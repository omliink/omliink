'use client'

import { useEffect } from 'react'
import { markConversationRead } from '@/lib/actions/messages'

export default function MarkConversationRead({ conversationId }: { conversationId: string }) {
  useEffect(() => {
    markConversationRead(conversationId)
  }, [conversationId])

  return null
}
