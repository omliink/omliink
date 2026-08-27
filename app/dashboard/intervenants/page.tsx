import { redirect } from 'next/navigation'
import EmployerCollaboratorsList from '@/components/dashboard/EmployerCollaboratorsList'
import {
  getContractsByMissionIds,
  getCurrentUser,
  getEmployerCollaborators,
  getProfile,
  getProfilesByIds,
} from '@/lib/dashboard-data'

export default async function IntervenantsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  if (!profile?.is_employer) {
    redirect('/dashboard')
  }

  const collaborators = await getEmployerCollaborators(user.id)
  const [profiles, contracts] = await Promise.all([
    getProfilesByIds([...new Set(collaborators.map((c) => c.candidateId))]),
    getContractsByMissionIds([...new Set(collaborators.map((c) => c.mission.id))]),
  ])
  const profileById = new Map(profiles.map((p) => [p.id, p]))
  const contractByMissionId = new Map(contracts.map((c) => [c.mission_id, c]))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mes intervenants</h1>
      <p className="mt-1 text-sm text-gray-600">
        Les candidats que vous avez déjà embauchés — retrouvez-les rapidement pour une nouvelle mission.
      </p>

      <EmployerCollaboratorsList
        collaborators={collaborators}
        profileById={profileById}
        contractByMissionId={contractByMissionId}
      />
    </div>
  )
}
