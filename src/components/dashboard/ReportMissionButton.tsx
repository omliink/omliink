'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { reportMission, type ReportMissionState } from '@/lib/actions/mission-reports'
import { MISSION_REPORT_REASON_OPTIONS } from '@/lib/mission-report-reasons'

const initialState: ReportMissionState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Envoi…' : 'Envoyer le signalement'}
    </button>
  )
}

export default function ReportMissionButton({ missionId }: { missionId: string }) {
  const [open, setOpen] = useState(false)
  const action = reportMission.bind(null, missionId)
  const [state, formAction] = useActionState(action, initialState)

  if (state.success) {
    return <p className="text-sm text-emerald-600">Signalement envoyé. Merci, notre équipe va l’examiner.</p>
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-gray-400 hover:text-red-600"
      >
        Signaler cette mission
      </button>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div>
        <label htmlFor="report_reason" className="mb-1 block text-sm font-medium text-gray-700">
          Motif
        </label>
        <select
          id="report_reason"
          name="reason"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {MISSION_REPORT_REASON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="report_details" className="mb-1 block text-sm font-medium text-gray-700">
          Détails (facultatif)
        </label>
        <textarea
          id="report_details"
          name="details"
          rows={2}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <SubmitButton />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
