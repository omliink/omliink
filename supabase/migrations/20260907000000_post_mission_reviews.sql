-- Sprint avis post-mission : durcit la policy INSERT sur `reviews` (table
-- héritée du script de setup initial, jamais utilisée par l'app jusqu'ici).
-- L'ancienne policy ("Users can create reviews", from_user_id = auth.uid()
-- seul) vérifie QUI écrit mais jamais SI l'écriture est légitime — même
-- famille de risque que les colonnes corrigées lors de l'audit RLS
-- précédent. reviews est publique et non modérée (pas d'édition, pas de
-- suppression prévues), donc un faux avis reste un vecteur de nuisance
-- directe (diffamation, note manipulée) même sans toucher aux colonnes déjà
-- protégées par trigger (candidate_profiles.rating / employer_profiles.rating).

create or replace function public.is_valid_mission_review(p_mission_id uuid, p_from_user_id uuid, p_to_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    p_from_user_id <> p_to_user_id
    and exists (
      select 1
      from public.missions m
      join public.applications a on a.mission_id = m.id and a.status = 'hired'
      where m.id = p_mission_id
        and m.status = 'completed'
        and (
          (p_from_user_id = m.employer_id and p_to_user_id = a.candidate_id)
          or (p_from_user_id = a.candidate_id and p_to_user_id = m.employer_id)
        )
    );
$$;

drop policy if exists "Users can create reviews" on public.reviews;
drop policy if exists "reviews_insert_valid_participant" on public.reviews;
create policy "reviews_insert_valid_participant"
  on public.reviews for insert
  with check (
    from_user_id = auth.uid()
    and public.is_valid_mission_review(mission_id, from_user_id, to_user_id)
  );

-- notifications: étend la liste blanche avec les deux types que ce sprint
-- introduit (mission marquée terminée par l'autre partie, nouvel avis reçu).
drop policy if exists "notifications_insert_known_types" on public.notifications;
create policy "notifications_insert_known_types"
  on public.notifications for insert
  to authenticated
  with check (
    type in (
      'application_received', 'application_accepted', 'application_interviewing',
      'application_hired', 'application_rejected', 'new_message', 'visio_proposed',
      'visio_accepted', 'visio_completed', 'contract_ready', 'mission_invitation',
      'verification_approved', 'verification_rejected', 'mission_suspended', 'mission_removed',
      'mission_completed', 'review_received'
    )
  );
