-- RLS for chat-images: employees manage all objects; clients may upload/read only
-- under folders named with their reservation_group_id (matches app upload paths).

-- Ensure bucket exists when migrations run without local config.toml seeding the bucket.
insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', false)
on conflict (id) do nothing;

drop policy if exists "chat_images_employee_all" on storage.objects;
create policy "chat_images_employee_all"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'chat-images' and public.is_employee())
  with check (bucket_id = 'chat-images' and public.is_employee());

drop policy if exists "chat_images_client_insert_own" on storage.objects;
create policy "chat_images_client_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'chat-images'
    and public.is_client()
    and exists (
      select 1
      from public.reservations r
      where r.reservation_group_id::text = split_part(name, '/', 1)
        and r.customer_email = auth.jwt() ->> 'email'
    )
  );

drop policy if exists "chat_images_client_select_own" on storage.objects;
create policy "chat_images_client_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'chat-images'
    and public.is_client()
    and exists (
      select 1
      from public.reservations r
      where r.reservation_group_id::text = split_part(name, '/', 1)
        and r.customer_email = auth.jwt() ->> 'email'
    )
  );
