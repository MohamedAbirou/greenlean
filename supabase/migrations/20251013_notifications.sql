create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references auth.users(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  type text check (type in ('like', 'comment', 'reply', 'mention', 'challenge')),
  entity_id uuid not null,
  entity_type text check (entity_type in ('post', 'comment', 'challenge')),
  message text,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists notifications_recipient_read_idx on notifications (recipient_id, read);

alter table notifications enable row level security;

create policy "Users can read their own notifications"
on notifications for select
using (auth.uid() = recipient_id);

create policy "Service inserts notifications"
on notifications for insert
using (true)
with check (true);
