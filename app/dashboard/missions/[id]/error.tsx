'use client'

import ErrorState from '@/components/ui/ErrorState'

export default function MissionDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="Impossible de charger cette mission" />
}
