import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getEmployerProfile, getProfile } from '@/lib/dashboard-data'
import PremiumCheckoutForm from '@/components/dashboard/PremiumCheckoutForm'

const BENEFITS = [
  'Missions illimitées, sans plafond de missions actives',
  'Priorité de matching : vos missions apparaissent en premier auprès des candidats',
  "Accompagnement CESU/Pajemploi : formulaires de connexion et suivi par notre équipe",
]

interface PremiumPageProps {
  searchParams: Promise<{ cancelled?: string }>
}

export default async function PremiumPage({ searchParams }: PremiumPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  if (!profile?.is_employer) {
    redirect('/dashboard')
  }

  const employerProfile = await getEmployerProfile(user.id)
  if (employerProfile?.subscription_tier === 'premium') {
    redirect('/dashboard')
  }

  const params = await searchParams

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Passer en Premium</h1>
      <p className="mt-1 text-sm text-gray-600">10€/mois, sans engagement, résiliable à tout moment.</p>

      {params.cancelled && (
        <div role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Paiement annulé — vous pouvez réessayer quand vous le souhaitez.
        </div>
      )}

      <div className="mt-6 rounded-xl border border-[#ff5a3d]/30 bg-[#ff5a3d]/5 p-6">
        <ul className="flex flex-col gap-3 text-sm text-gray-700">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <span className="mt-0.5 text-[#ff5a3d]">✓</span>
              {benefit}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-3xl font-bold text-gray-900">
          10€<span className="text-base font-medium text-gray-500">/mois</span>
        </p>

        <div className="mt-6">
          <PremiumCheckoutForm />
        </div>
      </div>

      <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-gray-500 hover:text-gray-700">
        ← Retour au tableau de bord
      </Link>
    </div>
  )
}
