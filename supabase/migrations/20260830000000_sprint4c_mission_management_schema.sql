-- Sprint 4c: employer-side mission management (pause/reactivate, edit,
-- need sub-typing) + candidate suggestion/invitation.
--
-- Judgment calls made here, flagged for visibility:
--   1. missions.status needs no migration at all to support 'paused' — it's
--      a plain VARCHAR(50) with no CHECK constraint (confirmed: every
--      status-like column in this schema follows the same convention,
--      values enforced only by application code). 'paused' is simply a new
--      literal the app code now writes/reads; nothing to ALTER.
--   2. The brief names one new table (mission_needs) but asks for "un
--      référentiel raisonnable de sous-types" seeded per category — that
--      needs a reference table to seed INTO, the same way skill_taxonomy
--      backed candidate_skills in Sprint 4b. Added mission_need_taxonomy
--      (public read, seeded by migration only) and given mission_needs a
--      composite FK into it — same pattern as candidate_skills, same
--      reasoning: a mission can't be tagged with a need_tag under the wrong
--      category.
--   3. mission_needs.candidate_id doesn't exist (it's employer/mission-side
--      data) — RLS write is scoped to "the employer who owns the mission",
--      not a candidate_id column.

-- ============================================================
-- employer_profiles: new field
-- ============================================================
alter table public.employer_profiles
  add column if not exists nationality text;

-- ============================================================
-- mission_need_taxonomy: reference table (like skill_taxonomy), no owner —
-- public read, seeded by migration only.
-- ============================================================
create table if not exists public.mission_need_taxonomy (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.service_categories(id) on delete cascade,
  need_tag varchar(100) not null,
  label varchar(255) not null,
  created_at timestamptz not null default now(),
  unique (category_id, need_tag)
);

alter table public.mission_need_taxonomy enable row level security;
drop policy if exists "mission_need_taxonomy_select_all" on public.mission_need_taxonomy;
create policy "mission_need_taxonomy_select_all"
  on public.mission_need_taxonomy for select
  using (true);

-- ============================================================
-- mission_needs: employer's selected sub-types for one mission. Composite
-- FK into mission_need_taxonomy(category_id, need_tag) — same integrity
-- guard as candidate_skills in Sprint 4b.
-- ============================================================
create table if not exists public.mission_needs (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  category_id uuid not null,
  need_tag varchar(100) not null,
  created_at timestamptz not null default now(),
  unique (mission_id, need_tag),
  foreign key (category_id, need_tag) references public.mission_need_taxonomy(category_id, need_tag) on delete cascade
);

alter table public.mission_needs enable row level security;

drop policy if exists "mission_needs_select_all" on public.mission_needs;
create policy "mission_needs_select_all"
  on public.mission_needs for select
  using (true);

drop policy if exists "mission_needs_manage_owner" on public.mission_needs;
create policy "mission_needs_manage_owner"
  on public.mission_needs for all
  using (exists (select 1 from public.missions where missions.id = mission_needs.mission_id and missions.employer_id = auth.uid()))
  with check (exists (select 1 from public.missions where missions.id = mission_needs.mission_id and missions.employer_id = auth.uid()));

-- ============================================================
-- mission_invitations: employer invites a candidate to apply. One-directional
-- dependency on missions (never referenced FROM missions'/applications' own
-- policies) — same safe pattern used throughout, no RLS recursion risk.
-- ============================================================
create table if not exists public.mission_invitations (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  status varchar(20) not null default 'pending',
  -- 'pending', 'viewed', 'applied', 'declined'
  created_at timestamptz not null default now(),
  unique (mission_id, candidate_id)
);

alter table public.mission_invitations enable row level security;

drop policy if exists "mission_invitations_manage_employer" on public.mission_invitations;
create policy "mission_invitations_manage_employer"
  on public.mission_invitations for all
  using (exists (select 1 from public.missions where missions.id = mission_invitations.mission_id and missions.employer_id = auth.uid()))
  with check (exists (select 1 from public.missions where missions.id = mission_invitations.mission_id and missions.employer_id = auth.uid()));

drop policy if exists "mission_invitations_select_candidate" on public.mission_invitations;
create policy "mission_invitations_select_candidate"
  on public.mission_invitations for select
  using (candidate_id = auth.uid());

drop policy if exists "mission_invitations_update_candidate" on public.mission_invitations;
create policy "mission_invitations_update_candidate"
  on public.mission_invitations for update
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

-- ============================================================
-- notifications: extend the allow-list with the invitation type this
-- sprint introduces (same additive pattern as every prior sprint).
-- ============================================================
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
      'mission_invitation'
    )
  );
