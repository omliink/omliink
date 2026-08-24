'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { AccessToken } from 'livekit-server-sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createNotification } from '@/lib/notifications-helpers'
import { parseVisioTimestamp } from '@/lib/visio-time'

const MAX_RESCHEDULES = 3
const JOIN_WINDOW_MINUTES_BEFORE = 10
const NO_SHOW_WINDOW_MINUTES_AFTER = 15

export interface VisioActionState {
  error?: string
  success?: boolean
}

export async function proposeVisioSlot(
  meetingId: string,
  missionId: string,
  _prevState: VisioActionState,
  formData: FormData
): Promise<VisioActionState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: meeting } = await supabase.from('visio_meetings').select('*').eq('id', meetingId).maybeSingle()
  if (!meeting) {
    return { error: 'Visioconférence introuvable' }
  }
  if (meeting.employer_id !== user.id && meeting.candidate_id !== user.id) {
    return { error: 'Non autorisé' }
  }

  const proposedDateRaw = String(formData.get('proposed_date') ?? '')
  if (!proposedDateRaw) {
    return { error: 'Merci de choisir une date et une heure' }
  }

  const proposedDate = new Date(proposedDateRaw)
  if (Number.isNaN(proposedDate.getTime())) {
    return { error: 'Date invalide' }
  }
  if (proposedDate.getTime() < Date.now()) {
    return { error: 'La date doit être dans le futur' }
  }

  const isReschedule = meeting.proposed_date !== null
  if (isReschedule && meeting.reschedule_count >= MAX_RESCHEDULES) {
    return { error: 'Nombre maximum de reports atteint (3)' }
  }

  const { error } = await supabase
    .from('visio_meetings')
    .update({
      proposed_date: proposedDate.toISOString(),
      status: 'proposed',
      reschedule_count: isReschedule ? meeting.reschedule_count + 1 : meeting.reschedule_count,
    })
    .eq('id', meetingId)

  if (error) {
    return { error: error.message }
  }

  const otherUserId = user.id === meeting.employer_id ? meeting.candidate_id : meeting.employer_id
  await createNotification(supabase, {
    userId: otherUserId,
    type: 'visio_proposed',
    title: isReschedule ? 'Nouveau créneau de visio proposé' : 'Créneau de visio proposé',
    message: `Un créneau de visioconférence a été proposé pour le ${proposedDate.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}.`,
    relatedId: missionId,
  })

  revalidatePath(`/dashboard/missions/${missionId}`)
  return { success: true }
}

export async function acceptVisioSlot(meetingId: string, missionId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: meeting } = await supabase.from('visio_meetings').select('*').eq('id', meetingId).maybeSingle()
  if (!meeting || (meeting.employer_id !== user.id && meeting.candidate_id !== user.id)) {
    throw new Error('Non autorisé')
  }
  if (!meeting.proposed_date) {
    throw new Error('Aucun créneau proposé')
  }

  const { error } = await supabase
    .from('visio_meetings')
    .update({ status: 'accepted', scheduled_date: meeting.proposed_date })
    .eq('id', meetingId)

  if (error) {
    throw new Error(error.message)
  }

  const otherUserId = user.id === meeting.employer_id ? meeting.candidate_id : meeting.employer_id
  await createNotification(supabase, {
    userId: otherUserId,
    type: 'visio_accepted',
    title: 'Créneau de visio confirmé',
    message: `Le créneau du ${parseVisioTimestamp(meeting.proposed_date).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })} a été confirmé.`,
    relatedId: missionId,
  })

  revalidatePath(`/dashboard/missions/${missionId}`)
}

export interface JoinTokenResult {
  token?: string
  livekitUrl?: string
  roomName?: string
  error?: string
}

export async function generateVisioToken(meetingId: string): Promise<JoinTokenResult> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: meeting } = await supabase.from('visio_meetings').select('*').eq('id', meetingId).maybeSingle()
  if (!meeting) {
    return { error: 'Visioconférence introuvable' }
  }
  if (meeting.employer_id !== user.id && meeting.candidate_id !== user.id) {
    return { error: 'Non autorisé' }
  }
  if (meeting.status === 'completed') {
    return { error: 'Cette visioconférence est terminée' }
  }
  if (meeting.status !== 'accepted' && meeting.status !== 'in_progress') {
    return { error: "Le créneau n'a pas encore été confirmé par les deux parties" }
  }
  if (!meeting.scheduled_date) {
    return { error: 'Aucune date planifiée' }
  }

  const scheduled = parseVisioTimestamp(meeting.scheduled_date).getTime()
  const minutesUntil = (scheduled - Date.now()) / 60000

  if (meeting.status !== 'in_progress' && minutesUntil > JOIN_WINDOW_MINUTES_BEFORE) {
    return {
      error: `Trop tôt : rendez-vous à ${parseVisioTimestamp(meeting.scheduled_date).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`,
    }
  }
  if (meeting.status !== 'in_progress' && minutesUntil < -NO_SHOW_WINDOW_MINUTES_AFTER) {
    return { error: 'Le créneau est dépassé de plus de 15 minutes. Vous pouvez signaler une absence.' }
  }

  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const livekitUrl = process.env.LIVEKIT_URL
  if (!apiKey || !apiSecret || !livekitUrl) {
    return { error: 'Configuration LiveKit manquante' }
  }

  const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).maybeSingle()

  const accessToken = new AccessToken(apiKey, apiSecret, {
    identity: user.id,
    name: profile?.full_name ?? profile?.email ?? 'Utilisateur',
  })
  accessToken.addGrant({ roomJoin: true, room: meeting.room_name, canPublish: true, canSubscribe: true })
  const token = await accessToken.toJwt()

  if (meeting.status === 'accepted') {
    await supabase
      .from('visio_meetings')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', meetingId)
      .is('started_at', null)
  }

  return { token, livekitUrl, roomName: meeting.room_name }
}

export async function endVisioMeeting(meetingId: string, missionId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: meeting } = await supabase.from('visio_meetings').select('*').eq('id', meetingId).maybeSingle()
  if (!meeting || (meeting.employer_id !== user.id && meeting.candidate_id !== user.id)) {
    throw new Error('Non autorisé')
  }
  if (meeting.status === 'completed') {
    return
  }

  const endedAt = new Date()
  const startedAt = meeting.started_at ? parseVisioTimestamp(meeting.started_at) : endedAt
  const durationMinutes = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))

  const { error } = await supabase
    .from('visio_meetings')
    .update({ status: 'completed', ended_at: endedAt.toISOString(), duration_minutes: durationMinutes })
    .eq('id', meetingId)

  if (error) {
    throw new Error(error.message)
  }

  const { data: mission } = await supabase.from('missions').select('*').eq('id', missionId).maybeSingle()
  if (!mission) {
    revalidatePath(`/dashboard/missions/${missionId}`)
    return
  }

  const { error: missionUpdateError } = await supabase
    .from('missions')
    .update({ status: 'assigned' })
    .eq('id', missionId)
  if (missionUpdateError) {
    console.error('[endVisioMeeting] mission status update failed', { missionId, error: missionUpdateError })
  }

  await Promise.all([
    createNotification(supabase, {
      userId: meeting.employer_id,
      type: 'visio_completed',
      title: 'Visio terminée, mission confirmée',
      message: `La visioconférence pour "${mission.title}" est terminée. La mission est confirmée.`,
      relatedId: missionId,
    }),
    createNotification(supabase, {
      userId: meeting.candidate_id,
      type: 'visio_completed',
      title: 'Visio terminée, mission confirmée',
      message: `La visioconférence pour "${mission.title}" est terminée. La mission est confirmée.`,
      relatedId: missionId,
    }),
  ])

  const { data: existingContract } = await supabase
    .from('contracts')
    .select('id')
    .eq('mission_id', missionId)
    .maybeSingle()

  if (!existingContract) {
    const { error: contractInsertError } = await supabase.from('contracts').insert({
      mission_id: missionId,
      candidate_id: meeting.candidate_id,
      employer_id: meeting.employer_id,
      status: 'pending',
      total_amount: mission.budget,
      payment_status: 'pending',
    })
    if (contractInsertError) {
      console.error('[endVisioMeeting] contract insert failed', { missionId, error: contractInsertError })
    }

    await Promise.all([
      createNotification(supabase, {
        userId: meeting.employer_id,
        type: 'contract_ready',
        title: 'Contrat prêt à signer',
        message: `Le contrat pour "${mission.title}" est prêt à être signé.`,
        relatedId: missionId,
      }),
      createNotification(supabase, {
        userId: meeting.candidate_id,
        type: 'contract_ready',
        title: 'Contrat prêt à signer',
        message: `Le contrat pour "${mission.title}" est prêt à être signé.`,
        relatedId: missionId,
      }),
    ])
  }

  revalidatePath(`/dashboard/missions/${missionId}`)
}

export async function markNoShow(meetingId: string, missionId: string, party: 'employer' | 'candidate') {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: meeting } = await supabase.from('visio_meetings').select('*').eq('id', meetingId).maybeSingle()
  if (!meeting || (meeting.employer_id !== user.id && meeting.candidate_id !== user.id)) {
    throw new Error('Non autorisé')
  }

  const status = party === 'employer' ? 'no_show_employer' : 'no_show_candidate'
  const { error } = await supabase.from('visio_meetings').update({ status }).eq('id', meetingId)
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/missions/${missionId}`)
}
