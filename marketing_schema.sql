-- Enable uuid extension if not exists
create extension if not exists "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. MARKETING OBJECTIONS TABLE
--------------------------------------------------------------------------------
create table if not exists public.marketing_objections (
    id uuid default gen_random_uuid() primary key,
    objection_text text not null,
    category text default 'other' check (category in ('price', 'time', 'laptop', 'fear', 'other')),
    source_context text, -- WhatsApp chat log or email snippet
    frequency_count integer default 1 not null,
    resolved boolean default false not null,
    created_at timestamp with time zone default now() not null
);

--------------------------------------------------------------------------------
-- 2. TIKTOK CREATIVE RESEARCH TABLE
--------------------------------------------------------------------------------
create table if not exists public.marketing_tiktok_research (
    id uuid default gen_random_uuid() primary key,
    url text unique not null,
    title text,
    transcript text,
    analysis jsonb, -- Hook, 3s patterns, story structure, CTA, Sena adaptation
    status text default 'pending' not null check (status in ('pending', 'analyzed', 'failed')),
    created_at timestamp with time zone default now() not null
);

--------------------------------------------------------------------------------
-- 3. MARKETING SCRIPTS TABLE
--------------------------------------------------------------------------------
create table if not exists public.marketing_scripts (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    hook text,
    script_body text not null, -- Script content with visual & audio directives
    objection_id uuid references public.marketing_objections(id) on delete set null,
    research_id uuid references public.marketing_tiktok_research(id) on delete set null,
    framework_used text, -- e.g., "Problem-Agitate-Solve", "VSL Offer Sequence"
    repurposed_email text, -- Generated email newsletter version
    repurposed_linkedin text, -- Generated LinkedIn post version
    created_at timestamp with time zone default now() not null
);

--------------------------------------------------------------------------------
-- 4. MARKETING CONTENT PLAN TABLE
--------------------------------------------------------------------------------
create table if not exists public.marketing_content_plan (
    id uuid default gen_random_uuid() primary key,
    publish_date date not null,
    script_id uuid references public.marketing_scripts(id) on delete set null,
    status text default 'planned' not null check (status in ('planned', 'scripted', 'recorded', 'published')),
    created_at timestamp with time zone default now() not null
);

-- Enable Row Level Security (RLS)
alter table public.marketing_objections enable row level security;
alter table public.marketing_tiktok_research enable row level security;
alter table public.marketing_scripts enable row level security;
alter table public.marketing_content_plan enable row level security;

-- Create policies to allow all actions for authenticated users (or bypass if using service role key)
create policy "Allow all actions for authenticated users on marketing_objections"
    on public.marketing_objections for all to authenticated using (true);
create policy "Allow all actions for authenticated users on marketing_tiktok_research"
    on public.marketing_tiktok_research for all to authenticated using (true);
create policy "Allow all actions for authenticated users on marketing_scripts"
    on public.marketing_scripts for all to authenticated using (true);
create policy "Allow all actions for authenticated users on marketing_content_plan"
    on public.marketing_content_plan for all to authenticated using (true);

-- Also allow public select if needed (optional)
create policy "Allow public read-only access on marketing_content_plan"
    on public.marketing_content_plan for select to public using (true);
