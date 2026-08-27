'use client'

import { useState } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'

export interface CandidateRow {
  applicationId: string
  candidateId: string
  candidateName: string
  missionId: string
  missionTitle: string
  status: string
  appliedAt: string
}

interface EmployerCandidatesListProps {
  rows: CandidateRow[]
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'interviewing', label: 'En entretien' },
  { value: 'hired', label: 'Embauché' },
  { value: 'rejected', label: 'Refusé' },
] as const

export default function EmployerCandidatesList({ rows }: EmployerCandidatesListProps) {
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]['value']>('all')

  const filteredRows = filter === 'all' ? rows : rows.filter((row) => row.status === filter)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === option.value ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredRows.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Aucun candidat" description="Aucune candidature ne correspond à ce filtre." />
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white">
          <ul className="divide-y divide-gray-100">
            {filteredRows.map((row) => (
              <li key={row.applicationId} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{row.candidateName}</p>
                  <p className="text-xs text-gray-500">
                    {row.missionTitle} · Candidature envoyée le {new Date(row.appliedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <StatusBadge status={row.status} />
                  <Link href={`/dashboard/missions/${row.missionId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    Voir
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
