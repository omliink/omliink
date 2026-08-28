'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import MissionModerationActions from './MissionModerationActions'
import type { Database } from '@/types/database.types'

type Mission = Database['public']['Tables']['missions']['Row']

const STATUS_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publiée' },
  { value: 'paused', label: 'En pause' },
  { value: 'visio_scheduled', label: 'Visio à planifier' },
  { value: 'assigned', label: 'Assignée' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
]

interface AdminMissionsListProps {
  missions: Mission[]
  categoryNameById: Map<string, string>
  employerNameById: Map<string, string>
}

export default function AdminMissionsList({ missions, categoryNameById, employerNameById }: AdminMissionsListProps) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return missions.filter((mission) => {
      if (statusFilter !== 'all' && mission.status !== statusFilter) return false
      if (!query) return true
      const employerName = employerNameById.get(mission.employer_id) ?? ''
      return mission.title.toLowerCase().includes(query) || employerName.toLowerCase().includes(query)
    })
  }, [missions, statusFilter, search, employerNameById])

  return (
    <div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par titre ou employeur…"
          className="w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500">
          {filtered.length} mission(s) sur {missions.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">Aucune mission ne correspond à ce filtre.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 bg-white">
          {filtered.map((mission) => (
            <li key={mission.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/missions/${mission.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {mission.title}
                  </Link>
                  <StatusBadge status={mission.status} />
                  {mission.moderation_status !== 'normal' && <StatusBadge status={mission.moderation_status} />}
                </div>
                <p className="text-xs text-gray-500">
                  {categoryNameById.get(mission.category_id) ?? 'Catégorie'} ·{' '}
                  {employerNameById.get(mission.employer_id) ?? 'Employeur'}
                </p>
              </div>
              <MissionModerationActions missionId={mission.id} moderationStatus={mission.moderation_status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
