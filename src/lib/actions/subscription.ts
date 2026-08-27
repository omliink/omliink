'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'
import { getBaseUrl } from '@/lib/site-url'

const PREMIUM_PRICE_EUR_CENTS = 1000 // 10€/mois

export interface SubscriptionActionState {
  error?: string
}

async function getOwnEmployerProfile() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase.from('employer_profiles').select('*').eq('user_id', user.id).maybeSingle()
  if (!profile) {
    throw new Error('Profil employeur introuvable')
  }

  return { supabase, user, profile }
}

interface ValidPromoCode {
  id: string
  discount_type: string
  discount_value: number
}

async function validatePromoCode(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  employerId: string,
  rawCode: string
): Promise<{ promoCode?: ValidPromoCode; error?: string }> {
  const code = rawCode.trim()
  if (!code) return {}

  const { data: promoCode } = await supabase
    .from('promo_codes')
    .select('*')
    .ilike('code', code)
    .maybeSingle()

  if (!promoCode || !promoCode.active) {
    return { error: 'Code promo invalide.' }
  }

  const now = new Date()
  if (promoCode.valid_from && now < new Date(promoCode.valid_from)) {
    return { error: "Ce code promo n'est pas encore valide." }
  }
  if (promoCode.valid_until && now > new Date(promoCode.valid_until)) {
    return { error: 'Ce code promo a expiré.' }
  }
  if (promoCode.max_uses != null && promoCode.current_uses >= promoCode.max_uses) {
    return { error: "Ce code promo a atteint son nombre maximal d'utilisations." }
  }

  const { data: existingRedemption } = await supabase
    .from('promo_code_redemptions')
    .select('id')
    .eq('employer_id', employerId)
    .eq('promo_code_id', promoCode.id)
    .maybeSingle()
  if (existingRedemption) {
    return { error: 'Vous avez déjà utilisé ce code promo.' }
  }

  return { promoCode: { id: promoCode.id, discount_type: promoCode.discount_type, discount_value: promoCode.discount_value } }
}

// --- Employer: Devenir premium ---
export async function startPremiumCheckout(
  _prevState: SubscriptionActionState,
  formData: FormData
): Promise<SubscriptionActionState> {
  const { supabase, user, profile } = await getOwnEmployerProfile()

  if (profile.subscription_tier === 'premium') {
    return { error: 'Vous êtes déjà abonné Premium.' }
  }

  const rawPromoCode = String(formData.get('promo_code') ?? '')
  const { promoCode, error: promoError } = await validatePromoCode(supabase, user.id, rawPromoCode)
  if (promoError) {
    return { error: promoError }
  }

  let customerId = profile.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { employer_id: user.id },
    })
    customerId = customer.id
    await supabase.from('employer_profiles').update({ stripe_customer_id: customerId }).eq('user_id', user.id)
  }

  let couponId: string | undefined
  if (promoCode) {
    const coupon = await stripe.coupons.create({
      duration: 'once',
      ...(promoCode.discount_type === 'percent'
        ? { percent_off: Number(promoCode.discount_value) }
        : { amount_off: Math.round(Number(promoCode.discount_value) * 100), currency: 'eur' }),
    })
    couponId = coupon.id
  }

  const baseUrl = await getBaseUrl()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: PREMIUM_PRICE_EUR_CENTS,
          recurring: { interval: 'month' },
          product_data: { name: 'OMLIINK Premium' },
        },
        quantity: 1,
      },
    ],
    ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
    subscription_data: {
      metadata: {
        employer_id: user.id,
        ...(promoCode ? { promo_code_id: promoCode.id } : {}),
      },
    },
    metadata: { employer_id: user.id },
    success_url: `${baseUrl}/dashboard?premium=success`,
    cancel_url: `${baseUrl}/dashboard/premium?cancelled=1`,
  })

  if (!session.url) {
    return { error: 'Impossible de créer la session de paiement' }
  }

  redirect(session.url)
}

// --- Employer: Gérer mon abonnement (Stripe Customer Portal) ---
export async function openBillingPortal(): Promise<SubscriptionActionState> {
  const { profile } = await getOwnEmployerProfile()
  if (!profile.stripe_customer_id) {
    return { error: 'Aucun abonnement à gérer.' }
  }

  const baseUrl = await getBaseUrl()
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${baseUrl}/dashboard`,
  })

  redirect(portalSession.url)
}
