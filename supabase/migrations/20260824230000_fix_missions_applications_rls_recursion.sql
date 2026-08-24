-- Bug found while testing: any query touching profiles/applications/missions
-- started failing with "infinite recursion detected in policy for relation
-- applications" (Postgres 42P17).
--
-- Cause: "applications_select_own_or_mission_owner" (Sprint 1) already checks
-- missions via EXISTS. The previous migration added
-- "missions_select_accepted_candidate", which checks applications via EXISTS
-- in the opposite direction. That bidirectional EXISTS between the two
-- tables is a cycle Postgres's RLS planner can't resolve as a plain SQL
-- subquery — evaluating one table's policy re-triggers the other's, forever.
--
-- Fix: move the applications-side check into a SECURITY DEFINER function.
-- Such a function runs with the privileges of its owner (the Postgres role
-- that owns it, which bypasses RLS), so the inner lookup no longer
-- re-triggers applications' own policies and the cycle is broken.

create or replace function public.is_accepted_candidate_for_mission(p_mission_id uuid, p_candidate_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.applications
    where applications.mission_id = p_mission_id
      and applications.candidate_id = p_candidate_id
      and applications.status = 'accepted'
  );
$$;

drop policy if exists "missions_select_accepted_candidate" on public.missions;
create policy "missions_select_accepted_candidate"
  on public.missions for select
  using (public.is_accepted_candidate_for_mission(missions.id, auth.uid()));
