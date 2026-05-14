create or replace function public.current_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id from public.users_profile where id = auth.uid()
$$;

create or replace function public.is_household_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users_profile
    where id = auth.uid() and role = 'admin'
  )
$$;

drop policy if exists "users profile household read" on public.users_profile;
create policy "users profile household read" on public.users_profile
for select using (id = auth.uid() or household_id = public.current_household_id());
