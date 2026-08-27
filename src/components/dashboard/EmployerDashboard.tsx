import Link from 'next/link'
import ActiveMissionCard from './ActiveMissionCard'
import EmployerMissionsTabs from './EmployerMissionsTabs'
import {
  getApplicationsForMissions,
  getCategories,
  getContractsByMissionIds,
  getEmployerCollaborators,
  getEmployerMissions,
  getProfilesByIds,
  getVisioMeetingsByMissionIds,
} from '@/lib/dashboard-data'

const PENDING_VISIO_STATUSES = new Set(['proposed', 'accepted', 'in_progress'])

interface EmployerDashboardProps {
  employerId: string
  fullName: string
}

export default async function EmployerDashboard({ employerId, fullName }: EmployerDashboardProps) {
  const missions = await getEmployerMissions(employerId)
  const missionIds = missions.map((mission) => mission.id)
  const [categories, applications, visioMeetings, collaborators] = await Promise.all([
    getCategories(),
    getApplicationsForMissions(missionIds),
    getVisioMeetingsByMissionIds(missionIds),
    getEmployerCollaborators(employerId),
  ])

  const [collaboratorProfiles, collaboratorContracts] = await Promise.all([
    getProfilesByIds([...new Set(collaborators.map((c) => c.candidateId))]),
    getContractsByMissionIds([...new Set(collaborators.map((c) => c.mission.id))]),
  ])
  const profileById = new Map(collaboratorProfiles.map((p) => [p.id, p]))
  const contractByMissionId = new Map(collaboratorContracts.map((c) => [c.mission_id, c]))

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]))
  const applicationsCountByMission = new Map<string, number>()
  const hiredMissionIds = new Set<string>()
  applications.forEach((application) => {
    applicationsCountByMission.set(
      application.mission_id,
      (applicationsCountByMission.get(application.mission_id) ?? 0) + 1
    )
    if (application.status === 'hired') {
      hiredMissionIds.add(application.mission_id)
    }
  })

  const activeMissionsCount = missions.filter(
    (mission) => mission.status === 'published' || mission.status === 'in_progress'
  ).length

  const missionById = new Map(missions.map((mission) => [mission.id, mission]))
  const pendingVisioMeetings = visioMeetings.filter((meeting) => PENDING_VISIO_STATUSES.has(meeting.status))

  // This Server Component renders once per request — there's no re-render to
  // go stale, so the purity rule (aimed at memoized client components) does
  // not apply here.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour {fullName}</h1>
          <p className="mt-1 text-sm text-gray-600">Voici un aperçu de vos missions.</p>
        </div>
        <Link
          href="/dashboard/missions/new"
          className="inline-flex items-center justify-center rounded-lg bg-[#ff5a3d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff5a3d]/90 focus:outline-none focus:ring-2 focus:ring-[#ff5a3d] focus:ring-offset-2"
        >
          Créer une mission
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm text-gray-500">Missions actives</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{activeMissionsCount}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm text-gray-500">Candidatures reçues</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{applications.length}</p>
        </div>
      </div>

      {pendingVisioMeetings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Visioconférences</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingVisioMeetings.map((meeting) => {
              const mission = missionById.get(meeting.mission_id)
              if (!mission) return null
              return <ActiveMissionCard key={meeting.id} mission={mission} meeting={meeting} now={now} />
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        <EmployerMissionsTabs
          missions={missions}
          categoryMap={categoryMap}
          applicationsCountByMission={applicationsCountByMission}
          hiredMissionIds={hiredMissionIds}
          collaborators={collaborators}
          profileById={profileById}
          contractByMissionId={contractByMissionId}
        />
      </div>
    </section>
  )
}
