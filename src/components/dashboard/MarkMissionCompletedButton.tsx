'use client'

import { useState, useTransition } from 'react'
import { markMissionCompleted } from '@/lib/actions/missions'

export default function MarkMissionCompletedButton({ missionId }: { missionId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            try {
              await markMissionCompleted(missionId)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
            }
          })
        }
        className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Confirmation…' : 'Marquer comme terminée'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
