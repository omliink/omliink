import Link from 'next/link'
import StatusBadge from './StatusBadge'
import type { Database } from '@/types/database.types'

type Mission = Database['public']['Tables']['missions']['Row']

interface MissionCardProps {
  mission: Mission
  variant: 'employer' | 'candidate'
  categoryName?: string | null
  applicationsCount?: number
  distanceKm?: number | null
}

function formatDistance(value: number) {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
}

function formatDate(value: string | null) {
  if (!value) return 'Date à définir'
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatBudget(value: number | null) {
  if (value === null) return 'Budget à définir'
  return `${value.toLocaleString('fr-FR')} €`
}

export default function MissionCard({ mission, variant, categoryName, applicationsCount, distanceKm }: MissionCardProps) {
  return (
    <Link
      href={`/dashboard/missions/${mission.id}`}
      className="block rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
            {categoryName ?? 'Catégorie'}
          </p>
          <h3 className="mt-1 text-base font-semibold text-gray-900">{mission.title}</h3>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
        {variant === 'candidate' && mission.location_address && <span>{mission.location_address}</span>}
        <span>{formatDate(mission.mission_date)}</span>
        <span>{formatBudget(mission.budget)}</span>
        {variant === 'candidate' && distanceKm != null && (
          <span className="font-medium text-indigo-600">{formatDistance(distanceKm)}</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {variant === 'employer' ? (
          <span className="text-sm font-medium text-gray-700">
            {applicationsCount ?? 0} candidature{(applicationsCount ?? 0) > 1 ? 's' : ''}
          </span>
        ) : (
          <span />
        )}
        {variant === 'candidate' && (
          <span className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">Candidater</span>
        )}
      </div>
    </Link>
  )
}
