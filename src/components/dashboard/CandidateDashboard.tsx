import Link from 'next/link'
import MissionCard from '@/components/ui/MissionCard'
import EmptyState from '@/components/ui/EmptyState'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryFilter from './CategoryFilter'
import ActiveMissionCard from './ActiveMissionCard'
import DistanceFilterToggle from './DistanceFilterToggle'
import { haversineDistanceKm } from '@/lib/geo'
import {
  getCandidateApplications,
  getCandidateProfile,
  getCategories,
  getMissionsByIds,
  getPublishedMissions,
  getVisioMeetingsByMissionIds,
} from '@/lib/dashboard-data'

interface CandidateDashboardProps {
  candidateId: string
  fullName: string
  categoryFilter?: string
  showAllDistance?: boolean
}

export default async function CandidateDashboard({
  candidateId,
  fullName,
  categoryFilter,
  showAllDistance,
}: CandidateDashboardProps) {
  const [allMissions, categories, myApplications, candidateProfile] = await Promise.all([
    getPublishedMissions(),
    getCategories(),
    getCandidateApplications(candidateId),
    getCandidateProfile(candidateId),
  ])

  const appliedMissionIds = new Set(myApplications.map((application) => application.mission_id))
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]))

  let availableMissions = allMissions.filter((mission) => !appliedMissionIds.has(mission.id))
  if (categoryFilter) {
    availableMissions = availableMissions.filter((mission) => mission.category_id === categoryFilter)
  }

  const candidateLat = candidateProfile?.location_lat
  const candidateLng = candidateProfile?.location_lng
  const hasLocation = candidateLat != null && candidateLng != null
  const radiusKm = candidateProfile?.radius_km ?? 20

  const availableMissionsWithDistance = availableMissions.map((mission) => ({
    mission,
    distanceKm:
      hasLocation && mission.location_lat != null && mission.location_lng != null
        ? haversineDistanceKm(candidateLat, candidateLng, mission.location_lat, mission.location_lng)
        : null,
  }))

  if (hasLocation) {
    availableMissionsWithDistance.sort((a, b) => {
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
  }

  const visibleMissionsWithDistance =
    hasLocation && !showAllDistance
      ? availableMissionsWithDistance.filter((entry) => entry.distanceKm == null || entry.distanceKm <= radiusKm)
      : availableMissionsWithDistance

  const appliedMissions = await getMissionsByIds(myApplications.map((application) => application.mission_id))
  const missionById = new Map(appliedMissions.map((mission) => [mission.id, mission]))

  const inProgressMissionIds = myApplications
    .filter((application) => application.status === 'interviewing' || application.status === 'hired')
    .map((application) => application.mission_id)
  const activeMissions = inProgressMissionIds
    .map((id) => missionById.get(id))
    .filter((mission): mission is NonNullable<typeof mission> => Boolean(mission))
  // RLS scopes visio_meetings to its two participants, so even though this
  // mission may have other candidates' meetings too (parallel interviews),
  // this query — run as the candidate — only ever returns their own.
  const visioMeetings = await getVisioMeetingsByMissionIds(inProgressMissionIds)
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
          <div className="flex flex-wrap items-center gap-4">
            {hasLocation && <DistanceFilterToggle radiusKm={radiusKm} showAll={Boolean(showAllDistance)} />}
            <CategoryFilter categories={categories} selected={categoryFilter} />
          </div>
        </div>

        {!hasLocation && (
          <p className="mt-2 text-xs text-gray-500">
            <Link href="/dashboard/profile" className="text-indigo-600 underline hover:text-indigo-700">
              Renseignez votre localisation sur votre profil
            </Link>{' '}
            pour trier et filtrer les missions par distance.
          </p>
        )}

        {visibleMissionsWithDistance.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Aucune mission disponible"
              description="Revenez plus tard, de nouvelles missions sont publiées régulièrement."
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMissionsWithDistance.map(({ mission, distanceKm }) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                variant="candidate"
                categoryName={categoryMap.get(mission.category_id)}
                distanceKm={distanceKm}
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
