'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createNotification } from '@/lib/notifications-helpers'
import { cancelPendingVisioForApplication } from '@/lib/visio-cleanup'

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

  const { data: mission } = await supabase
    .from('missions')
    .select('employer_id, title, moderation_status')
    .eq('id', missionId)
    .maybeSingle()

  if (mission && mission.moderation_status !== 'normal') {
    return { error: "Cette mission n'est plus disponible." }
  }

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

  // If this application follows an employer invitation, close the loop on
  // it so the employer can see it converted rather than sitting "pending".
  await supabase
    .from('mission_invitations')
    .update({ status: 'applied' })
    .eq('mission_id', missionId)
    .eq('candidate_id', user.id)

  revalidatePath(`/dashboard/missions/${missionId}`)
  return { success: true }
}

// Employer chooses a candidate to interview. Several candidates can be
// 'interviewing' on the same mission at once — the mission itself stays
// 'published' until one of them is hired (see hiring.ts).
export async function startInterview(applicationId: string, missionId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: application, error } = await supabase
    .from('applications')
    .update({ status: 'interviewing', responded_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select('candidate_id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const { data: mission } = await supabase.from('missions').select('employer_id, title').eq('id', missionId).maybeSingle()
  if (!mission) {
    revalidatePath(`/dashboard/missions/${missionId}`)
    return
  }

  await createNotification(supabase, {
    userId: application.candidate_id,
    type: 'application_interviewing',
    title: 'Entretien proposé',
    message: `Vous êtes convié(e) à un entretien visio pour "${mission.title}".`,
    relatedId: missionId,
  })

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

  const meetingId = crypto.randomUUID()
  const roomName = `mission-${missionId}-${meetingId}`

  await supabase.from('visio_meetings').insert({
    id: meetingId,
    application_id: applicationId,
    mission_id: missionId,
    employer_id: mission.employer_id,
    candidate_id: application.candidate_id,
    room_name: roomName,
    status: 'proposed',
  })

  revalidatePath(`/dashboard/missions/${missionId}`)
}

// Rejects a single application — used both for the employer directly
// declining a 'pending' candidate, and for discarding one 'interviewing'
// candidate without hiring anyone else yet.
export async function rejectApplication(applicationId: string, missionId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: application, error } = await supabase
    .from('applications')
    .update({ status: 'rejected', responded_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select('candidate_id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await cancelPendingVisioForApplication(supabase, applicationId)

  const { data: mission } = await supabase.from('missions').select('title').eq('id', missionId).maybeSingle()

  await createNotification(supabase, {
    userId: application.candidate_id,
    type: 'application_rejected',
    title: 'Candidature refusée',
    message: mission
      ? `Votre candidature pour "${mission.title}" a été refusée.`
      : 'Votre candidature a été refusée.',
    relatedId: missionId,
  })

  revalidatePath(`/dashboard/missions/${missionId}`)
}
