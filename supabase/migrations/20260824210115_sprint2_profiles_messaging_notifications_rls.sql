-- Sprint 2 RLS policies: candidate profile visibility for the employer who
-- received an application, plus conversations/messages/notifications access.
-- All additive (existing policies are untouched); safe to re-run.

-- candidate_profiles: an employer may read a candidate's extended profile
-- (bio, skills, experience) if that candidate applied to one of the
-- employer's own missions — same pattern as profiles_select_via_application
-- from the Sprint 1 migration.
drop policy if exists "candidate_profiles_select_via_application" on public.candidate_profiles;
create policy "candidate_profiles_select_via_application"
  on public.candidate_profiles for select
  using (
    exists (
      select 1
      from public.applications
      join public.missions on missions.id = applications.mission_id
      where applications.candidate_id = candidate_profiles.user_id
        and missions.employer_id = auth.uid()
    )
  );

-- conversations: only the two participants can see or create a conversation.
drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant"
  on public.conversations for select
  using (auth.uid() = user_1_id or auth.uid() = user_2_id);

drop policy if exists "conversations_insert_participant" on public.conversations;
create policy "conversations_insert_participant"
  on public.conversations for insert
  with check (auth.uid() = user_1_id or auth.uid() = user_2_id);

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant"
  on public.conversations for update
  using (auth.uid() = user_1_id or auth.uid() = user_2_id)
  with check (auth.uid() = user_1_id or auth.uid() = user_2_id);

-- messages: only participants of the parent conversation can read, send, or
-- mark messages as read.
drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and (conversations.user_1_id = auth.uid() or conversations.user_2_id = auth.uid())
    )
  );

drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and (conversations.user_1_id = auth.uid() or conversations.user_2_id = auth.uid())
    )
  );

drop policy if exists "messages_update_participant" on public.messages;
create policy "messages_update_participant"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and (conversations.user_1_id = auth.uid() or conversations.user_2_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and (conversations.user_1_id = auth.uid() or conversations.user_2_id = auth.uid())
    )
  );

-- notifications: a user only ever reads/marks-read their own notifications.
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- notifications INSERT is inherently cross-user (the actor notifying someone
-- is never the recipient), so it can't be scoped to auth.uid() = user_id the
-- way the other tables are. This app has no service-role key available, so
-- the pragmatic tradeoff for now is: any authenticated user may insert a
-- notification, restricted to the known notification types our own app
-- code creates. This is not real spam protection — a later hardening pass
-- should move notification creation into a SECURITY DEFINER trigger (e.g. on
-- applications/messages insert/update) so clients can't call it directly at all.
drop policy if exists "notifications_insert_known_types" on public.notifications;
create policy "notifications_insert_known_types"
  on public.notifications for insert
  to authenticated
  with check (
    type in ('application_received', 'application_accepted', 'application_rejected', 'new_message')
  );
