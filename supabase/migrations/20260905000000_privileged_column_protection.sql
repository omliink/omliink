-- Correctif de sécurité critique : profiles.is_admin,
-- employer_profiles.subscription_tier/subscription_status et
-- candidate_profiles.verification_status sont protégés uniquement par des
-- policies RLS "c'est votre propre ligne" (ex: missions_update_own-style
-- auth.uid() = id), qui ne restreignent jamais les COLONNES modifiables —
-- seulement quelles LIGNES sont accessibles. Confirmé exploitable
-- empiriquement sur les trois : un PATCH direct via l'API REST, en
-- contournant entièrement l'app, suffisait à s'auto-accorder is_admin,
-- passer soi-même en Premium, ou s'auto-vérifier.
--
-- Approche : trigger BEFORE UPDATE par table, qui compare OLD/NEW sur le
-- champ sensible et lève une exception si la valeur change hors d'un appel
-- autorisé. "Autorisé" a été vérifié précisément par table (voir le code
-- réel, pas une supposition) avant d'écrire ces triggers :
--
--   profiles.is_admin
--     Aucun code applicatif ne l'écrit, jamais. Trigger strict :
--     service_role uniquement, pas d'exception admin (cohérent avec la
--     règle du projet depuis le sprint admin : is_admin n'est JAMAIS
--     modifiable par l'app, seulement en SQL manuel).
--
--   employer_profiles.subscription_tier / subscription_status
--     Écrits uniquement par app/api/webhooks/stripe-subscriptions/route.ts,
--     via createServiceRoleClient() (src/lib/supabase-service.ts).
--     Trigger : service_role OU is_admin_user() (exception admin ajoutée
--     par cohérence avec le design général, pas exercée aujourd'hui par
--     un flux existant).
--
--   candidate_profiles.verification_status
--     Trois écritures existantes, PAS une seule :
--       1. src/lib/actions/admin.ts (approve/reject → 'verified'/'rejected')
--          via admin.supabase = createServerSupabaseClient() — la session
--          de l'admin lui-même, PAS service_role. Géré aujourd'hui par la
--          policy RLS candidate_profiles_update_admin (is_admin_user()).
--       2. src/lib/actions/verification.ts (submitVerificationDocument)
--          → 'pending', via la session du candidat lui-même sur SA PROPRE
--          ligne (ni admin ni service_role) — flux légitime d'upload de
--          pièce d'identité.
--       3. src/lib/actions/onboarding-candidate.ts (upsert onboarding)
--          → 'unverified' par défaut, même client candidat.
--     Un trigger "bloque tout sauf service_role/admin" aurait cassé le
--     flux #2 (et potentiellement #3 sur un upsert en conflit). Le trigger
--     ci-dessous distingue donc : service_role/admin peuvent tout faire ;
--     le propriétaire de la ligne peut seulement transiter vers 'pending'
--     ou 'unverified' (jamais un gain de confiance), jamais directement
--     vers 'verified'/'rejected'.

-- ============================================================
-- 1. profiles.is_admin
-- ============================================================
create or replace function public.protect_profiles_is_admin()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin then
    if auth.role() <> 'service_role' then
      raise exception 'is_admin cannot be modified through this API — manual SQL only';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profiles_is_admin_trigger on public.profiles;
create trigger protect_profiles_is_admin_trigger
  before update on public.profiles
  for each row
  execute function public.protect_profiles_is_admin();

-- ============================================================
-- 2. employer_profiles.subscription_tier / subscription_status
-- ============================================================
create or replace function public.protect_employer_profiles_subscription()
returns trigger
language plpgsql
as $$
begin
  if (new.subscription_tier is distinct from old.subscription_tier)
     or (new.subscription_status is distinct from old.subscription_status) then
    if auth.role() <> 'service_role' and not public.is_admin_user() then
      raise exception 'subscription_tier/subscription_status cannot be modified through this API — Stripe webhook or admin only';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_employer_profiles_subscription_trigger on public.employer_profiles;
create trigger protect_employer_profiles_subscription_trigger
  before update on public.employer_profiles
  for each row
  execute function public.protect_employer_profiles_subscription();

-- ============================================================
-- 3. candidate_profiles.verification_status
-- ============================================================
create or replace function public.protect_candidate_profiles_verification_status()
returns trigger
language plpgsql
as $$
begin
  if new.verification_status is distinct from old.verification_status then
    if auth.role() = 'service_role' or public.is_admin_user() then
      return new;
    end if;
    -- Le propriétaire peut soumettre pour revue ou se réinitialiser, jamais
    -- s'accorder lui-même 'verified' ou 'rejected'.
    if new.verification_status not in ('pending', 'unverified') then
      raise exception 'verification_status can only be set to verified/rejected by an admin';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_candidate_profiles_verification_status_trigger on public.candidate_profiles;
create trigger protect_candidate_profiles_verification_status_trigger
  before update on public.candidate_profiles
  for each row
  execute function public.protect_candidate_profiles_verification_status();
