'use client'

import { useActionState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { proposeVisioSlot, type VisioActionState } from '@/lib/actions/visio'

const initialState: VisioActionState = {}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Envoi…' : label}
    </button>
  )
}

interface ProposeSlotFormProps {
  meetingId: string
  missionId: string
  label?: string
}

export default function ProposeSlotForm({ meetingId, missionId, label = 'Proposer ce créneau' }: ProposeSlotFormProps) {
  const action = proposeVisioSlot.bind(null, meetingId, missionId)
  const [state, formAction] = useActionState(action, initialState)
  const isoDateRef = useRef<HTMLInputElement>(null)

  return (
    <form action={formAction} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
      {/*
        The visible input is a browser-local datetime-local value with no
        timezone info. Parsing that raw string server-side is ambiguous (the
        server process's own timezone, not the visitor's, decides the
        result) — we saw meetings land two hours off from what was picked.
        Converting to a real UTC ISO string here, in the browser where the
        local timezone is actually known, removes the ambiguity before it
        ever reaches the server.
      */}
      <input type="hidden" name="proposed_date" ref={isoDateRef} />
      <div className="flex-1">
        <label htmlFor={`proposed_date_${meetingId}`} className="mb-1 block text-sm font-medium text-gray-700">
          Date et heure
        </label>
        <input
          id={`proposed_date_${meetingId}`}
          type="datetime-local"
          required
          onChange={(e) => {
            if (isoDateRef.current) {
              isoDateRef.current.value = e.target.value ? new Date(e.target.value).toISOString() : ''
            }
          }}
          aria-describedby={state.error ? `proposed-date-error-${meetingId}` : undefined}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <SubmitButton label={label} />
      {state.error && (
        <p
          id={`proposed-date-error-${meetingId}`}
          role="alert"
          aria-live="polite"
          className="text-xs text-red-600 sm:basis-full"
        >
          {state.error}
        </p>
      )}
    </form>
  )
}
