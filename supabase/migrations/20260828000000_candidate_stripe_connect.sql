-- Sprint Stripe Connect (Express) : le candidat auto-entrepreneur a besoin
-- d'un compte Connect pour recevoir les paiements. Ces deux colonnes
-- suffisent : l'ID du compte Stripe (pour créer des liens d'onboarding /
-- dashboard et le désigner comme destination de transfert), et un flag
-- local pour savoir s'il a terminé l'onboarding sans avoir à interroger
-- l'API Stripe à chaque affichage.
--
-- Pas de nouvelle policy RLS nécessaire : "candidate_profiles_update_own"
-- (Sprint 1) couvre déjà la mise à jour de sa propre ligne, et
-- "candidate_profiles_select_via_application" (Sprint 2) couvre déjà la
-- lecture de ces deux nouveaux champs par l'employeur d'une mission sur
-- laquelle le candidat a postulé.

alter table public.candidate_profiles
  add column if not exists stripe_connect_account_id text,
  add column if not exists stripe_connect_onboarded boolean not null default false;
