'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createNotification } from '@/lib/notifications-helpers'

export interface SendMessageState {
  error?: string
  success?: boolean
}

export async function sendMessage(
  conversationId: string,
  _prevState: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const content = String(formData.get('content') ?? '').trim()
  if (!content) {
    return { error: 'Le message ne peut pas être vide' }
  }

  const { data: conversation } = await supabase
    .from('conversations')
    .select('user_1_id, user_2_id')
    .eq('id', conversationId)
    .maybeSingle()

  if (!conversation) {
    return { error: 'Conversation introuvable' }
  }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content,
  })

  if (error) {
    return { error: error.message }
  }

  await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId)

  const recipientId = conversation.user_1_id === user.id ? conversation.user_2_id : conversation.user_1_id
  await createNotification(supabase, {
    userId: recipientId,
    type: 'new_message',
    title: 'Nouveau message',
    message: content.length > 80 ? `${content.slice(0, 80)}…` : content,
    relatedId: conversationId,
  })

  revalidatePath(`/dashboard/messages/${conversationId}`)
  revalidatePath('/dashboard/messages')
  return { success: true }
}

export async function markConversationRead(conversationId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  await supabase
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  revalidatePath(`/dashboard/messages/${conversationId}`)
}
