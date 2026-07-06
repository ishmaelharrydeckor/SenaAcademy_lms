-- Enable UUID generation extension
create extension if not exists "uuid-ossp";

-- 1. Cohorts Table
create table public.cohorts (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    start_date timestamp with time zone not null,
    end_date timestamp with time zone not null,
    max_students integer not null,
    status text not null check (status in ('upcoming', 'active', 'completed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Cohorts
alter table public.cohorts enable row level security;

-- 2. Profiles Table (extends auth.users)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    full_name text not null,
    role text not null check (role in ('student', 'facilitator', 'admin')),
    cohort_id uuid references public.cohorts(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- 3. Access Codes Table
create table public.access_codes (
    code text primary key,
    assigned_email text not null,
    cohort_id uuid not null references public.cohorts(id) on delete cascade,
    role text not null default 'student' check (role in ('student', 'facilitator', 'admin')),
    status text not null default 'unused' check (status in ('unused', 'redeemed', 'expired', 'revoked')),
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    redeemed_at timestamp with time zone
);

-- Enable RLS for Access Codes
alter table public.access_codes enable row level security;

-- 4. Modules Table
create table public.modules (
    id uuid primary key default uuid_generate_v4(),
    module_number integer not null unique,
    title text not null,
    description text not null,
    learning_outcomes text[] not null default '{}',
    objectives text[] not null default '{}',
    resources jsonb not null default '[]'::jsonb,
    assignment_title text not null,
    assignment_description text not null,
    assignment_deadline timestamp with time zone not null,
    assignment_rubric jsonb not null default '[]'::jsonb,
    unlock_date timestamp with time zone not null,
    is_visible boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Modules
alter table public.modules enable row level security;

-- 5. Submissions Table
create table public.submissions (
    id uuid primary key default uuid_generate_v4(),
    module_id uuid not null references public.modules(id) on delete cascade,
    student_id uuid not null references public.profiles(id) on delete cascade,
    submission_date timestamp with time zone default timezone('utc'::text, now()) not null,
    zip_file_url text,
    pdf_file_url text,
    github_url text,
    vercel_url text,
    drive_url text,
    comments text,
    status text not null default 'submitted' check (status in ('submitted', 'graded', 'resubmission_requested')),
    score numeric check (score >= 0),
    feedback_json jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(module_id, student_id)
);

-- Enable RLS for Submissions
alter table public.submissions enable row level security;

-- 6. Announcements Table
create table public.announcements (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    content text not null,
    cohort_id uuid references public.cohorts(id) on delete cascade, -- null means global
    created_by uuid not null references public.profiles(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Announcements
alter table public.announcements enable row level security;

-- 7. Notifications Table
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    message text not null,
    is_read boolean not null default false,
    link text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Notifications
alter table public.notifications enable row level security;


--------------------------------------------------------------------------------
-- TRIGGER: Auto-Create Profile on Signup (Or when profile is generated)
--------------------------------------------------------------------------------

-- This function runs when a user completes auth sign up.
-- It attempts to map metadata fields (role, full_name, cohort_id) into profiles.
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, role, cohort_id)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', 'Sena Trainee'),
        coalesce(new.raw_user_meta_data->>'role', 'student'),
        (new.raw_user_meta_data->>'cohort_id')::uuid
    );
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to sync auth.users with public.profiles
create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();


--------------------------------------------------------------------------------
-- SECURITY DEFINER RPCs (To safely query access codes without table access)
--------------------------------------------------------------------------------

-- Secure function to check access code validity before signing up
create or replace function public.verify_access_code(input_code text)
returns jsonb as $$
declare
    code_record record;
begin
    select * into code_record 
    from public.access_codes 
    where code = input_code;

    if not found then
        return jsonb_build_object('valid', false, 'reason', 'Access code not found.');
    end if;

    if code_record.status != 'unused' then
        return jsonb_build_object('valid', false, 'reason', 'This access code has already been ' || code_record.status || '.');
    end if;

    if code_record.expires_at < now() then
        -- Automatically flag as expired if queried after expiration
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


-- Secure function to redeem an access code and link details
create or replace function public.redeem_access_code(input_code text, user_id uuid)
returns boolean as $$
declare
    code_record record;
begin
    select * into code_record 
    from public.access_codes 
    where code = input_code and status = 'unused' and expires_at > now();

    if not found then
        return false;
    end if;

    -- Update access code status
    update public.access_codes 
    set status = 'redeemed', redeemed_at = now()
    where code = input_code;

    -- Update profile cohort and role just in case
    update public.profiles
    set cohort_id = code_record.cohort_id,
        role = code_record.role
    where id = user_id;

    return true;
end;
$$ language plpgsql security definer;


--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Helper functions for cleaner policy expressions
create or replace function public.get_user_role()
returns text as $$
    select role from public.profiles where id = auth.uid();
$$ language sql security definer;

-- Cohorts Policies
create policy "Users can view active/assigned cohorts" on public.cohorts
    for select using (
        public.get_user_role() in ('admin', 'facilitator') or
        exists (
            select 1 from public.profiles 
            where profiles.id = auth.uid() and profiles.cohort_id = cohorts.id
        )
    );

create policy "Admins have full control of cohorts" on public.cohorts
    for all using (
        public.get_user_role() = 'admin'
    );

-- Profiles Policies
create policy "Users can view their own profile" on public.profiles
    for select using (
        auth.uid() = id or
        public.get_user_role() in ('admin', 'facilitator')
    );

create policy "Users can update their own profile" on public.profiles
    for update using (
        auth.uid() = id or
        public.get_user_role() = 'admin'
    );

create policy "Admins have full control of profiles" on public.profiles
    for all using (
        public.get_user_role() = 'admin'
    );

-- Access Codes Policies (Admins only)
create policy "Admins have full control of access codes" on public.access_codes
    for all using (
        public.get_user_role() = 'admin'
    );

-- Modules Policies
create policy "Users can view unlocked visible modules" on public.modules
    for select using (
        public.get_user_role() in ('admin', 'facilitator') or
        (is_visible = true and unlock_date <= now())
    );

create policy "Admins have full control of modules" on public.modules
    for all using (
        public.get_user_role() = 'admin'
    );

-- Submissions Policies
create policy "Students can view their own submissions, facilitators/admins view all" on public.submissions
    for select using (
        student_id = auth.uid() or
        public.get_user_role() in ('admin', 'facilitator')
    );

create policy "Students can create submissions" on public.submissions
    for insert with check (
        student_id = auth.uid() and 
        public.get_user_role() = 'student'
    );

create policy "Students can update their submissions, facilitators/admins can grade" on public.submissions
    for update using (
        (student_id = auth.uid() and status != 'graded') or
        public.get_user_role() in ('admin', 'facilitator')
    );

create policy "Admins and facilitators can delete submissions" on public.submissions
    for delete using (
        public.get_user_role() in ('admin', 'facilitator')
    );

-- Announcements Policies
create policy "Users can view their cohort's announcements or global ones" on public.announcements
    for select using (
        public.get_user_role() in ('admin', 'facilitator') or
        cohort_id is null or
        exists (
            select 1 from public.profiles 
            where profiles.id = auth.uid() and profiles.cohort_id = announcements.cohort_id
        )
    );

create policy "Admins can manage announcements" on public.announcements
    for all using (
        public.get_user_role() = 'admin'
    );

-- Notifications Policies
create policy "Users can view and update their own notifications" on public.notifications
    for all using (
        user_id = auth.uid()
    );

--------------------------------------------------------------------------------
-- RELIABILITY & POLISH INDEXES & SCHEMAS
--------------------------------------------------------------------------------
create index if not exists idx_submissions_student_id on public.submissions(student_id);
create index if not exists idx_submissions_module_id on public.submissions(module_id);
create index if not exists idx_profiles_cohort_id on public.profiles(cohort_id);
create index if not exists idx_access_codes_status on public.access_codes(status);

-- Database-backed grading drafts
alter table public.submissions
  add column if not exists draft_feedback_json jsonb;

--------------------------------------------------------------------------------
-- PAYSTACK PAYMENTS SCHEMAS
--------------------------------------------------------------------------------
-- Paystack Payments Log Table
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

-- Enable RLS
alter table public.payments enable row level security;

-- Select Policy (Admins only - no public insert or select allowed)
create policy "Admins can view all payment records" on public.payments
    for select using (public.get_user_role() = 'admin');
