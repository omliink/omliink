import Link from 'next/link'
import { redirect } from 'next/navigation'
import EmptyState from '@/components/ui/EmptyState'
import {
  getConversationsForUser,
  getCurrentUser,
  getMissionsByIds,
  getProfilesByIds,
  getUnreadMessagesForConversations,
} from '@/lib/dashboard-data'

export default async function MessagesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const conversations = await getConversationsForUser(user.id)
  const otherUserIds = conversations.map((c) => (c.user_1_id === user.id ? c.user_2_id : c.user_1_id))
  const missionIds = conversations.map((c) => c.mission_id).filter((id): id is string => Boolean(id))

  const [otherProfiles, missions, unreadMessages] = await Promise.all([
    getProfilesByIds(otherUserIds),
    getMissionsByIds(missionIds),
    getUnreadMessagesForConversations(conversations.map((c) => c.id), user.id),
  ])

  const profileById = new Map(otherProfiles.map((p) => [p.id, p]))
  const missionById = new Map(missions.map((m) => [m.id, m]))
  const unreadCountByConversation = new Map<string, number>()
  unreadMessages.forEach((message) => {
    unreadCountByConversation.set(message.conversation_id, (unreadCountByConversation.get(message.conversation_id) ?? 0) + 1)
  })

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      <p className="mt-1 text-sm text-gray-600">Échangez avec vos interlocuteurs après acceptation d&apos;une mission.</p>

      {conversations.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Aucune conversation"
            description="Les conversations apparaissent automatiquement quand une candidature est acceptée."
          />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 bg-white">
          {conversations.map((conversation) => {
            const otherId = conversation.user_1_id === user.id ? conversation.user_2_id : conversation.user_1_id
            const otherProfile = profileById.get(otherId)
            const mission = conversation.mission_id ? missionById.get(conversation.mission_id) : null
            const unreadCount = unreadCountByConversation.get(conversation.id) ?? 0

            return (
              <li key={conversation.id}>
                <Link
                  href={`/dashboard/messages/${conversation.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className={`text-sm ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {otherProfile?.full_name ?? otherProfile?.email ?? 'Utilisateur'}
                    </p>
                    {mission && <p className="mt-0.5 truncate text-xs text-gray-500">{mission.title}</p>}
                  </div>
                  {unreadCount > 0 && (
                    <span className="flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5a3d] px-1.5 text-xs font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
