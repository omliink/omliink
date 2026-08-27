'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import ProfileBlockCard from './ProfileBlockCard'
import { updatePassword, type ProfileFormState } from '@/lib/actions/profile'

const initialState: ProfileFormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Enregistrement…' : 'Changer le mot de passe'}
    </button>
  )
}

export default function PasswordBlock() {
  const [editing, setEditing] = useState(false)
  const [state, formAction] = useActionState(updatePassword, initialState)

  const [prevState, setPrevState] = useState(state)
  if (state !== prevState) {
    setPrevState(state)
    if (state.success) setEditing(false)
  }

  const inputClass =
    'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <ProfileBlockCard
      title="Mot de passe"
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={() => setEditing(false)}
      readView={
        <div>
          <p className="text-sm text-gray-600">••••••••••••</p>
          {state.success && <p className="mt-2 text-sm text-emerald-600">Mot de passe mis à jour avec succès.</p>}
        </div>
      }
      editView={
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <input id="password" name="password" type="password" autoComplete="new-password" className={inputClass} />
            <p className="mt-1 text-xs text-gray-500">12 caractères minimum, 1 majuscule, 1 chiffre.</p>
          </div>
          <div>
            <label htmlFor="confirm_password" className="mb-1 block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
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
