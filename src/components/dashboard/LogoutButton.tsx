'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    // Full navigation rather than router.push(): the server (proxy.ts +
    // Server Components) needs to see the cleared session cookie on a fresh
    // request. A client-side push/refresh can race the in-flight transition
    // and leave the page blank until a manual reload.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/auth/login'
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
        <path
          d="M7 4H4.5A1.5 1.5 0 003 5.5v9A1.5 1.5 0 004.5 16H7M13 13.5L16.5 10 13 6.5M16 10H7.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {loading ? 'Déconnexion…' : 'Se déconnecter'}
    </button>
  )
}
