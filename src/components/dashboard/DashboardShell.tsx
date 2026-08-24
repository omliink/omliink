'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import NotificationsBell from './NotificationsBell'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']

interface DashboardShellProps {
  profile: Profile
  unreadMessagesCount: number
  notifications: Notification[]
  unreadNotificationsCount: number
  children: ReactNode
}

export default function DashboardShell({
  profile,
  unreadMessagesCount,
  notifications,
  unreadNotificationsCount,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/dashboard', label: 'Tableau de bord' },
    ...(profile.is_employer ? [{ href: '/dashboard/missions/new', label: 'Nouvelle mission' }] : []),
    { href: '/dashboard/messages', label: 'Messages', badge: unreadMessagesCount },
    { href: '/dashboard/profile', label: 'Mon profil' },
  ]

  const displayName = profile.full_name ?? profile.email
  const initials = displayName.trim().charAt(0).toUpperCase() || '?'

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {link.label}
            {Boolean(link.badge) && link.badge! > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff5a3d] px-1 text-[11px] font-semibold text-white">
                {link.badge! > 9 ? '9+' : link.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 flex-shrink-0 flex-col justify-between border-r border-gray-100 bg-white px-4 py-6 md:flex">
        <div>
          <Link href="/dashboard" className="flex items-center gap-2 px-2 text-lg font-bold text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
              O
            </span>
            OMLIINK
          </Link>
          <div className="mt-8">{navLinks}</div>
        </div>
        <LogoutButton />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 md:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>

          <span className="text-sm font-semibold text-gray-900 md:hidden">OMLIINK</span>

          <div className="flex items-center gap-3">
            <NotificationsBell notifications={notifications} unreadCount={unreadNotificationsCount} />
            <span className="hidden text-sm font-medium text-gray-700 sm:inline">{displayName}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {initials}
            </div>
          </div>
        </header>

        {menuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-black/30"
            />
            <div className="absolute left-0 top-0 flex h-full w-64 flex-col justify-between bg-white px-4 py-6 shadow-xl">
              <div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-lg font-bold text-gray-900">OMLIINK</span>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Fermer le menu"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="mt-6">{navLinks}</div>
              </div>
              <LogoutButton />
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
