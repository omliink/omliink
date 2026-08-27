'use client'

import { useState, useTransition } from 'react'
import { dismissMissionReport } from '@/lib/actions/admin'

export default function DismissReportButton({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await dismissMissionReport(reportId)
            if (result.error) setError(result.error)
          })
        }
        className="text-xs font-medium text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? '…' : 'Ignorer ce signalement'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
