import { redirect } from 'next/navigation'
import EmployerCandidatesList, { type CandidateRow } from '@/components/dashboard/EmployerCandidatesList'
import {
  getApplicationsForMissions,
  getCurrentUser,
  getEmployerMissions,
  getProfile,
  getProfilesByIds,
} from '@/lib/dashboard-data'

export default async function CandidatsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  if (!profile?.is_employer) {
    redirect('/dashboard')
  }

  const missions = await getEmployerMissions(user.id)
  const missionById = new Map(missions.map((m) => [m.id, m]))
  const applications = await getApplicationsForMissions(missions.map((m) => m.id))
  const candidateProfiles = await getProfilesByIds([...new Set(applications.map((a) => a.candidate_id))])
  const candidateNameById = new Map(candidateProfiles.map((p) => [p.id, p.full_name ?? p.email]))

  const rows: CandidateRow[] = applications
    .map((application) => ({
      applicationId: application.id,
      candidateId: application.candidate_id,
      candidateName: candidateNameById.get(application.candidate_id) ?? 'Candidat',
      missionId: application.mission_id,
      missionTitle: missionById.get(application.mission_id)?.title ?? 'Mission',
      status: application.status,
      appliedAt: application.applied_at,
    }))
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mes candidats</h1>
      <p className="mt-1 text-sm text-gray-600">Toutes les candidatures reçues, tous statuts confondus.</p>

      <div className="mt-6">
        <EmployerCandidatesList rows={rows} />
      </div>
    </div>
  )
}
