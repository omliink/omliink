'use client'

import { useState, useTransition } from 'react'
import { applyToMission } from '@/lib/actions/applications'
import type { SuggestedMission } from '@/lib/dashboard-data'
import type { Database } from '@/types/database.types'

type ServiceCategory = Database['public']['Tables']['service_categories']['Row']

interface SuggestedMissionsBannerProps {
  missions: SuggestedMission[]
  categories: ServiceCategory[]
}

function formatDate(value: string | null) {
  if (!value) return 'Non renseignée'
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatBudget(value: number | null) {
  if (value === null) return 'Non renseigné'
  return `${value.toLocaleString('fr-FR')} €`
}

export default function SuggestedMissionsBanner({ missions, categories }: SuggestedMissionsBannerProps) {
  const [isPending, startTransition] = useTransition()
  const [appliedMissionIds, setAppliedMissionIds] = useState<Set<string>>(new Set())

  const handleApply = (missionId: string) => {
    startTransition(async () => {
      const res = await applyToMission(missionId, {}, new FormData())
      if (!res.error) {
        setAppliedMissionIds((prev) => new Set(prev).add(missionId))
      }
    })
  }

  if (missions.length === 0) return null

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
      <h2 className="text-lg font-semibold text-indigo-900">Votre profil est prêt ! Missions suggérées pour vous</h2>
      <p className="mt-1 text-sm text-indigo-700">Voici quelques missions correspondant à vos services.</p>

      <ul className="mt-4 flex flex-col gap-3">
        {missions.map((mission) => {
          const categoryName = categories.find((c) => c.id === mission.category_id)?.name
          const applied = appliedMissionIds.has(mission.id)
          return (
            <li key={mission.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">{categoryName}</p>
                <p className="truncate text-sm font-semibold text-gray-900">{mission.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {formatDate(mission.mission_date)} · {formatBudget(mission.budget)}
                  {mission.distanceKm != null && ` · ${mission.distanceKm.toFixed(1)} km`}
                </p>
              </div>
              <button
                type="button"
                disabled={applied || isPending}
                onClick={() => handleApply(mission.id)}
                className="flex-shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applied ? 'Candidature envoyée ✓' : 'Candidater'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
