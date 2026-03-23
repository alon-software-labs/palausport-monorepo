-- RLS: Replace permissive policies with role-based policies
-- Employees: full CRUD on all tables. Clients: limited access.
-- Ensures app_role exists (idempotent) in case 20250307120000 was not applied yet.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role' and typnamespace = (select oid from pg_namespace where nspname = 'public')) then
    create type public.app_role as enum ('client', 'employee');
  end if;
end
$$;

-- Helper: true if current user's JWT has the given role
create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() ->> 'user_role')::public.app_role,
    'client'::public.app_role
  );
$$;

-- Helper: true if current user is employee
create or replace function public.is_employee()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_user_role() = 'employee';
$$;

-- Helper: true if current user is client
create or replace function public.is_client()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_user_role() = 'client';
$$;

-- cruise_events: employees full CRUD; clients SELECT only
drop policy if exists "cruise_events_authenticated" on cruise_events;
create policy "cruise_events_employee_all" on cruise_events
  for all to authenticated using (public.is_employee()) with check (public.is_employee());
create policy "cruise_events_client_select" on cruise_events
  for select to authenticated using (public.is_client());

-- reservations: employees full CRUD; clients SELECT own + INSERT
drop policy if exists "reservations_authenticated" on reservations;
create policy "reservations_employee_all" on reservations
  for all to authenticated using (public.is_employee()) with check (public.is_employee());
create policy "reservations_client_select_own" on reservations
  for select to authenticated using (
    public.is_client() and customer_email = auth.jwt() ->> 'email'
  );
create policy "reservations_client_insert" on reservations
  for insert to authenticated with check (public.is_client());

-- invoices: employees full CRUD; clients SELECT where reservation belongs to them
drop policy if exists "invoices_authenticated" on invoices;
create policy "invoices_employee_all" on invoices
  for all to authenticated using (public.is_employee()) with check (public.is_employee());
create policy "invoices_client_select_own" on invoices
  for select to authenticated using (
    public.is_client()
    and exists (
      select 1 from reservations r
      where r.id = invoices.reservation_id
      and r.customer_email = auth.jwt() ->> 'email'
    )
  );
