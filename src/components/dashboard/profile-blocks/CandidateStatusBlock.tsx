'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import ProfileBlockCard from './ProfileBlockCard'
import { updateCandidateStatus, type ProfileFormState } from '@/lib/actions/profile'

const EMPLOYMENT_STATUS_OPTIONS = [
  {
    value: 'particulier_employeur',
    label: 'Particulier employeur (emploi déclaré)',
    hint: "L'employeur (la famille) reste votre employeur légal. Salaire et cotisations gérés via le CESU officiel, en dehors d'OMLIINK. OMLIINK vous fournit le contrat de travail.",
  },
  {
    value: 'auto_entrepreneur',
    label: 'Auto-entrepreneur',
    hint: "Vous facturez vos prestations comme travailleur indépendant, l'employeur devient votre client. Paiement sécurisé via Stripe Connect, commission OMLIINK de 10%.",
  },
] as const

const initialState: ProfileFormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Enregistrement…' : 'Enregistrer'}
    </button>
  )
}

export default function CandidateStatusBlock({ employmentStatus }: { employmentStatus: string }) {
  const [editing, setEditing] = useState(false)
  const [status, setStatus] = useState(employmentStatus || 'particulier_employeur')
  const [state, formAction] = useActionState(updateCandidateStatus, initialState)

  const [prevState, setPrevState] = useState(state)
  if (state !== prevState) {
    setPrevState(state)
    if (state.success) setEditing(false)
  }

  const current = EMPLOYMENT_STATUS_OPTIONS.find((o) => o.value === employmentStatus)

  return (
    <ProfileBlockCard
      title="Statut"
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={() => setEditing(false)}
      readView={
        <div>
          <p className="text-sm font-medium text-gray-900">{current?.label ?? 'Non renseigné'}</p>
          {current && <p className="mt-1 text-xs text-gray-500">{current.hint}</p>}
          {state.success && <p className="mt-2 text-sm text-emerald-600">Statut mis à jour avec succès.</p>}
        </div>
      }
      editView={
        <form action={formAction} className="flex flex-col gap-4">
          <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
            {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={status === option.value}
                onClick={() => setStatus(option.value)}
                className={`rounded-xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  status === option.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-1 block text-xs text-gray-500">{option.hint}</span>
              </button>
            ))}
          </div>
          <input type="hidden" name="employment_status" value={status} />
          {state.error && (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}
          <div>
            <SubmitButton />
          </div>
        </form>
      }
    />
  )
}
