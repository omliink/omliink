'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleMissionPause } from '@/lib/actions/missions'

interface MissionActionsMenuProps {
  missionId: string
  status: string
  moderationStatus: string
  hasHiredApplication: boolean
}

export default function MissionActionsMenu({ missionId, status, moderationStatus, hasHiredApplication }: MissionActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isModerated = moderationStatus !== 'normal'
  const canPauseToggle = (status === 'published' || status === 'paused') && !isModerated

  const handleTogglePause = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(() => toggleMissionPause(missionId))
    setOpen(false)
  }

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          setOpen((current) => !current)
        }}
        aria-expanded={open}
        aria-label="Actions"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
          <circle cx="10" cy="4" r="1.5" fill="currentColor" />
          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
          <circle cx="10" cy="16" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30"
          />
          <div className="absolute right-0 z-40 mt-1 w-56 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
            <Link
              href={`/dashboard/missions/${missionId}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Voir
            </Link>

            {isModerated ? (
              <span
                className="block px-4 py-2 text-sm text-gray-400"
                title="Suspendue ou supprimée par la modération"
              >
                Éditer — suspendue par la modération
              </span>
            ) : hasHiredApplication ? (
              <span className="block px-4 py-2 text-sm text-gray-400" title="Non modifiable après embauche">
                Éditer — non modifiable après embauche
              </span>
            ) : (
              <Link
                href={`/dashboard/missions/${missionId}/edit`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Éditer
              </Link>
            )}

            {canPauseToggle && (
              <button
                type="button"
                disabled={isPending}
                onClick={handleTogglePause}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'published' ? 'Mettre en pause' : 'Réactiver'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
