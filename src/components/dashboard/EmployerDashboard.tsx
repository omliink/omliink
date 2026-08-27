import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import ActiveMissionCard from './ActiveMissionCard'
import EmployerMissionsGrid from './EmployerMissionsGrid'
import EmployerCollaboratorsList from './EmployerCollaboratorsList'
import PremiumStatusBlock from './PremiumStatusBlock'
import {
  getApplicationsForMissions,
  getCategories,
  getContractsByMissionIds,
  getEmployerCollaborators,
  getEmployerMissions,
  getEmployerProfile,
  getProfilesByIds,
  getVisioMeetingsByMissionIds,
} from '@/lib/dashboard-data'

const PENDING_VISIO_STATUSES = new Set(['proposed', 'accepted', 'in_progress'])
const PREVIEW_COUNT = 3

interface EmployerDashboardProps {
  employerId: string
  fullName: string
}

export default async function EmployerDashboard({ employerId, fullName }: EmployerDashboardProps) {
  const missions = await getEmployerMissions(employerId)
  const missionIds = missions.map((mission) => mission.id)
  const [categories, applications, visioMeetings, collaborators, employerProfile] = await Promise.all([
    getCategories(),
    getApplicationsForMissions(missionIds),
    getVisioMeetingsByMissionIds(missionIds),
    getEmployerCollaborators(employerId),
    getEmployerProfile(employerId),
  ])

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
    .slice(0, PREVIEW_COUNT)
  const recentCollaborators = collaborators.slice(0, PREVIEW_COUNT)

  const [collaboratorProfiles, collaboratorContracts, applicantProfiles] = await Promise.all([
    getProfilesByIds([...new Set(recentCollaborators.map((c) => c.candidateId))]),
    getContractsByMissionIds([...new Set(recentCollaborators.map((c) => c.mission.id))]),
    getProfilesByIds([...new Set(recentApplications.map((a) => a.candidate_id))]),
  ])
  const profileById = new Map(collaboratorProfiles.map((p) => [p.id, p]))
  const contractByMissionId = new Map(collaboratorContracts.map((c) => [c.mission_id, c]))
  const applicantNameById = new Map(applicantProfiles.map((p) => [p.id, p.full_name ?? p.email]))

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
  const recentMissions = [...missions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, PREVIEW_COUNT)

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

      <PremiumStatusBlock
        subscriptionTier={employerProfile?.subscription_tier ?? 'free'}
        subscriptionCurrentPeriodEnd={employerProfile?.subscription_current_period_end ?? null}
      />

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Mes missions</h2>
          <Link href="/dashboard/missions" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Voir tout →
          </Link>
        </div>
        <EmployerMissionsGrid
          missions={recentMissions}
          categoryMap={categoryMap}
          applicationsCountByMission={applicationsCountByMission}
          hiredMissionIds={hiredMissionIds}
        />
      </div>

      {recentApplications.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Dernières candidatures</h2>
            <Link href="/dashboard/candidats" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Voir tout →
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white">
            <ul className="divide-y divide-gray-100">
              {recentApplications.map((application) => (
                <li key={application.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {applicantNameById.get(application.candidate_id) ?? 'Candidat'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {missionById.get(application.mission_id)?.title ?? 'Mission'} ·{' '}
                      {new Date(application.applied_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <StatusBadge status={application.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Mes intervenants</h2>
          <Link href="/dashboard/intervenants" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Voir tout →
          </Link>
        </div>
        <EmployerCollaboratorsList
          collaborators={recentCollaborators}
          profileById={profileById}
          contractByMissionId={contractByMissionId}
        />
      </div>
    </section>
  )
}
