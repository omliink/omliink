import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase-service'

// Dedicated endpoint (distinct signing secret) for subscription lifecycle
// events — separate from app/api/webhooks/stripe/route.ts, which only
// handles one-time mission payment Checkout Sessions.
const PREMIUM_STATUSES = new Set(['active', 'trialing'])

async function applySubscriptionState(
  supabase: ReturnType<typeof createServiceRoleClient>,
  subscription: Stripe.Subscription
) {
  const employerId = subscription.metadata?.employer_id
  if (!employerId) return

  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  // current_period_end moved from the subscription object to its first item
  // in this API version — see SubscriptionItems.d.ts.
  const currentPeriodEndUnix = subscription.items.data[0]?.current_period_end

  await supabase
    .from('employer_profiles')
    .update({
      subscription_tier: PREMIUM_STATUSES.has(subscription.status) ? 'premium' : 'free',
      subscription_status: subscription.status,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      subscription_current_period_end: currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000).toISOString() : null,
    })
    .eq('user_id', employerId)
}

// Redemption is only ever recorded here, after Stripe confirms the
// subscription was actually created — never at Checkout Session creation.
// The unique (employer_id, promo_code_id) constraint makes this idempotent
// under webhook redelivery: current_uses is only incremented if the INSERT
// actually inserted a new row.
async function redeemPromoCodeIfAny(supabase: ReturnType<typeof createServiceRoleClient>, subscription: Stripe.Subscription) {
  const employerId = subscription.metadata?.employer_id
  const promoCodeId = subscription.metadata?.promo_code_id
  if (!employerId || !promoCodeId) return

  const { error: insertError } = await supabase
    .from('promo_code_redemptions')
    .insert({ employer_id: employerId, promo_code_id: promoCodeId })
  if (insertError) return // unique violation = already redeemed, nothing further to do

  const { data: promoCode } = await supabase
    .from('promo_codes')
    .select('current_uses')
    .eq('id', promoCodeId)
    .maybeSingle()
  if (promoCode) {
    await supabase
      .from('promo_codes')
      .update({ current_uses: promoCode.current_uses + 1 })
      .eq('id', promoCodeId)
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    await applySubscriptionState(supabase, subscription)
    if (event.type === 'customer.subscription.created') {
      await redeemPromoCodeIfAny(supabase, subscription)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const employerId = subscription.metadata?.employer_id
    if (employerId) {
      await supabase
        .from('employer_profiles')
        .update({ subscription_tier: 'free', subscription_status: 'canceled' })
        .eq('user_id', employerId)
    }
  }

  // Renewal confirmation — a safety net in case this arrives before the
  // corresponding subscription.updated event (Stripe doesn't guarantee
  // delivery order). Looked up by stripe_subscription_id: this API version
  // moved the subscription reference off the invoice root onto
  // invoice.parent.subscription_details.subscription (see Invoices.d.ts).
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionRef = invoice.parent?.subscription_details?.subscription
    const subscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id

    if (subscriptionId) {
      await supabase
        .from('employer_profiles')
        .update({ subscription_tier: 'premium', subscription_status: 'active' })
        .eq('stripe_subscription_id', subscriptionId)
    }
  }

  return NextResponse.json({ received: true })
}
