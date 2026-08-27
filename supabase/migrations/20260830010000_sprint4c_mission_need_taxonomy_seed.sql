-- Sprint 4c: seed mission_need_taxonomy, the reference sub-type list the
-- mission form's "Mes besoins" step reads from (filtered to the mission's
-- chosen category). 2-4 sub-types per category, looked up by slug rather
-- than hardcoded UUIDs — same safe, idempotent pattern as the
-- skill_taxonomy seed from Sprint 4b.

insert into public.mission_need_taxonomy (category_id, need_tag, label)
select sc.id, v.need_tag, v.label
from (
  values
    -- Garde d'enfants
    ('garde-enfants', 'garde_reguliere', 'Garde régulière'),
    ('garde-enfants', 'garde_ponctuelle', 'Garde ponctuelle'),
    ('garde-enfants', 'garde_soir_weekend', 'Garde soir/week-end'),
    ('garde-enfants', 'garde_bebe', 'Garde de bébé (0-2 ans)'),
    -- Ménage
    ('menage', 'menage_regulier', 'Ménage régulier'),
    ('menage', 'grand_menage', 'Grand ménage / saisonnier'),
    ('menage', 'repassage_seul', 'Repassage seul'),
    ('menage', 'menage_apres_travaux', 'Ménage après travaux'),
    -- Jardinage
    ('jardinage', 'entretien_regulier', 'Entretien régulier'),
    ('jardinage', 'gros_travaux_jardin', 'Gros travaux ponctuels'),
    ('jardinage', 'taille_elagage', 'Taille et élagage'),
    ('jardinage', 'creation_amenagement', 'Création / aménagement'),
    -- Bricolage
    ('bricolage', 'petits_travaux', 'Petits travaux divers'),
    ('bricolage', 'installation_electromenager', 'Installation électroménager'),
    ('bricolage', 'montage_meubles', 'Montage de meubles'),
    ('bricolage', 'renovation_legere', 'Rénovation légère'),
    -- Cours particuliers
    ('cours-particuliers', 'soutien_scolaire', 'Soutien scolaire régulier'),
    ('cours-particuliers', 'preparation_examen', 'Préparation à un examen'),
    ('cours-particuliers', 'cours_langue', 'Cours de langue'),
    ('cours-particuliers', 'remise_a_niveau', 'Remise à niveau'),
    -- Aide aux courses
    ('aide-courses', 'courses_hebdomadaires', 'Courses hebdomadaires'),
    ('aide-courses', 'courses_ponctuelles', 'Courses ponctuelles'),
    ('aide-courses', 'livraison_pharmacie', 'Livraison pharmacie'),
    -- Déménagement
    ('demenagement', 'demenagement_complet', 'Déménagement complet'),
    ('demenagement', 'aide_portage', 'Aide au portage'),
    ('demenagement', 'emballage_seul', 'Emballage/cartons seul'),
    -- Garde d'animaux
    ('garde-animaux', 'garde_domicile', 'Garde à domicile'),
    ('garde-animaux', 'promenade_quotidienne', 'Promenade quotidienne'),
    ('garde-animaux', 'garde_vacances', 'Garde pendant les vacances'),
    ('garde-animaux', 'soins_specifiques', 'Soins spécifiques'),
    -- Aide personnes âgées
    ('aide-personnes-agees', 'auxiliaire_de_vie', 'Auxiliaire de vie'),
    ('aide-personnes-agees', 'dame_de_compagnie', 'Dame/homme de compagnie'),
    ('aide-personnes-agees', 'aide_toilette_specialisee', 'Aide à la toilette spécialisée'),
    ('aide-personnes-agees', 'accompagnement_sorties', 'Accompagnement sorties'),
    -- Aide informatique
    ('aide-informatique', 'depannage_ponctuel', 'Dépannage ponctuel'),
    ('aide-informatique', 'initiation_debutant', 'Initiation débutant'),
    ('aide-informatique', 'configuration_equipement', 'Configuration d''équipement'),
    -- Préparation repas
    ('preparation-repas', 'repas_quotidiens', 'Repas quotidiens'),
    ('preparation-repas', 'repas_evenementiel', 'Repas événementiel'),
    ('preparation-repas', 'regime_specifique', 'Régime spécifique'),
    -- Accompagnement véhiculé
    ('accompagnement-vehicule', 'trajets_medicaux', 'Trajets médicaux'),
    ('accompagnement-vehicule', 'trajets_scolaires', 'Trajets scolaires'),
    ('accompagnement-vehicule', 'trajets_reguliers', 'Trajets réguliers'),
    -- Aide saisonnière
    ('aide-saisonniere', 'deneigement', 'Déneigement'),
    ('aide-saisonniere', 'entretien_exterieur_saisonnier', 'Entretien extérieur saisonnier'),
    ('aide-saisonniere', 'decoration_saisonniere', 'Décoration saisonnière'),
    -- Aide événementielle
    ('aide-evenementielle', 'renfort_service', 'Renfort service à table'),
    ('aide-evenementielle', 'aide_logistique_evenement', 'Aide logistique événement'),
    ('aide-evenementielle', 'garde_enfants_evenement', 'Garde d''enfants en événement'),
    -- Surveillance domicile
    ('surveillance-domicile', 'surveillance_absence_courte', 'Surveillance absence courte'),
    ('surveillance-domicile', 'surveillance_longue_duree', 'Surveillance longue durée'),
    ('surveillance-domicile', 'entretien_domicile_absence', 'Entretien du domicile en votre absence')
) as v(slug, need_tag, label)
join public.service_categories sc on sc.slug = v.slug
where not exists (
  select 1 from public.mission_need_taxonomy existing
  where existing.category_id = sc.id and existing.need_tag = v.need_tag
);
