'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import ProfileBlockCard from './ProfileBlockCard'
import { updateEmployerInfo, type ProfileFormState } from '@/lib/actions/profile'

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

interface EmployerInfoBlockProps {
  companyName: string | null
  nationality: string | null
  phone: string | null
}

export default function EmployerInfoBlock({ companyName, nationality, phone }: EmployerInfoBlockProps) {
  const [editing, setEditing] = useState(false)
  const [state, formAction] = useActionState(updateEmployerInfo, initialState)

  const [prevState, setPrevState] = useState(state)
  if (state !== prevState) {
    setPrevState(state)
    if (state.success) setEditing(false)
  }

  return (
    <ProfileBlockCard
      title="Mes informations"
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={() => setEditing(false)}
      readView={
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-500">Nom / société</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{companyName ?? 'Non renseigné'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Nationalité</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{nationality ?? 'Non renseignée'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Téléphone</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{phone ?? 'Non renseigné'}</dd>
          </div>
          {state.success && <p className="sm:col-span-2 text-sm text-emerald-600">Mis à jour avec succès.</p>}
        </dl>
      }
      editView={
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="company_name" className="mb-1 block text-sm font-medium text-gray-700">
              Nom / société
            </label>
            <input id="company_name" name="company_name" defaultValue={companyName ?? ''} className={inputClass} />
          </div>
          <div>
            <label htmlFor="nationality" className="mb-1 block text-sm font-medium text-gray-700">
              Nationalité
            </label>
            <input id="nationality" name="nationality" defaultValue={nationality ?? ''} className={inputClass} />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input id="phone" name="phone" defaultValue={phone ?? ''} className={inputClass} />
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
