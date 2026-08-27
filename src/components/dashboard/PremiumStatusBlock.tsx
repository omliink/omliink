import Link from 'next/link'
import ManageBillingButton from './ManageBillingButton'

interface PremiumStatusBlockProps {
  subscriptionTier: string
  subscriptionCurrentPeriodEnd: string | null
}

export default function PremiumStatusBlock({ subscriptionTier, subscriptionCurrentPeriodEnd }: PremiumStatusBlockProps) {
  if (subscriptionTier === 'premium') {
    return (
      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800">Vous êtes Premium ✓</p>
          {subscriptionCurrentPeriodEnd && (
            <p className="mt-1 text-xs text-emerald-700">
              Renouvellement le{' '}
              {new Date(subscriptionCurrentPeriodEnd).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
        <ManageBillingButton />
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-xl border border-[#ff5a3d]/30 bg-[#ff5a3d]/5 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Passez en Premium</p>
          <p className="mt-1 text-sm text-gray-600">
            Missions illimitées, priorité de matching, accompagnement CESU/Pajemploi — 10€/mois.
          </p>
        </div>
        <Link
          href="/dashboard/premium"
          className="inline-flex flex-shrink-0 items-center justify-center rounded-lg bg-[#ff5a3d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff5a3d]/90"
        >
          Devenir premium
        </Link>
      </div>
    </div>
  )
}
