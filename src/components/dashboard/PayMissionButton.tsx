'use client'

import { useState, useTransition } from 'react'
import { createMissionPaymentCheckout } from '@/lib/actions/stripe-payment'

interface PayMissionButtonProps {
  contractId: string
  missionId: string
  amount: number
}

function formatAmount(value: number) {
  return `${value.toLocaleString('fr-FR')} €`
}

export default function PayMissionButton({ contractId, missionId, amount }: PayMissionButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError('')
            const result = await createMissionPaymentCheckout(contractId, missionId)
            if (result?.error) setError(result.error)
          })
        }
        className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Redirection…' : `Payer la mission (${formatAmount(amount)})`}
      </button>
      {error && (
        <p role="alert" aria-live="polite" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
