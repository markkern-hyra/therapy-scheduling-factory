-- Статус перевірки страхування клієнта (AC-INS-01..06). Немає рядка — «Not set», тож картки без статусу не потребують
-- заповнення. Бачить той, хто бачить картку; позначає лише admin і scheduler; видалення не видано нікому.
create table public.client_insurance (
  client_id uuid primary key references public.clients (id) on delete cascade,
  status text not null check (status in ('verified', 'not_accepted', 'private_pay'))
);

alter table public.client_insurance enable row level security;

revoke all on table public.client_insurance from anon, authenticated;
grant select, insert on table public.client_insurance to authenticated;
grant update (status) on table public.client_insurance to authenticated;

create policy client_insurance_select
  on public.client_insurance
  for select
  to authenticated
  using ((select private.has_role('admin', 'scheduler')) or (select private.is_own_client(client_id)));

create policy client_insurance_insert_staff
  on public.client_insurance
  for insert
  to authenticated
  with check ((select private.has_role('admin', 'scheduler')));

create policy client_insurance_update_staff
  on public.client_insurance
  for update
  to authenticated
  using ((select private.has_role('admin', 'scheduler')))
  with check ((select private.has_role('admin', 'scheduler')));

create function public.set_insurance_status(p_client_id uuid, p_status text)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.client_insurance (client_id, status)
  values (p_client_id, p_status)
  on conflict (client_id) do update set status = excluded.status;
$$;

revoke execute on function public.set_insurance_status(uuid, text) from public, anon;
grant execute on function public.set_insurance_status(uuid, text) to authenticated;
