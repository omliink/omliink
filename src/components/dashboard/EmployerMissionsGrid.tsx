import Link from 'next/link'
import MissionCard from '@/components/ui/MissionCard'
import EmptyState from '@/components/ui/EmptyState'
import MissionActionsMenu from './MissionActionsMenu'
import type { Database } from '@/types/database.types'

type Mission = Database['public']['Tables']['missions']['Row']

interface EmployerMissionsGridProps {
  missions: Mission[]
  categoryMap: Map<string, string>
  applicationsCountByMission: Map<string, number>
  hiredMissionIds: Set<string>
}

function MissionsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
      <path d="M4 7h16M4 12h10M4 17h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export default function EmployerMissionsGrid({
  missions,
  categoryMap,
  applicationsCountByMission,
  hiredMissionIds,
}: EmployerMissionsGridProps) {
  if (missions.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState
          icon={<MissionsIcon />}
          title="Aucune mission pour le moment"
          description="Créez votre première mission pour commencer à recevoir des candidatures."
          action={
            <Link
              href="/dashboard/missions/new"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
            >
              Créer une mission
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          variant="employer"
          categoryName={categoryMap.get(mission.category_id)}
          applicationsCount={applicationsCountByMission.get(mission.id) ?? 0}
          actionsSlot={
            <MissionActionsMenu
              missionId={mission.id}
              status={mission.status}
              moderationStatus={mission.moderation_status}
              hasHiredApplication={hiredMissionIds.has(mission.id)}
            />
          }
        />
      ))}
    </div>
  )
}
