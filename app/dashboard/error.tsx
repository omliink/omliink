'use client'

import ErrorState from '@/components/ui/ErrorState'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="Impossible de charger le tableau de bord" />
}
