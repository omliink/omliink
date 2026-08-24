-- Reciprocal of "profiles_select_via_application" (Sprint 1: employer sees a
-- candidate's profile once that candidate applied to one of the employer's
-- missions). Symmetric case: a candidate may read the profile of the
-- employer behind a mission they applied to — needed so the messaging
-- thread can show the employer's real name instead of falling back to
-- "Utilisateur". Additive (SELECT policies on the same table are combined
-- with OR); does not touch the existing policy.

drop policy if exists "profiles_select_via_application_candidate" on public.profiles;
create policy "profiles_select_via_application_candidate"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.applications
      join public.missions on missions.id = applications.mission_id
      where missions.employer_id = profiles.id
        and applications.candidate_id = auth.uid()
    )
  );
