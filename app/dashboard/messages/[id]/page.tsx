import { notFound, redirect } from 'next/navigation'
import MessageForm from '@/components/dashboard/MessageForm'
import MarkConversationRead from '@/components/dashboard/MarkConversationRead'
import {
  getConversationById,
  getCurrentUser,
  getMessagesForConversation,
  getMissionById,
  getProfilesByIds,
} from '@/lib/dashboard-data'

interface ConversationPageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params

  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const conversation = await getConversationById(id)
  if (!conversation) {
    notFound()
  }

  const isParticipant = conversation.user_1_id === user.id || conversation.user_2_id === user.id
  if (!isParticipant) {
    redirect('/dashboard/messages')
  }

  const otherId = conversation.user_1_id === user.id ? conversation.user_2_id : conversation.user_1_id

  const [messages, profiles, mission] = await Promise.all([
    getMessagesForConversation(conversation.id),
    getProfilesByIds([otherId]),
    conversation.mission_id ? getMissionById(conversation.mission_id) : Promise.resolve(null),
  ])

  const otherProfile = profiles[0]

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <MarkConversationRead conversationId={conversation.id} />

      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-lg font-bold text-gray-900">{otherProfile?.full_name ?? otherProfile?.email ?? 'Utilisateur'}</h1>
        {mission && <p className="mt-0.5 text-sm text-gray-500">{mission.title}</p>}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Aucun message pour le moment. Lancez la conversation !</p>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === user.id
            return (
              <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm sm:max-w-md ${
                    isMine ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`mt-1 text-[11px] ${isMine ? 'text-indigo-100' : 'text-gray-400'}`}>
                    {new Date(message.created_at).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <MessageForm conversationId={conversation.id} />
      </div>
    </div>
  )
}
