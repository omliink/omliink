const STATUS_CONFIG: Record<string, { label: string; className: string } | undefined> = {
  verified: { label: 'Profil vérifié ✓', className: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Vérification en cours', className: 'bg-amber-100 text-amber-700' },
  rejected: { label: 'Vérification refusée', className: 'bg-red-100 text-red-700' },
}

export default function VerificationBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status]
  if (!config) return null

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
