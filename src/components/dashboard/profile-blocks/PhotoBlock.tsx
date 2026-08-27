'use client'

import { useRef, useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import type { ProfileFormState } from '@/lib/actions/profile'

interface PhotoBlockProps {
  title: string
  photoUrl: string | null
  benefits: string[]
  action: (prevState: ProfileFormState, formData: FormData) => Promise<ProfileFormState>
}

const initialState: ProfileFormState = {}

function UploadButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="mt-4 w-fit rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Envoi…' : 'Télécharger une photo'}
    </button>
  )
}

export default function PhotoBlock({ title, photoUrl, benefits, action }: PhotoBlockProps) {
  const [state, formAction] = useActionState(action, initialState)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  const displayUrl = previewUrl ?? photoUrl

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>

      <form action={formAction} className="mt-4 flex flex-col gap-6 sm:flex-row">
        <div className="flex flex-shrink-0 flex-col items-center">
          <div className="relative">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Choisir une photo"
            >
              {displayUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-gray-400" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
                  <path d="M4.5 19c1.5-3.5 4.5-5 7.5-5s6 1.5 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label="Changer la photo"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            name="photo"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <UploadButton disabled={!selectedFile} />
        </div>

        <div className="flex-1">
          <ul className="flex flex-col gap-2 text-sm text-gray-600">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
          {selectedFile && <p className="mt-3 text-sm text-emerald-600">Photo sélectionnée : {selectedFile.name}</p>}
          {state.error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {state.error}
            </p>
          )}
          {state.success && (
            <p role="status" className="mt-3 text-sm text-emerald-600">
              Photo mise à jour avec succès.
            </p>
          )}
        </div>
      </form>
    </section>
  )
}
