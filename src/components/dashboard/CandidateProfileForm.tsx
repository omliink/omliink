'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateCandidateProfile, type ProfileFormState } from '@/lib/actions/profile'
import type { Database } from '@/types/database.types'

type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']

const initialState: ProfileFormState = {}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Enregistrement…' : 'Enregistrer'}
    </button>
  )
}

export default function CandidateProfileForm({ profile }: { profile: CandidateProfile }) {
  const [state, formAction] = useActionState(updateCandidateProfile, initialState)
  const [employmentStatus, setEmploymentStatus] = useState(
    profile.employment_status || 'particulier_employeur'
  )

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">Statut</span>
        <div role="radiogroup" aria-label="Statut" className="grid gap-3 sm:grid-cols-2">
          {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={employmentStatus === option.value}
              onClick={() => setEmploymentStatus(option.value)}
              className={`rounded-xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                employmentStatus === option.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="mt-1 block text-xs text-gray-500">{option.hint}</span>
            </button>
          ))}
        </div>
        <input type="hidden" name="employment_status" value={employmentStatus} />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1 block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile.bio ?? ''}
          placeholder="Présentez-vous en quelques lignes…"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="skills" className="mb-1 block text-sm font-medium text-gray-700">
          Compétences
        </label>
        <input
          id="skills"
          name="skills"
          type="text"
          defaultValue={profile.skills?.join(', ') ?? ''}
          placeholder="Ménage, garde d'enfants, jardinage…"
          aria-describedby="skills-hint"
          className={inputClass}
        />
        <p id="skills-hint" className="mt-1 text-xs text-gray-500">
          Séparez les compétences par des virgules.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="years_experience" className="mb-1 block text-sm font-medium text-gray-700">
            Années d&apos;expérience
          </label>
          <input
            id="years_experience"
            name="years_experience"
            type="number"
            min="0"
            step="1"
            defaultValue={profile.years_experience ?? ''}
            placeholder="3"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="hourly_rate" className="mb-1 block text-sm font-medium text-gray-700">
            Tarif horaire (€)
          </label>
          <input
            id="hourly_rate"
            name="hourly_rate"
            type="number"
            min="0"
            step="0.5"
            defaultValue={profile.hourly_rate ?? ''}
            placeholder="15"
            className={inputClass}
          />
        </div>
      </div>

      {state.error && (
        <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </div>
      )}
      {state.success && (
        <div role="status" aria-live="polite" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Profil mis à jour avec succès.
        </div>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
