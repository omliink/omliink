import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'
import StatusBadge from '@/components/ui/StatusBadge'
import MissionModerationActions from '@/components/admin/MissionModerationActions'
import DismissReportButton from '@/components/admin/DismissReportButton'
import { MISSION_REPORT_REASON_LABELS } from '@/lib/mission-report-reasons'
import {
  getCategories,
  getMissionsByIds,
  getPendingMissionReportsForMissions,
  getPendingReportsByMission,
  getProfilesByIds,
  getPublishedMissions,
} from '@/lib/dashboard-data'

export default async function AdminMissionsPage() {
  const [missions, categories, pendingReportsByMission] = await Promise.all([
    getPublishedMissions(),
    getCategories(),
    getPendingReportsByMission(),
  ])

  const reportedMissionIds = [...pendingReportsByMission.keys()]
  const [reportedMissions, pendingReports] = await Promise.all([
    getMissionsByIds(reportedMissionIds),
    getPendingMissionReportsForMissions(reportedMissionIds),
  ])
  const reportsByMissionId = new Map<string, typeof pendingReports>()
  for (const report of pendingReports) {
    const existing = reportsByMissionId.get(report.mission_id) ?? []
    existing.push(report)
    reportsByMissionId.set(report.mission_id, existing)
  }

  const allEmployerIds = new Set([...missions.map((m) => m.employer_id), ...reportedMissions.map((m) => m.employer_id)])
  const employerProfiles = await getProfilesByIds([...allEmployerIds])
  const employerNameById = new Map(employerProfiles.map((p) => [p.id, p.full_name ?? p.email]))
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Missions</h1>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">Missions signalées</h2>
        {reportedMissions.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Aucun signalement en attente.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {reportedMissions.map((mission) => {
              const summary = pendingReportsByMission.get(mission.id)
              const reports = reportsByMissionId.get(mission.id) ?? []
              return (
                <li key={mission.id} className="rounded-xl border border-red-200 bg-red-50/40 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/dashboard/missions/${mission.id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-indigo-600"
                        >
                          {mission.title}
                        </Link>
                        <StatusBadge status={mission.status} />
                        {mission.moderation_status !== 'normal' && <StatusBadge status={mission.moderation_status} />}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {categoryNameById.get(mission.category_id) ?? 'Catégorie'} ·{' '}
                        {employerNameById.get(mission.employer_id) ?? 'Employeur'}
                      </p>
                      <p className="mt-2 text-sm font-medium text-red-700">
                        {summary?.count ?? reports.length} signalement{(summary?.count ?? reports.length) > 1 ? 's' : ''} —{' '}
                        {(summary?.reasons ?? []).map((r) => MISSION_REPORT_REASON_LABELS[r] ?? r).join(', ')}
                      </p>
                    </div>
                    <MissionModerationActions missionId={mission.id} moderationStatus={mission.moderation_status} />
                  </div>

                  <ul className="mt-3 flex flex-col gap-2 border-t border-red-100 pt-3">
                    {reports.map((report) => (
                      <li key={report.id} className="flex items-start justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <span className="font-medium text-gray-700">
                            {MISSION_REPORT_REASON_LABELS[report.reason] ?? report.reason}
                          </span>
                          {report.details && <p className="mt-0.5 text-xs text-gray-500">{report.details}</p>}
                          <p className="mt-0.5 text-xs text-gray-400">
                            {new Date(report.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <DismissReportButton reportId={report.id} />
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Missions publiées</h2>
        <p className="mt-1 text-sm text-gray-600">{missions.length} mission(s) publiée(s).</p>

        {missions.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Aucune mission publiée" description="Rien à modérer pour le moment." />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 bg-white">
            {missions.map((mission) => (
              <li key={mission.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/missions/${mission.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {mission.title}
                    </Link>
                    {mission.moderation_status !== 'normal' && <StatusBadge status={mission.moderation_status} />}
                  </div>
                  <p className="text-xs text-gray-500">
                    {categoryNameById.get(mission.category_id) ?? 'Catégorie'} ·{' '}
                    {employerNameById.get(mission.employer_id) ?? 'Employeur'}
                  </p>
                </div>
                <MissionModerationActions missionId={mission.id} moderationStatus={mission.moderation_status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
