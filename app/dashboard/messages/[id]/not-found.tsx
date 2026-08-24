import Link from 'next/link'

export default function ConversationNotFound() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Conversation introuvable</h1>
      <p className="mt-2 text-sm text-gray-600">Cette conversation n&apos;existe pas ou a été supprimée.</p>
      <Link
        href="/dashboard/messages"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Retour aux messages
      </Link>
    </div>
  )
}
