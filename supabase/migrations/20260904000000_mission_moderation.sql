-- Sprint modération: mission_reports (signalements) + missions.moderation_status
-- (indépendant de missions.status, piloté uniquement par l'admin).

alter table public.missions
  add column if not exists moderation_status varchar(20) not null default 'normal';
  -- 'normal' | 'suspended' | 'removed'

-- ============================================================
-- mission_reports
-- ============================================================
create table if not exists public.mission_reports (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason varchar(30) not null, -- 'contenu_inapproprie' | 'arnaque_suspectee' | 'informations_trompeuses' | 'autre'
  details text,
  status varchar(20) not null default 'pending', -- 'pending' | 'reviewed' | 'dismissed'
  created_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid references public.profiles(id) on delete set null,
  unique (mission_id, reporter_id)
);

alter table public.mission_reports enable row level security;

-- Un utilisateur signale (candidat ou employeur, aucune restriction de rôle —
-- voir section 3 : un employeur peut tomber sur la mission d'un autre).
drop policy if exists "mission_reports_insert_own" on public.mission_reports;
create policy "mission_reports_insert_own"
  on public.mission_reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "mission_reports_select_own" on public.mission_reports;
create policy "mission_reports_select_own"
  on public.mission_reports for select
  using (auth.uid() = reporter_id);

-- Pas de policy UPDATE pour le déclarant — contrainte de blocage simple
-- (un signalement par mission par utilisateur), pas d'édition a posteriori,
-- conforme à l'option la plus simple proposée.

drop policy if exists "mission_reports_select_admin" on public.mission_reports;
create policy "mission_reports_select_admin"
  on public.mission_reports for select
  using (public.is_admin_user());

drop policy if exists "mission_reports_update_admin" on public.mission_reports;
create policy "mission_reports_update_admin"
  on public.mission_reports for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- ============================================================
-- missions RLS: la visibilité "published = tout le monde" se resserre pour
-- exiger aussi moderation_status = 'normal' — n'affecte que les missions
-- suspendues/supprimées, aucun changement pour le reste. missions_select_
-- applicant (Sprint 4a, candidat déjà postulé) reste inchangée à part :
-- un candidat garde accès à une mission qu'il a rejointe même si elle est
-- ensuite suspendue, cohérent avec le principe "jamais de perte d'accès
-- silencieuse sur un changement de statut" déjà établi au Sprint 4a.
-- ============================================================
drop policy if exists "missions_select_own_or_published" on public.missions;
create policy "missions_select_own_or_published"
  on public.missions for select
  using (auth.uid() = employer_id or (status = 'published' and moderation_status = 'normal'));

drop policy if exists "missions_select_admin" on public.missions;
create policy "missions_select_admin"
  on public.missions for select
  using (public.is_admin_user());

-- L'employeur ne peut plus modifier SA PROPRE mission (update/pause/
-- réactivation, Sprint 4c) une fois que moderation_status != 'normal' — la
-- policy exclut ces lignes en amont (USING), donc toute tentative affecte
-- 0 ligne plutôt que d'être explicitement refusée ; la Server Action ajoute
-- son propre check explicite pour renvoyer un message clair plutôt qu'un
-- échec silencieux (voir section code).
drop policy if exists "missions_update_own" on public.missions;
create policy "missions_update_own"
  on public.missions for update
  using (auth.uid() = employer_id and moderation_status = 'normal')
  with check (auth.uid() = employer_id and moderation_status = 'normal');

drop policy if exists "missions_update_admin" on public.missions;
create policy "missions_update_admin"
  on public.missions for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- applications: l'admin doit pouvoir rejeter automatiquement les
-- candidatures pending/interviewing d'une mission supprimée.
drop policy if exists "applications_select_admin" on public.applications;
create policy "applications_select_admin"
  on public.applications for select
  using (public.is_admin_user());

drop policy if exists "applications_update_admin" on public.applications;
create policy "applications_update_admin"
  on public.applications for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- notifications: deux nouveaux types pour ce sprint (suspension et
-- suppression notifiées à l'employeur) ; le rejet automatique des
-- candidatures sur suppression réutilise 'application_rejected' existant.
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
      'contract_ready',
      'mission_invitation',
      'verification_approved',
      'verification_rejected',
      'mission_suspended',
      'mission_removed'
    )
  );
