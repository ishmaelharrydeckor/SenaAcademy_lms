--------------------------------------------------------------------------------
-- EVENT WAITLIST TABLE
--------------------------------------------------------------------------------
create table if not exists public.event_waitlist (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references public.events(id) on delete cascade not null,
    full_name text not null,
    email text not null,
    created_at timestamp with time zone default now() not null
);

-- Indexes for performance
create index if not exists idx_event_waitlist_event_id on public.event_waitlist(event_id);
create index if not exists idx_event_waitlist_email on public.event_waitlist(email);

-- Enable RLS
alter table public.event_waitlist enable row level security;

-- Row Level Security (RLS) Policies
drop policy if exists "Admins have full control of event waitlist" on public.event_waitlist;
create policy "Admins have full control of event waitlist" on public.event_waitlist
    for all using (public.get_user_role() = 'admin');

drop policy if exists "Anyone can join waitlist" on public.event_waitlist;
create policy "Anyone can join waitlist" on public.event_waitlist
    for insert with check (true);
