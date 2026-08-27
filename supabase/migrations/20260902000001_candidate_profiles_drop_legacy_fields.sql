-- Sprint cleanup: drop candidate_profiles legacy fields superseded by the
-- Sprint 4b wizard (bio_title/bio_text, candidate_skills, experience_level).
-- Confirmed dead in the app before this migration:
--   - CandidateProfileReveal.tsx was the one remaining reader of all three
--     (employer-facing "Voir le profil" panel on ApplicationsList/
--     InterviewsList) — fixed to read bio_text, candidate_skills +
--     skill_taxonomy, and experience_level instead.
--   - The 3 candidate_profiles rows that still had legacy data populated
--     (all confirmed test accounts) had their bio backfilled into bio_text
--     by the companion migration run immediately before this one — skills/
--     years_experience were intentionally not migrated: different formats
--     from their modern equivalents (candidate_skills rows vs a free-text
--     array; experience_level enum vs a raw integer), not a 1:1 mapping
--     worth automating for 3 test rows.
--
-- MUST run the bio backfill migration before this one, or those 3 rows'
-- bio text is lost permanently — DROP COLUMN is not reversible without a
-- database backup restore.
alter table public.candidate_profiles
  drop column bio,
  drop column skills,
  drop column years_experience;
