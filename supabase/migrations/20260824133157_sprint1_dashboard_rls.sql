-- Sprint 1 (dashboards + missions) RLS policies.
-- Discovered missing during end-to-end testing: onboarding's upsert into `profiles`
-- failed with 42501 "new row violates row-level security policy" — there was no
-- INSERT policy letting an authenticated user create their own profile row.
-- This migration adds the minimal owner-based policies needed for the Sprint 1
-- flows (onboarding, employer/candidate dashboards, mission creation, applications).
-- Every policy is scoped to auth.uid() matching the row's owner column, and
-- DROP POLICY IF EXISTS is used first so this migration is safe to re-run.

-- profiles: a user can see/insert/update only their own row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- candidate_profiles: same owner pattern, keyed on user_id.
drop policy if exists "candidate_profiles_select_own" on public.candidate_profiles;
create policy "candidate_profiles_select_own"
  on public.candidate_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "candidate_profiles_insert_own" on public.candidate_profiles;
create policy "candidate_profiles_insert_own"
  on public.candidate_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "candidate_profiles_update_own" on public.candidate_profiles;
create policy "candidate_profiles_update_own"
  on public.candidate_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- employer_profiles: same owner pattern, keyed on user_id.
drop policy if exists "employer_profiles_select_own" on public.employer_profiles;
create policy "employer_profiles_select_own"
  on public.employer_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "employer_profiles_insert_own" on public.employer_profiles;
create policy "employer_profiles_insert_own"
  on public.employer_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "employer_profiles_update_own" on public.employer_profiles;
create policy "employer_profiles_update_own"
  on public.employer_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- service_categories: public reference data, readable by any authenticated user.
drop policy if exists "service_categories_select_all" on public.service_categories;
create policy "service_categories_select_all"
  on public.service_categories for select
  to authenticated
  using (true);

-- missions: employers manage their own missions; any authenticated user can
-- browse published missions (needed for the candidate dashboard listing).
drop policy if exists "missions_select_own_or_published" on public.missions;
create policy "missions_select_own_or_published"
  on public.missions for select
  using (auth.uid() = employer_id or status = 'published');

drop policy if exists "missions_insert_own" on public.missions;
create policy "missions_insert_own"
  on public.missions for insert
  with check (auth.uid() = employer_id);

drop policy if exists "missions_update_own" on public.missions;
create policy "missions_update_own"
  on public.missions for update
  using (auth.uid() = employer_id)
  with check (auth.uid() = employer_id);

-- applications: a candidate sees/creates their own applications; the employer
-- who owns the related mission can see them too and update their status
-- (accept/reject).
drop policy if exists "applications_select_own_or_mission_owner" on public.applications;
create policy "applications_select_own_or_mission_owner"
  on public.applications for select
  using (
    auth.uid() = candidate_id
    or exists (
      select 1 from public.missions
      where missions.id = applications.mission_id
        and missions.employer_id = auth.uid()
    )
  );

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own"
  on public.applications for insert
  with check (auth.uid() = candidate_id);

drop policy if exists "applications_update_mission_owner" on public.applications;
create policy "applications_update_mission_owner"
  on public.applications for update
  using (
    exists (
      select 1 from public.missions
      where missions.id = applications.mission_id
        and missions.employer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.missions
      where missions.id = applications.mission_id
        and missions.employer_id = auth.uid()
    )
  );
