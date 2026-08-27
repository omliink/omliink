'use client'

import { useState, useTransition } from 'react'
import { reactivateMission, removeMission, suspendMission, type AdminActionState } from '@/lib/actions/admin'

export default function MissionModerationActions({
  missionId,
  moderationStatus,
}: {
  missionId: string
  moderationStatus: string
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  const run = (action: () => Promise<AdminActionState>) => {
    startTransition(async () => {
      const result = await action()
      setError(result.error ?? null)
      setConfirmingRemove(false)
    })
  }

  if (moderationStatus === 'removed') {
    return <span className="text-xs text-gray-400">Mission supprimée</span>
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {moderationStatus === 'normal' && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => suspendMission(missionId))}
            className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Suspendre
          </button>
        )}
        {moderationStatus === 'suspended' && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => reactivateMission(missionId))}
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Réactiver
          </button>
        )}
        {!confirmingRemove ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmingRemove(true)}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Supprimer définitivement
          </button>
        ) : (
          <>
            <span className="text-xs font-medium text-red-700">Confirmer la suppression ?</span>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => removeMission(missionId))}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? '…' : 'Oui, supprimer'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingRemove(false)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
