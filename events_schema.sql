-- Enable required extensions
create extension if not exists "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. EVENTS TABLE
--------------------------------------------------------------------------------
create table if not exists public.events (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    slug text unique not null,
    description text not null,
    cover_image_url text,
    event_type text not null check (event_type in ('online', 'in_person')),
    location text, -- physical address
    meeting_link text, -- meeting URL
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null,
    is_paid boolean default false not null,
    price numeric check (price >= 0),
    currency text default 'GHS' not null,
    capacity integer check (capacity > 0), -- max spots
    status text default 'draft' not null check (status in ('draft', 'published', 'cancelled')),
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default now() not null,
    constraint check_dates check (start_time <= end_time)
);

--------------------------------------------------------------------------------
-- 2. EVENT REGISTRATIONS TABLE
--------------------------------------------------------------------------------
create table if not exists public.event_registrations (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references public.events(id) on delete cascade not null,
    full_name text not null,
    email text not null,
    payment_status text default 'not_required' not null check (payment_status in ('not_required', 'pending', 'paid')),
    paystack_reference text unique,
    checked_in boolean default false not null,
    created_at timestamp with time zone default now() not null
);

--------------------------------------------------------------------------------
-- 3. INDEXES FOR PERFORMANCE
--------------------------------------------------------------------------------
create index if not exists idx_events_slug on public.events(slug);
create index if not exists idx_events_status on public.events(status);
create index if not exists idx_event_registrations_event_id on public.event_registrations(event_id);
create index if not exists idx_event_registrations_email on public.event_registrations(email);

--------------------------------------------------------------------------------
-- 4. ATOMIC CAPACITY-SAFE REGISTRATION FUNCTION
--------------------------------------------------------------------------------
-- Prevents race conditions where two simultaneous registrations both pass
-- a capacity check before either insert completes. This function checks
-- capacity and inserts the registration in a single atomic transaction.
create or replace function public.register_for_event(
    p_event_id uuid,
    p_full_name text,
    p_email text,
    p_payment_status text default 'not_required',
    p_paystack_reference text default null
)
returns table (registration_id uuid, success boolean, error_message text) as $$
declare
    v_capacity integer;
    v_current_count integer;
    v_status text;
    v_new_id uuid;
begin
    -- Lock the event row for the duration of this transaction to prevent races
    select capacity, status into v_capacity, v_status
    from public.events
    where id = p_event_id
    for update;

    if v_status is null then
        return query select null::uuid, false, 'Event not found'::text;
        return;
    end if;

    if v_status != 'published' then
        return query select null::uuid, false, 'Event is not open for registration'::text;
        return;
    end if;

    if v_capacity is not null then
        select count(*)::integer into v_current_count
        from public.event_registrations
        where event_id = p_event_id;

        if v_current_count >= v_capacity then
            return query select null::uuid, false, 'Event is full'::text;
            return;
        end if;
    end if;

    insert into public.event_registrations (event_id, full_name, email, payment_status, paystack_reference)
    values (p_event_id, p_full_name, p_email, p_payment_status, p_paystack_reference)
    returning id into v_new_id;

    return query select v_new_id, true, null::text;
end;
$$ language plpgsql security definer;

--------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

-- Events Policies
drop policy if exists "Anyone can view published events" on public.events;
create policy "Anyone can view published events" on public.events
    for select using (status = 'published');

drop policy if exists "Admins have full control of events" on public.events;
create policy "Admins have full control of events" on public.events
    for all using (public.get_user_role() = 'admin');

-- Event Registrations Policies
drop policy if exists "Admins have full control of event registrations" on public.event_registrations;
create policy "Admins have full control of event registrations" on public.event_registrations
    for all using (public.get_user_role() = 'admin');

--------------------------------------------------------------------------------
-- 6. SECURE METRICS AND VERIFICATION PROCEDURES (RPC)
--------------------------------------------------------------------------------
-- Securely returns the registration count for a given event without exposing attendee details
create or replace function public.get_event_attendee_count(p_event_id uuid)
returns integer as $$
declare
  v_count integer;
begin
  select count(*)::integer into v_count
  from public.event_registrations
  where event_id = p_event_id;
  return v_count;
end;
$$ language plpgsql security definer;

-- Securely checks and returns details for a specific payment reference
create or replace function public.check_registration_status(p_reference text)
returns jsonb as $$
declare
  reg_record record;
  event_record record;
begin
  select * into reg_record
  from public.event_registrations
  where paystack_reference = p_reference;
  
  if not found then
    return jsonb_build_object('registered', false);
  end if;
  
  select title, event_type, meeting_link, location into event_record
  from public.events
  where id = reg_record.event_id;
  
  return jsonb_build_object(
    'registered', true,
    'full_name', reg_record.full_name,
    'email', reg_record.email,
    'payment_status', reg_record.payment_status,
    'event_title', event_record.title,
    'event_type', event_record.event_type,
    'meeting_link', case when event_record.event_type = 'online' then event_record.meeting_link else null end,
    'location', event_record.location
  );
end;
$$ language plpgsql security definer;
