'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitVerificationDocument, type VerificationState } from '@/lib/actions/verification'

const initialState: VerificationState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Envoi…' : "Envoyer une pièce d'identité"}
    </button>
  )
}

export default function VerificationBanner() {
  const [state, formAction] = useActionState(submitVerificationDocument, initialState)

  if (state.success) {
    return (
      <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Document envoyé. Votre profil est en cours de vérification.
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-indigo-900">Faites vérifier votre profil</p>
        <p className="text-xs text-indigo-700">Rassurez les employeurs en confirmant votre identité.</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <input
          type="file"
          name="document"
          accept="image/*,application/pdf"
          required
          className="text-xs text-indigo-900 file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700"
        />
        <SubmitButton />
      </div>
      {state.error && (
        <p role="alert" className="w-full text-xs text-red-600">
          {state.error}
        </p>
      )}
    </form>
  )
}
