-- UX fix: the "Adresse de référence" field on the candidate profile only
-- showed a generic "Position enregistrée" placeholder, with no way for the
-- candidate (or anyone debugging matching distances) to see which address
-- was actually saved. Store the formatted address text too, same as
-- missions.location_address.

alter table public.candidate_profiles
  add column if not exists location_address text;
