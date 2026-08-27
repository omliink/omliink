-- Sprint 4b: seed skill_taxonomy, the reference tag list wizard step 7 reads
-- from (filtered to whichever categories the candidate picked at step 4).
-- Looks categories up by slug rather than hardcoding UUIDs, and skips rows
-- whose (category, skill_tag) already exists — safe to re-run, same
-- pattern as the service_categories seed migrations.

insert into public.skill_taxonomy (category_id, skill_tag, label)
select sc.id, v.skill_tag, v.label
from (
  values
    -- Ménage
    ('menage', 'repassage', 'Repassage'),
    ('menage', 'cuisine_preparation_repas', 'Cuisine/préparation repas'),
    ('menage', 'rangement', 'Rangement'),
    ('menage', 'vitres', 'Vitres'),
    ('menage', 'nettoyage_sols', 'Nettoyage sols'),
    ('menage', 'produits_ecologiques', 'Produits écologiques'),
    -- Jardinage
    ('jardinage', 'tonte', 'Tonte'),
    ('jardinage', 'taille_haies', 'Taille de haies'),
    ('jardinage', 'entretien_massifs', 'Entretien massifs'),
    ('jardinage', 'desherbage', 'Désherbage'),
    ('jardinage', 'arrosage', 'Arrosage'),
    ('jardinage', 'petit_elagage', 'Petit élagage'),
    -- Bricolage
    ('bricolage', 'travaux_electriques', 'Petits travaux électriques'),
    ('bricolage', 'plomberie_base', 'Plomberie de base'),
    ('bricolage', 'montage_meubles', 'Montage meubles'),
    ('bricolage', 'peinture', 'Peinture'),
    ('bricolage', 'pose_etageres', 'Pose d''étagères'),
    -- Déménagement
    ('demenagement', 'port_charges_lourdes', 'Port de charges lourdes'),
    ('demenagement', 'emballage_cartons', 'Emballage/cartons'),
    ('demenagement', 'demontage_remontage_meubles', 'Démontage/remontage meubles'),
    ('demenagement', 'permis_b', 'Permis B'),
    -- Garde d'enfants
    ('garde-enfants', 'nouveau_nes', 'Nouveau-nés'),
    ('garde-enfants', 'tout_petits', 'Tout-petits'),
    ('garde-enfants', 'age_prescolaire', 'Âge préscolaire'),
    ('garde-enfants', 'age_scolaire', 'Âge scolaire'),
    ('garde-enfants', 'aide_devoirs', 'Aide aux devoirs'),
    ('garde-enfants', 'activites_montessori', 'Activités/Montessori'),
    ('garde-enfants', 'premiers_secours', 'Premiers secours'),
    -- Garde d'animaux
    ('garde-animaux', 'chiens', 'Chiens'),
    ('garde-animaux', 'chats', 'Chats'),
    ('garde-animaux', 'nac', 'NAC'),
    ('garde-animaux', 'promenade', 'Promenade'),
    ('garde-animaux', 'administration_medicaments', 'Administration médicaments'),
    ('garde-animaux', 'toilettage_base', 'Toilettage de base'),
    -- Cours particuliers
    ('cours-particuliers', 'primaire', 'Primaire'),
    ('cours-particuliers', 'college', 'Collège'),
    ('cours-particuliers', 'lycee', 'Lycée'),
    ('cours-particuliers', 'soutien_methodologie', 'Soutien méthodologie'),
    ('cours-particuliers', 'langues', 'Langues'),
    ('cours-particuliers', 'matieres_scientifiques', 'Matières scientifiques'),
    -- Aide personnes âgées
    ('aide-personnes-agees', 'aide_toilette', 'Aide à la toilette'),
    ('aide-personnes-agees', 'aide_repas', 'Aide au repas'),
    ('aide-personnes-agees', 'accompagnement_sorties', 'Accompagnement sorties'),
    ('aide-personnes-agees', 'stimulation_cognitive', 'Stimulation cognitive'),
    ('aide-personnes-agees', 'premiers_secours', 'Premiers secours'),
    -- Aide informatique
    ('aide-informatique', 'initiation_smartphone', 'Initiation smartphone'),
    ('aide-informatique', 'configuration_ordinateur', 'Configuration ordinateur'),
    ('aide-informatique', 'demarches_en_ligne', 'Démarches en ligne'),
    ('aide-informatique', 'depannage_base', 'Dépannage de base'),
    -- Préparation repas
    ('preparation-repas', 'cuisine_traditionnelle', 'Cuisine traditionnelle'),
    ('preparation-repas', 'regimes_specifiques', 'Régimes spécifiques'),
    ('preparation-repas', 'batch_cooking', 'Batch cooking'),
    ('preparation-repas', 'patisserie', 'Pâtisserie'),
    -- Courses/Livraison (catégorie "Aide aux courses", slug aide-courses)
    ('aide-courses', 'motorise', 'Motorisé'),
    ('aide-courses', 'grandes_surfaces', 'Grandes surfaces'),
    ('aide-courses', 'marches', 'Marchés'),
    ('aide-courses', 'pharmacie', 'Pharmacie'),
    -- Accompagnement véhiculé
    ('accompagnement-vehicule', 'permis_de_conduire', 'Permis de conduire'),
    ('accompagnement-vehicule', 'vehicule_personnel', 'Véhicule personnel'),
    ('accompagnement-vehicule', 'trajets_medicaux', 'Trajets médicaux'),
    ('accompagnement-vehicule', 'trajets_scolaires', 'Trajets scolaires'),
    -- Aide saisonnière
    ('aide-saisonniere', 'deneigement', 'Déneigement'),
    ('aide-saisonniere', 'entretien_exterieur_hiver', 'Entretien extérieur hiver'),
    ('aide-saisonniere', 'decorations_saisonnieres', 'Décorations saisonnières'),
    -- Aide événementielle
    ('aide-evenementielle', 'service_a_table', 'Service à table'),
    ('aide-evenementielle', 'aide_logistique', 'Aide logistique'),
    ('aide-evenementielle', 'garde_enfants_evenement', 'Garde d''enfants en événement'),
    -- Surveillance domicile
    ('surveillance-domicile', 'arrosage_plantes', 'Arrosage plantes'),
    ('surveillance-domicile', 'releve_courrier', 'Relève courrier'),
    ('surveillance-domicile', 'rondes_securite', 'Rondes de sécurité'),
    ('surveillance-domicile', 'alimentation_animaux', 'Alimentation animaux')
) as v(slug, skill_tag, label)
join public.service_categories sc on sc.slug = v.slug
where not exists (
  select 1 from public.skill_taxonomy existing
  where existing.category_id = sc.id and existing.skill_tag = v.skill_tag
);
