import { cache } from 'react'
import { createServerSupabaseClient } from './supabase-server'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Mission = Database['public']['Tables']['missions']['Row']
type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type Application = Database['public']['Tables']['applications']['Row']

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
