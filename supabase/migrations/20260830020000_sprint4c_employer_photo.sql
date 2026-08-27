-- Sprint 4c follow-up: optional employer profile photo (missed in the
-- original sprint prompt — was analyzed in the Yoopies scenario reference
-- but not carried into this sprint's brief). Mirrors the candidate photo
-- pattern from Sprint 4b, with two deliberate differences: nullable (not
-- mandatory) and its own dedicated bucket rather than sharing
-- candidate-photos, since employers and candidates are different rows in
-- the same profiles table and mixing their files in one bucket would need
-- messier path-based RLS than two clean per-role buckets.

alter table public.employer_profiles
  add column if not exists photo_url text;

insert into storage.buckets (id, name, public)
values ('employer-photos', 'employer-photos', true)
on conflict (id) do nothing;

-- Same folder-ownership pattern as candidate-photos (Sprint 4b):
-- {auth.uid()}/filename. No upsert used on the application side (lesson
-- from Sprint 4b: upsert:true needs a non-trivial SELECT policy to
-- evaluate the ON CONFLICT arbiter), so insert/update/delete-own is
-- sufficient — no separate SELECT policy needed either, since the bucket
-- is public and reads go through the public URL endpoint, not RLS.
drop policy if exists "employer_photos_insert_own" on storage.objects;
create policy "employer_photos_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'employer-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "employer_photos_update_own" on storage.objects;
create policy "employer_photos_update_own"
  on storage.objects for update
  using (bucket_id = 'employer-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "employer_photos_delete_own" on storage.objects;
create policy "employer_photos_delete_own"
  on storage.objects for delete
  using (bucket_id = 'employer-photos' and (storage.foldername(name))[1] = auth.uid()::text);
