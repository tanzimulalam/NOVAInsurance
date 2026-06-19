# Low Rate Insurance

A complete insurance website with a customer facing site and a private management portal for the business owner. Visitors can browse coverage options and request quotes, while the owner can log in to see every lead in real time as it comes in.

The brand colors follow the company logo: blue and green.

## What it does

**Customer website**
- Modern, responsive landing page with a hero, company stats, an about section, reasons to choose the agency, and a service grid
- Quote request forms for Auto, Home, Renters, Commercial, Cyber, and Other coverage
- Auto insurance has an extra step for vehicle details (VIN, license, vehicle status)
- A confirmation screen with the agent contact details after submitting

**Management portal**
- Private login for the owner at `/login`
- Live dashboard called the Low Rate Insurance Management Portal
- Every lead shows up instantly without refreshing the page
- Leads are marked Incomplete while a visitor is still filling the form, and Complete once they submit
- Counts for total, complete, and incomplete leads
- Click any lead to view all the information the visitor entered
- Delete leads you no longer need

## How lead tracking works

When a visitor opens a quote form, a lead is created right away with the status Incomplete. As they type, their information is saved to that same lead. When they submit the form, the status changes to Complete. The owner portal listens for these changes over a live connection, so new and updated leads appear on the dashboard in real time.

## Tech stack

- React 18 with React Router
- Vite for the build and dev server
- Express for the backend API
- Server Sent Events for the live lead updates
- Lead data stored in a local JSON file (`server/data/leads.json`)
- Lucide icons

## Getting started

You need Node.js 18 or newer.

Install the dependencies:

```bash
npm install
```

Run the website and the API together in development:

```bash
npm run dev
```

- Website: http://localhost:5173
- API: http://localhost:3001

The Vite dev server proxies API requests to the Express server, so you only need the one command.

## Production build

Build the frontend and start the server, which serves the built site and the API on one port:

```bash
npm run build
npm start
```

The site will then be available at http://localhost:3001.

## Available scripts

- `npm run dev` runs the API and the Vite dev server together
- `npm run server` runs only the Express API
- `npm run build` builds the production frontend into `dist`
- `npm start` runs the Express server, which also serves the built site
- `npm run lint` runs ESLint

## Owner login

The portal login is handled by the Express server. The username and password are read from environment variables, with fallback defaults defined in `server/index.js`:

- `OWNER_USERNAME`
- `OWNER_PASSWORD`
- `PORT` (defaults to 3001)

Before deploying anywhere public, set your own values for these so the defaults are not used:

```bash
# example
set OWNER_USERNAME=youruser
set OWNER_PASSWORD=yourpassword
```

## Project structure

```
.
├── server
│   ├── index.js          Express API, auth, and live lead stream
│   └── data              Stored leads (created at runtime)
├── src
│   ├── api               API client for the frontend
│   ├── components        Header, Footer, Layout, Reveal, route guards
│   ├── context           Auth state
│   ├── hooks             Lead tracking hook used by the quote forms
│   └── pages             Home, QuoteForm, Login, Portal
├── public                Logo and icon assets
└── index.html
```

## Notes

- Lead data lives in `server/data/leads.json`, which is ignored by git so real customer data is never committed.
- The login uses a token kept in the browser, and the API checks it on every protected request.
