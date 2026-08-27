import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'
import type { Collaborator } from '@/lib/dashboard-data'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Contract = Database['public']['Tables']['contracts']['Row']

interface EmployerCollaboratorsListProps {
  collaborators: Collaborator[]
  profileById: Map<string, Profile>
  contractByMissionId: Map<string, Contract>
}

export default function EmployerCollaboratorsList({
  collaborators,
  profileById,
  contractByMissionId,
}: EmployerCollaboratorsListProps) {
  if (collaborators.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState
          title="Aucun intervenant pour le moment"
          description="Les candidats que vous embauchez apparaîtront ici, avec l'historique de vos collaborations."
        />
      </div>
    )
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {collaborators.map(({ candidateId, mission, application }) => {
        const profile = profileById.get(candidateId)
        const contract = contractByMissionId.get(mission.id)
        return (
          <li key={application.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{profile?.full_name ?? profile?.email ?? 'Candidat'}</p>
              <p className="mt-0.5 text-xs text-gray-500">Mission : {mission.title}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3 text-sm">
              <Link href={`/dashboard/missions/${mission.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                Voir la mission
              </Link>
              {contract && (
                <Link href={`/dashboard/missions/${mission.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                  Contrat
                </Link>
              )}
              <Link
                href="/dashboard/missions/new"
                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600"
              >
                Recontacter pour une mission
              </Link>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
