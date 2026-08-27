'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { startPremiumCheckout, type SubscriptionActionState } from '@/lib/actions/subscription'

const initialState: SubscriptionActionState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-[#ff5a3d] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ff5a3d]/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Redirection…' : 'Devenir premium'}
    </button>
  )
}

export default function PremiumCheckoutForm() {
  const [state, formAction] = useActionState(startPremiumCheckout, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="promo_code" className="mb-1 block text-sm font-medium text-gray-700">
          Code promo (facultatif)
        </label>
        <input
          id="promo_code"
          name="promo_code"
          placeholder="RENTREE2026"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  )
}
