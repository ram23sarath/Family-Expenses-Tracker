do $$
declare
  admin_user uuid;
  member_user uuid;
  demo_household uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  zerodha_account uuid := '22222222-2222-2222-2222-222222222221'::uuid;
  groww_account uuid := '22222222-2222-2222-2222-222222222222'::uuid;
  indmoney_account uuid := '22222222-2222-2222-2222-222222222223'::uuid;
begin
  select id into admin_user from auth.users order by created_at asc limit 1;
  select id into member_user from auth.users where id <> admin_user order by created_at asc limit 1;

  if admin_user is null then
    raise notice 'Seed skipped: create at least one auth user first.';
    return;
  end if;

  if member_user is null then
    member_user := admin_user;
  end if;

  insert into public.households(id, name, created_by)
  values (demo_household, 'Sharma Family', admin_user)
  on conflict (id) do update set name = excluded.name;

  insert into public.users_profile(id, household_id, full_name, role, preferred_currency)
  values
    (admin_user, demo_household, 'Aarav Sharma', 'admin', 'INR'),
    (member_user, demo_household, 'Meera Sharma', 'member', 'INR')
  on conflict (id) do update
  set household_id = excluded.household_id, full_name = excluded.full_name, role = excluded.role;

  insert into public.accounts(id, household_id, user_id, name, provider_type, account_category, base_currency, status, last_sync_at)
  values
    (zerodha_account, demo_household, admin_user, 'Zerodha Primary', 'zerodha', 'brokerage', 'INR', 'active', now()),
    (groww_account, demo_household, member_user, 'Groww MF', 'groww', 'mutual_fund', 'INR', 'active', now()),
    (indmoney_account, demo_household, member_user, 'INDmoney Upload', 'indmoney_csv', 'stock', 'INR', 'active', now())
  on conflict (id) do update set name = excluded.name, status = excluded.status;

  insert into public.holdings(household_id, account_id, user_id, symbol, isin, asset_name, asset_type, exchange, quantity, average_cost, last_price, market_value, unrealized_pnl, currency, as_of, source, raw_payload_json)
  values
    (demo_household, zerodha_account, admin_user, 'RELIANCE', 'INE002A01018', 'Reliance Industries Ltd', 'equity', 'NSE', 25, 2450, 2864, 71600, 10350, 'INR', now(), 'zerodha', '{"sample":true}'::jsonb),
    (demo_household, zerodha_account, admin_user, 'INFY', 'INE009A01021', 'Infosys Ltd', 'equity', 'NSE', 40, 1460, 1542, 61680, 3280, 'INR', now(), 'zerodha', '{"sample":true}'::jsonb),
    (demo_household, groww_account, member_user, 'SBI_BLUE_DIRECT', 'INF200K01WS6', 'SBI Bluechip Fund Direct Growth', 'mutual_fund', null, 223.81, 68.2, 78.6, 17592.41, 2327.57, 'INR', now(), 'groww', '{"sample":true}'::jsonb),
    (demo_household, groww_account, member_user, 'PPFAS_FLEXI', 'INF879O01027', 'Parag Parikh Flexi Cap Fund Direct Growth', 'mutual_fund', null, 310.55, 49.8, 62.15, 19303.68, 3836.29, 'INR', now(), 'groww', '{"sample":true}'::jsonb)
  on conflict (household_id, account_id, symbol) do update
  set quantity = excluded.quantity, market_value = excluded.market_value, unrealized_pnl = excluded.unrealized_pnl;

  insert into public.transactions(household_id, account_id, user_id, symbol, isin, asset_name, transaction_type, quantity, price, amount, currency, transaction_date, source, import_hash, raw_payload_json)
  values
    (demo_household, zerodha_account, admin_user, 'RELIANCE', 'INE002A01018', 'Reliance Industries Ltd', 'buy', 10, 2440, 24400, 'INR', now() - interval '80 days', 'zerodha', 'seed_tx_1', '{"sample":true}'::jsonb),
    (demo_household, zerodha_account, admin_user, 'INFY', 'INE009A01021', 'Infosys Ltd', 'buy', 20, 1410, 28200, 'INR', now() - interval '60 days', 'zerodha', 'seed_tx_2', '{"sample":true}'::jsonb),
    (demo_household, groww_account, member_user, 'SBI_BLUE_DIRECT', 'INF200K01WS6', 'SBI Bluechip Fund Direct Growth', 'buy', 100, 66, 6600, 'INR', now() - interval '50 days', 'groww', 'seed_tx_3', '{"sample":true}'::jsonb),
    (demo_household, groww_account, member_user, 'PPFAS_FLEXI', 'INF879O01027', 'Parag Parikh Flexi Cap Fund Direct Growth', 'buy', 120, 47, 5640, 'INR', now() - interval '45 days', 'groww', 'seed_tx_4', '{"sample":true}'::jsonb),
    (demo_household, indmoney_account, member_user, null, null, 'Monthly Salary', 'income', null, null, 165000, 'INR', now() - interval '20 days', 'manual', 'seed_tx_5', '{"sample":true}'::jsonb),
    (demo_household, indmoney_account, member_user, null, null, 'Home Rent', 'expense', null, null, 45000, 'INR', now() - interval '15 days', 'manual', 'seed_tx_6', '{"sample":true}'::jsonb)
  on conflict (household_id, import_hash) do nothing;

  insert into public.expense_categories(household_id, name)
  values
    (demo_household, 'Groceries'),
    (demo_household, 'Dining'),
    (demo_household, 'School Fees'),
    (demo_household, 'Salary')
  on conflict (household_id, name) do nothing;

  insert into public.expense_entries(household_id, category_id, paid_by_user_id, entry_type, amount, currency, expense_date, note, split_mode)
  select demo_household, c.id, member_user, 'expense', 8200, 'INR', current_date - 12, 'Monthly groceries', 'equal'
  from public.expense_categories c
  where c.household_id = demo_household
    and c.name = 'Groceries'
    and not exists (
      select 1 from public.expense_entries e
      where e.household_id = demo_household and e.note = 'Monthly groceries' and e.expense_date = current_date - 12
    );

  insert into public.expense_entries(household_id, category_id, paid_by_user_id, entry_type, amount, currency, expense_date, note, split_mode)
  select demo_household, c.id, admin_user, 'expense', 5400, 'INR', current_date - 9, 'Family outing', 'equal'
  from public.expense_categories c
  where c.household_id = demo_household
    and c.name = 'Dining'
    and not exists (
      select 1 from public.expense_entries e
      where e.household_id = demo_household and e.note = 'Family outing' and e.expense_date = current_date - 9
    );

  insert into public.expense_entries(household_id, category_id, paid_by_user_id, entry_type, amount, currency, expense_date, note, split_mode)
  select demo_household, c.id, admin_user, 'income', 165000, 'INR', current_date - 20, 'Monthly salary credit', 'equal'
  from public.expense_categories c
  where c.household_id = demo_household
    and c.name = 'Salary'
    and not exists (
      select 1 from public.expense_entries e
      where e.household_id = demo_household and e.note = 'Monthly salary credit' and e.expense_date = current_date - 20
    );

  insert into public.portfolio_snapshots(household_id, user_id, snapshot_date, total_invested, total_value, total_gain_loss, total_gain_loss_percent, equity_value, mutual_fund_value, cash_value, other_value, source_summary_json)
  values
    (demo_household, null, '2025-01-01T00:00:00Z', 100000, 108000, 8000, 0.08, 70000, 28000, 10000, 0, '{"zerodha":70000,"groww":28000,"cash":10000}'::jsonb),
    (demo_household, null, '2025-02-01T00:00:00Z', 112000, 123000, 11000, 0.0982, 78000, 34000, 11000, 0, '{"zerodha":78000,"groww":34000,"cash":11000}'::jsonb),
    (demo_household, null, '2025-03-01T00:00:00Z', 125000, 136000, 11000, 0.088, 86000, 39000, 11000, 0, '{"zerodha":86000,"groww":39000,"cash":11000}'::jsonb),
    (demo_household, null, '2025-04-01T00:00:00Z', 141000, 152000, 11000, 0.078, 94000, 47000, 11000, 0, '{"zerodha":94000,"groww":47000,"cash":11000}'::jsonb),
    (demo_household, null, '2025-05-01T00:00:00Z', 155000, 167000, 12000, 0.0774, 102000, 54000, 11000, 0, '{"zerodha":102000,"groww":54000,"cash":11000}'::jsonb),
    (demo_household, null, '2025-06-01T00:00:00Z', 168000, 181000, 13000, 0.0773, 111000, 59000, 11000, 0, '{"zerodha":111000,"groww":59000,"cash":11000}'::jsonb)
  on conflict (household_id, snapshot_date) do nothing;

  insert into public.csv_uploads(household_id, user_id, account_id, provider_type, file_name, file_content, status, version)
  values (
    demo_household,
    member_user,
    indmoney_account,
    'indmoney_csv',
    'indmoney-sample.csv',
    'account_name,symbol,asset_name,quantity,amount,transaction_date,transaction_type,currency
INDmoney Upload,NASDAQ:AAPL,Apple Inc,10,1890,2025-01-15,buy,USD
INDmoney Upload,NASDAQ:MSFT,Microsoft Corp,6,2500,2025-02-12,buy,USD',
    'parsed',
    1
  )
  on conflict do nothing;

  insert into public.import_jobs(household_id, user_id, upload_id, status, preview_json)
  select
    demo_household,
    member_user,
    u.id,
    'parsed',
    '{
      "totalRows": 2,
      "validRows": 2,
      "issues": [],
      "rows": [
        {"rowNumber":1,"accountName":"INDmoney Upload","symbol":"NASDAQ:AAPL","assetName":"Apple Inc","quantity":10,"amount":1890,"transactionDate":"2025-01-15","transactionType":"buy","currency":"USD"},
        {"rowNumber":2,"accountName":"INDmoney Upload","symbol":"NASDAQ:MSFT","assetName":"Microsoft Corp","quantity":6,"amount":2500,"transactionDate":"2025-02-12","transactionType":"buy","currency":"USD"}
      ]
    }'::jsonb
  from public.csv_uploads u
  where u.household_id = demo_household
    and u.file_name = 'indmoney-sample.csv'
    and not exists (select 1 from public.import_jobs j where j.upload_id = u.id);
end;
$$;
