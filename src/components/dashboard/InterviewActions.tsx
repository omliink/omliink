'use client'

import { useTransition } from 'react'
import { chooseCandidate } from '@/lib/actions/hiring'
import { rejectApplication } from '@/lib/actions/applications'

interface InterviewActionsProps {
  applicationId: string
  missionId: string
}

export default function InterviewActions({ applicationId, missionId }: InterviewActionsProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => chooseCandidate(applicationId, missionId))}
        className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Choisir ce candidat
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => rejectApplication(applicationId, missionId))}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Écarter ce candidat
      </button>
    </div>
  )
}
