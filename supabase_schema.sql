--------------------------------------------------------------------------------
-- SENA ACADEMY LMS SYSTEM MASTER DATABASE SCHEMA
-- Idempotent Configuration (Safe to run multiple times)
--------------------------------------------------------------------------------

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Define custom User Role enum if it doesn't exist
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role_enum') then
    create type public.user_role_enum as enum ('student', 'facilitator', 'admin');
  end if;
end
$$;

--------------------------------------------------------------------------------
-- 1. COHORTS TABLE
--------------------------------------------------------------------------------
create table if not exists public.cohorts (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    start_date date not null,
    end_date date not null,
    max_students integer not null,
    status text default 'upcoming' not null check (status in ('upcoming', 'active', 'completed')),
    price numeric(10, 2) default 100.00 not null,
    created_at timestamp with time zone default now() not null
);

--------------------------------------------------------------------------------
-- 2. PROFILES TABLE (Synced with Auth.users)
--------------------------------------------------------------------------------
create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    email text unique not null,
    full_name text not null,
    role public.user_role_enum default 'student'::public.user_role_enum not null,
    cohort_id uuid references public.cohorts(id) on delete set null,
    created_at timestamp with time zone default now() not null
);

--------------------------------------------------------------------------------
-- 3. AUTH TRIGGER (Auto-populate profiles on signup)
--------------------------------------------------------------------------------
create or replace function public.on_auth_user_created()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, cohort_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Trainee'),
    coalesce(new.raw_user_meta_data->>'role', 'student')::public.user_role_enum,
    (new.raw_user_meta_data->>'cohort_id')::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists before creating
drop trigger if exists on_auth_user_created_trigger on auth.users;
create trigger on_auth_user_created_trigger
  after insert on auth.users
  for each row execute function public.on_auth_user_created();

--------------------------------------------------------------------------------
-- 4. ACCESS CODES TABLE
--------------------------------------------------------------------------------
create table if not exists public.access_codes (
    id uuid default gen_random_uuid() primary key,
    code text unique not null,
    assigned_email text not null,
    cohort_id uuid references public.cohorts(id) on delete cascade,
    role text default 'student' not null check (role in ('student', 'facilitator', 'admin')),
    status text default 'unused' not null check (status in ('unused', 'redeemed', 'expired', 'revoked')),
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone default now() not null,
    redeemed_at timestamp with time zone,
    redeemed_by uuid references public.profiles(id)
);

--------------------------------------------------------------------------------
-- 5. SECURE ACCESS CODE PROCEDURES (RPC)
--------------------------------------------------------------------------------
-- Verify Access Code
create or replace function public.verify_access_code(input_code text)
returns jsonb as $$
declare
  code_record record;
begin
  select * into code_record
  from public.access_codes
  where code = input_code;

  if not found then
    return jsonb_build_object('valid', false, 'reason', 'Access code does not exist.');
  end if;

  if code_record.status != 'unused' then
    return jsonb_build_object('valid', false, 'reason', 'This access code is ' || code_record.status || '.');
  end if;

  if code_record.expires_at < now() then
    -- Auto expire code in lookup
    update public.access_codes set status = 'expired' where code = input_code;
    return jsonb_build_object('valid', false, 'reason', 'This access code has expired.');
  end if;

  return jsonb_build_object(
    'valid', true,
    'email', code_record.assigned_email,
    'cohort_id', code_record.cohort_id,
    'role', code_record.role
  );
end;
$$ language plpgsql security definer;

-- Redeem Access Code
create or replace function public.redeem_access_code(input_code text, user_id uuid)
returns boolean as $$
declare
  code_record record;
begin
  select * into code_record
  from public.access_codes
  where code = input_code;

  if not found or code_record.status != 'unused' or code_record.expires_at < now() then
    return false;
  end if;

  -- 1. Update the status of the code to redeemed
  update public.access_codes
  set status = 'redeemed',
      redeemed_at = now(),
      redeemed_by = user_id
  where code = input_code;

  -- 2. Link the student profile to the cohort in the profiles table
  update public.profiles
  set cohort_id = code_record.cohort_id,
      role = code_record.role::public.user_role_enum
  where id = user_id;

  return true;
end;
$$ language plpgsql security definer;

--------------------------------------------------------------------------------
-- 6. CURRICULUM MODULES TABLE
--------------------------------------------------------------------------------
create table if not exists public.modules (
    id uuid default gen_random_uuid() primary key,
    module_number integer unique not null,
    title text not null,
    description text not null,
    learning_outcomes text[] default '{}'::text[] not null,
    objectives text[] default '{}'::text[] not null,
    resources jsonb default '[]'::jsonb not null,
    assignment_title text not null,
    assignment_description text not null,
    assignment_deadline timestamp with time zone not null,
    assignment_rubric jsonb default '[]'::jsonb not null,
    unlock_date timestamp with time zone not null,
    is_visible boolean default true not null,
    created_at timestamp with time zone default now() not null
);

--------------------------------------------------------------------------------
-- 7. SUBMISSIONS TABLE
--------------------------------------------------------------------------------
create table if not exists public.submissions (
    id uuid default gen_random_uuid() primary key,
    module_id uuid references public.modules(id) on delete cascade not null,
    student_id uuid references public.profiles(id) on delete cascade not null,
    submission_date timestamp with time zone default now() not null,
    zip_file_url text, -- Stores R2 key
    pdf_file_url text, -- Stores R2 key
    github_url text,
    vercel_url text,
    drive_url text,
    comments text,
    status text default 'submitted' not null check (status in ('submitted', 'graded', 'resubmission_requested')),
    score integer check (score >= 0 and score <= 100),
    feedback_json jsonb,
    draft_feedback_json jsonb, -- Database-backed grading draft
    created_at timestamp with time zone default now() not null
);

--------------------------------------------------------------------------------
-- 8. ANNOUNCEMENTS TABLE
--------------------------------------------------------------------------------
create table if not exists public.announcements (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    content text not null,
    cohort_id uuid references public.cohorts(id) on delete cascade, -- Null means global/all cohorts
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default now() not null
);

--------------------------------------------------------------------------------
-- 9. NOTIFICATIONS TABLE (Real-time updates)
--------------------------------------------------------------------------------
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    message text not null,
    link text,
    is_read boolean default false not null,
    created_at timestamp with time zone default now() not null
);

--------------------------------------------------------------------------------
-- 10. PAYSTACK PAYMENTS TABLE
--------------------------------------------------------------------------------
create table if not exists public.payments (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    full_name text not null,
    cohort_id uuid references public.cohorts(id) on delete cascade,
    paystack_reference text unique not null,
    amount numeric not null,
    currency text default 'GHS' not null,
    status text not null check (status in ('success', 'failed')),
    access_code_generated boolean default false not null,
    created_at timestamp with time zone default now() not null
);

--------------------------------------------------------------------------------
-- 11. INDEXES FOR PERFORMANCE OPTIMIZATIONS
--------------------------------------------------------------------------------
create index if not exists idx_submissions_student_id on public.submissions(student_id);
create index if not exists idx_submissions_module_id on public.submissions(module_id);
create index if not exists idx_profiles_cohort_id on public.profiles(cohort_id);
create index if not exists idx_access_codes_status on public.access_codes(status);
create index if not exists idx_payments_reference on public.payments(paystack_reference);

--------------------------------------------------------------------------------
-- 12. ROLE HELPER RPC (Determines current profile role)
--------------------------------------------------------------------------------
create or replace function public.get_user_role()
returns text as $$
declare
  user_role text;
begin
  select role::text into user_role
  from public.profiles
  where id = auth.uid();
  
  return coalesce(user_role, 'student');
end;
$$ language plpgsql security definer;

--------------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------
-- Enable RLS on all tables
alter table public.cohorts enable row level security;
alter table public.profiles enable row level security;
alter table public.access_codes enable row level security;
alter table public.modules enable row level security;
alter table public.submissions enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.payments enable row level security;

-- Cohorts Policies
drop policy if exists "Admins can view and manage cohorts" on public.cohorts;
create policy "Admins can view and manage cohorts" on public.cohorts
    for all using (public.get_user_role() = 'admin');

drop policy if exists "Trainees and facilitators can view active cohorts" on public.cohorts;
create policy "Trainees and facilitators can view active cohorts" on public.cohorts
    for select using (true);

-- Profiles Policies
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users" on public.profiles
    for select using (auth.uid() is not null);

drop policy if exists "Users can update their own names" on public.profiles;
create policy "Users can update their own names" on public.profiles
    for update using (id = auth.uid());

drop policy if exists "Admins have full control of profiles" on public.profiles;
create policy "Admins have full control of profiles" on public.profiles
    for all using (public.get_user_role() = 'admin');

-- Access Codes Policies
drop policy if exists "Admins have full control of access codes" on public.access_codes;
create policy "Admins have full control of access codes" on public.access_codes
    for all using (public.get_user_role() = 'admin');

-- Modules Policies
drop policy if exists "Users can view unlocked visible modules" on public.modules;
create policy "Users can view unlocked visible modules" on public.modules
    for select using (
        public.get_user_role() in ('admin', 'facilitator') or
        (is_visible = true and unlock_date <= now())
    );

drop policy if exists "Admins have full control of modules" on public.modules;
create policy "Admins have full control of modules" on public.modules
    for all using (public.get_user_role() = 'admin');

-- Submissions Policies
drop policy if exists "Students can view their own submissions, facilitators/admins view all" on public.submissions;
create policy "Students can view their own submissions, facilitators/admins view all" on public.submissions
    for select using (
        student_id = auth.uid() or
        public.get_user_role() in ('admin', 'facilitator')
    );

drop policy if exists "Students can create submissions" on public.submissions;
create policy "Students can create submissions" on public.submissions
    for insert with check (
        student_id = auth.uid() and 
        public.get_user_role() = 'student'
    );

drop policy if exists "Students can update their submissions, facilitators/admins can grade" on public.submissions;
create policy "Students can update their submissions, facilitators/admins can grade" on public.submissions
    for update using (
        (student_id = auth.uid() and status != 'graded') or
        public.get_user_role() in ('admin', 'facilitator')
    );

drop policy if exists "Admins and facilitators can delete submissions" on public.submissions;
create policy "Admins and facilitators can delete submissions" on public.submissions
    for delete using (
        public.get_user_role() in ('admin', 'facilitator')
    );

-- Announcements Policies
drop policy if exists "Users can view their cohort's announcements or global ones" on public.announcements;
create policy "Users can view their cohort's announcements or global ones" on public.announcements
    for select using (
        public.get_user_role() in ('admin', 'facilitator') or
        cohort_id is null or
        exists (
            select 1 from public.profiles 
            where profiles.id = auth.uid() and profiles.cohort_id = announcements.cohort_id
        )
    );

drop policy if exists "Admins can manage announcements" on public.announcements;
create policy "Admins can manage announcements" on public.announcements
    for all using (public.get_user_role() = 'admin');

-- Notifications Policies
drop policy if exists "Users can view and update their own notifications" on public.notifications;
drop policy if exists "Users can select their own notifications" on public.notifications;
create policy "Users can select their own notifications" on public.notifications
    for select using (user_id = auth.uid());

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications" on public.notifications
    for update using (user_id = auth.uid());

drop policy if exists "Users can delete their own notifications" on public.notifications;
create policy "Users can delete their own notifications" on public.notifications
    for delete using (user_id = auth.uid());

drop policy if exists "Admins and facilitators can insert notifications" on public.notifications;
create policy "Admins and facilitators can insert notifications" on public.notifications
    for insert with check (
        public.get_user_role() in ('admin', 'facilitator') or user_id = auth.uid()
    );

-- Payments Policies (Admins only)
drop policy if exists "Admins can view all payment records" on public.payments;
drop policy if exists "Admins have full control of payments" on public.payments;
create policy "Admins have full control of payments" on public.payments
    for all using (public.get_user_role() = 'admin');

--------------------------------------------------------------------------------
-- DATA MANAGEMENT & PASSWORD RESETS UPGRADES
--------------------------------------------------------------------------------
-- Track deleted submission assets
alter table public.submissions 
  add column if not exists zip_file_deleted boolean default false not null,
  add column if not exists pdf_file_deleted boolean default false not null;

-- Safe cohort archiving
alter table public.cohorts 
  add column if not exists is_archived boolean default false not null;

-- Password Reset Requests Table
create table if not exists public.password_reset_requests (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    message text,
    status text default 'pending' not null check (status in ('pending', 'resolved')),
    resolved_by uuid references public.profiles(id),
    resolved_at timestamp with time zone,
    created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.password_reset_requests enable row level security;

-- Policies
drop policy if exists "Anyone can submit password reset requests" on public.password_reset_requests;
create policy "Anyone can submit password reset requests" on public.password_reset_requests
    for insert with check (true);

drop policy if exists "Admins can view and manage password reset requests" on public.password_reset_requests;
create policy "Admins can view and manage password reset requests" on public.password_reset_requests
    for all using (public.get_user_role() = 'admin');

-- Safe cohort cascading database deletion transaction RPC
create or replace function public.delete_cohort_db_cascade(target_cohort_id uuid)
returns void as $$
begin
  -- 1. Delete all submissions for students in this cohort
  delete from public.submissions
  where student_id in (select id from public.profiles where cohort_id = target_cohort_id);
  
  -- 2. Delete all access codes tied to this cohort
  delete from public.access_codes
  where cohort_id = target_cohort_id;
  
  -- 3. Delete all profiles rows in this cohort (which cascades to Auth.users via metadata/triggers if set, otherwise deletes database profiles)
  delete from public.profiles
  where cohort_id = target_cohort_id;
  
  -- 4. Delete the cohort itself
  delete from public.cohorts
  where id = target_cohort_id;
end;
$$ language plpgsql security definer;

--------------------------------------------------------------------------------
-- 14. SITE SETTINGS TABLE
--------------------------------------------------------------------------------
create table if not exists public.site_settings (
    key text primary key,
    value text not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.site_settings enable row level security;

-- Policies
drop policy if exists "Site settings are viewable by anyone" on public.site_settings;
create policy "Site settings are viewable by anyone" on public.site_settings
    for select using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings" on public.site_settings
    for all using (public.get_user_role() = 'admin');

-- Seed initial settings
insert into public.site_settings (key, value)
values ('whatsapp_member_count', '238')
on conflict (key) do nothing;
