-- Restrict gym_place visibility to each authenticated user's own gyms list.

begin;

drop policy if exists gym_place_select_authenticated on public.gym_place;
drop policy if exists gym_place_select_own on public.gym_place;
drop policy if exists gym_place_delete_own on public.gym_place;

create policy gym_place_select_own
  on public.gym_place
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy gym_place_delete_own
  on public.gym_place
  for delete
  to authenticated
  using (auth.uid() = user_id);

commit;
