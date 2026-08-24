'use client'

import { useTransition } from 'react'
import { acceptVisioSlot } from '@/lib/actions/visio'

export default function AcceptSlotButton({ meetingId, missionId }: { meetingId: string; missionId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => acceptVisioSlot(meetingId, missionId))}
      className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? 'Confirmation…' : 'Accepter ce créneau'}
    </button>
  )
}
