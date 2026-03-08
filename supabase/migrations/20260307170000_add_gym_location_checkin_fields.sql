alter table public.app_state
  add column if not exists gym_latitude double precision,
  add column if not exists gym_longitude double precision,
  add column if not exists gym_radius_m integer not null default 120,
  add column if not exists last_gym_checkin_date date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'app_state_gym_radius_m_check'
  ) then
    alter table public.app_state
      add constraint app_state_gym_radius_m_check
      check (gym_radius_m >= 20 and gym_radius_m <= 1000);
  end if;
end $$;
