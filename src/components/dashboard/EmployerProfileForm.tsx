'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateEmployerProfile, type ProfileFormState } from '@/lib/actions/profile'
import type { Database } from '@/types/database.types'

type EmployerProfile = Database['public']['Tables']['employer_profiles']['Row']

const initialState: ProfileFormState = {}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

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

export default function EmployerProfileForm({ profile }: { profile: EmployerProfile }) {
  const [state, formAction] = useActionState(updateEmployerProfile, initialState)

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="company_name" className="mb-1 block text-sm font-medium text-gray-700">
          Nom / société
        </label>
        <input
          id="company_name"
          name="company_name"
          type="text"
          defaultValue={profile.company_name ?? ''}
          placeholder="Jeanne Dupont"
          className={inputClass}
        />
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
