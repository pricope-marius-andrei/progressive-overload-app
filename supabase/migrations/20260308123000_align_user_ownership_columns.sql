-- Align data ownership with authenticated users.
-- This migration adds user ownership columns, enables RLS, and creates owner-based policies.

begin;

-- app_state was initially a singleton row (id = 1). Convert it to multi-row so each user can own one row.
alter table public.app_state
  alter column id drop default;

alter table public.app_state
  drop constraint if exists app_state_id_check;

do $$
begin
  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'S'
      and c.relname = 'app_state_id_seq'
      and n.nspname = 'public'
  ) then
    create sequence public.app_state_id_seq;
  end if;
end $$;

alter sequence public.app_state_id_seq owned by public.app_state.id;

select setval(
  'public.app_state_id_seq',
  greatest((select coalesce(max(id), 0) from public.app_state), 1),
  true
);

alter table public.app_state
  alter column id set default nextval('public.app_state_id_seq');

-- Ownership columns.
alter table public.app_state add column if not exists user_id uuid;
alter table public.workout add column if not exists user_id uuid;
alter table public.exercise add column if not exists user_id uuid;
alter table public.excercise_set add column if not exists user_id uuid;
alter table public.exercise_daily_snapshot add column if not exists user_id uuid;
alter table public.exercise_performance_index add column if not exists user_id uuid;
alter table public.gym_place add column if not exists user_id uuid;

-- Defaults for new rows from authenticated clients.
alter table public.app_state alter column user_id set default auth.uid();
alter table public.workout alter column user_id set default auth.uid();
alter table public.exercise alter column user_id set default auth.uid();
alter table public.excercise_set alter column user_id set default auth.uid();
alter table public.exercise_daily_snapshot alter column user_id set default auth.uid();
alter table public.exercise_performance_index alter column user_id set default auth.uid();
alter table public.gym_place alter column user_id set default auth.uid();

-- Backfill ownership across related tables where parent ownership is already known.
update public.exercise e
set user_id = w.user_id
from public.workout w
where e.workout_id = w.id
  and e.user_id is null
  and w.user_id is not null;

update public.excercise_set s
set user_id = e.user_id
from public.exercise e
where s.exercise_id = e.id
  and s.user_id is null
  and e.user_id is not null;

update public.exercise_daily_snapshot s
set user_id = e.user_id
from public.exercise e
where s.exercise_id = e.id
  and s.user_id is null
  and e.user_id is not null;

update public.exercise_daily_snapshot s
set user_id = w.user_id
from public.workout w
where s.workout_id = w.id
  and s.user_id is null
  and w.user_id is not null;

update public.exercise_performance_index p
set user_id = e.user_id
from public.exercise e
where p.exercise_id = e.id
  and p.user_id is null
  and e.user_id is not null;

update public.exercise_performance_index p
set user_id = w.user_id
from public.workout w
where p.workout_id = w.id
  and p.user_id is null
  and w.user_id is not null;

-- For legacy single-user environments, adopt pre-auth rows into the first user account.
do $$
declare
  bootstrap_user_id uuid;
begin
  select id into bootstrap_user_id
  from auth.users
  order by created_at asc
  limit 1;

  if bootstrap_user_id is not null then
    update public.workout set user_id = bootstrap_user_id where user_id is null;
    update public.exercise set user_id = bootstrap_user_id where user_id is null;
    update public.excercise_set set user_id = bootstrap_user_id where user_id is null;
    update public.exercise_daily_snapshot set user_id = bootstrap_user_id where user_id is null;
    update public.exercise_performance_index set user_id = bootstrap_user_id where user_id is null;
    update public.app_state set user_id = bootstrap_user_id where user_id is null;
    update public.gym_place set user_id = bootstrap_user_id where user_id is null;
  end if;
end $$;

-- Foreign keys to auth.users.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'app_state_user_id_fkey'
  ) then
    alter table public.app_state
      add constraint app_state_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'workout_user_id_fkey'
  ) then
    alter table public.workout
      add constraint workout_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'exercise_user_id_fkey'
  ) then
    alter table public.exercise
      add constraint exercise_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'excercise_set_user_id_fkey'
  ) then
    alter table public.excercise_set
      add constraint excercise_set_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'exercise_daily_snapshot_user_id_fkey'
  ) then
    alter table public.exercise_daily_snapshot
      add constraint exercise_daily_snapshot_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'exercise_performance_index_user_id_fkey'
  ) then
    alter table public.exercise_performance_index
      add constraint exercise_performance_index_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'gym_place_user_id_fkey'
  ) then
    alter table public.gym_place
      add constraint gym_place_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete set null;
  end if;
end $$;

-- Indexes used by RLS and filters.
create index if not exists app_state_user_id_idx
  on public.app_state (user_id);

create unique index if not exists app_state_user_id_unique
  on public.app_state (user_id)
  where user_id is not null;

create index if not exists workout_user_id_idx
  on public.workout (user_id);

create index if not exists exercise_user_id_idx
  on public.exercise (user_id);

create index if not exists excercise_set_user_id_idx
  on public.excercise_set (user_id);

create index if not exists exercise_daily_snapshot_user_id_idx
  on public.exercise_daily_snapshot (user_id);

create index if not exists exercise_performance_index_user_id_idx
  on public.exercise_performance_index (user_id);

create index if not exists gym_place_user_id_idx
  on public.gym_place (user_id);

-- Enforce row-level security.
alter table public.app_state enable row level security;
alter table public.workout enable row level security;
alter table public.exercise enable row level security;
alter table public.excercise_set enable row level security;
alter table public.exercise_daily_snapshot enable row level security;
alter table public.exercise_performance_index enable row level security;
alter table public.gym_place enable row level security;

-- Drop stale policies if they exist, then re-create canonical policies.
drop policy if exists app_state_select_own on public.app_state;
drop policy if exists app_state_insert_own on public.app_state;
drop policy if exists app_state_update_own on public.app_state;

drop policy if exists workout_select_own on public.workout;
drop policy if exists workout_insert_own on public.workout;
drop policy if exists workout_update_own on public.workout;

drop policy if exists exercise_select_own on public.exercise;
drop policy if exists exercise_insert_own on public.exercise;
drop policy if exists exercise_update_own on public.exercise;

drop policy if exists excercise_set_select_own on public.excercise_set;
drop policy if exists excercise_set_insert_own on public.excercise_set;
drop policy if exists excercise_set_update_own on public.excercise_set;
drop policy if exists excercise_set_delete_own on public.excercise_set;

drop policy if exists exercise_daily_snapshot_select_own on public.exercise_daily_snapshot;
drop policy if exists exercise_daily_snapshot_insert_own on public.exercise_daily_snapshot;
drop policy if exists exercise_daily_snapshot_update_own on public.exercise_daily_snapshot;

drop policy if exists exercise_performance_index_select_own on public.exercise_performance_index;
drop policy if exists exercise_performance_index_insert_own on public.exercise_performance_index;
drop policy if exists exercise_performance_index_update_own on public.exercise_performance_index;

drop policy if exists gym_place_select_authenticated on public.gym_place;
drop policy if exists gym_place_insert_own on public.gym_place;
drop policy if exists gym_place_update_own on public.gym_place;

create policy app_state_select_own
  on public.app_state
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy app_state_insert_own
  on public.app_state
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy app_state_update_own
  on public.app_state
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy workout_select_own
  on public.workout
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy workout_insert_own
  on public.workout
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy workout_update_own
  on public.workout
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy exercise_select_own
  on public.exercise
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy exercise_insert_own
  on public.exercise
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy exercise_update_own
  on public.exercise
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy excercise_set_select_own
  on public.excercise_set
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy excercise_set_insert_own
  on public.excercise_set
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy excercise_set_update_own
  on public.excercise_set
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy excercise_set_delete_own
  on public.excercise_set
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy exercise_daily_snapshot_select_own
  on public.exercise_daily_snapshot
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy exercise_daily_snapshot_insert_own
  on public.exercise_daily_snapshot
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy exercise_daily_snapshot_update_own
  on public.exercise_daily_snapshot
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy exercise_performance_index_select_own
  on public.exercise_performance_index
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy exercise_performance_index_insert_own
  on public.exercise_performance_index
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy exercise_performance_index_update_own
  on public.exercise_performance_index
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Community gyms remain shareable for all authenticated users,
-- but ownership is preserved for mutation rights.
create policy gym_place_select_authenticated
  on public.gym_place
  for select
  to authenticated
  using (true);

create policy gym_place_insert_own
  on public.gym_place
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy gym_place_update_own
  on public.gym_place
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;
