const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-600' },
  published: { label: 'Publiée', className: 'bg-indigo-100 text-indigo-700' },
  visio_scheduled: { label: 'Visio à planifier', className: 'bg-purple-100 text-purple-700' },
  assigned: { label: 'Assignée', className: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En cours', className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Terminée', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Acceptée', className: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Refusée', className: 'bg-red-100 text-red-700' },
  withdrawn: { label: 'Retirée', className: 'bg-gray-100 text-gray-600' },
  proposed: { label: 'Créneau proposé', className: 'bg-amber-100 text-amber-700' },
  no_show_employer: { label: 'Absence employeur', className: 'bg-red-100 text-red-700' },
  no_show_candidate: { label: 'Absence candidat', className: 'bg-red-100 text-red-700' },
  signed_by_employer: { label: 'Signé par l’employeur', className: 'bg-amber-100 text-amber-700' },
  signed_by_candidate: { label: 'Signé par le candidat', className: 'bg-amber-100 text-amber-700' },
  signed: { label: 'Signé', className: 'bg-emerald-100 text-emerald-700' },
  paid: { label: 'Payé', className: 'bg-emerald-100 text-emerald-700' },
}

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
