'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export interface CreateMissionState {
  error?: string
}

function parseNeedTags(formData: FormData): string[] {
  return formData.getAll('need_tags').map(String).filter(Boolean)
}

async function replaceMissionNeeds(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  missionId: string,
  categoryId: string,
  needTags: string[]
) {
  await supabase.from('mission_needs').delete().eq('mission_id', missionId)
  if (needTags.length > 0) {
    await supabase
      .from('mission_needs')
      .insert(needTags.map((needTag) => ({ mission_id: missionId, category_id: categoryId, need_tag: needTag })))
  }
}

export async function createMission(
  _prevState: CreateMissionState,
  formData: FormData
): Promise<CreateMissionState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase.from('profiles').select('is_employer').eq('id', user.id).maybeSingle()
  if (!profile?.is_employer) {
    redirect('/dashboard')
  }

  const status = formData.get('status') === 'published' ? 'published' : 'draft'
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const categoryId = String(formData.get('category_id') ?? '')
  const locationAddress = String(formData.get('location_address') ?? '').trim()
  const locationLatRaw = formData.get('location_lat')
  const locationLngRaw = formData.get('location_lng')
  const missionDate = String(formData.get('mission_date') ?? '')
  const missionTimeStart = String(formData.get('mission_time_start') ?? '')
  const missionTimeEnd = String(formData.get('mission_time_end') ?? '')
  const estimatedDurationHoursRaw = formData.get('estimated_duration_hours')
  const budgetRaw = formData.get('budget')
  const needTags = parseNeedTags(formData)

  if (title.length < 10 || title.length > 60) {
    return { error: 'Le titre doit contenir entre 10 et 60 caractères.' }
  }
  if (!categoryId) {
    return { error: 'Merci de choisir une catégorie' }
  }
  if (description && (description.length < 30 || description.length > 2000)) {
    return { error: 'La description doit contenir entre 30 et 2000 caractères.' }
  }

  const { data: mission, error } = await supabase
    .from('missions')
    .insert({
      employer_id: user.id,
      category_id: categoryId,
      title,
      description: description || null,
      location_address: locationAddress || null,
      location_lat: locationLatRaw ? Number(locationLatRaw) : null,
      location_lng: locationLngRaw ? Number(locationLngRaw) : null,
      status,
      mission_date: missionDate || null,
      mission_time_start: missionTimeStart || null,
      mission_time_end: missionTimeEnd || null,
      estimated_duration_hours: estimatedDurationHoursRaw ? Number(estimatedDurationHoursRaw) : null,
      budget: budgetRaw ? Number(budgetRaw) : null,
      urssaf_declared: false,
      visio_required: true,
      visio_completed: false,
      max_candidates: 5,
    })
    .select('id')
    .single()

  if (error || !mission) {
    return { error: error?.message ?? 'Une erreur est survenue lors de la création de la mission' }
  }

  if (needTags.length > 0) {
    await replaceMissionNeeds(supabase, mission.id, categoryId, needTags)
  }

  redirect(`/dashboard/missions/${mission.id}?created=${status}`)
}

export interface UpdateMissionState {
  error?: string
  success?: boolean
}

export async function updateMission(
  missionId: string,
  _prevState: UpdateMissionState,
  formData: FormData
): Promise<UpdateMissionState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: mission } = await supabase.from('missions').select('employer_id').eq('id', missionId).maybeSingle()
  if (!mission || mission.employer_id !== user.id) {
    return { error: 'Non autorisé' }
  }

  const { data: hiredApplication } = await supabase
    .from('applications')
    .select('id')
    .eq('mission_id', missionId)
    .eq('status', 'hired')
    .maybeSingle()
  if (hiredApplication) {
    return { error: 'Non modifiable après embauche' }
  }

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const categoryId = String(formData.get('category_id') ?? '')
  const locationAddress = String(formData.get('location_address') ?? '').trim()
  const locationLatRaw = formData.get('location_lat')
  const locationLngRaw = formData.get('location_lng')
  const missionDate = String(formData.get('mission_date') ?? '')
  const missionTimeStart = String(formData.get('mission_time_start') ?? '')
  const missionTimeEnd = String(formData.get('mission_time_end') ?? '')
  const estimatedDurationHoursRaw = formData.get('estimated_duration_hours')
  const budgetRaw = formData.get('budget')
  const needTags = parseNeedTags(formData)

  if (title.length < 10 || title.length > 60) {
    return { error: 'Le titre doit contenir entre 10 et 60 caractères.' }
  }
  if (!categoryId) {
    return { error: 'Merci de choisir une catégorie' }
  }
  if (description && (description.length < 30 || description.length > 2000)) {
    return { error: 'La description doit contenir entre 30 et 2000 caractères.' }
  }

  const { error } = await supabase
    .from('missions')
    .update({
      category_id: categoryId,
      title,
      description: description || null,
      location_address: locationAddress || null,
      location_lat: locationLatRaw ? Number(locationLatRaw) : null,
      location_lng: locationLngRaw ? Number(locationLngRaw) : null,
      mission_date: missionDate || null,
      mission_time_start: missionTimeStart || null,
      mission_time_end: missionTimeEnd || null,
      estimated_duration_hours: estimatedDurationHoursRaw ? Number(estimatedDurationHoursRaw) : null,
      budget: budgetRaw ? Number(budgetRaw) : null,
    })
    .eq('id', missionId)

  if (error) {
    return { error: error.message }
  }

  await replaceMissionNeeds(supabase, missionId, categoryId, needTags)

  revalidatePath(`/dashboard/missions/${missionId}`)
  redirect(`/dashboard/missions/${missionId}`)
}

// Pause/reactivate toggle. Only a 'published' mission can be paused, and a
// 'paused' mission always reactivates back to 'published' — the only status
// that ever leads into 'paused', so there's no other prior state to
// remember or restore.
export async function toggleMissionPause(missionId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: mission } = await supabase.from('missions').select('employer_id, status').eq('id', missionId).maybeSingle()
  if (!mission || mission.employer_id !== user.id) {
    throw new Error('Non autorisé')
  }

  let nextStatus: string | null = null
  if (mission.status === 'published') nextStatus = 'paused'
  else if (mission.status === 'paused') nextStatus = 'published'

  if (!nextStatus) {
    throw new Error('Cette mission ne peut pas être mise en pause dans son état actuel')
  }

  const { error } = await supabase.from('missions').update({ status: nextStatus }).eq('id', missionId)
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/missions/${missionId}`)
}
