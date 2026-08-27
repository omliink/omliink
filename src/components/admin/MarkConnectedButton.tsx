'use client'

import { useState, useTransition } from 'react'
import { markSocialConnectionConnected } from '@/lib/actions/admin'

export default function MarkConnectedButton({ connectionId }: { connectionId: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await markSocialConnectionConnected(connectionId)
            if (result.error) setError(result.error)
          })
        }
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Envoi…' : 'Marquer comme connecté'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
