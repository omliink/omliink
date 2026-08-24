'use client'

import { useTransition } from 'react'
import { updateApplicationStatus } from '@/lib/actions/applications'

interface ApplicationActionsProps {
  applicationId: string
  missionId: string
  status: string
}

export default function ApplicationActions({ applicationId, missionId, status }: ApplicationActionsProps) {
  const [isPending, startTransition] = useTransition()

  if (status !== 'pending') return null

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => updateApplicationStatus(applicationId, missionId, 'accepted'))}
        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Accepter
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => updateApplicationStatus(applicationId, missionId, 'rejected'))}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Refuser
      </button>
    </div>
  )
}
