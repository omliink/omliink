'use client'

import { useActionState } from 'react'
import { submitReview, type ReviewFormState } from '@/lib/actions/reviews'

interface LeaveReviewSectionProps {
  missionId: string
  toUserId: string
  toName: string
  alreadyReviewed: boolean
}

const initialState: ReviewFormState = {}

export default function LeaveReviewSection({ missionId, toUserId, toName, alreadyReviewed }: LeaveReviewSectionProps) {
  const [state, formAction, isPending] = useActionState(submitReview.bind(null, missionId, toUserId), initialState)

  if (alreadyReviewed || state.success) {
    return <p className="mt-2 text-sm text-emerald-700">Merci, votre avis sur {toName} a été enregistré.</p>
  }

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Votre note pour {toName}</label>
        <div className="mt-1 flex gap-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="flex items-center gap-1 text-sm text-gray-600">
              <input type="radio" name="rating" value={value} required className="accent-amber-500" />
              {value}★
            </label>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor={`comment-${missionId}-${toUserId}`} className="text-sm font-medium text-gray-700">
          Commentaire (optionnel)
        </label>
        <textarea
          id={`comment-${missionId}-${toUserId}`}
          name="comment"
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Envoi…' : 'Laisser un avis'}
      </button>
    </form>
  )
}
