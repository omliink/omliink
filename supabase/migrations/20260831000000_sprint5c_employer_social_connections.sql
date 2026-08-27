-- Sprint 5c: CESU/Pajemploi shell — forms + storage for the employer's
-- "Identifiants" block, no real URSSAF/CESU/Pajemploi API integration yet.
-- Processing of a submitted connection request stays 100% manual: the team
-- reviews rows where connection_status = 'pending_verification' directly in
-- Supabase (no notification infra built this sprint, per explicit decision).
--
-- Judgment call validated with the user before this migration: NO IBAN/BIC
-- collected this sprint. The CESU "nouvelle inscription" form in the Yoopies
-- reference captures it, but nothing here processes a real SEPA debit yet —
-- collecting bank details with no corresponding use is a pure liability
-- (data-minimisation), and phase 2 (real API integration) is the point where
-- the exact format/validation needs become clear and encryption is actually
-- worth building. provider_account_number and date_of_birth are treated as
-- ordinary identifiers (not secrets — a CESU/Pajemploi number alone doesn't
-- grant account access) and stored in plain columns, same sensitivity class
-- as employer_profiles.nationality/profiles.phone.
--
-- One row per (employer_id, provider): the "Connecter" forms upsert on
-- conflict rather than insert-only, since re-submitting the same provider
-- should just refresh the pending request.

create table if not exists public.employer_social_connections (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  provider varchar(20) not null, -- 'pajemploi' | 'cesu'
  connection_status varchar(30) not null default 'not_connected',
  -- 'not_connected' | 'pending_verification' | 'connected'
  cesu_path varchar(20), -- 'existing' | 'new' — only meaningful when provider = 'cesu'
  provider_account_number varchar(50), -- numéro CESU/Pajemploi (identifiant, pas un secret)
  date_of_birth date,
  -- CESU "nouvelle inscription" seulement — pas d'IBAN/BIC ce sprint (voir ci-dessus)
  civility varchar(10), -- 'M' | 'Mme'
  first_name varchar(255),
  last_name varchar(255),
  phone varchar(30),
  address text,
  mandate_accepted_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (employer_id, provider)
);

alter table public.employer_social_connections enable row level security;

-- Owner-only, no candidate access at all — unlike the candidate-satellite
-- tables (Sprint 4b), nothing here is ever employer-facing marketplace
-- content, so there's no "select via application" counterpart to add.
drop policy if exists "employer_social_connections_manage_own" on public.employer_social_connections;
create policy "employer_social_connections_manage_own"
  on public.employer_social_connections for all
  using (employer_id = auth.uid())
  with check (employer_id = auth.uid());

drop trigger if exists employer_social_connections_updated_at on public.employer_social_connections;
create trigger employer_social_connections_updated_at
  before update on public.employer_social_connections
  for each row execute function update_updated_at_column();
