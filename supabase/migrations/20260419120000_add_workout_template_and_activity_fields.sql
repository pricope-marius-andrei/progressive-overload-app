alter table public.workout
  add column if not exists activity_date date null,
  add column if not exists template_workout_id bigint null;

alter table public.workout
  drop constraint if exists workout_template_workout_id_fkey;

alter table public.workout
  add constraint workout_template_workout_id_fkey
  foreign key (template_workout_id)
  references public.workout(id)
  on delete set null;

create index if not exists workout_activity_date_idx
  on public.workout (activity_date)
  where deleted_at is null;

create index if not exists workout_template_workout_id_idx
  on public.workout (template_workout_id)
  where deleted_at is null;

create unique index if not exists workout_user_daily_template_unique
  on public.workout (user_id, activity_date, template_workout_id)
  where deleted_at is null
    and activity_date is not null
    and template_workout_id is not null;
