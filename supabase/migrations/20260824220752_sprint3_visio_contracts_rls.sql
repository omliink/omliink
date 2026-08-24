-- Sprint 3 RLS: visio_meetings, contracts, plus the extra grants those two
-- flows need on missions/notifications. All additive; safe to re-run.

-- visio_meetings: only the employer and candidate on the meeting can see or
-- change it (propose/accept a slot, join, end, mark no-show).
drop policy if exists "visio_meetings_select_participant" on public.visio_meetings;
create policy "visio_meetings_select_participant"
  on public.visio_meetings for select
  using (auth.uid() = employer_id or auth.uid() = candidate_id);

drop policy if exists "visio_meetings_insert_participant" on public.visio_meetings;
create policy "visio_meetings_insert_participant"
  on public.visio_meetings for insert
  with check (auth.uid() = employer_id or auth.uid() = candidate_id);

drop policy if exists "visio_meetings_update_participant" on public.visio_meetings;
create policy "visio_meetings_update_participant"
  on public.visio_meetings for update
  using (auth.uid() = employer_id or auth.uid() = candidate_id)
  with check (auth.uid() = employer_id or auth.uid() = candidate_id);

-- contracts: same participant pattern (employer/candidate of the contract).
drop policy if exists "contracts_select_participant" on public.contracts;
create policy "contracts_select_participant"
  on public.contracts for select
  using (auth.uid() = employer_id or auth.uid() = candidate_id);

drop policy if exists "contracts_insert_participant" on public.contracts;
create policy "contracts_insert_participant"
  on public.contracts for insert
  with check (auth.uid() = employer_id or auth.uid() = candidate_id);

drop policy if exists "contracts_update_participant" on public.contracts;
create policy "contracts_update_participant"
  on public.contracts for update
  using (auth.uid() = employer_id or auth.uid() = candidate_id)
  with check (auth.uid() = employer_id or auth.uid() = candidate_id);

-- missions: the existing "missions_update_own" policy only lets the employer
-- update their own mission. Ending a visio can be triggered by either party,
-- and that action also flips the mission to 'assigned' — so the accepted
-- candidate needs UPDATE rights too. Scoped to missions they have an
-- accepted application on (not a blanket grant).
drop policy if exists "missions_update_accepted_candidate" on public.missions;
create policy "missions_update_accepted_candidate"
  on public.missions for update
  using (
    exists (
      select 1 from public.applications
      where applications.mission_id = missions.id
        and applications.candidate_id = auth.uid()
        and applications.status = 'accepted'
    )
  )
  with check (
    exists (
      select 1 from public.applications
      where applications.mission_id = missions.id
        and applications.candidate_id = auth.uid()
        and applications.status = 'accepted'
    )
  );

-- notifications: extend the Sprint 2 allow-list of insertable types to cover
-- the new visio/contract notifications this sprint creates.
drop policy if exists "notifications_insert_known_types" on public.notifications;
create policy "notifications_insert_known_types"
  on public.notifications for insert
  to authenticated
  with check (
    type in (
      'application_received',
      'application_accepted',
      'application_rejected',
      'new_message',
      'visio_proposed',
      'visio_accepted',
      'visio_completed',
      'contract_ready'
    )
  );
