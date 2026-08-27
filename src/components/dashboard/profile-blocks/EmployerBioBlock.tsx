'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import ProfileBlockCard from './ProfileBlockCard'
import { updateEmployerBio, type ProfileFormState } from '@/lib/actions/profile'

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

export default function EmployerBioBlock({ bio }: { bio: string | null }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction] = useActionState(updateEmployerBio, initialState)

  const [prevState, setPrevState] = useState(state)
  if (state !== prevState) {
    setPrevState(state)
    if (state.success) setEditing(false)
  }

  return (
    <ProfileBlockCard
      title="Bio / présentation"
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={() => setEditing(false)}
      readView={
        <div>
          <p className="whitespace-pre-wrap text-sm text-gray-600">{bio ?? 'Non renseignée'}</p>
          {state.success && <p className="mt-2 text-sm text-emerald-600">Mis à jour avec succès.</p>}
        </div>
      }
      editView={
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="bio" className="mb-1 block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={bio ?? ''}
              placeholder="Présentez-vous en quelques lignes…"
              className={inputClass}
            />
          </div>
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
