'use client'

import { useState, useTransition } from 'react'
import { createConnectOnboardingLink, openExpressDashboard } from '@/lib/actions/stripe-connect'

interface StripeConnectButtonProps {
  variant: 'onboard' | 'dashboard'
}

const LABELS = {
  onboard: { idle: 'Configurer mon compte de paiement', pending: 'Redirection…' },
  dashboard: { idle: 'Accéder à mon dashboard Stripe', pending: 'Redirection…' },
}

export default function StripeConnectButton({ variant }: StripeConnectButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const action = variant === 'onboard' ? createConnectOnboardingLink : openExpressDashboard
  const labels = LABELS[variant]

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError('')
            const result = await action()
            if (result?.error) setError(result.error)
          })
        }
        className={
          variant === 'onboard'
            ? 'rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
            : 'rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60'
        }
      >
        {isPending ? labels.pending : labels.idle}
      </button>
      {error && (
        <p role="alert" aria-live="polite" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
