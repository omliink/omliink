'use client'

import ErrorState from '@/components/ui/ErrorState'

export default function VisioError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="Impossible de charger la visioconférence" />
}
