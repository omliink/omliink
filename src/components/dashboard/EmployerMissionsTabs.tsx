'use client'

import { useState } from 'react'
import Link from 'next/link'
import MissionCard from '@/components/ui/MissionCard'
import EmptyState from '@/components/ui/EmptyState'
import MissionActionsMenu from './MissionActionsMenu'
import EmployerCollaboratorsList from './EmployerCollaboratorsList'
import type { Collaborator } from '@/lib/dashboard-data'
import type { Database } from '@/types/database.types'

type Mission = Database['public']['Tables']['missions']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Contract = Database['public']['Tables']['contracts']['Row']

interface EmployerMissionsTabsProps {
  missions: Mission[]
  categoryMap: Map<string, string>
  applicationsCountByMission: Map<string, number>
  hiredMissionIds: Set<string>
  collaborators: Collaborator[]
  profileById: Map<string, Profile>
  contractByMissionId: Map<string, Contract>
}

function MissionsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
      <path d="M4 7h16M4 12h10M4 17h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export default function EmployerMissionsTabs({
  missions,
  categoryMap,
  applicationsCountByMission,
  hiredMissionIds,
  collaborators,
  profileById,
  contractByMissionId,
}: EmployerMissionsTabsProps) {
  const [tab, setTab] = useState<'missions' | 'collaborators'>('missions')

  const tabClass = (active: boolean) =>
    `border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
      active ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`

  return (
    <div>
      <div className="flex gap-6 border-b border-gray-200">
        <button type="button" onClick={() => setTab('missions')} className={tabClass(tab === 'missions')}>
          Mes missions ({missions.length})
        </button>
        <button type="button" onClick={() => setTab('collaborators')} className={tabClass(tab === 'collaborators')}>
          Mes intervenants ({collaborators.length})
        </button>
      </div>

      {tab === 'missions' &&
        (missions.length === 0 ? (
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
        ) : (
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
                    hasHiredApplication={hiredMissionIds.has(mission.id)}
                  />
                }
              />
            ))}
          </div>
        ))}

      {tab === 'collaborators' && (
        <EmployerCollaboratorsList
          collaborators={collaborators}
          profileById={profileById}
          contractByMissionId={contractByMissionId}
        />
      )}
    </div>
  )
}
