'use client'

interface ErrorStateProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
}

export default function ErrorState({ error, reset, title = 'Une erreur est survenue' }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 py-16 text-center">
      <h2 className="text-base font-semibold text-red-700">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-red-600">{error.message || 'Merci de réessayer dans quelques instants.'}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Réessayer
      </button>
    </div>
  )
}
