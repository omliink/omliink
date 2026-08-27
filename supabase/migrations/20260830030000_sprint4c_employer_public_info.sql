-- Sprint 4c follow-up: neither `profiles` nor `employer_profiles` has ever
-- had a policy letting a candidate read an employer's row before they've
-- applied to one of that employer's missions. The only existing reciprocal
-- policy (profiles_select_via_application_candidate, Sprint 2) requires an
-- EXISTING application — but the mission detail page already lets any
-- candidate view a published mission before applying, so the new "Publié
-- par [Nom]" display (this sprint's employer photo feature) silently
-- rendered nothing: both profiles.full_name and employer_profiles.photo_url
-- were blocked by RLS for a browsing-not-yet-applied candidate. Confirmed
-- empirically — the whole block failed to render in testing.
--
-- Fix: one shared SECURITY DEFINER helper, reused by a new SELECT policy on
-- each table, scoped to "this employer has at least one published
-- mission" — published-mission info (who posted it) is public-facing
-- marketplace content, not something that should be gated behind an
-- application. Using SECURITY DEFINER here for consistency with
-- is_applicant_for_mission (Sprint 4a), per project convention, even
-- though — like candidate_profiles_select_via_application (Sprint 2) —
-- there's no actual recursion risk: neither profiles nor employer_profiles
-- is ever referenced from missions' own policies, so the dependency is
-- one-directional either way.

create or replace function public.employer_has_published_mission(p_employer_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.missions
    where missions.employer_id = p_employer_id
      and missions.status = 'published'
  );
$$;

drop policy if exists "employer_profiles_select_via_published_mission" on public.employer_profiles;
create policy "employer_profiles_select_via_published_mission"
  on public.employer_profiles for select
  using (public.employer_has_published_mission(employer_profiles.user_id));

drop policy if exists "profiles_select_via_published_mission" on public.profiles;
create policy "profiles_select_via_published_mission"
  on public.profiles for select
  using (public.employer_has_published_mission(profiles.id));
