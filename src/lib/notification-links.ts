export function getNotificationHref(type: string | null, relatedId: string | null): string {
  if (!relatedId) return '/dashboard'
  if (type === 'new_message') return `/dashboard/messages/${relatedId}`
  if (
    type === 'application_received' ||
    type === 'application_accepted' ||
    type === 'application_interviewing' ||
    type === 'application_hired' ||
    type === 'application_rejected' ||
    type === 'visio_proposed' ||
    type === 'visio_accepted' ||
    type === 'visio_completed' ||
    type === 'contract_ready'
  ) {
    return `/dashboard/missions/${relatedId}`
  }
  return '/dashboard'
}
