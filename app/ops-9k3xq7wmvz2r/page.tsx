import Link from 'next/link'
import { ADMIN_BASE_PATH } from '@/lib/admin-auth'
import {
  getActivePromoCodeCount,
  getPendingSocialConnectionCount,
  getPendingVerificationCount,
} from '@/lib/dashboard-data'

export default async function AdminDashboardPage() {
  const [pendingVerifications, pendingSocialConnections, activePromoCodes] = await Promise.all([
    getPendingVerificationCount(),
    getPendingSocialConnectionCount(),
    getActivePromoCodeCount(),
  ])

  const cards = [
    { href: `${ADMIN_BASE_PATH}/verifications`, label: 'Vérifications en attente', count: pendingVerifications },
    {
      href: `${ADMIN_BASE_PATH}/cesu-pajemploi`,
      label: 'Demandes CESU/Pajemploi en attente',
      count: pendingSocialConnections,
    },
    { href: `${ADMIN_BASE_PATH}/promo-codes`, label: 'Codes promo actifs', count: activePromoCodes },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord admin</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-gray-100 bg-white p-5 transition-colors hover:border-gray-200"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{card.count}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
