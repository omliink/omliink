import MissionCard from '@/components/ui/MissionCard'
import EmptyState from '@/components/ui/EmptyState'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryFilter from './CategoryFilter'
import ActiveMissionCard from './ActiveMissionCard'
import {
  getCandidateApplications,
  getCategories,
  getMissionsByIds,
  getPublishedMissions,
  getVisioMeetingsByMissionIds,
} from '@/lib/dashboard-data'

interface CandidateDashboardProps {
  candidateId: string
  fullName: string
  categoryFilter?: string
}

export default async function CandidateDashboard({ candidateId, fullName, categoryFilter }: CandidateDashboardProps) {
  const [allMissions, categories, myApplications] = await Promise.all([
    getPublishedMissions(),
    getCategories(),
    getCandidateApplications(candidateId),
  ])

  const appliedMissionIds = new Set(myApplications.map((application) => application.mission_id))
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]))

  let availableMissions = allMissions.filter((mission) => !appliedMissionIds.has(mission.id))
  if (categoryFilter) {
    availableMissions = availableMissions.filter((mission) => mission.category_id === categoryFilter)
  }

  const appliedMissions = await getMissionsByIds(myApplications.map((application) => application.mission_id))
  const missionById = new Map(appliedMissions.map((mission) => [mission.id, mission]))

  const acceptedMissionIds = myApplications
    .filter((application) => application.status === 'accepted')
    .map((application) => application.mission_id)
  const activeMissions = acceptedMissionIds
    .map((id) => missionById.get(id))
    .filter((mission): mission is NonNullable<typeof mission> => Boolean(mission))
  const visioMeetings = await getVisioMeetingsByMissionIds(acceptedMissionIds)
  const visioMeetingByMissionId = new Map(visioMeetings.map((meeting) => [meeting.mission_id, meeting]))

  // This Server Component renders once per request — there's no re-render to
  // go stale, so the purity rule (aimed at memoized client components) does
  // not apply here.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  return (
    <section className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bonjour {fullName}</h1>
        <p className="mt-1 text-sm text-gray-600">Découvrez les missions disponibles.</p>
      </div>

      {activeMissions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Mes missions en cours</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeMissions.map((mission) => (
              <ActiveMissionCard
                key={mission.id}
                mission={mission}
                meeting={visioMeetingByMissionId.get(mission.id)}
                now={now}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Missions disponibles</h2>
          <CategoryFilter categories={categories} selected={categoryFilter} />
        </div>

        {availableMissions.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Aucune mission disponible"
              description="Revenez plus tard, de nouvelles missions sont publiées régulièrement."
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                variant="candidate"
                categoryName={categoryMap.get(mission.category_id)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Mes candidatures</h2>
        {myApplications.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Vous n&apos;avez pas encore candidaté.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white">
            <ul className="divide-y divide-gray-100">
              {myApplications.map((application) => {
                const mission = missionById.get(application.mission_id)
                return (
                  <li key={application.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{mission?.title ?? 'Mission'}</p>
                      <p className="text-xs text-gray-500">
                        Candidature envoyée le {new Date(application.applied_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
