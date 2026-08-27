-- Backfill: candidate_profiles legacy bio -> bio_text, for the handful of
-- pre-Sprint-4b rows that never went through the wizard and would otherwise
-- lose their bio text once the legacy `bio` column is dropped (see the
-- companion drop migration, applied immediately after this one). Scoped
-- generically (not by user_id) so it's self-limiting and idempotent —
-- confirmed via direct query that exactly 3 rows in the whole table match
-- this condition, all confirmed test accounts.
update public.candidate_profiles
set bio_text = bio
where bio_text is null and bio is not null;
