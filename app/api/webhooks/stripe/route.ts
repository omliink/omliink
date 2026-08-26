import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase-service'
import { createNotification } from '@/lib/notifications-helpers'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const contractId = session.metadata?.contract_id

    if (contractId) {
      const supabase = createServiceRoleClient()
      const { data: contract } = await supabase.from('contracts').select('*').eq('id', contractId).maybeSingle()

      if (contract && contract.payment_status !== 'paid') {
        const { error } = await supabase.from('contracts').update({ payment_status: 'paid' }).eq('id', contractId)

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        await Promise.all([
          createNotification(supabase, {
            userId: contract.candidate_id,
            type: 'payment_received',
            title: 'Paiement effectué',
            message: 'Le paiement de la mission vous a été versé.',
            relatedId: contract.mission_id,
          }),
          createNotification(supabase, {
            userId: contract.employer_id,
            type: 'payment_confirmed',
            title: 'Paiement confirmé',
            message: 'Votre paiement pour la mission a bien été confirmé.',
            relatedId: contract.mission_id,
          }),
        ])
      }
    }
  }

  return NextResponse.json({ received: true })
}
