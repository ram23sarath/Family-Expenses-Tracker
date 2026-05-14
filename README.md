# Family Expenses & Portfolio Tracker (Draft)

Production-oriented draft for a family finance tracker built with **Next.js App Router + Supabase**.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ram23sarath/Family-Expenses-Tracker)

## What this draft includes

- Supabase-authenticated household app with role-aware access
- Portfolio tracking across Zerodha/Groww (mocked server connectors) + INDmoney/other CSV imports
- 3-step CSV import workflow: upload -> parse/validate preview -> commit
- Holdings, transactions, snapshots, prices, expenses, members, audit log
- Dashboard with summary cards and charts:
  - net worth over time
  - asset allocation donut
  - monthly income vs expense bar
- Server-side sync flow + Supabase edge function + cron SQL schedule template
- RLS-enabled normalized database schema and seed data
- Unit tests for parser/mapping/calculations/RLS helpers/idempotency

## Stack

- Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Recharts
- Backend: Supabase Postgres, Supabase Auth, Edge Function (`sync-all`)
- Deployment target: Netlify

## Netlify Deployment

To deploy this project to Netlify:

1.  Click the **Deploy to Netlify** button above or connect your GitHub repository to Netlify.
2.  Configure the following environment variables in the Netlify Dashboard (**Site configuration > Environment variables**):
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `APP_BASE_URL` (Your Netlify site URL)
    - `CRON_SYNC_SHARED_SECRET`
3.  Netlify will automatically detect Next.js and use the `@netlify/plugin-nextjs` for optimal performance.

## Quick start

1. Install dependencies

```bash
npm install
```

2. Configure env

```bash
cp .env.example .env.local
```

Fill:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL`
- `CRON_SYNC_SHARED_SECRET`
- broker placeholders (`ZERODHA_*`, `GROWW_*`)

3. Apply Supabase schema + seed

- Run migration: `supabase/migrations/20260514143000_initial_schema.sql`
- Run seed: `supabase/seed.sql`

4. Optional cron setup (every 15 min)

- Deploy edge function: `supabase/functions/sync-all`
- Apply schedule SQL template in `supabase/cron/schedule.sql` after replacing placeholders

5. Run app

```bash
npm run dev
```

## Routes

Public:
- `/login`
- `/signup`
- `/forgot-password`

Authenticated:
- `/dashboard`
- `/portfolio`
- `/portfolio/[accountId]`
- `/expenses`
- `/transactions`
- `/accounts`
- `/accounts/[id]`
- `/imports`
- `/imports/new`
- `/imports/[id]`
- `/reports`
- `/reports/net-worth`
- `/reports/allocation`
- `/reports/cashflow`
- `/members`
- `/audit-log`
- `/settings`

## API endpoints

- `POST /api/import/upload`
- `POST /api/import/parse`
- `POST /api/import/commit`
- `POST /api/sync/all`
- `POST /api/sync/account`
- `GET /api/dashboard/summary`
- `GET /api/portfolio/holdings`
- `GET /api/reports/net-worth`
- `GET /api/reports/allocation`
- `GET /api/reports/cashflow`
- `POST /api/accounts/connect`
- `POST /api/accounts/disconnect`

## Mocked vs real

### Mocked in this draft
- Zerodha and Groww live auth/API requests are mocked with realistic connector payloads.
- Access-token encryption currently uses base64 placeholder.
- FX conversion uses static INR/USD map.

### Real/implemented
- Supabase auth integration and household/profile bootstrap trigger
- RLS policies across core tables
- CSV import parsing/validation/mapping/preview/commit flow
- Idempotent sync run key strategy (15-min buckets)
- Audit logging and import versioning

## Tests

```bash
npm run test
```

Covered:
- CSV parsing + validation
- Mapping resolution
- Portfolio summary + snapshot calculations
- RLS scoping helpers
- Sync run idempotency key behavior

## Project structure (key areas)

```text
app/
  (auth)/
  (app)/
  api/
components/
  accounts/
  auth/
  charts/
  dashboard/
  expenses/
  imports/
  layout/
  transactions/
  ui/
lib/
  api/
  auth/
  domain/
  imports/
  integrations/
  services/
  supabase/
  validation/
supabase/
  migrations/
  functions/sync-all/
  cron/
tests/
```

## Production hardening TODOs

- Replace mocked broker connectors with live Zerodha/Groww OAuth/token exchange + API SDK integration
- Replace token placeholder encoding with KMS-backed encryption/decryption
- Move large CSV payloads from DB text to Supabase Storage object references
- Add retry queue/backoff for broker outages and dead-letter handling
- Add stronger optimistic locking/version checks for concurrent imports
- Add E2E tests and load testing for large household datasets
