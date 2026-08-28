-- Suite du correctif de sécurité critique (voir
-- 20260905000000_privileged_column_protection.sql) : même pattern de
-- trigger BEFORE UPDATE, étendu aux 5 autres colonnes confirmées
-- exploitables lors du sweep RLS systématique.
--
-- Deux candidats du même sweep NE reçoivent PAS de trigger ici, décision
-- documentée (voir discussion du sprint, pas répétée en détail dans ce
-- fichier) :
--   - applications.status : chooseCandidate() écrit via la session de
--     l'employeur lui-même (createServerSupabaseClient), pas service_role
--     — indiscernable d'un PATCH brut par le même employeur. Pas un
--     problème de colonne privilégiée (l'employeur a déjà autorité sur
--     ses candidatures), mais un risque d'intégrité (contournement des
--     effets de bord de chooseCandidate). Nécessite un autre type de
--     correctif si on veut le traiter.
--   - visio_meetings.status : markNoShow() permet déjà à chaque
--     participant d'écrire n'importe quelle valeur de statut via sa
--     propre session, sans vérifier l'état précédent — aucune valeur
--     n'est réservée service_role/admin ici par conception actuelle.

-- ============================================================
-- 1. contracts.payment_status
-- ============================================================
-- Écrit uniquement par app/api/webhooks/stripe/route.ts via
-- createServiceRoleClient() ; la valeur initiale 'pending' vient de
-- l'INSERT dans hiring.ts, jamais d'une UPDATE hors webhook.
create or replace function public.protect_contracts_payment_status()
returns trigger
language plpgsql
as $$
begin
  if new.payment_status is distinct from old.payment_status then
    if auth.role() <> 'service_role' and not public.is_admin_user() then
      raise exception 'payment_status cannot be modified through this API — Stripe webhook or admin only';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_contracts_payment_status_trigger on public.contracts;
create trigger protect_contracts_payment_status_trigger
  before update on public.contracts
  for each row
  execute function public.protect_contracts_payment_status();

-- ============================================================
-- 2. employer_social_connections.connection_status
-- ============================================================
-- Le propriétaire (src/lib/actions/social-connections.ts) ne soumet
-- jamais que 'pending_verification' ; seul l'admin (src/lib/actions/
-- admin.ts, via sa propre session + is_admin_user() en RLS) écrit
-- 'connected'.
create or replace function public.protect_employer_social_connections_status()
returns trigger
language plpgsql
as $$
begin
  if new.connection_status is distinct from old.connection_status then
    if auth.role() = 'service_role' or public.is_admin_user() then
      return new;
    end if;
    if new.connection_status not in ('pending_verification', 'not_connected') then
      raise exception 'connection_status can only be set to connected by an admin';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_employer_social_connections_status_trigger on public.employer_social_connections;
create trigger protect_employer_social_connections_status_trigger
  before update on public.employer_social_connections
  for each row
  execute function public.protect_employer_social_connections_status();

-- ============================================================
-- 3. employer_profiles reputation/verification fields
-- ============================================================
-- Aucune écriture applicative en dehors des valeurs par défaut à la
-- création (OnboardingForm.tsx) ; rien ne les met à jour ensuite.
create or replace function public.protect_employer_profiles_reputation()
returns trigger
language plpgsql
as $$
begin
  if (new.payment_verified is distinct from old.payment_verified)
     or (new.rating is distinct from old.rating)
     or (new.total_missions_posted is distinct from old.total_missions_posted)
     or (new.total_spent is distinct from old.total_spent) then
    if auth.role() <> 'service_role' and not public.is_admin_user() then
      raise exception 'payment_verified/rating/total_missions_posted/total_spent cannot be modified through this API';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_employer_profiles_reputation_trigger on public.employer_profiles;
create trigger protect_employer_profiles_reputation_trigger
  before update on public.employer_profiles
  for each row
  execute function public.protect_employer_profiles_reputation();

-- ============================================================
-- 4. candidate_profiles reputation fields
-- ============================================================
-- Même situation : uniquement des valeurs par défaut à la création
-- (onboarding-candidate.ts), jamais mises à jour ensuite par l'app.
create or replace function public.protect_candidate_profiles_reputation()
returns trigger
language plpgsql
as $$
begin
  if (new.rating is distinct from old.rating)
     or (new.total_missions_completed is distinct from old.total_missions_completed)
     or (new.response_rate is distinct from old.response_rate)
     or (new.no_show_count is distinct from old.no_show_count) then
    if auth.role() <> 'service_role' and not public.is_admin_user() then
      raise exception 'rating/total_missions_completed/response_rate/no_show_count cannot be modified through this API';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_candidate_profiles_reputation_trigger on public.candidate_profiles;
create trigger protect_candidate_profiles_reputation_trigger
  before update on public.candidate_profiles
  for each row
  execute function public.protect_candidate_profiles_reputation();

-- ============================================================
-- 5. profiles.is_verified / verification_type / account_status
-- ============================================================
-- Confirmé inertes fonctionnellement (jamais lus ailleurs que comme
-- valeurs par défaut à la création), mais protégés quand même par
-- cohérence — un futur usage de ces colonnes ne doit pas hériter d'un
-- trou RLS déjà identifié aujourd'hui.
create or replace function public.protect_profiles_trust_fields()
returns trigger
language plpgsql
as $$
begin
  if (new.is_verified is distinct from old.is_verified)
     or (new.verification_type is distinct from old.verification_type)
     or (new.account_status is distinct from old.account_status) then
    if auth.role() <> 'service_role' and not public.is_admin_user() then
      raise exception 'is_verified/verification_type/account_status cannot be modified through this API';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profiles_trust_fields_trigger on public.profiles;
create trigger protect_profiles_trust_fields_trigger
  before update on public.profiles
  for each row
  execute function public.protect_profiles_trust_fields();
