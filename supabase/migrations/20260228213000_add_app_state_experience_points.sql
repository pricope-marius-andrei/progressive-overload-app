alter table public.app_state
  add column if not exists experience_score integer not null default 0 check (experience_score >= 0),
  add column if not exists last_monthly_bonus_period date;
