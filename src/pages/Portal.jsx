import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, RefreshCw, Trash2, Eye, X, Radio,
  Car, Home, Building2, Shield, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { leadsApi } from '../api/client';

const typeIcons = {
  auto: Car,
  home: Home,
  renters: Building2,
  commercial: Briefcase,
  cyber: Shield,
  others: Shield,
};

const formatType = (type) => {
  if (type === 'others') return 'Other';
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown';
};

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
};

const Portal = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await leadsApi.getAll();
      setLeads(data);
    } catch {
      /* handled by auth */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();

    const token = localStorage.getItem('lri_token');
    let aborted = false;
    const controller = new AbortController();

    async function streamLeads() {
      try {
        const res = await fetch(leadsApi.streamUrl(), {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Stream failed');

        setConnected(true);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                setLeads(data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
              } catch { /* skip malformed */ }
            }
          }
        }
      } catch {
        if (!aborted) {
          setConnected(false);
          setTimeout(streamLeads, 3000);
        }
      }
    }

    streamLeads();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [fetchLeads]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead permanently?')) return;
    await leadsApi.delete(id);
    if (selected?.id === id) setSelected(null);
  };

  const completeCount = leads.filter((l) => l.status === 'complete').length;
  const incompleteCount = leads.filter((l) => l.status === 'incomplete').length;

  const getLeadName = (lead) => lead.data?.name || '-';
  const getLeadContact = (lead) => lead.data?.phone || lead.data?.email || '-';

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <div className="portal-header-brand">
          <img src={`${import.meta.env.BASE_URL}icon.png`} alt="Low Rate Insurance" />
          <div>
          <h1>Low Rate Insurance Management Portal</h1>
          <p>Welcome, {user?.username} &nbsp;·&nbsp;
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {connected ? (
                <><span className="live-dot" /> Live</>
              ) : (
                <><Radio size={12} /> Connecting...</>
              )}
            </span>
          </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchLeads} style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="portal-body fade-in-up">
        <div className="portal-stats">
          <div className="glass-panel portal-stat total">
            <div className="num">{leads.length}</div>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Total Leads</div>
          </div>
          <div className="glass-panel portal-stat complete">
            <div className="num">{completeCount}</div>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Complete</div>
          </div>
          <div className="glass-panel portal-stat incomplete">
            <div className="num">{incompleteCount}</div>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Incomplete</div>
          </div>
        </div>

        <div className="glass-panel leads-table-wrap">
          {loading ? (
            <p style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-500)' }}>Loading leads...</p>
          ) : leads.length === 0 ? (
            <p style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-500)' }}>
              No leads yet. Leads will appear here in real-time when visitors fill out quote forms.
            </p>
          ) : (
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const Icon = typeIcons[lead.type] || Shield;
                  return (
                    <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(lead)}>
                      <td>
                        <span className={`status-badge status-${lead.status}`}>
                          {lead.status === 'complete' ? 'Complete' : 'Incomplete'}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Icon size={16} color="var(--blue-700)" />
                          {formatType(lead.type)}
                        </span>
                      </td>
                      <td>{getLeadName(lead)}</td>
                      <td>{getLeadContact(lead)}</td>
                      <td style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>{formatDate(lead.updatedAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(lead)} title="View details">
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(lead.id)} title="Delete" style={{ color: '#dc2626' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="glass-panel lead-detail-panel fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Lead Details</h3>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginTop: '4px' }}>
                  ID: {selected.id} &nbsp;·&nbsp; Created {formatDate(selected.createdAt)}
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ margin: '16px 0' }}>
              <span className={`status-badge status-${selected.status}`}>
                {selected.status === 'complete' ? 'Complete' : 'Incomplete'}
              </span>
              <span style={{ marginLeft: '12px', color: 'var(--slate-500)', fontSize: '0.9rem' }}>
                {formatType(selected.type)} Insurance
              </span>
            </div>

            <div className="lead-detail-grid">
              {Object.entries(selected.data || {}).map(([key, value]) => {
                if (!value || String(value).trim() === '') return null;
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (s) => s.toUpperCase());
                return (
                  <div key={key} className="lead-detail-item">
                    <label>{label}</label>
                    <span>{value}</span>
                  </div>
                );
              })}
            </div>

            {Object.values(selected.data || {}).every((v) => !v || String(v).trim() === '') && (
              <p style={{ color: 'var(--slate-500)', marginTop: '12px' }}>
                No information entered yet. The visitor started the form but has not filled in any fields.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portal;
