'use client'

import { useState, useTransition } from 'react'
import { inviteCandidateToMission } from '@/lib/actions/invitations'
import type { SuggestedCandidate } from '@/lib/dashboard-data'

interface SuggestedCandidatesListProps {
  missionId: string
  candidates: SuggestedCandidate[]
  nameByCandidateId: Map<string, string>
  initiallyInvitedIds: string[]
}

export default function SuggestedCandidatesList({
  missionId,
  candidates,
  nameByCandidateId,
  initiallyInvitedIds,
}: SuggestedCandidatesListProps) {
  const [isPending, startTransition] = useTransition()
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set(initiallyInvitedIds))

  const handleInvite = (candidateId: string) => {
    startTransition(async () => {
      const res = await inviteCandidateToMission(missionId, candidateId)
      if (!res.error) {
        setInvitedIds((prev) => new Set(prev).add(candidateId))
      }
    })
  }

  if (candidates.length === 0) {
    return <p className="mt-3 text-sm text-gray-500">Aucun candidat compatible trouvé pour le moment.</p>
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {candidates.map((candidate) => {
        const invited = invitedIds.has(candidate.candidateId)
        return (
          <li
            key={candidate.candidateId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              {candidate.profile.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={candidate.profile.photo_url} alt="" className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {nameByCandidateId.get(candidate.candidateId) ?? 'Candidat'}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {candidate.profile.bio_title}
                  {candidate.distanceKm != null && ` · ${candidate.distanceKm.toFixed(1)} km`}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={invited || isPending}
              onClick={() => handleInvite(candidate.candidateId)}
              className="flex-shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {invited ? 'Invité(e) ✓' : 'Inviter à candidater'}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
