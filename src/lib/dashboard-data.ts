import { cache } from 'react'
import { createServerSupabaseClient } from './supabase-server'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Mission = Database['public']['Tables']['missions']['Row']
type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type Application = Database['public']['Tables']['applications']['Row']
type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']
type EmployerProfile = Database['public']['Tables']['employer_profiles']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type Message = Database['public']['Tables']['messages']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']
type VisioMeeting = Database['public']['Tables']['visio_meetings']['Row']
type Contract = Database['public']['Tables']['contracts']['Row']

export const getCurrentUser = cache(async () => {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const getProfile = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return data
})

export const getCategories = cache(async (): Promise<ServiceCategory[]> => {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('service_categories').select('*').order('sort_order', { ascending: true })
  return data ?? []
})

export async function getEmployerMissions(employerId: string): Promise<Mission[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('missions')
    .select('*')
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getApplicationsForMissions(missionIds: string[]): Promise<Application[]> {
  if (missionIds.length === 0) return []
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('applications').select('*').in('mission_id', missionIds)
  return data ?? []
}

export async function getPublishedMissions(): Promise<Mission[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('missions')
    .select('*')
    .eq('status', 'published')
    .order('mission_date', { ascending: true })
  return data ?? []
}

export async function getCandidateApplications(candidateId: string): Promise<Application[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('applications')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('applied_at', { ascending: false })
  return data ?? []
}

export async function getMissionsByIds(ids: string[]): Promise<Mission[]> {
  if (ids.length === 0) return []
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('missions').select('*').in('id', ids)
  return data ?? []
}

export async function getMissionById(id: string): Promise<Mission | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('missions').select('*').eq('id', id).maybeSingle()
  return data
}

export async function getApplicationsForMission(missionId: string): Promise<Application[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('applications')
    .select('*')
    .eq('mission_id', missionId)
    .order('applied_at', { ascending: false })
  return data ?? []
}

export async function getProfilesByIds(ids: string[]): Promise<Profile[]> {
  if (ids.length === 0) return []
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('profiles').select('*').in('id', ids)
  return data ?? []
}

export async function getApplicationForMissionAndCandidate(
  missionId: string,
  candidateId: string
): Promise<Application | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('applications')
    .select('*')
    .eq('mission_id', missionId)
    .eq('candidate_id', candidateId)
    .maybeSingle()
  return data
}

export async function getCandidateProfile(userId: string): Promise<CandidateProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('candidate_profiles').select('*').eq('user_id', userId).maybeSingle()
  return data
}

export async function getEmployerProfile(userId: string): Promise<EmployerProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('employer_profiles').select('*').eq('user_id', userId).maybeSingle()
  return data
}

export async function getCandidateProfilesByUserIds(userIds: string[]): Promise<CandidateProfile[]> {
  if (userIds.length === 0) return []
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('candidate_profiles').select('*').in('user_id', userIds)
  return data ?? []
}

export async function getConversationsForUser(userId: string): Promise<Conversation[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })
  return data ?? []
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('conversations').select('*').eq('id', id).maybeSingle()
  return data
}

export async function getConversationForMissionAndUsers(
  missionId: string,
  userAId: string,
  userBId: string
): Promise<Conversation | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('mission_id', missionId)
    .or(
      `and(user_1_id.eq.${userAId},user_2_id.eq.${userBId}),and(user_1_id.eq.${userBId},user_2_id.eq.${userAId})`
    )
    .maybeSingle()
  return data
}

export async function getMessagesForConversation(conversationId: string): Promise<Message[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getVisioMeetingByMissionId(missionId: string): Promise<VisioMeeting | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('visio_meetings').select('*').eq('mission_id', missionId).maybeSingle()
  return data
}

export async function getVisioMeetingById(id: string): Promise<VisioMeeting | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('visio_meetings').select('*').eq('id', id).maybeSingle()
  return data
}

export async function getContractByMissionId(missionId: string): Promise<Contract | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('contracts').select('*').eq('mission_id', missionId).maybeSingle()
  return data
}

export async function getUnreadMessagesForConversations(
  conversationIds: string[],
  userId: string
): Promise<Message[]> {
  if (conversationIds.length === 0) return []
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('messages')
    .select('*')
    .in('conversation_id', conversationIds)
    .neq('sender_id', userId)
    .eq('is_read', false)
  return data ?? []
}

export async function getUnreadMessagesCountForUser(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const conversations = await getConversationsForUser(userId)
  const conversationIds = conversations.map((c) => c.id)
  if (conversationIds.length === 0) return 0

  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', conversationIds)
    .neq('sender_id', userId)
    .eq('is_read', false)

  return count ?? 0
}

export async function getRecentNotifications(userId: string, limit = 10): Promise<Notification[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getUnreadNotificationsCountForUser(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  return count ?? 0
}
