-- Sprint matching géographique : localisation de référence du candidat +
-- rayon de déplacement accepté, pour le tri/filtre par distance des
-- missions disponibles (formule haversine, côté applicatif — pas de
-- PostGIS nécessaire à ce volume).

alter table public.candidate_profiles
  add column if not exists location_lat double precision,
  add column if not exists location_lng double precision,
  add column if not exists radius_km integer not null default 20;
