import { redirect } from 'next/navigation'
import CandidateApplicationsTabs from '@/components/dashboard/CandidateApplicationsTabs'
import { getCandidateApplications, getCurrentUser, getMissionsByIds, getProfile } from '@/lib/dashboard-data'

export default async function CandidaturesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  if (!profile?.is_candidate) {
    redirect('/dashboard')
  }

  const applications = await getCandidateApplications(user.id)
  const missions = await getMissionsByIds(applications.map((a) => a.mission_id))
  const missionById = new Map(missions.map((m) => [m.id, m]))

  const pendingApplications = applications.filter(
    (application) => application.status === 'pending' || application.status === 'interviewing'
  )
  const historyApplications = applications.filter((application) => {
    if (application.status === 'rejected') return true
    if (application.status === 'hired') {
      const mission = missionById.get(application.mission_id)
      return mission?.status === 'completed'
    }
    return false
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mes candidatures</h1>
      <p className="mt-1 text-sm text-gray-600">Toutes vos candidatures, en attente ou passées.</p>

      <div className="mt-6">
        <CandidateApplicationsTabs pending={pendingApplications} history={historyApplications} missionById={missionById} />
      </div>
    </div>
  )
}
