alter table "public"."app_state" disable row level security;

alter table "public"."excercise_set" alter column "exercise_id" set not null;

alter table "public"."excercise_set" alter column "updated_at" set not null;

alter table "public"."excercise_set" disable row level security;

alter table "public"."exercise" alter column "name" set not null;

alter table "public"."exercise" alter column "updated_at" set not null;

alter table "public"."exercise" alter column "workout_id" set not null;

alter table "public"."exercise" disable row level security;

alter table "public"."exercise_daily_snapshot" disable row level security;

alter table "public"."workout" alter column "name" set not null;

alter table "public"."workout" disable row level security;


