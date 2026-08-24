import type { createServerSupabaseClient } from './supabase-server'

type SupabaseServerClient = Awaited<ReturnType<typeof createServerSupabaseClient>>

interface CreateNotificationParams {
  userId: string
  type: string
  title: string
  message?: string | null
  relatedId?: string | null
}

export async function createNotification(
  supabase: SupabaseServerClient,
  { userId, type, title, message, relatedId }: CreateNotificationParams
) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message: message ?? null,
    related_id: relatedId ?? null,
    is_read: false,
  })
}
