export function getNotificationHref(type: string | null, relatedId: string | null): string {
  if (!relatedId) return '/dashboard'
  if (type === 'new_message') return `/dashboard/messages/${relatedId}`
  if (type === 'application_received' || type === 'application_accepted' || type === 'application_rejected') {
    return `/dashboard/missions/${relatedId}`
  }
  return '/dashboard'
}
