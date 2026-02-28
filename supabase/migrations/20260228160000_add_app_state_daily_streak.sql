create table if not exists public.app_state (
  id integer primary key default 1 check (id = 1),
  daily_streak integer not null default 0 check (daily_streak >= 0),
  last_open_date date,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.app_state enable row level security;

grant all on table public.app_state to anon;
grant all on table public.app_state to authenticated;
