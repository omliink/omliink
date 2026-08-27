-- Sprint admin: profiles.is_admin + is_admin_user() SECURITY DEFINER helper,
-- réutilisé par toutes les policies admin ci-dessous plutôt que de dupliquer
-- la vérification. AUCUN mécanisme applicatif ne peut jamais passer
-- is_admin à true — colonne à défaut false, aucun formulaire/Server Action
-- ne l'écrit, uniquement modifiable manuellement en base (SQL Editor).

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- profiles: admin doit pouvoir lire tous les profils (noms/emails affichés
-- dans les files d'attente vérifications et CESU/Pajemploi).
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin_user());

-- candidate_profiles: lecture (liste des vérifications en attente) +
-- écriture (approuver/rejeter) réservées à l'admin, en plus des policies
-- existantes réservées au candidat propriétaire.
drop policy if exists "candidate_profiles_select_admin" on public.candidate_profiles;
create policy "candidate_profiles_select_admin"
  on public.candidate_profiles for select
  using (public.is_admin_user());

drop policy if exists "candidate_profiles_update_admin" on public.candidate_profiles;
create policy "candidate_profiles_update_admin"
  on public.candidate_profiles for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- employer_social_connections: idem, lecture + passage à 'connected'.
drop policy if exists "employer_social_connections_select_admin" on public.employer_social_connections;
create policy "employer_social_connections_select_admin"
  on public.employer_social_connections for select
  using (public.is_admin_user());

drop policy if exists "employer_social_connections_update_admin" on public.employer_social_connections;
create policy "employer_social_connections_update_admin"
  on public.employer_social_connections for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- promo_codes: lecture déjà publique (Sprint 4d) ; ajoute création +
-- modification (désactivation) réservées à l'admin. Toujours pas de policy
-- DELETE — désactivation via active=false uniquement, jamais de suppression,
-- pour garder promo_code_redemptions cohérent.
drop policy if exists "promo_codes_insert_admin" on public.promo_codes;
create policy "promo_codes_insert_admin"
  on public.promo_codes for insert
  with check (public.is_admin_user());

drop policy if exists "promo_codes_update_admin" on public.promo_codes;
create policy "promo_codes_update_admin"
  on public.promo_codes for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- verification-documents (bucket privé, Sprint 4b) : jusqu'ici seul le
-- candidat propriétaire pouvait lire son propre document (la revue passait
-- par le rôle service dans le dashboard Supabase). Ajoute une policy de
-- lecture admin pour permettre la génération d'URL signée depuis l'app.
drop policy if exists "verification_documents_select_admin" on storage.objects;
create policy "verification_documents_select_admin"
  on storage.objects for select
  using (bucket_id = 'verification-documents' and public.is_admin_user());

-- notifications: étend la liste blanche avec les deux types que ce sprint
-- introduit (résultat de vérification envoyé au candidat).
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
      'verification_rejected'
    )
  );
