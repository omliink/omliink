import { redirect } from 'next/navigation'
import { getCurrentUser, getProfile } from '@/lib/dashboard-data'
import EmployerDashboard from '@/components/dashboard/EmployerDashboard'
import CandidateDashboard from '@/components/dashboard/CandidateDashboard'

interface DashboardPageProps {
  searchParams: Promise<{ category?: string; created?: string; showAll?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  if (!profile) {
    redirect('/dashboard/onboarding')
  }

  const params = await searchParams
  const fullName = profile.full_name ?? profile.email

  return (
    <div className="flex flex-col gap-8">
      {params.created && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
            <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          {params.created === 'published' ? 'Mission publiée avec succès.' : 'Mission enregistrée en brouillon.'}
        </div>
      )}

      <div className="flex flex-col gap-12">
        {profile.is_employer && <EmployerDashboard employerId={user.id} fullName={fullName} />}
        {profile.is_candidate && (
          <CandidateDashboard
            candidateId={user.id}
            fullName={fullName}
            categoryFilter={params.category}
            showAllDistance={params.showAll === '1'}
          />
        )}
      </div>
    </div>
  )
}
