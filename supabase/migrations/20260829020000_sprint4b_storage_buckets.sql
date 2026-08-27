-- Sprint 4b: two new Storage buckets for the onboarding wizard.
--
-- candidate-photos: public bucket — the whole point of a profile photo is
-- that employers see it (mission list, applications, "Entretiens" tab), so
-- a plain public URL is simplest; only the owning candidate can write to
-- their own folder.
--
-- verification-documents: private bucket for identity documents. Only the
-- owning candidate can read/write their own file. Per this sprint's spec
-- there is no in-app reviewer UI yet — manual review happens directly in
-- the Supabase dashboard using the service role, which bypasses RLS
-- entirely, so no additional "reviewer" policy is needed here.
--
-- Both buckets use the path convention `${auth.uid()}/filename`, enforced
-- via storage.foldername(name)[1] — the standard Supabase per-user-folder
-- pattern.

insert into storage.buckets (id, name, public)
values ('candidate-photos', 'candidate-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('verification-documents', 'verification-documents', false)
on conflict (id) do nothing;

drop policy if exists "candidate_photos_insert_own" on storage.objects;
create policy "candidate_photos_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'candidate-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "candidate_photos_update_own" on storage.objects;
create policy "candidate_photos_update_own"
  on storage.objects for update
  using (bucket_id = 'candidate-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "candidate_photos_delete_own" on storage.objects;
create policy "candidate_photos_delete_own"
  on storage.objects for delete
  using (bucket_id = 'candidate-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "verification_documents_insert_own" on storage.objects;
create policy "verification_documents_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "verification_documents_select_own" on storage.objects;
create policy "verification_documents_select_own"
  on storage.objects for select
  using (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "verification_documents_update_own" on storage.objects;
create policy "verification_documents_update_own"
  on storage.objects for update
  using (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);
