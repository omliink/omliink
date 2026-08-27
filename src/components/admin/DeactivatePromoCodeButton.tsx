'use client'

import { useState, useTransition } from 'react'
import { deactivatePromoCode } from '@/lib/actions/admin'

export default function DeactivatePromoCodeButton({ promoCodeId }: { promoCodeId: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await deactivatePromoCode(promoCodeId)
            if (result.error) setError(result.error)
          })
        }
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Désactivation…' : 'Désactiver'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
