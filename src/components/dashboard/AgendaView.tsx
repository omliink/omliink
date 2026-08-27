'use client'

import { useState } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import { parseVisioTimestamp } from '@/lib/visio-time'
import type { Database } from '@/types/database.types'

type VisioMeeting = Database['public']['Tables']['visio_meetings']['Row']
type Mission = Database['public']['Tables']['missions']['Row']

interface AgendaViewProps {
  visioMeetings: VisioMeeting[]
  missionById: Map<string, Mission>
  employerNameById: Map<string, string>
  activeMissions: Mission[]
}

function formatDateTime(value: string) {
  return parseVisioTimestamp(value).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  })
}

export default function AgendaView({ visioMeetings, missionById, employerNameById, activeMissions }: AgendaViewProps) {
  const [tab, setTab] = useState<'visio' | 'missions'>('visio')

  const sortedMeetings = [...visioMeetings].sort((a, b) => {
    const dateA = a.scheduled_date ?? a.proposed_date
    const dateB = b.scheduled_date ?? b.proposed_date
    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1
    return parseVisioTimestamp(dateA).getTime() - parseVisioTimestamp(dateB).getTime()
  })

  const tabClass = (active: boolean) =>
    `border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
      active ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`

  return (
    <div>
      <div className="flex gap-6 border-b border-gray-200">
        <button type="button" onClick={() => setTab('visio')} className={tabClass(tab === 'visio')}>
          Visio ({sortedMeetings.length})
        </button>
        <button type="button" onClick={() => setTab('missions')} className={tabClass(tab === 'missions')}>
          Missions ({activeMissions.length})
        </button>
      </div>

      {tab === 'visio' &&
        (sortedMeetings.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Aucune visioconférence pour le moment.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {sortedMeetings.map((meeting) => {
              const mission = missionById.get(meeting.mission_id)
              const dateValue = meeting.scheduled_date ?? meeting.proposed_date
              return (
                <li key={meeting.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">{mission?.title ?? 'Mission'}</p>
                      <StatusBadge status={meeting.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      avec {employerNameById.get(meeting.employer_id) ?? 'Employeur'}
                      {dateValue && ` · ${formatDateTime(dateValue)}`}
                      {!dateValue && ' · Créneau à définir'}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/missions/${meeting.mission_id}`}
                    className="flex-shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Voir
                  </Link>
                </li>
              )
            })}
          </ul>
        ))}

      {tab === 'missions' &&
        (activeMissions.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Aucune mission en cours pour le moment.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {activeMissions.map((mission) => (
              <li key={mission.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4">
                <div className="min-w-0">
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
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}
