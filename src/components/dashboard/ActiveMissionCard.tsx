import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import { canJoinVisio, parseVisioTimestamp } from '@/lib/visio-time'
import type { Database } from '@/types/database.types'

type Mission = Database['public']['Tables']['missions']['Row']
type VisioMeeting = Database['public']['Tables']['visio_meetings']['Row']

interface ActiveMissionCardProps {
  mission: Mission
  meeting?: VisioMeeting | null
  now: number
}

function formatDateTime(value: string) {
  return parseVisioTimestamp(value).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  })
}

const PENDING_OR_ACTIVE_VISIO_STATUSES = new Set(['proposed', 'accepted', 'in_progress'])

export default function ActiveMissionCard({ mission, meeting, now }: ActiveMissionCardProps) {
  const showJoinButton = Boolean(meeting) && canJoinVisio(meeting!, now)
  const showVisioLine = Boolean(meeting) && PENDING_OR_ACTIVE_VISIO_STATUSES.has(meeting!.status)
  const showScheduledInfo =
    meeting && (meeting.status === 'accepted' || meeting.status === 'in_progress') && meeting.scheduled_date

  return (
    <div className="flex flex-col justify-between rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900">{mission.title}</h3>
          <StatusBadge status={mission.status} />
        </div>
        {showVisioLine && (
          <p className="mt-2 text-xs text-gray-500">
            Visio :{' '}
            {showScheduledInfo
              ? `${meeting!.status === 'in_progress' ? 'en cours' : 'programmée'} — ${formatDateTime(meeting!.scheduled_date as string)}`
              : 'en attente de créneau'}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Link
          href={`/dashboard/missions/${mission.id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Voir la mission
        </Link>
        {showJoinButton && (
          <Link
            href={`/dashboard/visio/${meeting!.id}`}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Rejoindre la visio
          </Link>
        )}
      </div>
    </div>
  )
}
