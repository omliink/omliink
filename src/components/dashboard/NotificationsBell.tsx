'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markNotificationRead } from '@/lib/actions/notifications'
import { getNotificationHref } from '@/lib/notification-links'
import type { Database } from '@/types/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']

interface NotificationsBellProps {
  notifications: Notification[]
  unreadCount: number
}

export default function NotificationsBell({ notifications, unreadCount }: NotificationsBellProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleClick = async (notification: Notification) => {
    setOpen(false)
    // Await the mutation before navigating: firing it via startTransition and
    // pushing immediately let the route change race the in-flight request,
    // so the notification was sometimes still unread after landing on the
    // target page.
    if (!notification.is_read) {
      await markNotificationRead(notification.id)
    }
    router.push(getNotificationHref(notification.type, notification.related_id))
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M6 8a6 6 0 1112 0c0 3 1 5 2 6H4c1-1 2-3 2-6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff5a3d] px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer les notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30"
          />
          <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
            <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Notifications</p>
            {notifications.length === 0 ? (
              <p className="px-4 py-4 text-sm text-gray-500">Aucune notification.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(notification)}
                      className={`block w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                        !notification.is_read ? 'bg-indigo-50/60' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      {notification.message && <p className="mt-0.5 text-xs text-gray-600">{notification.message}</p>}
                      <p className="mt-1 text-[11px] text-gray-400">
                        {new Date(notification.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
