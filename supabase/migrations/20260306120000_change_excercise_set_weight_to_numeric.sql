alter table "public"."excercise_set"
alter column "weight" type numeric
using ("weight"::numeric);
