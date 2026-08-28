import type { Database } from '@/types/database.types'

type Review = Database['public']['Tables']['reviews']['Row']

interface ReviewsSummaryProps {
  rating: number
  reviews: Review[]
  reviewerNameById: Map<string, string>
}

function Stars({ value }: { value: number }) {
  return (
    <span className="text-amber-500" aria-label={`${value} sur 5 étoiles`}>
      {'★'.repeat(Math.round(value))}
      <span className="text-gray-300">{'★'.repeat(5 - Math.round(value))}</span>
    </span>
  )
}

export default function ReviewsSummary({ rating, reviews, reviewerNameById }: ReviewsSummaryProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Stars value={rating} />
        <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
        <span className="text-sm text-gray-500">({reviews.length} avis)</span>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">Aucun avis pour le moment.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-lg border border-gray-100 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900">{reviewerNameById.get(review.from_user_id) ?? 'Utilisateur'}</span>
                <Stars value={review.rating} />
              </div>
              {review.comment && <p className="mt-1 text-sm text-gray-600">{review.comment}</p>}
              <p className="mt-1 text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
