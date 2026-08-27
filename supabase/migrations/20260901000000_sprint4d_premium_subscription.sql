-- Sprint 4d: Premium employer subscription (Stripe Subscriptions), promo
-- codes, mission-count gating for free tier, and retroactive gating of the
-- Sprint 5c CESU/Pajemploi block behind Premium.
--
-- employer_profiles.stripe_customer_id already exists in the base schema
-- (OMLIINK_DATABASE_SETUP.sql) but has never been populated — the current
-- Connect flow only creates Connect *accounts* for candidates (a different
-- Stripe object entirely), no employer-side Stripe Customer exists yet.
-- Reused here rather than adding a second column.

alter table public.employer_profiles
  add column if not exists subscription_tier varchar(20) not null default 'free',
  -- 'free' | 'premium'
  add column if not exists subscription_status varchar(20),
  -- null until first subscription attempt; then mirrors Stripe's Subscription.status:
  -- 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid'
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_current_period_end timestamp with time zone;
  -- mirrors Subscription.current_period_end — avoids a live Stripe call just
  -- to show "renews on <date>" on every dashboard load.

-- ============================================================
-- promo_codes: reference-ish table, public read (validated client-side
-- before Stripe Checkout), no INSERT/UPDATE/DELETE policy at all — same
-- "no admin system exists yet, service_role only" pattern as skill_taxonomy
-- (Sprint 4b): service_role bypasses RLS regardless, so omitting write
-- policies for authenticated/anon is sufficient without inventing an admin
-- role. Codes are created directly in Supabase by the team, no admin UI.
-- ============================================================
create table if not exists public.promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code varchar(50) not null unique,
  discount_type varchar(20) not null, -- 'percent' | 'fixed'
  discount_value numeric(10, 2) not null,
  valid_from timestamp with time zone,
  valid_until timestamp with time zone,
  max_uses integer,
  current_uses integer not null default 0,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.promo_codes enable row level security;

drop policy if exists "promo_codes_select_all" on public.promo_codes;
create policy "promo_codes_select_all"
  on public.promo_codes for select
  using (true);

drop trigger if exists promo_codes_updated_at on public.promo_codes;
create trigger promo_codes_updated_at
  before update on public.promo_codes
  for each row execute function update_updated_at_column();

-- ============================================================
-- promo_code_redemptions: append-only log, one row per (employer, code) —
-- the unique constraint is what makes webhook redelivery idempotent (see
-- webhook handler: INSERT is attempted, current_uses is only incremented
-- if that INSERT actually succeeds) and is what "one use per employer"
-- means mechanically. Only ever written by the webhook (service_role,
-- bypasses RLS) — the owner policy exists for symmetry with the rest of
-- the schema and future direct reads, not because the client ever writes
-- here itself.
-- ============================================================
create table if not exists public.promo_code_redemptions (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  promo_code_id uuid not null references public.promo_codes(id) on delete cascade,
  redeemed_at timestamp with time zone not null default now(),
  unique (employer_id, promo_code_id)
);

alter table public.promo_code_redemptions enable row level security;

drop policy if exists "promo_code_redemptions_manage_own" on public.promo_code_redemptions;
create policy "promo_code_redemptions_manage_own"
  on public.promo_code_redemptions for all
  using (employer_id = auth.uid())
  with check (employer_id = auth.uid());
