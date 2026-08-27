'use client'

import { useState } from 'react'
import StatusBadge from '@/components/ui/StatusBadge'
import type { Database } from '@/types/database.types'

type Application = Database['public']['Tables']['applications']['Row']
type Mission = Database['public']['Tables']['missions']['Row']

interface CandidateApplicationsTabsProps {
  pending: Application[]
  history: Application[]
  missionById: Map<string, Mission>
}

function ApplicationList({ applications, missionById }: { applications: Application[]; missionById: Map<string, Mission> }) {
  if (applications.length === 0) {
    return <p className="mt-3 text-sm text-gray-500">Rien à afficher pour le moment.</p>
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white">
      <ul className="divide-y divide-gray-100">
        {applications.map((application) => {
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
  )
}

export default function CandidateApplicationsTabs({ pending, history, missionById }: CandidateApplicationsTabsProps) {
  const [tab, setTab] = useState<'pending' | 'history'>('pending')

  const tabClass = (active: boolean) =>
    `border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
      active ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`

  return (
    <div>
      <div className="flex gap-6 border-b border-gray-200">
        <button type="button" onClick={() => setTab('pending')} className={tabClass(tab === 'pending')}>
          En attente ({pending.length})
        </button>
        <button type="button" onClick={() => setTab('history')} className={tabClass(tab === 'history')}>
          Historique ({history.length})
        </button>
      </div>
      <ApplicationList applications={tab === 'pending' ? pending : history} missionById={missionById} />
    </div>
  )
}
