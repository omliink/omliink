'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { applyToMission, type ApplyState } from '@/lib/actions/applications'

const initialState: ApplyState = {}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Envoi…' : 'Candidater'}
    </button>
  )
}

export default function ApplyForm({ missionId }: { missionId: string }) {
  const applyWithMission = applyToMission.bind(null, missionId)
  const [state, formAction] = useActionState(applyWithMission, initialState)

  if (state.success) {
    return (
      <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Votre candidature a bien été envoyée !
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="rounded-lg border border-gray-100 bg-white p-5">
      <label htmlFor="cover_letter" className="mb-1 block text-sm font-medium text-gray-700">
        Lettre de motivation (optionnelle)
      </label>
      <textarea
        id="cover_letter"
        name="cover_letter"
        rows={4}
        placeholder="Présentez-vous en quelques lignes…"
        className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {state.error && (
        <div role="alert" aria-live="polite" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div className="mt-4">
        <SubmitButton />
      </div>
    </form>
  )
}
