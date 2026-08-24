-- Bug found while testing "mark notification as read": every UPDATE on
-- `notifications` failed with Postgres error 42703 "record 'new' has no
-- field 'updated_at'". The table has a generic BEFORE UPDATE trigger
-- (the same one applied across the schema) that sets NEW.updated_at, but
-- unlike every other table here, `notifications` was never given that
-- column. Adding it brings the table in line with the rest of the schema
-- and fixes the trigger error — no application code or trigger change needed.

alter table public.notifications
  add column if not exists updated_at timestamptz not null default now();
