-- Unify chats and read-tracking by reservation_group_id (logical booking)
-- while preserving legacy reservation_id references for compatibility.

alter table public.chat_messages
  add column if not exists reservation_group_id uuid;

update public.chat_messages cm
set reservation_group_id = r.reservation_group_id
from public.reservations r
where r.id = cm.reservation_id
  and cm.reservation_group_id is null;

create or replace function public.set_chat_message_group_id()
returns trigger
language plpgsql
as $$
declare
  resolved_group_id uuid;
begin
  select reservation_group_id into resolved_group_id
  from public.reservations
  where id = new.reservation_id;

  if resolved_group_id is null then
    raise exception 'Reservation % not found for chat message', new.reservation_id;
  end if;

  if new.reservation_group_id is null then
    new.reservation_group_id := resolved_group_id;
  elsif new.reservation_group_id <> resolved_group_id then
    raise exception 'reservation_group_id does not match reservation_id';
  end if;

  return new;
end;
$$;

drop trigger if exists chat_messages_set_group_id on public.chat_messages;
create trigger chat_messages_set_group_id
before insert or update of reservation_id, reservation_group_id
on public.chat_messages
for each row
execute function public.set_chat_message_group_id();

alter table public.chat_messages
  alter column reservation_group_id set not null;

create index if not exists chat_messages_reservation_group_id_idx
  on public.chat_messages (reservation_group_id);
create index if not exists chat_messages_group_created_idx
  on public.chat_messages (reservation_group_id, created_at);

alter table public.chat_thread_reads
  add column if not exists reservation_group_id uuid;

update public.chat_thread_reads ctr
set reservation_group_id = r.reservation_group_id
from public.reservations r
where r.id = ctr.reservation_id
  and ctr.reservation_group_id is null;

with ranked_reads as (
  select
    ctid,
    row_number() over (
      partition by user_id, reservation_group_id
      order by read_at desc, reservation_id asc
    ) as row_rank
  from public.chat_thread_reads
)
delete from public.chat_thread_reads ctr
using ranked_reads rr
where ctr.ctid = rr.ctid
  and rr.row_rank > 1;

create or replace function public.set_chat_thread_read_group_id()
returns trigger
language plpgsql
as $$
declare
  resolved_group_id uuid;
begin
  select reservation_group_id into resolved_group_id
  from public.reservations
  where id = new.reservation_id;

  if resolved_group_id is null then
    raise exception 'Reservation % not found for thread read', new.reservation_id;
  end if;

  if new.reservation_group_id is null then
    new.reservation_group_id := resolved_group_id;
  elsif new.reservation_group_id <> resolved_group_id then
    raise exception 'reservation_group_id does not match reservation_id';
  end if;

  return new;
end;
$$;

drop trigger if exists chat_thread_reads_set_group_id on public.chat_thread_reads;
create trigger chat_thread_reads_set_group_id
before insert or update of reservation_id, reservation_group_id
on public.chat_thread_reads
for each row
execute function public.set_chat_thread_read_group_id();

alter table public.chat_thread_reads
  alter column reservation_group_id set not null;

create index if not exists chat_thread_reads_reservation_group_id_idx
  on public.chat_thread_reads (reservation_group_id);
create unique index if not exists chat_thread_reads_user_group_uidx
  on public.chat_thread_reads (user_id, reservation_group_id);

create or replace view public.client_stats as
with grouped_reservations as (
  select
    lower(customer_email) as email,
    reservation_group_id,
    max(customer_name) as customer_name,
    min(id) as primary_reservation_id,
    min(event_id) as event_id,
    string_agg(cabin_id, ', ' order by cabin_id) as cabin_ids,
    (array_agg(cabin_type order by id))[1] as cabin_type,
    (array_agg(status order by id))[1] as status,
    max(total_guests) as total_guests,
    max(total_price) as total_price,
    min(created_at) as created_at
  from public.reservations
  group by lower(customer_email), reservation_group_id
)
select
  email,
  max(customer_name) as name,
  count(*) as total_bookings,
  sum(total_price) as total_spent,
  jsonb_agg(
    jsonb_build_object(
      'id', primary_reservation_id::text,
      'reservationGroupId', reservation_group_id::text,
      'eventId', event_id,
      'cabinId', cabin_ids,
      'cabinType', cabin_type,
      'customerName', customer_name,
      'status', status,
      'totalGuests', total_guests,
      'totalPrice', total_price,
      'createdAt', created_at
    ) order by created_at desc
  ) as reservations
from grouped_reservations
group by email;
