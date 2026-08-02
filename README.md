# HT Ads — Campaign Console

A real, deployable full-stack build: React (Vite) frontend + Express/Postgres backend.
Real authentication, real campaign persistence, real registries (Business Units, WhatsApp
channels, templates, cohorts, placements) — no mock arrays left in the data path.

## What's real vs. what needs your credentials

- **Real**: login (bcrypt + JWT against a Postgres `users` table), campaign creation/listing,
  all registry data (BU list, WhatsApp channels, templates, cohorts, placements), the dashboard
  stats and channel throughput (computed from actual campaign rows).
- **Needs your input to go fully live**: the WhatsApp "Test the message" button. It always
  logs a real row to `whatsapp_test_sends`, but it only contacts the real Meta WhatsApp
  Business API if you set `WHATSAPP_ACCESS_TOKEN` and give the specific channel a
  `wa_phone_number_id` (see `.env.example`). Until then it responds honestly as "simulated" —
  it never pretends a message was actually delivered.

## Local development

Requirements: Node 20+, a Postgres database.

```bash
npm install
cp .env.example .env        # then edit DATABASE_URL if needed
node server/src/db/seed.js  # creates tables + seed data, prints a login you can use
npm run dev:server          # starts the API on :8080
npm run dev:client          # in a second terminal — starts Vite on :5173, proxying /api to :8080
```

Open http://localhost:5173. Log in with the email/password the seed script printed
(default: `priya.kapoor@hindustantimes.com` / `HtAds@2026` — change this after first login,
or set `SEED_ADMIN_PASSWORD` before seeding).

## Production build (what Render runs)

```bash
npm install
npm run build     # builds the frontend into dist/
node server/src/index.js   # serves the API and the built frontend from one process, on $PORT
```

## Deploying to Render

1. Push this project to a GitHub (or GitLab) repository.
2. In Render, click **New → Blueprint**, and point it at your repo. Render will read
   `render.yaml` and provision:
   - A **Postgres** database (`ht-ads-db`)
   - A **web service** (`ht-ads`) built from the included `Dockerfile`, with `DATABASE_URL`
     and a generated `JWT_SECRET` wired in automatically.
3. After the first deploy, open the Render **Shell** tab for the `ht-ads` service and run:
   ```bash
   node server/src/db/seed.js
   ```
   This creates the tables and seed data against the real production database. Do this once.
4. (Optional, for real WhatsApp sending) In the service's **Environment** tab, add
   `WHATSAPP_ACCESS_TOKEN` from your Meta WhatsApp Business API app. Then, using Render's
   Postgres connection (Shell tab → `psql $DATABASE_URL`), set the phone_number_id for each
   channel you want to go live:
   ```sql
   UPDATE whatsapp_channels SET wa_phone_number_id = '<id from Meta>' WHERE id = 'wa_htauto_primary';
   ```
5. Visit the `.onrender.com` URL Render gives the web service. That's the whole app —
   frontend and API served from one place.

### Deploying without the Blueprint (manual)

If you'd rather not use `render.yaml`: create a Postgres instance manually, create a Web
Service from the same repo choosing "Docker" as the runtime, and set `DATABASE_URL` (from
the Postgres instance's connection string) and `JWT_SECRET` (any random string) as
environment variables on the web service. Everything else is the same.

## Project structure

```
src/                  React frontend (Vite)
server/src/index.js   Express entry point — serves /api/* and the built frontend
server/src/db/        Postgres connection, schema.sql, seed.js
server/src/routes/    auth, campaigns, registries, whatsapp
Dockerfile             Builds and runs the whole app in one container
render.yaml            Render Blueprint — one web service + one Postgres database
```
