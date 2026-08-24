'use client'

import { useTransition } from 'react'
import { markNoShow } from '@/lib/actions/visio'

export default function NoShowButtons({ meetingId, missionId }: { meetingId: string; missionId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => markNoShow(meetingId, missionId, 'employer'))}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Signaler absence employeur
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => markNoShow(meetingId, missionId, 'candidate'))}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Signaler absence candidat
      </button>
    </div>
  )
}
