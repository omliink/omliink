'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createNotification } from '@/lib/notifications-helpers'

export interface ApplyState {
  error?: string
  success?: boolean
}

export async function applyToMission(
  missionId: string,
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const coverLetter = String(formData.get('cover_letter') ?? '').trim()

  const { data: mission } = await supabase.from('missions').select('employer_id, title').eq('id', missionId).maybeSingle()

  const { error } = await supabase.from('applications').insert({
    mission_id: missionId,
    candidate_id: user.id,
    status: 'pending',
    cover_letter: coverLetter || null,
    proposed_rate: null,
  })

  if (error) {
    return { error: error.message }
  }

  if (mission) {
    await createNotification(supabase, {
      userId: mission.employer_id,
      type: 'application_received',
      title: 'Nouvelle candidature reçue',
      message: `Vous avez reçu une nouvelle candidature pour "${mission.title}".`,
      relatedId: missionId,
    })
  }

  revalidatePath(`/dashboard/missions/${missionId}`)
  return { success: true }
}

export async function updateApplicationStatus(
  applicationId: string,
  missionId: string,
  status: 'accepted' | 'rejected'
) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: application, error } = await supabase
    .from('applications')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select('candidate_id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const { data: mission } = await supabase.from('missions').select('employer_id, title').eq('id', missionId).maybeSingle()

  if (mission) {
    await createNotification(supabase, {
      userId: application.candidate_id,
      type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
      title: status === 'accepted' ? 'Candidature acceptée' : 'Candidature refusée',
      message:
        status === 'accepted'
          ? `Votre candidature pour "${mission.title}" a été acceptée.`
          : `Votre candidature pour "${mission.title}" a été refusée.`,
      relatedId: missionId,
    })

    if (status === 'accepted') {
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('mission_id', missionId)
        .or(
          `and(user_1_id.eq.${mission.employer_id},user_2_id.eq.${application.candidate_id}),and(user_1_id.eq.${application.candidate_id},user_2_id.eq.${mission.employer_id})`
        )
        .maybeSingle()

      if (!existingConversation) {
        await supabase.from('conversations').insert({
          mission_id: missionId,
          user_1_id: mission.employer_id,
          user_2_id: application.candidate_id,
        })
      }

      // OMLIINK requires a visio between employer and candidate before a
      // mission can proceed: block the mission on that step and create the
      // meeting shell (no date yet — the employer proposes one next).
      const meetingId = crypto.randomUUID()
      const roomName = `mission-${missionId}-${meetingId}`

      await supabase.from('visio_meetings').insert({
        id: meetingId,
        mission_id: missionId,
        employer_id: mission.employer_id,
        candidate_id: application.candidate_id,
        room_name: roomName,
        status: 'proposed',
      })

      await supabase.from('missions').update({ status: 'visio_scheduled' }).eq('id', missionId)
    }
  }

  revalidatePath(`/dashboard/missions/${missionId}`)
}
