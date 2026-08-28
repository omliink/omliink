'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { supabase } from '@/lib/supabase'
import { submitVerificationDocument, type VerificationState } from '@/lib/actions/verification'

const initialState: VerificationState = {}

export default function VerificationBanner({ userId }: { userId: string }) {
  const [state, formAction, isDispatching] = useActionState(submitVerificationDocument, initialState)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  if (state.success) {
    return (
      <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Document envoyé. Votre profil est en cours de vérification.
      </div>
    )
  }

  // Uploaded client -> Storage directly here, rather than submitted as a
  // native form (which would put the raw File in the Server Action's
  // request body and hit Next.js's default 1MB limit — ID scans/PDFs
  // routinely exceed that). Only the storage path is dispatched to
  // submitVerificationDocument below, still via useActionState's own
  // dispatcher so state/error handling is unchanged from before.
  const handleUpload = async () => {
    if (!selectedFile) return
    setUploadError(null)
    setIsUploading(true)
    try {
      const documentPath = `${userId}/${Date.now()}-${selectedFile.name}`
      const { error } = await supabase.storage.from('verification-documents').upload(documentPath, selectedFile)
      if (error) {
        setUploadError(`Échec de l'upload : ${error.message}`)
        return
      }
      const fd = new FormData()
      fd.set('document_path', documentPath)
      formAction(fd)
    } finally {
      setIsUploading(false)
    }
  }

  const pending = isUploading || isDispatching

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-indigo-900">Faites vérifier votre profil</p>
        <p className="text-xs text-indigo-700">Rassurez les employeurs en confirmant votre identité.</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => {
            setSelectedFile(e.target.files?.[0] ?? null)
            setUploadError(null)
          }}
          className="text-xs text-indigo-900 file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700"
        />
        <button
          type="button"
          disabled={!selectedFile || pending}
          onClick={handleUpload}
          className="flex-shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Envoi…' : "Envoyer une pièce d'identité"}
        </button>
      </div>
      {(uploadError || state.error) && (
        <p role="alert" className="w-full text-xs text-red-600">
          {uploadError ?? state.error}
        </p>
      )}
    </div>
  )
}
