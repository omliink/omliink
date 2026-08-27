-- Sprint 4a: allow several candidates to be interviewed in parallel on the
-- same mission before the employer makes a final hire.
--
-- applications.status: 'pending' | 'accepted' | 'rejected'
--                    -> 'pending' | 'interviewing' | 'hired' | 'rejected'
-- No CHECK constraint exists on this column (plain VARCHAR(50) with a
-- comment listing valid values, see OMLIINK_DATABASE_SETUP.sql) — nothing
-- to alter beyond migrating the data itself.

update public.applications
set status = 'interviewing'
where status = 'accepted';

-- visio_meetings currently keys a meeting by (mission_id, candidate_id).
-- With several 'interviewing' candidates on one mission, each needs its own
-- dedicated meeting row, so the natural key becomes application_id.
alter table public.visio_meetings
  add column if not exists application_id uuid references public.applications(id) on delete cascade;

update public.visio_meetings vm
set application_id = a.id
from public.applications a
where vm.application_id is null
  and a.mission_id = vm.mission_id
  and a.candidate_id = vm.candidate_id;

-- Partial unique index (not a plain UNIQUE constraint) so this doesn't fail
-- if any legacy row has no matching application and is left NULL.
create unique index if not exists visio_meetings_application_id_unique
  on public.visio_meetings (application_id)
  where application_id is not null;

-- The candidate no longer needs UPDATE rights on missions: ending a visio
-- no longer flips missions.status (that now happens only via the
-- employer-only "choose candidate" action), so this policy is dead code.
drop policy if exists "missions_update_accepted_candidate" on public.missions;

-- RLS judgment call (flagged per your request): the old
-- is_accepted_candidate_for_mission()/missions_select_accepted_candidate
-- pair only granted mission SELECT to a candidate whose application was
-- 'accepted'. Under the new statuses that would mean a candidate loses
-- visibility on the mission the moment they're rejected — the exact bug
-- class that bit this project twice in Sprint 3 (silent access loss on a
-- status change). I'm broadening the check to "has any application at all
-- on this mission, regardless of status" so a rejected candidate can still
-- see the mission they applied to. Same SECURITY DEFINER pattern as before
-- (never a raw bidirectional EXISTS between missions and applications) —
-- just renamed and widened. Let me know if you'd rather keep it scoped
-- narrower (e.g. interviewing/hired only) before this runs.
create or replace function public.is_applicant_for_mission(p_mission_id uuid, p_candidate_id uuid)
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
  );
$$;

drop policy if exists "missions_select_accepted_candidate" on public.missions;
drop policy if exists "missions_select_applicant" on public.missions;
create policy "missions_select_applicant"
  on public.missions for select
  using (public.is_applicant_for_mission(missions.id, auth.uid()));

drop function if exists public.is_accepted_candidate_for_mission(uuid, uuid);

-- notifications: extend the allow-list with the two new application-status
-- notification types this sprint introduces. 'application_accepted' is kept
-- even though nothing inserts it anymore — harmless, and cheaper than
-- risking a policy edit that isn't needed.
drop policy if exists "notifications_insert_known_types" on public.notifications;
create policy "notifications_insert_known_types"
  on public.notifications for insert
  to authenticated
  with check (
    type in (
      'application_received',
      'application_accepted',
      'application_interviewing',
      'application_hired',
      'application_rejected',
      'new_message',
      'visio_proposed',
      'visio_accepted',
      'visio_completed',
      'contract_ready'
    )
  );
