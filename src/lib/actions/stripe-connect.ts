'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'
import { getBaseUrl } from '@/lib/site-url'

export interface StripeConnectActionState {
  error?: string
}

async function getOwnCandidateProfile() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase.from('candidate_profiles').select('*').eq('user_id', user.id).maybeSingle()
  if (!profile) {
    throw new Error('Profil candidat introuvable')
  }
  if (profile.employment_status !== 'auto_entrepreneur') {
    throw new Error("Réservé aux candidats au statut auto-entrepreneur")
  }

  return { supabase, user, profile }
}

export async function createConnectOnboardingLink(): Promise<StripeConnectActionState> {
  const { supabase, user, profile } = await getOwnCandidateProfile()
  const baseUrl = await getBaseUrl()

  let accountId = profile.stripe_connect_account_id
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email ?? undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })
    accountId = account.id

    const { error } = await supabase
      .from('candidate_profiles')
      .update({ stripe_connect_account_id: accountId })
      .eq('user_id', user.id)
    if (error) {
      return { error: error.message }
    }
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/dashboard/profile`,
    return_url: `${baseUrl}/dashboard/profile/stripe-return`,
    type: 'account_onboarding',
  })

  redirect(accountLink.url)
}

export async function openExpressDashboard(): Promise<StripeConnectActionState> {
  const { profile } = await getOwnCandidateProfile()
  if (!profile.stripe_connect_account_id) {
    return { error: 'Aucun compte de paiement configuré' }
  }

  const loginLink = await stripe.accounts.createLoginLink(profile.stripe_connect_account_id)
  redirect(loginLink.url)
}

/**
 * Called from the /dashboard/profile/stripe-return Route Handler after the
 * hosted Connect onboarding flow redirects back. Stripe doesn't push a
 * synchronous "onboarding finished" signal to the return_url, so we just
 * re-check the account's status directly. Deliberately NOT called during a
 * page render — Next.js forbids mutating/revalidating data mid-render, and
 * a Route Handler followed by a redirect to a fresh page load makes any
 * explicit revalidation unnecessary anyway.
 */
export async function syncStripeConnectStatus(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile?.stripe_connect_account_id || profile.stripe_connect_onboarded) return

  const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id)
  const onboarded = Boolean(account.details_submitted && account.charges_enabled)

  if (onboarded) {
    await supabase.from('candidate_profiles').update({ stripe_connect_onboarded: true }).eq('user_id', user.id)
  }
}
