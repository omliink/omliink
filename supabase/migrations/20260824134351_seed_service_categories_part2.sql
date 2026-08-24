-- Completes the 15 official OMLIINK service categories. The first 6 (slugs
-- garde-enfants, menage, jardinage, bricolage, cours-particuliers, aide-courses,
-- sort_order 1-6) were already seeded manually — verified present via a live
-- query before writing this migration. This adds the remaining 9, continuing
-- sort_order at 7. Safe to re-run: skips rows whose slug already exists.

insert into public.service_categories (name, slug, description, sort_order)
select v.name, v.slug, v.description, v.sort_order
from (
  values
    ('Déménagement', 'demenagement', 'Aide au déménagement et transport de meubles', 7),
    ('Garde animaux', 'garde-animaux', 'Garde, promenade et soins des animaux de compagnie', 8),
    ('Aide personnes âgées', 'aide-personnes-agees', 'Accompagnement et assistance aux personnes âgées', 9),
    ('Aide informatique', 'aide-informatique', 'Dépannage et assistance informatique à domicile', 10),
    ('Préparation repas', 'preparation-repas', 'Préparation de repas à domicile', 11),
    ('Accompagnement véhiculé', 'accompagnement-vehicule', 'Trajets et accompagnement en véhicule', 12),
    ('Aide saisonnière', 'aide-saisonniere', 'Aide ponctuelle liée aux saisons (neige, jardin, etc.)', 13),
    ('Aide événementielle', 'aide-evenementielle', 'Renfort pour événements privés ou festifs', 14),
    ('Surveillance domicile', 'surveillance-domicile', 'Surveillance du domicile en cas d''absence', 15)
) as v(name, slug, description, sort_order)
where not exists (
  select 1 from public.service_categories existing where existing.slug = v.slug
);
