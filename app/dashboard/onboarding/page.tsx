import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dashboard-data'
import OnboardingForm from '@/components/dashboard/OnboardingForm'

export default async function OnboardingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const metadata = user.user_metadata as Record<string, unknown>
  const fullName = typeof metadata.full_name === 'string' ? metadata.full_name : null
  const phone = typeof metadata.phone === 'string' ? metadata.phone : null
  const accountType =
    metadata.account_type === 'employer' || metadata.account_type === 'candidate' ? metadata.account_type : null

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Bienvenue sur OMLIINK</h1>
        <p className="mt-2 text-sm text-gray-600">Choisissez votre profil pour accéder à votre tableau de bord.</p>

        <div className="mt-8">
          <OnboardingForm
            userId={user.id}
            email={user.email ?? ''}
            fullName={fullName}
            phone={phone}
            initialAccountType={accountType}
          />
        </div>
      </div>
    </div>
  )
}
