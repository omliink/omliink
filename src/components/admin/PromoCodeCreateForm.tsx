'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createPromoCode, type AdminActionState } from '@/lib/actions/admin'

const initialState: AdminActionState = {}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Création…' : 'Créer le code'}
    </button>
  )
}

export default function PromoCodeCreateForm() {
  const [state, formAction] = useActionState(createPromoCode, initialState)
  const [discountType, setDiscountType] = useState('percent')

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="code" className="mb-1 block text-sm font-medium text-gray-700">
            Code
          </label>
          <input id="code" name="code" placeholder="RENTREE2026" className={inputClass} />
        </div>
        <div>
          <label htmlFor="discount_type" className="mb-1 block text-sm font-medium text-gray-700">
            Type de réduction
          </label>
          <select
            id="discount_type"
            name="discount_type"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
            className={inputClass}
          >
            <option value="percent">Pourcentage</option>
            <option value="fixed">Montant fixe (€)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="discount_value" className="mb-1 block text-sm font-medium text-gray-700">
            Valeur {discountType === 'percent' ? '(%)' : '(€)'}
          </label>
          <input
            id="discount_value"
            name="discount_value"
            type="number"
            step="0.01"
            min="0"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="valid_from" className="mb-1 block text-sm font-medium text-gray-700">
            Valide à partir du
          </label>
          <input id="valid_from" name="valid_from" type="date" className={inputClass} />
        </div>
        <div>
          <label htmlFor="valid_until" className="mb-1 block text-sm font-medium text-gray-700">
            Valide jusqu’au
          </label>
          <input id="valid_until" name="valid_until" type="date" className={inputClass} />
        </div>
      </div>

      <div className="sm:w-1/3">
        <label htmlFor="max_uses" className="mb-1 block text-sm font-medium text-gray-700">
          Utilisations max (vide = illimité)
        </label>
        <input id="max_uses" name="max_uses" type="number" min="1" className={inputClass} />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm text-emerald-600">Code promo créé.</p>}

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
