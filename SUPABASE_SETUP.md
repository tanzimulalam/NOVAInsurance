# Connecting the Management Portal to Supabase

Your app now talks directly to **Supabase** (a hosted Postgres database with
login + live updates) instead of the old local Node server. Follow these steps
once. Anything in `code font` is a button/label you click in the Supabase
website.

---

## 1. Create your Supabase project

1. Go to **https://supabase.com** and click `Start your project` / `Sign in`
   (sign in with GitHub or email).
2. Click `New project`.
3. Pick your organization (create one if asked).
4. Fill in:
   - **Name:** `low-rate-insurance`
   - **Database Password:** click `Generate a password` and **save it somewhere**
     (you won't need it day-to-day, but keep it safe).
   - **Region:** pick the one closest to your customers.
5. Click `Create new project`. Wait ~2 minutes while it sets up.

---

## 2. Create the leads table (copy/paste SQL)

1. In the left sidebar, click `SQL Editor`.
2. Click `+ New query`.
3. Paste everything below and click `Run` (bottom right).

```sql
-- Leads table
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'unknown',
  status text not null default 'incomplete',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Turn on Row Level Security (controls who can do what)
alter table public.leads enable row level security;

-- Visitors (anonymous) can submit a quote
create policy "Anyone can insert leads"
  on public.leads for insert
  to anon, authenticated
  with check (true);

-- Visitors can update their draft as they type
create policy "Anyone can update leads"
  on public.leads for update
  to anon, authenticated
  using (true) with check (true);

-- Only a logged-in owner can view all leads
create policy "Authenticated can read leads"
  on public.leads for select
  to authenticated
  using (true);

-- Only a logged-in owner can delete leads
create policy "Authenticated can delete leads"
  on public.leads for delete
  to authenticated
  using (true);

-- Enable live updates for the portal
alter publication supabase_realtime add table public.leads;
```

You should see `Success. No rows returned`.

---

## 3. Get your API keys

1. Left sidebar: click `Project Settings` (gear icon) -> `API`.
2. Copy two values:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

> The anon key is safe to put in the website — your data is protected by the
> Row Level Security rules above.

---

## 4. Put the keys in your project (local testing)

1. Open the file `.env` in the project root.
2. Replace the placeholders with your values:

   ```
   VITE_SUPABASE_URL=https://abcd1234.supabase.co
   VITE_SUPABASE_ANON_KEY=paste-your-anon-key-here
   ```

3. Save the file.

---

## 5. Create your owner login

1. Left sidebar: click `Authentication` -> `Users`.
2. Click `Add user` -> `Create new user`.
3. Enter the **email** and **password** you want to log in with.
4. Make sure `Auto Confirm User` is ON, then click `Create user`.

(Optional, to stop strangers from signing up: `Authentication` ->
`Sign In / Providers` -> under Email, turn OFF `Allow new users to sign up`.)

---

## 6. Test it locally

1. In a terminal: `npm install` (first time only), then `npm run dev`.
2. Open the local URL it prints (usually `http://localhost:5173`).
3. Fill out a quote form as a customer — it saves to Supabase.
4. Click `Agent Login` in the header, sign in with the email/password from step 5.
5. You should see the lead appear in the portal in real time.

You can also confirm data is landing in Supabase: `Table Editor` -> `leads`.

---

## 7. Make the live (deployed) site work

Your site deploys to GitHub Pages via GitHub Actions. The build needs the same
two keys:

1. Go to your repo on **GitHub** -> `Settings` -> `Secrets and variables` ->
   `Actions`.
2. Click `New repository secret` and add:
   - Name: `VITE_SUPABASE_URL`  → Value: your Project URL
   - Name: `VITE_SUPABASE_ANON_KEY`  → Value: your anon key
3. Push to the `main` branch (or click `Run workflow`). The deploy will now
   build with your Supabase keys baked in.

---

## Notes

- The old `server/` folder and `server/data/leads.json` are no longer used and
  can be deleted whenever you like.
- ID photos are stored inside each lead's `data` (as compressed images). If you
  later expect a lot of large photos, we can switch to Supabase **Storage** for
  cheaper/faster image handling — ask when you're ready.
