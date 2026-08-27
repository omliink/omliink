'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createNotification } from '@/lib/notifications-helpers'

export interface InvitationResult {
  error?: string
  success?: boolean
}

export async function inviteCandidateToMission(missionId: string, candidateId: string): Promise<InvitationResult> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: mission } = await supabase.from('missions').select('*').eq('id', missionId).maybeSingle()
  if (!mission || mission.employer_id !== user.id) {
    return { error: 'Non autorisé' }
  }

  const { error } = await supabase
    .from('mission_invitations')
    .insert({ mission_id: missionId, candidate_id: candidateId, status: 'pending' })

  if (error) {
    // Unique(mission_id, candidate_id) — already invited is not a real error.
    if (error.code === '23505') {
      return { success: true }
    }
    return { error: error.message }
  }

  await createNotification(supabase, {
    userId: candidateId,
    type: 'mission_invitation',
    title: 'Une mission vous a repéré(e) !',
    message: `L'employeur de "${mission.title}" vous invite à candidater.`,
    relatedId: missionId,
  })

  revalidatePath(`/dashboard/missions/${missionId}`)
  return { success: true }
}
