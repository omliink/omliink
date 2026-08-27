'use client'

import { useActionState, useState, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import {
  approveVerification,
  getVerificationDocumentSignedUrl,
  rejectVerification,
  type AdminActionState,
} from '@/lib/actions/admin'

const initialState: AdminActionState = {}

function RejectSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Envoi…' : 'Confirmer le refus'}
    </button>
  )
}

interface VerificationRowProps {
  candidateId: string
  name: string
  submittedAt: string
}

export default function VerificationRow({ candidateId, name, submittedAt }: VerificationRowProps) {
  const [docState, setDocState] = useState<{ url?: string; error?: string }>({})
  const [docPending, startDocTransition] = useTransition()
  const [approvePending, startApproveTransition] = useTransition()
  const [approveError, setApproveError] = useState<string | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [rejectState, rejectAction] = useActionState(rejectVerification, initialState)

  const handleViewDocument = () => {
    startDocTransition(async () => {
      const result = await getVerificationDocumentSignedUrl(candidateId)
      setDocState(result)
    })
  }

  const handleApprove = () => {
    startApproveTransition(async () => {
      const result = await approveVerification(candidateId)
      if (result.error) setApproveError(result.error)
    })
  }

  return (
    <li className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">
            Soumis le {new Date(submittedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleViewDocument}
            disabled={docPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {docPending ? 'Génération…' : 'Voir le document'}
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={approvePending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {approvePending ? 'Envoi…' : 'Approuver'}
          </button>
          <button
            type="button"
            onClick={() => setShowReject((current) => !current)}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Rejeter
          </button>
        </div>
      </div>

      {docState.url && (
        <a
          href={docState.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-indigo-600 hover:underline"
        >
          Ouvrir le document (lien valable 5 minutes) →
        </a>
      )}
      {docState.error && <p className="text-xs text-red-600">{docState.error}</p>}
      {approveError && <p className="text-xs text-red-600">{approveError}</p>}

      {showReject && (
        <form action={rejectAction} className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50 p-3">
          <input type="hidden" name="candidate_id" value={candidateId} />
          <label htmlFor={`reason-${candidateId}`} className="text-xs font-medium text-gray-700">
            Raison du refus (facultatif — envoyée au candidat)
          </label>
          <textarea
            id={`reason-${candidateId}`}
            name="reason"
            rows={2}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {rejectState.error && <p className="text-xs text-red-600">{rejectState.error}</p>}
          <div>
            <RejectSubmitButton />
          </div>
        </form>
      )}
    </li>
  )
}
