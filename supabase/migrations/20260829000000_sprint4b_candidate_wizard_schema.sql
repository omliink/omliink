-- Sprint 4b: schema for the 9-step candidate onboarding wizard — extended
-- candidate_profiles fields, plus 5 new candidate-linked tables (languages,
-- service types, supplements, skill taxonomy, skills).
--
-- Naming/value judgment calls made here that deviate from the earlier
-- docs-only pass (CAHIER_DES_CHARGES.md / ARCHITECTURE_DATABASE.md /
-- OMLIINK_DATABASE_SETUP.sql), flagged for visibility:
--   1. experience_level values: 'debutant' | '1-3ans' | '3-5ans' | '5ans-plus'
--      (this sprint's brief) instead of the doc's 'debutant'/'intermediaire'/
--      'experimente'.
--   2. verification_status: default 'unverified', values 'unverified' |
--      'pending' | 'verified' | 'rejected' (this sprint's brief) instead of
--      the doc's default 'not_submitted'.
--   3. candidate_languages gets an is_native boolean (this sprint's brief);
--      the doc's version omitted it.
--   4. candidate_supplements.supplement_code uses the French codes from this
--      sprint's brief (premiers_secours/motorise/permis_conduire/
--      dispo_immediate) instead of the doc's English ones.
--   5. Foreign keys to service_categories are named category_id everywhere
--      (skill_taxonomy, candidate_service_types), matching the existing
--      missions.category_id convention, rather than "service_category_id"
--      as worded in the sprint brief's prose.
--   6. candidate_skills stores (candidate_id, category_id, skill_tag)
--      directly with a composite FK to skill_taxonomy(category_id,
--      skill_tag) — matching this sprint's explicit column list — instead
--      of the doc's single skill_id FK to skill_taxonomy.id.
-- Docs will be updated to match after this migration is confirmed.

-- ============================================================
-- candidate_profiles: new wizard fields
-- ============================================================
alter table public.candidate_profiles
  add column if not exists gender varchar(20),
  add column if not exists birth_date date,
  add column if not exists birth_place varchar(255),
  add column if not exists native_language varchar(100),
  add column if not exists phone_visible boolean not null default true,
  add column if not exists photo_url text,
  add column if not exists experience_level varchar(20),
  add column if not exists bio_title varchar(60),
  add column if not exists bio_text text,
  add column if not exists verification_status varchar(20) not null default 'unverified',
  add column if not exists verification_document_url text;

-- photo_url is mandatory going forward (wizard step 3 blocks progression
-- without an upload) but existing test rows predate the column and have
-- nothing to backfill from — placeholder empty string so the NOT NULL
-- constraint can be added without losing those rows.
update public.candidate_profiles set photo_url = '' where photo_url is null;
alter table public.candidate_profiles alter column photo_url set not null;

-- ============================================================
-- skill_taxonomy: reference table (like service_categories), no owner —
-- public read, no write policy since it's seeded by migration only.
-- ============================================================
create table if not exists public.skill_taxonomy (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.service_categories(id) on delete cascade,
  skill_tag varchar(100) not null,
  label varchar(255) not null,
  created_at timestamp with time zone not null default now(),
  unique (category_id, skill_tag)
);

alter table public.skill_taxonomy enable row level security;
drop policy if exists "skill_taxonomy_select_all" on public.skill_taxonomy;
create policy "skill_taxonomy_select_all"
  on public.skill_taxonomy for select
  using (true);

-- ============================================================
-- candidate_languages (wizard step 2)
-- ============================================================
create table if not exists public.candidate_languages (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidate_profiles(user_id) on delete cascade,
  language varchar(100) not null,
  is_native boolean not null default false,
  created_at timestamp with time zone not null default now(),
  unique (candidate_id, language)
);

alter table public.candidate_languages enable row level security;

drop policy if exists "candidate_languages_manage_own" on public.candidate_languages;
create policy "candidate_languages_manage_own"
  on public.candidate_languages for all
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

-- Same pattern as candidate_profiles_select_via_application (Sprint 2): an
-- employer may read this once the candidate has applied to one of their
-- missions. One-directional dependency on applications/missions (this table
-- is never referenced FROM those tables' own policies), so no RLS
-- recursion risk — unlike the missions<->applications cycle from Sprint 3.
drop policy if exists "candidate_languages_select_via_application" on public.candidate_languages;
create policy "candidate_languages_select_via_application"
  on public.candidate_languages for select
  using (
    exists (
      select 1
      from public.applications
      join public.missions on missions.id = applications.mission_id
      where applications.candidate_id = candidate_languages.candidate_id
        and missions.employer_id = auth.uid()
    )
  );

-- ============================================================
-- candidate_service_types (wizard step 4)
-- ============================================================
create table if not exists public.candidate_service_types (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidate_profiles(user_id) on delete cascade,
  category_id uuid not null references public.service_categories(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique (candidate_id, category_id)
);

alter table public.candidate_service_types enable row level security;

drop policy if exists "candidate_service_types_manage_own" on public.candidate_service_types;
create policy "candidate_service_types_manage_own"
  on public.candidate_service_types for all
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

drop policy if exists "candidate_service_types_select_via_application" on public.candidate_service_types;
create policy "candidate_service_types_select_via_application"
  on public.candidate_service_types for select
  using (
    exists (
      select 1
      from public.applications
      join public.missions on missions.id = applications.mission_id
      where applications.candidate_id = candidate_service_types.candidate_id
        and missions.employer_id = auth.uid()
    )
  );

-- ============================================================
-- candidate_supplements (wizard step 5)
-- ============================================================
create table if not exists public.candidate_supplements (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidate_profiles(user_id) on delete cascade,
  supplement_code varchar(50) not null,
  -- 'premiers_secours', 'motorise', 'permis_conduire', 'dispo_immediate'
  created_at timestamp with time zone not null default now(),
  unique (candidate_id, supplement_code)
);

alter table public.candidate_supplements enable row level security;

drop policy if exists "candidate_supplements_manage_own" on public.candidate_supplements;
create policy "candidate_supplements_manage_own"
  on public.candidate_supplements for all
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

drop policy if exists "candidate_supplements_select_via_application" on public.candidate_supplements;
create policy "candidate_supplements_select_via_application"
  on public.candidate_supplements for select
  using (
    exists (
      select 1
      from public.applications
      join public.missions on missions.id = applications.mission_id
      where applications.candidate_id = candidate_supplements.candidate_id
        and missions.employer_id = auth.uid()
    )
  );

-- ============================================================
-- candidate_skills (wizard step 7) — composite FK into skill_taxonomy so a
-- candidate can never attach a skill_tag under the wrong category.
-- ============================================================
create table if not exists public.candidate_skills (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidate_profiles(user_id) on delete cascade,
  category_id uuid not null,
  skill_tag varchar(100) not null,
  created_at timestamp with time zone not null default now(),
  unique (candidate_id, category_id, skill_tag),
  foreign key (category_id, skill_tag) references public.skill_taxonomy(category_id, skill_tag) on delete cascade
);

alter table public.candidate_skills enable row level security;

drop policy if exists "candidate_skills_manage_own" on public.candidate_skills;
create policy "candidate_skills_manage_own"
  on public.candidate_skills for all
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

drop policy if exists "candidate_skills_select_via_application" on public.candidate_skills;
create policy "candidate_skills_select_via_application"
  on public.candidate_skills for select
  using (
    exists (
      select 1
      from public.applications
      join public.missions on missions.id = applications.mission_id
      where applications.candidate_id = candidate_skills.candidate_id
        and missions.employer_id = auth.uid()
    )
  );
