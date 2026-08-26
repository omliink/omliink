import { redirect } from 'next/navigation'
import CandidateProfileForm from '@/components/dashboard/CandidateProfileForm'
import EmployerProfileForm from '@/components/dashboard/EmployerProfileForm'
import StripeConnectSection from '@/components/dashboard/StripeConnectSection'
import { getCandidateProfile, getCurrentUser, getEmployerProfile, getProfile } from '@/lib/dashboard-data'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  if (!profile) {
    redirect('/dashboard/onboarding')
  }

  const [candidateProfile, employerProfile] = await Promise.all([
    profile.is_candidate ? getCandidateProfile(user.id) : Promise.resolve(null),
    profile.is_employer ? getEmployerProfile(user.id) : Promise.resolve(null),
  ])

  if ((profile.is_candidate && !candidateProfile) || (profile.is_employer && !employerProfile)) {
    redirect('/dashboard/onboarding')
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="mt-1 text-sm text-gray-600">Ces informations sont visibles par vos interlocuteurs sur OMLIINK.</p>
      </div>

      {profile.is_employer && employerProfile && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Profil employeur</h2>
          <div className="mt-4">
            <EmployerProfileForm profile={employerProfile} />
          </div>
        </section>
      )}

      {profile.is_candidate && candidateProfile && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Profil candidat</h2>
          <div className="mt-4">
            <CandidateProfileForm profile={candidateProfile} />
          </div>
        </section>
      )}

      {profile.is_candidate && candidateProfile && <StripeConnectSection profile={candidateProfile} />}
    </div>
  )
}
