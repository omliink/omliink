'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import ProfileBlockCard from './ProfileBlockCard'
import { updateCandidateExperience, type ProfileFormState } from '@/lib/actions/profile'
import { EXPERIENCE_LEVEL_OPTIONS } from '@/lib/experience-level'

const LEGAL_MENTIONS: Record<string, string> = {
  particulier_employeur: 'Tarif net, congés payés inclus (10%).',
  auto_entrepreneur: 'Non applicable aux auto-entrepreneurs.',
}

const initialState: ProfileFormState = {}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

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

interface CandidateExperienceBlockProps {
  experienceLevel: string | null
  hourlyRate: number | null
  employmentStatus: string
}

export default function CandidateExperienceBlock({
  experienceLevel,
  hourlyRate,
  employmentStatus,
}: CandidateExperienceBlockProps) {
  const [editing, setEditing] = useState(false)
  const [state, formAction] = useActionState(updateCandidateExperience, initialState)
  const [level, setLevel] = useState(experienceLevel ?? '')
  const [rate, setRate] = useState(hourlyRate ?? 15)

  const [prevState, setPrevState] = useState(state)
  if (state !== prevState) {
    setPrevState(state)
    if (state.success) setEditing(false)
  }

  const currentLevelLabel = EXPERIENCE_LEVEL_OPTIONS.find((o) => o.value === experienceLevel)?.label

  return (
    <ProfileBlockCard
      title="Expérience et tarif"
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={() => setEditing(false)}
      readView={
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-500">Niveau d’expérience</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{currentLevelLabel ?? 'Non renseigné'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Tarif horaire</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{hourlyRate != null ? `${hourlyRate.toFixed(2)} €` : 'Non renseigné'}</dd>
          </div>
          <p className="sm:col-span-2 text-xs font-medium text-indigo-600">{LEGAL_MENTIONS[employmentStatus]}</p>
          {state.success && (
            <p className="sm:col-span-2 text-sm text-emerald-600">Mis à jour avec succès.</p>
          )}
        </dl>
      }
      editView={
        <form action={formAction} className="flex flex-col gap-5">
          <div>
            <label htmlFor="experience_level" className="mb-1 block text-sm font-medium text-gray-700">
              Niveau d’expérience
            </label>
            <select
              id="experience_level"
              name="experience_level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={inputClass}
            >
              <option value="">Choisir…</option>
              {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">Tarif horaire</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRate(Math.max(0, Math.round((rate - 0.5) * 10) / 10))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                −
              </button>
              <span className="w-20 text-center text-base font-semibold text-gray-900">{rate.toFixed(2)} €</span>
              <button
                type="button"
                onClick={() => setRate(Math.round((rate + 0.5) * 10) / 10)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                +
              </button>
            </div>
            <input type="hidden" name="hourly_rate" value={rate} />
          </div>

          <p className="text-xs font-medium text-indigo-600">{LEGAL_MENTIONS[employmentStatus]}</p>

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
