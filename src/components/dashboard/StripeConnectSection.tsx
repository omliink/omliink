import StripeConnectButton from './StripeConnectButton'
import type { Database } from '@/types/database.types'

type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']

export default function StripeConnectSection({ profile }: { profile: CandidateProfile }) {
  if (profile.employment_status !== 'auto_entrepreneur') {
    return null
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900">Recevoir mes paiements</h2>
      <div className="mt-4 rounded-xl border border-gray-100 bg-white p-5">
        {profile.stripe_connect_onboarded ? (
          <div className="flex flex-col gap-3">
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Compte de paiement actif
            </p>
            <p className="text-sm text-gray-600">
              Les paiements des missions en tant qu&apos;auto-entrepreneur sont versés sur ce compte, moins la
              commission OMLIINK (10%).
            </p>
            <div>
              <StripeConnectButton variant="dashboard" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-600">
              Configurez votre compte de paiement Stripe pour pouvoir être payé directement après chaque mission
              signée.
            </p>
            <div>
              <StripeConnectButton variant="onboard" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
