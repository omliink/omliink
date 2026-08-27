import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAdminUser } from '@/lib/admin-auth'

const ADMIN_LINKS = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/verifications', label: 'Vérifications' },
  { href: '/admin/promo-codes', label: 'Codes promo' },
  { href: '/admin/cesu-pajemploi', label: 'CESU / Pajemploi' },
  { href: '/admin/missions', label: 'Missions' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // notFound() rather than a redirect for any non-admin — including a
  // logged-out visitor or a perfectly normal logged-in user — so the
  // response is identical to the route simply not existing. A redirect
  // would at least confirm something is there to be redirected away from.
  const admin = await requireAdminUser()
  if (!admin) notFound()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 flex-shrink-0 border-r border-gray-100 bg-white px-4 py-6">
        <Link href="/admin" className="flex items-center gap-2 px-2 text-lg font-bold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">
            A
          </span>
          Admin
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-gray-100 pt-4">
          <Link href="/dashboard" className="px-3 text-xs font-medium text-gray-400 hover:text-gray-600">
            ← Retour à OMLIINK
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
