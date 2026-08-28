-- Ferme la lacune d'intégrité documentée dans
-- 20260906000000_privileged_column_protection_part2.sql (section
-- applications.status) : chooseCandidate() (hiring.ts) écrit
-- status='hired' via la session de l'employeur lui-même, avec plusieurs
-- effets de bord censés être atomiques (rejet des autres candidatures,
-- passage mission -> 'assigned', génération du contrat). Rien n'empêchait
-- un employeur de PATCHer directement applications.status='hired' sans
-- passer par chooseCandidate(), laissant potentiellement un état
-- incohérent (deux candidats 'hired' sur la même mission, ou un hired
-- isolé sans aucun des effets de bord attendus).
--
-- Pas une restriction de colonne privilégiée (l'employeur a déjà
-- l'autorité légitime sur ses propres candidatures via
-- "applications_update_mission_owner") : ces deux triggers n'imposent que
-- des garanties d'intégrité — quelle que soit la voie d'écriture.

-- ============================================================
-- 1. BEFORE UPDATE — invariant : au plus un 'hired' par mission
-- ============================================================
create or replace function public.enforce_single_hired_application()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1 from public.applications
    where mission_id = new.mission_id
      and status = 'hired'
      and id <> new.id
  ) then
    raise exception 'This mission already has a hired candidate — only one application per mission can be hired at a time';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_single_hired_application_trigger on public.applications;
create trigger enforce_single_hired_application_trigger
  before update on public.applications
  for each row
  when (new.status = 'hired' and old.status is distinct from new.status)
  execute function public.enforce_single_hired_application();

-- ============================================================
-- 2. AFTER UPDATE — réplique les effets de bord de chooseCandidate() qui
--    sont des opérations 100% base de données, pour qu'un hired par
--    n'importe quelle voie (pas seulement chooseCandidate()) laisse un
--    état complet plutôt qu'à moitié cohérent.
--
--    Confirmé pur DB avant d'inclure la génération de contrat : l'insert
--    dans contracts ici est un simple insert avec
--    status/payment_status='pending' — Stripe n'est appelé nulle part à
--    la création du contrat, seulement plus tard dans
--    stripe-payment.ts::createPaymentIntent, conditionné sur
--    contract.status = 'signed' (action explicite et distincte, jamais
--    déclenchée automatiquement par cette création). Aucun appel
--    réseau/API externe dans ce trigger.
--
--    Délibérément NON répliqué : la notification 'application_hired' de
--    félicitations que chooseCandidate() envoie de façon inconditionnelle
--    (pas derrière un garde-fou d'existence) — la dupliquer ici
--    l'enverrait deux fois à chaque hire normal. Ce n'était pas non plus
--    demandé explicitement, contrairement au rejet des autres et au
--    passage de la mission à 'assigned'.
--
--    Tout le reste ci-dessous est naturellement dédupliqué contre les
--    effets de bord TypeScript de chooseCandidate() SANS toucher à
--    hiring.ts, parce que ce trigger s'exécute de façon synchrone, dans
--    la même transaction que l'UPDATE qui a mis status='hired', avant que
--    les instructions suivantes de chooseCandidate() ne s'exécutent :
--      - le rejet TypeScript est filtré sur
--        status IN ('pending','interviewing') — déjà basculé à
--        'rejected' par ce trigger au moment où cette instruction
--        s'exécute, donc elle ne matche plus aucune ligne et sa propre
--        boucle de notification/nettoyage visio devient un no-op ;
--      - la création de contrat TypeScript est déjà gardée par
--        "if (!existingContract)" — déjà créé par ce trigger au moment de
--        cette vérification, donc ce bloc entier est sauté, y compris les
--        deux notifications contract_ready qu'il contient.
--    Aucune modification de hiring.ts n'est donc nécessaire pour que ce
--    trigger coexiste avec chooseCandidate() sans notification en double.
-- ============================================================
create or replace function public.replicate_hired_side_effects()
returns trigger
language plpgsql
as $$
declare
  v_mission record;
  v_rejected record;
  v_existing_contract_id uuid;
begin
  select * into v_mission from public.missions where id = new.mission_id;
  if v_mission is null then
    return new;
  end if;

  -- Rejette les autres candidatures encore ouvertes sur cette mission,
  -- et nettoie leur visio + notifie le candidat, comme chooseCandidate().
  for v_rejected in
    update public.applications
    set status = 'rejected', responded_at = now()
    where mission_id = new.mission_id
      and id <> new.id
      and status in ('pending', 'interviewing')
    returning id, candidate_id
  loop
    update public.visio_meetings
    set status = 'cancelled'
    where application_id = v_rejected.id
      and status in ('proposed', 'accepted', 'no_show_employer', 'no_show_candidate');

    insert into public.notifications (user_id, type, title, message, related_id, is_read)
    values (
      v_rejected.candidate_id,
      'application_rejected',
      'Candidature refusée',
      format('Votre candidature pour "%s" a été refusée.', v_mission.title),
      new.mission_id,
      false
    );
  end loop;

  -- Confirme la mission.
  update public.missions
  set status = 'assigned'
  where id = new.mission_id
    and status <> 'assigned';

  -- Génère le contrat, une seule fois (même clé de lecture que
  -- chooseCandidate() : par mission_id seul, pas par candidat).
  select id into v_existing_contract_id
  from public.contracts
  where mission_id = new.mission_id
  limit 1;

  if v_existing_contract_id is null then
    insert into public.contracts (mission_id, candidate_id, employer_id, status, total_amount, payment_status)
    values (new.mission_id, new.candidate_id, v_mission.employer_id, 'pending', v_mission.budget, 'pending');

    insert into public.notifications (user_id, type, title, message, related_id, is_read)
    values
      (v_mission.employer_id, 'contract_ready', 'Contrat prêt à signer',
       format('Le contrat pour "%s" est prêt à être signé.', v_mission.title), new.mission_id, false),
      (new.candidate_id, 'contract_ready', 'Contrat prêt à signer',
       format('Le contrat pour "%s" est prêt à être signé.', v_mission.title), new.mission_id, false);
  end if;

  return new;
end;
$$;

drop trigger if exists replicate_hired_side_effects_trigger on public.applications;
create trigger replicate_hired_side_effects_trigger
  after update on public.applications
  for each row
  when (new.status = 'hired' and old.status is distinct from new.status)
  execute function public.replicate_hired_side_effects();
