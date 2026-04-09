-- Add image_urls array column to chat_messages
alter table public.chat_messages
  add column if not exists image_urls text[] not null default '{}';
