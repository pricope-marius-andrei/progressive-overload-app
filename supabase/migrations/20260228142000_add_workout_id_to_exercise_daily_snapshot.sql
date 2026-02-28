alter table public.exercise_daily_snapshot
  add column if not exists workout_id bigint;

update public.exercise_daily_snapshot s
set workout_id = e.workout_id
from public.exercise e
where s.exercise_id = e.id
  and s.workout_id is null;

alter table public.exercise_daily_snapshot
  alter column workout_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'exercise_daily_snapshot_workout_id_fkey'
  ) then
    alter table public.exercise_daily_snapshot
      add constraint exercise_daily_snapshot_workout_id_fkey
      foreign key (workout_id)
      references public.workout(id)
      on update cascade
      on delete cascade;
  end if;
end $$;

create index if not exists idx_exercise_daily_snapshot_workout_id
  on public.exercise_daily_snapshot (workout_id);
