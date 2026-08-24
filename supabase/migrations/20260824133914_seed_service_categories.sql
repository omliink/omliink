-- `service_categories` was empty, which blocks the mission creation form (its
-- category select has nothing to choose from). Seeding a starter set of
-- categories relevant to a home-services marketplace so Sprint 1 testing
-- (and early real usage) has something to select. Safe to re-run: skips rows
-- whose slug already exists.

insert into public.service_categories (name, slug, description, sort_order)
select v.name, v.slug, v.description, v.sort_order
from (
  values
    ('Garde d''enfants', 'garde-enfants', 'Surveillance et garde d''enfants à domicile', 1),
    ('Ménage', 'menage', 'Entretien et nettoyage du domicile', 2),
    ('Jardinage', 'jardinage', 'Entretien de jardin, tonte, taille', 3),
    ('Bricolage', 'bricolage', 'Petits travaux et réparations à domicile', 4),
    ('Cours particuliers', 'cours-particuliers', 'Soutien scolaire et cours à domicile', 5),
    ('Aide aux courses', 'aide-courses', 'Accompagnement et aide pour les courses', 6)
) as v(name, slug, description, sort_order)
where not exists (
  select 1 from public.service_categories existing where existing.slug = v.slug
);
