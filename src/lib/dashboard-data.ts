import { cache } from 'react'
import { createServerSupabaseClient } from './supabase-server'
import { haversineDistanceKm } from './geo'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Mission = Database['public']['Tables']['missions']['Row']
type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type SkillTaxonomy = Database['public']['Tables']['skill_taxonomy']['Row']
type Application = Database['public']['Tables']['applications']['Row']
type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']
type EmployerProfile = Database['public']['Tables']['employer_profiles']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type Message = Database['public']['Tables']['messages']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']
type VisioMeeting = Database['public']['Tables']['visio_meetings']['Row']
type Contract = Database['public']['Tables']['contracts']['Row']
type MissionNeedTaxonomy = Database['public']['Tables']['mission_need_taxonomy']['Row']
type MissionNeeds = Database['public']['Tables']['mission_needs']['Row']
type MissionInvitation = Database['public']['Tables']['mission_invitations']['Row']

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

export const getSkillTaxonomy = cache(async (): Promise<SkillTaxonomy[]> => {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('skill_taxonomy').select('*').order('label', { ascending: true })
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

export async function getCandidateServiceCategoryIds(candidateId: string): Promise<string[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('candidate_service_types').select('category_id').eq('candidate_id', candidateId)
  return (data ?? []).map((row) => row.category_id)
}

export async function getCandidateLanguages(
  candidateId: string
): Promise<Database['public']['Tables']['candidate_languages']['Row'][]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('candidate_languages').select('*').eq('candidate_id', candidateId)
  return data ?? []
}

export async function getCandidateSupplementCodes(candidateId: string): Promise<string[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('candidate_supplements').select('supplement_code').eq('candidate_id', candidateId)
  return (data ?? []).map((row) => row.supplement_code)
}

export async function getCandidateSkillRows(
  candidateId: string
): Promise<Database['public']['Tables']['candidate_skills']['Row'][]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('candidate_skills').select('*').eq('candidate_id', candidateId)
  return data ?? []
}

export interface SuggestedMission extends Mission {
  distanceKm: number | null
}

// Used right after onboarding completes (dashboard's "Missions suggérées"
// banner) — matches the candidate's chosen service categories, ranked by
// distance from their reference address via the existing haversine helper.
export async function getSuggestedMissionsForCandidate(candidateId: string, limit = 5): Promise<SuggestedMission[]> {
  const [profile, categoryIds] = await Promise.all([
    getCandidateProfile(candidateId),
    getCandidateServiceCategoryIds(candidateId),
  ])
  if (!profile || categoryIds.length === 0) return []

  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('missions')
    .select('*')
    .eq('status', 'published')
    .in('category_id', categoryIds)
    .order('mission_date', { ascending: true })

  const lat = profile.location_lat
  const lng = profile.location_lng

  return (data ?? [])
    .map((mission) => ({
      ...mission,
      distanceKm:
        lat != null && lng != null && mission.location_lat != null && mission.location_lng != null
          ? haversineDistanceKm(lat, lng, mission.location_lat, mission.location_lng)
          : null,
    }))
    .sort((a, b) => {
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
    .slice(0, limit)
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

export async function getEmployerSocialConnections(
  employerId: string
): Promise<Database['public']['Tables']['employer_social_connections']['Row'][]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('employer_social_connections').select('*').eq('employer_id', employerId)
  return data ?? []
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

// Safe to use with parallel interviews: scoped to one specific candidate, so
// it always returns at most one row even when several candidates each have
// their own visio_meeting on the same mission. Unlike a bare
// eq('mission_id', ...).maybeSingle(), which breaks once more than one
// meeting exists per mission.
export async function getVisioMeetingForCandidate(
  missionId: string,
  candidateId: string
): Promise<VisioMeeting | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('visio_meetings')
    .select('*')
    .eq('mission_id', missionId)
    .eq('candidate_id', candidateId)
    .maybeSingle()
  return data
}

export async function getVisioMeetingsByMissionIds(missionIds: string[]): Promise<VisioMeeting[]> {
  if (missionIds.length === 0) return []
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('visio_meetings').select('*').in('mission_id', missionIds)
  return data ?? []
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

export async function getContractsByMissionIds(missionIds: string[]): Promise<Contract[]> {
  if (missionIds.length === 0) return []
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('contracts').select('*').in('mission_id', missionIds)
  return data ?? []
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

export const getMissionNeedTaxonomy = cache(async (): Promise<MissionNeedTaxonomy[]> => {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('mission_need_taxonomy').select('*').order('label', { ascending: true })
  return data ?? []
})

export async function getMissionNeeds(missionId: string): Promise<MissionNeeds[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('mission_needs').select('*').eq('mission_id', missionId)
  return data ?? []
}

export async function getMissionNeedsForMissions(missionIds: string[]): Promise<MissionNeeds[]> {
  if (missionIds.length === 0) return []
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('mission_needs').select('*').in('mission_id', missionIds)
  return data ?? []
}

// "Mes intervenants": every candidate this employer has hired at least once,
// across any of their missions — a standing collaboration history distinct
// from the live "candidatures en cours" list.
export interface Collaborator {
  candidateId: string
  mission: Mission
  application: Application
}

export async function getEmployerCollaborators(employerId: string): Promise<Collaborator[]> {
  const missions = await getEmployerMissions(employerId)
  const missionIds = missions.map((m) => m.id)
  if (missionIds.length === 0) return []
  const missionById = new Map(missions.map((m) => [m.id, m]))

  const applications = await getApplicationsForMissions(missionIds)
  return applications
    .filter((application) => application.status === 'hired')
    .map((application) => ({
      candidateId: application.candidate_id,
      mission: missionById.get(application.mission_id)!,
      application,
    }))
}

export interface SuggestedCandidate {
  candidateId: string
  profile: CandidateProfile
  distanceKm: number | null
}

// Candidates compatible with a just-published mission: same service
// category (candidate_service_types), not already applied, ranked by
// distance from the mission when both sides have coordinates.
export async function getSuggestedCandidatesForMission(mission: Mission, limit = 10): Promise<SuggestedCandidate[]> {
  const supabase = await createServerSupabaseClient()

  const [{ data: candidateTypeRows }, existingApplications] = await Promise.all([
    supabase.from('candidate_service_types').select('candidate_id').eq('category_id', mission.category_id),
    getApplicationsForMission(mission.id),
  ])

  const candidateIds = [...new Set((candidateTypeRows ?? []).map((row) => row.candidate_id))]
  const appliedIds = new Set(existingApplications.map((a) => a.candidate_id))
  const eligibleIds = candidateIds.filter((id) => !appliedIds.has(id))
  if (eligibleIds.length === 0) return []

  const profiles = await getCandidateProfilesByUserIds(eligibleIds)

  return profiles
    .map((profile) => ({
      candidateId: profile.user_id,
      profile,
      distanceKm:
        mission.location_lat != null &&
        mission.location_lng != null &&
        profile.location_lat != null &&
        profile.location_lng != null
          ? haversineDistanceKm(mission.location_lat, mission.location_lng, profile.location_lat, profile.location_lng)
          : null,
    }))
    .sort((a, b) => {
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
    .slice(0, limit)
}

export async function getInvitationsForMission(missionId: string): Promise<MissionInvitation[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('mission_invitations').select('*').eq('mission_id', missionId)
  return data ?? []
}

export async function getInvitationsForCandidate(candidateId: string): Promise<MissionInvitation[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('mission_invitations')
    .select('*')
    .eq('candidate_id', candidateId)
    .in('status', ['pending', 'viewed'])
    .order('created_at', { ascending: false })
  return data ?? []
}
