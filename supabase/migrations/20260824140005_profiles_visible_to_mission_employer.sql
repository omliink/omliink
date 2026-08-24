-- The existing "profiles_select_own" policy only lets a user read their own
-- profile row. That's why the mission detail page (employer view) falls back
-- to the generic "Candidat" label instead of the applicant's real name — the
-- employer's session can't SELECT a candidate's profiles row.
--
-- This adds a second SELECT policy (RLS policies on the same command are
-- combined with OR, so this is additive and does not touch profiles_select_own):
-- an employer may read a candidate's profile if — and only if — that candidate
-- has an application on one of the employer's own missions.

drop policy if exists "profiles_select_via_application" on public.profiles;
create policy "profiles_select_via_application"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.applications
      join public.missions on missions.id = applications.mission_id
      where applications.candidate_id = profiles.id
        and missions.employer_id = auth.uid()
    )
  );
