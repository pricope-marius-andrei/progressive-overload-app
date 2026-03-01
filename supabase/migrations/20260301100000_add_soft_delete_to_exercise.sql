alter table public.exercise
  add column if not exists deleted_at timestamptz;

create index if not exists idx_exercise_workout_active
  on public.exercise (workout_id, id)
  where deleted_at is null;
