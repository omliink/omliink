import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import ProposeSlotForm from './ProposeSlotForm'
import AcceptSlotButton from './AcceptSlotButton'
import NoShowButtons from './NoShowButtons'
import { parseVisioTimestamp } from '@/lib/visio-time'
import type { Database } from '@/types/database.types'

type VisioMeeting = Database['public']['Tables']['visio_meetings']['Row']

const JOIN_WINDOW_MINUTES_BEFORE = 10
const NO_SHOW_WINDOW_MINUTES_AFTER = 15

function formatDateTime(value: string) {
  return parseVisioTimestamp(value).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  })
}

interface VisioSectionProps {
  meeting: VisioMeeting
  missionId: string
  isEmployerViewer: boolean
  now: number
}

export default function VisioSection({ meeting, missionId, isEmployerViewer, now }: VisioSectionProps) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Visioconférence</h2>
        <StatusBadge status={meeting.status} />
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Une visioconférence entre l&apos;employeur et le candidat est obligatoire avant le début de la mission.
      </p>

      <div className="mt-4 rounded-xl border border-gray-100 bg-white p-5">
        {meeting.status === 'completed' && (
          <p className="text-sm text-gray-700">
            Visio terminée{meeting.duration_minutes ? ` (${meeting.duration_minutes} min)` : ''}. La mission est confirmée.
          </p>
        )}

        {(meeting.status === 'no_show_employer' || meeting.status === 'no_show_candidate') && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-700">
              Une absence a été signalée pour ce créneau. Vous pouvez proposer un nouveau créneau.
            </p>
            <ProposeSlotForm meetingId={meeting.id} missionId={missionId} label="Proposer un nouveau créneau" />
          </div>
        )}

        {meeting.status === 'proposed' && !meeting.proposed_date && isEmployerViewer && (
          <div>
            <p className="mb-3 text-sm text-gray-700">Proposez une date et une heure pour la visioconférence.</p>
            <ProposeSlotForm meetingId={meeting.id} missionId={missionId} />
          </div>
        )}
        {meeting.status === 'proposed' && !meeting.proposed_date && !isEmployerViewer && (
          <p className="text-sm text-gray-500">En attente d&apos;une proposition de créneau par l&apos;employeur.</p>
        )}

        {meeting.status === 'proposed' && meeting.proposed_date && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-700">
              Créneau proposé : <span className="font-medium text-gray-900">{formatDateTime(meeting.proposed_date)}</span>
              {meeting.reschedule_count > 0 && (
                <span className="ml-2 text-xs text-gray-400">({meeting.reschedule_count}/3 report(s))</span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <AcceptSlotButton meetingId={meeting.id} missionId={missionId} />
            </div>
            {meeting.reschedule_count < 3 ? (
              <details>
                <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Proposer un autre créneau
                </summary>
                <div className="mt-3">
                  <ProposeSlotForm meetingId={meeting.id} missionId={missionId} label="Proposer ce nouveau créneau" />
                </div>
              </details>
            ) : (
              <p className="text-xs text-gray-400">Nombre maximum de reports atteint.</p>
            )}
          </div>
        )}

        {(meeting.status === 'accepted' || meeting.status === 'in_progress') && meeting.scheduled_date && (
          <VisioJoinStatus meeting={meeting} missionId={missionId} now={now} />
        )}
      </div>
    </section>
  )
}

function VisioJoinStatus({ meeting, missionId, now }: { meeting: VisioMeeting; missionId: string; now: number }) {
  const scheduled = parseVisioTimestamp(meeting.scheduled_date as string).getTime()
  const minutesUntil = (scheduled - now) / 60000
  const canJoin = meeting.status === 'in_progress' || minutesUntil <= JOIN_WINDOW_MINUTES_BEFORE
  const isLate = meeting.status !== 'in_progress' && minutesUntil < -NO_SHOW_WINDOW_MINUTES_AFTER

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-700">
        Créneau confirmé :{' '}
        <span className="font-medium text-gray-900">{formatDateTime(meeting.scheduled_date as string)}</span>
      </p>

      {isLate ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-red-600">Le créneau est dépassé de plus de 15 minutes.</p>
          <NoShowButtons meetingId={meeting.id} missionId={missionId} />
        </div>
      ) : canJoin ? (
        <Link
          href={`/dashboard/visio/${meeting.id}`}
          className="inline-flex w-fit items-center justify-center rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {meeting.status === 'in_progress' ? 'Rejoindre la visio (en cours)' : 'Rejoindre la visio'}
        </Link>
      ) : (
        <p className="text-sm text-gray-500">
          Vous pourrez rejoindre la salle à partir de{' '}
          {new Date(scheduled - JOIN_WINDOW_MINUTES_BEFORE * 60000).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Paris',
          })}
          .
        </p>
      )}
    </div>
  )
}
