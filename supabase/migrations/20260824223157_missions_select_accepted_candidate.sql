-- Bug found while testing: after ending a visio call, the accepted
-- candidate hit "Mission introuvable" navigating back to the mission page.
-- Cause: the Sprint 1 policy "missions_select_own_or_published" only lets a
-- non-owner SELECT a mission while status = 'published'. Once accepting an
-- application moves the mission to 'visio_scheduled' (and later 'assigned'),
-- that candidate loses read access to a mission they're actually part of.
--
-- Additive (SELECT policies on the same table are combined with OR) — mirrors
-- the existing "missions_update_accepted_candidate" policy's scope exactly.

drop policy if exists "missions_select_accepted_candidate" on public.missions;
create policy "missions_select_accepted_candidate"
  on public.missions for select
  using (
    exists (
      select 1 from public.applications
      where applications.mission_id = missions.id
        and applications.candidate_id = auth.uid()
        and applications.status = 'accepted'
    )
  );
