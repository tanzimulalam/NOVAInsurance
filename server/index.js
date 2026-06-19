import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

const PORT = process.env.PORT || 3001;
const OWNER_USERNAME = process.env.OWNER_USERNAME || 'bakirbd';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'F123456f';

const app = express();
const sseClients = new Set();
const sessions = new Map();

app.use(cors());
app.use(express.json());

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
  }
}

function readLeads() {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeLeads(leads) {
  ensureDataDir();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

function broadcastLeads() {
  const leads = readLeads();
  const payload = `data: ${JSON.stringify(leads)}\n\n`;
  sseClients.forEach((client) => client.write(payload));
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === OWNER_USERNAME && password === OWNER_PASSWORD) {
    const token = randomUUID();
    sessions.set(token, { username, createdAt: Date.now() });
    return res.json({ token, username });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  sessions.delete(token);
  res.json({ success: true });
});

app.get('/api/auth/verify', authenticate, (req, res) => {
  res.json({ valid: true });
});

app.get('/api/leads', authenticate, (req, res) => {
  const leads = readLeads().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(leads);
});

app.get('/api/leads/stream', authenticate, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify(readLeads())}\n\n`);
  sseClients.add(res);

  req.on('close', () => sseClients.delete(res));
});

app.post('/api/leads', (req, res) => {
  const { type, data = {} } = req.body;
  const now = new Date().toISOString();
  const lead = {
    id: randomUUID(),
    type: type || 'unknown',
    status: 'incomplete',
    data,
    createdAt: now,
    updatedAt: now,
  };

  const leads = readLeads();
  leads.push(lead);
  writeLeads(leads);
  broadcastLeads();
  res.status(201).json(lead);
});

app.patch('/api/leads/:id', (req, res) => {
  const leads = readLeads();
  const index = leads.findIndex((l) => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Lead not found' });

  const { data, status } = req.body;
  if (data !== undefined) leads[index].data = { ...leads[index].data, ...data };
  if (status) leads[index].status = status;
  leads[index].updatedAt = new Date().toISOString();

  writeLeads(leads);
  broadcastLeads();
  res.json(leads[index]);
});

app.delete('/api/leads/:id', authenticate, (req, res) => {
  const leads = readLeads().filter((l) => l.id !== req.params.id);
  writeLeads(leads);
  broadcastLeads();
  res.json({ success: true });
});

const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

ensureDataDir();
app.listen(PORT, () => {
  console.log(`Low Rate Insurance API running on http://localhost:${PORT}`);
});
