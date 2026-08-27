'use client'

import { useState, useTransition } from 'react'
import { openBillingPortal } from '@/lib/actions/subscription'

export default function ManageBillingButton() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    startTransition(async () => {
      const result = await openBillingPortal()
      if (result.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className="inline-flex flex-shrink-0 items-center justify-center rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Redirection…' : 'Gérer mon abonnement'}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
