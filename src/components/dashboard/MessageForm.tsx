'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { sendMessage, type SendMessageState } from '@/lib/actions/messages'

const initialState: SendMessageState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Envoi…' : 'Envoyer'}
    </button>
  )
}

export default function MessageForm({ conversationId }: { conversationId: string }) {
  const sendWithConversation = sendMessage.bind(null, conversationId)
  const [state, formAction] = useActionState(sendWithConversation, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} noValidate className="flex items-end gap-2">
      <div className="flex-1">
        <label htmlFor="content" className="sr-only">
          Message
        </label>
        <textarea
          id="content"
          name="content"
          rows={2}
          required
          placeholder="Écrire un message…"
          aria-describedby={state.error ? 'message-error' : undefined}
          className="block w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {state.error && (
          <p id="message-error" role="alert" aria-live="polite" className="mt-1 text-xs text-red-600">
            {state.error}
          </p>
        )}
      </div>
      <SubmitButton />
    </form>
  )
}
