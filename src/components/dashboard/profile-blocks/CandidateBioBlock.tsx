'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import ProfileBlockCard from './ProfileBlockCard'
import { updateCandidateBio, type ProfileFormState } from '@/lib/actions/profile'

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

interface CandidateBioBlockProps {
  bioTitle: string | null
  bioText: string | null
}

export default function CandidateBioBlock({ bioTitle, bioText }: CandidateBioBlockProps) {
  const [editing, setEditing] = useState(false)
  const [state, formAction] = useActionState(updateCandidateBio, initialState)
  const [title, setTitle] = useState(bioTitle ?? '')
  const [text, setText] = useState(bioText ?? '')

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
          <p className="text-sm font-semibold text-gray-900">{bioTitle ?? 'Non renseigné'}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{bioText ?? 'Non renseignée'}</p>
          {state.success && <p className="mt-2 text-sm text-emerald-600">Mis à jour avec succès.</p>}
        </div>
      }
      editView={
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="bio_title" className="mb-1 block text-sm font-medium text-gray-700">
              Titre ({title.length}/60)
            </label>
            <input
              id="bio_title"
              name="bio_title"
              maxLength={60}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="bio_text" className="mb-1 block text-sm font-medium text-gray-700">
              Présentation ({text.length}/2000)
            </label>
            <textarea
              id="bio_text"
              name="bio_text"
              rows={5}
              maxLength={2000}
              value={text}
              onChange={(e) => setText(e.target.value)}
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
