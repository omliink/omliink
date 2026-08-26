'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'
import { getBaseUrl } from '@/lib/site-url'

const PLATFORM_FEE_RATE = 0.1

export interface PaymentActionState {
  error?: string
}

export async function createMissionPaymentCheckout(
  contractId: string,
  missionId: string
): Promise<PaymentActionState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: contract } = await supabase.from('contracts').select('*').eq('id', contractId).maybeSingle()
  if (!contract || contract.employer_id !== user.id) {
    return { error: 'Non autorisé' }
  }
  if (contract.status !== 'signed') {
    return { error: 'Le contrat doit être signé par les deux parties avant paiement' }
  }
  if (contract.payment_status === 'paid') {
    return { error: 'Cette mission a déjà été payée' }
  }
  if (!contract.total_amount || contract.total_amount <= 0) {
    return { error: 'Montant de mission invalide' }
  }

  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', contract.candidate_id)
    .maybeSingle()

  if (candidateProfile?.employment_status !== 'auto_entrepreneur') {
    return { error: "Le paiement OMLIINK ne s'applique qu'au statut auto-entrepreneur" }
  }
  if (!candidateProfile.stripe_connect_onboarded || !candidateProfile.stripe_connect_account_id) {
    return { error: "Le candidat n'a pas encore configuré son compte de paiement" }
  }

  const { data: mission } = await supabase.from('missions').select('*').eq('id', missionId).maybeSingle()
  if (!mission) {
    return { error: 'Mission introuvable' }
  }

  const amountInCents = Math.round(contract.total_amount * 100)
  const applicationFeeInCents = Math.round(amountInCents * PLATFORM_FEE_RATE)
  const baseUrl = await getBaseUrl()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: amountInCents,
          product_data: {
            name: `Mission OMLIINK : ${mission.title}`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: applicationFeeInCents,
      transfer_data: {
        destination: candidateProfile.stripe_connect_account_id,
      },
    },
    metadata: {
      contract_id: contractId,
      mission_id: missionId,
    },
    success_url: `${baseUrl}/dashboard/missions/${missionId}?payment=success`,
    cancel_url: `${baseUrl}/dashboard/missions/${missionId}?payment=cancelled`,
  })

  if (!session.url) {
    return { error: 'Impossible de créer la session de paiement' }
  }

  redirect(session.url)
}
