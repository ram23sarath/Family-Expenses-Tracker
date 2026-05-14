create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  full_name text not null default '',
  role text not null default 'member' check (role in ('admin', 'member', 'viewer')),
  preferred_currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  provider_type text not null check (provider_type in ('zerodha', 'groww', 'indmoney_csv', 'manual', 'bank', 'cash')),
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete set null,
  name text not null,
  provider_type text not null check (provider_type in ('zerodha', 'groww', 'indmoney_csv', 'manual', 'bank', 'cash')),
  account_category text not null check (account_category in ('brokerage', 'mutual_fund', 'stock', 'cash', 'bank', 'other')),
  base_currency text not null default 'INR',
  status text not null default 'active' check (status in ('active', 'inactive', 'error')),
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.broker_connections (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  provider_type text not null check (provider_type in ('zerodha', 'groww')),
  external_account_id text not null,
  encrypted_access_token text not null,
  active boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, provider_type)
);

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null default '',
  isin text,
  asset_name text not null,
  asset_type text not null check (asset_type in ('equity', 'mutual_fund', 'etf', 'cash', 'bond', 'other')),
  exchange text,
  quantity numeric(20, 6) not null default 0,
  average_cost numeric(20, 6) not null default 0,
  last_price numeric(20, 6) not null default 0,
  market_value numeric(20, 6) not null default 0,
  unrealized_pnl numeric(20, 6) not null default 0,
  currency text not null default 'INR',
  as_of timestamptz not null default now(),
  source text not null,
  raw_payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, account_id, symbol)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text,
  isin text,
  asset_name text,
  transaction_type text not null check (transaction_type in ('buy', 'sell', 'dividend', 'interest', 'fee', 'transfer', 'expense', 'income', 'deposit', 'withdrawal')),
  quantity numeric(20, 6),
  price numeric(20, 6),
  amount numeric(20, 6) not null,
  currency text not null default 'INR',
  transaction_date timestamptz not null,
  source text not null,
  import_hash text,
  raw_payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, import_hash)
);

create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  snapshot_date timestamptz not null default date_trunc('minute', now()),
  total_invested numeric(20, 6) not null default 0,
  total_value numeric(20, 6) not null default 0,
  total_gain_loss numeric(20, 6) not null default 0,
  total_gain_loss_percent numeric(10, 6) not null default 0,
  equity_value numeric(20, 6) not null default 0,
  mutual_fund_value numeric(20, 6) not null default 0,
  cash_value numeric(20, 6) not null default 0,
  other_value numeric(20, 6) not null default 0,
  source_summary_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (household_id, snapshot_date)
);

create table if not exists public.prices (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  isin text,
  asset_name text not null,
  exchange text,
  currency text not null default 'INR',
  ltp numeric(20, 6) not null,
  close_price numeric(20, 6),
  open_price numeric(20, 6),
  high_price numeric(20, 6),
  low_price numeric(20, 6),
  as_of timestamptz not null default date_trunc('minute', now()),
  source text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (symbol, exchange, as_of)
);

create table if not exists public.csv_uploads (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  provider_type text not null check (provider_type in ('zerodha', 'groww', 'indmoney_csv', 'manual', 'bank', 'cash')),
  file_name text not null,
  file_content text not null,
  status text not null default 'uploaded' check (status in ('uploaded', 'parsed', 'committed', 'failed')),
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, account_id, provider_type, version)
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  upload_id uuid not null references public.csv_uploads(id) on delete cascade,
  status text not null default 'uploaded' check (status in ('uploaded', 'parsed', 'needs_review', 'committed', 'failed')),
  preview_json jsonb not null default '{}'::jsonb,
  committed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.asset_mappings (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  provider_type text not null,
  source_symbol text not null,
  source_name text,
  canonical_symbol text,
  canonical_isin text,
  canonical_asset_type text,
  mapping_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, provider_type, source_symbol)
);

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  parent_id uuid references public.expense_categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, name)
);

create table if not exists public.expense_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  category_id uuid not null references public.expense_categories(id) on delete restrict,
  paid_by_user_id uuid not null references auth.users(id) on delete restrict,
  entry_type text not null check (entry_type in ('expense', 'income')),
  amount numeric(20, 6) not null,
  currency text not null default 'INR',
  expense_date date not null,
  note text,
  receipt_url text,
  split_mode text not null default 'equal' check (split_mode in ('equal', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  expense_entry_id uuid not null references public.expense_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(20, 6) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (expense_entry_id, user_id)
);

create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  category_id uuid not null references public.expense_categories(id) on delete restrict,
  paid_by_user_id uuid not null references auth.users(id) on delete restrict,
  amount numeric(20, 6) not null,
  currency text not null default 'INR',
  cadence text not null check (cadence in ('weekly', 'monthly', 'quarterly', 'yearly')),
  starts_on date not null,
  ends_on date,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  run_key text not null,
  status text not null check (status in ('running', 'success', 'partial_success', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  stats_json jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_key)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_accounts_household on public.accounts(household_id, created_at desc);
create index if not exists idx_holdings_household on public.holdings(household_id, account_id);
create index if not exists idx_transactions_household_date on public.transactions(household_id, transaction_date desc);
create index if not exists idx_snapshots_household_date on public.portfolio_snapshots(household_id, snapshot_date desc);
create index if not exists idx_prices_symbol_as_of on public.prices(symbol, as_of desc);
create index if not exists idx_expense_entries_household_date on public.expense_entries(household_id, expense_date desc);
create index if not exists idx_audit_logs_household_created on public.audit_logs(household_id, created_at desc);

create trigger trg_households_updated_at before update on public.households for each row execute procedure public.set_updated_at();
create trigger trg_users_profile_updated_at before update on public.users_profile for each row execute procedure public.set_updated_at();
create trigger trg_institutions_updated_at before update on public.institutions for each row execute procedure public.set_updated_at();
create trigger trg_accounts_updated_at before update on public.accounts for each row execute procedure public.set_updated_at();
create trigger trg_broker_connections_updated_at before update on public.broker_connections for each row execute procedure public.set_updated_at();
create trigger trg_holdings_updated_at before update on public.holdings for each row execute procedure public.set_updated_at();
create trigger trg_transactions_updated_at before update on public.transactions for each row execute procedure public.set_updated_at();
create trigger trg_prices_updated_at before update on public.prices for each row execute procedure public.set_updated_at();
create trigger trg_csv_uploads_updated_at before update on public.csv_uploads for each row execute procedure public.set_updated_at();
create trigger trg_import_jobs_updated_at before update on public.import_jobs for each row execute procedure public.set_updated_at();
create trigger trg_asset_mappings_updated_at before update on public.asset_mappings for each row execute procedure public.set_updated_at();
create trigger trg_expense_categories_updated_at before update on public.expense_categories for each row execute procedure public.set_updated_at();
create trigger trg_expense_entries_updated_at before update on public.expense_entries for each row execute procedure public.set_updated_at();
create trigger trg_expense_splits_updated_at before update on public.expense_splits for each row execute procedure public.set_updated_at();
create trigger trg_recurring_expenses_updated_at before update on public.recurring_expenses for each row execute procedure public.set_updated_at();
create trigger trg_sync_jobs_updated_at before update on public.sync_jobs for each row execute procedure public.set_updated_at();

create or replace function public.current_household_id()
returns uuid
language sql
stable
as $$
  select household_id from public.users_profile where id = auth.uid()
$$;

create or replace function public.is_household_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users_profile
    where id = auth.uid() and role = 'admin'
  )
$$;

alter table public.households enable row level security;
alter table public.users_profile enable row level security;
alter table public.institutions enable row level security;
alter table public.accounts enable row level security;
alter table public.broker_connections enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;
alter table public.portfolio_snapshots enable row level security;
alter table public.prices enable row level security;
alter table public.csv_uploads enable row level security;
alter table public.import_jobs enable row level security;
alter table public.asset_mappings enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expense_entries enable row level security;
alter table public.expense_splits enable row level security;
alter table public.recurring_expenses enable row level security;
alter table public.sync_jobs enable row level security;
alter table public.audit_logs enable row level security;

create policy "household select" on public.households
for select using (id = public.current_household_id());
create policy "household insert" on public.households
for insert with check (created_by = auth.uid());
create policy "household update admin" on public.households
for update using (id = public.current_household_id() and public.is_household_admin())
with check (id = public.current_household_id() and public.is_household_admin());

create policy "users profile household read" on public.users_profile
for select using (household_id = public.current_household_id());
create policy "users profile self insert" on public.users_profile
for insert with check (id = auth.uid());
create policy "users profile update self or admin" on public.users_profile
for update using (id = auth.uid() or (household_id = public.current_household_id() and public.is_household_admin()))
with check (household_id = public.current_household_id());

create policy "institutions read all authenticated" on public.institutions
for select to authenticated using (true);

create policy "accounts household access" on public.accounts
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "broker connections household access" on public.broker_connections
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "holdings household access" on public.holdings
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "transactions household access" on public.transactions
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "snapshots household access" on public.portfolio_snapshots
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "prices authenticated read" on public.prices
for select to authenticated using (true);
create policy "prices admin write" on public.prices
for all using (public.is_household_admin()) with check (public.is_household_admin());

create policy "csv uploads household access" on public.csv_uploads
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "import jobs household access" on public.import_jobs
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "asset mappings household access" on public.asset_mappings
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "expense categories household access" on public.expense_categories
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "expense entries household access" on public.expense_entries
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "expense splits household access" on public.expense_splits
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "recurring expenses household access" on public.recurring_expenses
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "sync jobs household access" on public.sync_jobs
for all using (household_id is null or household_id = public.current_household_id())
with check (household_id is null or household_id = public.current_household_id());

create policy "audit logs household access" on public.audit_logs
for all using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household_id uuid;
  household_name text;
  invite_household_id uuid;
  invite_role text;
begin
  invite_role := coalesce(new.raw_user_meta_data ->> 'role', 'member');
  if coalesce(new.raw_user_meta_data ->> 'household_id', '') <> '' then
    invite_household_id := (new.raw_user_meta_data ->> 'household_id')::uuid;
  end if;

  if invite_household_id is not null and exists (select 1 from public.households where id = invite_household_id) then
    new_household_id := invite_household_id;
  else
    household_name := coalesce(new.raw_user_meta_data ->> 'household_name', split_part(new.email, '@', 1) || ' Household');
    insert into public.households (name, created_by) values (household_name, new.id) returning id into new_household_id;
    invite_role := 'admin';

    insert into public.expense_categories (household_id, name)
    values
      (new_household_id, 'Groceries'),
      (new_household_id, 'Rent'),
      (new_household_id, 'Utilities'),
      (new_household_id, 'Transport'),
      (new_household_id, 'Salary'),
      (new_household_id, 'Investments')
    on conflict (household_id, name) do nothing;
  end if;

  insert into public.users_profile (id, household_id, full_name, role, preferred_currency)
  values (
    new.id,
    new_household_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case when invite_role in ('admin', 'member', 'viewer') then invite_role else 'member' end,
    'INR'
  )
  on conflict (id) do update
  set household_id = excluded.household_id,
      full_name = excluded.full_name,
      role = excluded.role,
      preferred_currency = excluded.preferred_currency;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
