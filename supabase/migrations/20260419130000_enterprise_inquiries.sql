-- Enterprise inquiry intake for the-ai-rank.
-- Separate table from signups — different schema, different access model,
-- different retention policy (sales leads need to be kept longer).

create table if not exists public.enterprise_inquiries (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- Who
  company         text not null,
  contact_name    text not null,
  email           text not null,

  -- What (structured select values)
  employee_count  text,            -- 'under_50' | '50_300' | '300_1000' | 'over_1000' | 'unspecified'
  budget_range    text,            -- 'under_1m' | '1_5m' | '5_10m' | 'over_10m' | 'unspecified'
  timeline        text,            -- 'within_3m' | '3_6m' | '6_12m' | 'over_12m' | 'unspecified'

  -- Free text
  message         text,

  -- Context
  client_at       timestamptz,
  url             text,
  referrer        text,
  user_agent      text,
  ip              text
);

create index if not exists enterprise_inquiries_created_at_idx
  on public.enterprise_inquiries (created_at desc);
create index if not exists enterprise_inquiries_company_idx
  on public.enterprise_inquiries (lower(company));

-- RLS enabled; server-side writes only (service_role bypasses RLS).
alter table public.enterprise_inquiries enable row level security;
