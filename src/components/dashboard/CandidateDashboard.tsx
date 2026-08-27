import Link from 'next/link'
import MissionCard from '@/components/ui/MissionCard'
import EmptyState from '@/components/ui/EmptyState'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryFilter from './CategoryFilter'
import ActiveMissionCard from './ActiveMissionCard'
import DistanceFilterToggle from './DistanceFilterToggle'
import { haversineDistanceKm } from '@/lib/geo'
import { parseVisioTimestamp } from '@/lib/visio-time'
import {
  getCandidateApplications,
  getCandidateProfile,
  getCategories,
  getInvitationsForCandidate,
  getMissionsByIds,
  getProfilesByIds,
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

  // Agenda: upcoming confirmed visios, chronologically.
  const upcomingVisios = visioMeetings
    .filter((meeting) => meeting.status === 'accepted' && meeting.scheduled_date)
    .filter((meeting) => parseVisioTimestamp(meeting.scheduled_date as string).getTime() >= now)
    .sort(
      (a, b) =>
        parseVisioTimestamp(a.scheduled_date as string).getTime() - parseVisioTimestamp(b.scheduled_date as string).getTime()
    )
  const employerIds = [...new Set(upcomingVisios.map((meeting) => meeting.employer_id))]
  const employerProfiles = await getProfilesByIds(employerIds)
  const employerNameById = new Map(employerProfiles.map((p) => [p.id, p.full_name ?? p.email]))

  // Agenda: hired missions not yet completed (awaiting start or in progress).
  const hiredMissionIds = new Set(
    myApplications.filter((application) => application.status === 'hired').map((application) => application.mission_id)
  )
  const hiredActiveMissions = [...hiredMissionIds]
    .map((id) => missionById.get(id))
    .filter((mission): mission is NonNullable<typeof mission> => mission != null && mission.status !== 'completed')

  // Invitations: missions where an employer directly invited this candidate
  // to apply. Purely informational — applying stays entirely optional.
  const invitations = await getInvitationsForCandidate(candidateId)
  const invitedMissions = await getMissionsByIds(invitations.map((i) => i.mission_id))
  const invitedMissionById = new Map(invitedMissions.map((m) => [m.id, m]))

  // Dashboard preview only shows what's still live — the full "En attente" /
  // "Historique" split lives on the dedicated /dashboard/candidatures page.
  const pendingApplications = myApplications.filter(
    (application) => application.status === 'pending' || application.status === 'interviewing'
  )

  return (
    <section className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bonjour {fullName}</h1>
        <p className="mt-1 text-sm text-gray-600">Découvrez les missions disponibles.</p>
      </div>

      {(upcomingVisios.length > 0 || hiredActiveMissions.length > 0) && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Mon agenda</h2>
            <Link href="/dashboard/agenda" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Voir tout →
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {upcomingVisios.slice(0, 3).map((meeting) => {
              const mission = missionById.get(meeting.mission_id)
              return (
                <div key={meeting.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Visio</p>
                    <p className="truncate text-sm font-semibold text-gray-900">{mission?.title ?? 'Mission'}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      avec {employerNameById.get(meeting.employer_id) ?? 'Employeur'} ·{' '}
                      {parseVisioTimestamp(meeting.scheduled_date as string).toLocaleString('fr-FR', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                        timeZone: 'Europe/Paris',
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/missions/${meeting.mission_id}`}
                    className="flex-shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Voir
                  </Link>
                </div>
              )
            })}
            {hiredActiveMissions.slice(0, 3).map((mission) => (
              <div key={mission.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">Mission</p>
                  <p className="truncate text-sm font-semibold text-gray-900">{mission.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {mission.status === 'in_progress' ? 'En cours' : 'En attente de démarrage'}
                  </p>
                </div>
                <Link
                  href={`/dashboard/missions/${mission.id}`}
                  className="flex-shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Voir
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {invitations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Missions qui vous ont repéré</h2>
          <p className="mt-1 text-sm text-gray-600">
            Des employeurs vous ont invité(e) à candidater. Libre à vous de donner suite ou non.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {invitations.map((invitation) => {
              const mission = invitedMissionById.get(invitation.mission_id)
              if (!mission) return null
              return (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Invitation</p>
                    <p className="truncate text-sm font-semibold text-gray-900">{mission.title}</p>
                  </div>
                  <Link
                    href={`/dashboard/missions/${mission.id}`}
                    className="flex-shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600"
                  >
                    Voir la mission
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

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

      {pendingApplications.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Mes candidatures en attente</h2>
            <Link href="/dashboard/candidatures" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Voir tout →
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white">
            <ul className="divide-y divide-gray-100">
              {pendingApplications.slice(0, 3).map((application) => {
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
        </div>
      )}
    </section>
  )
}
