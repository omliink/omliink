'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export interface CreateMissionState {
  error?: string
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
  const missionDate = String(formData.get('mission_date') ?? '')
  const missionTimeStart = String(formData.get('mission_time_start') ?? '')
  const missionTimeEnd = String(formData.get('mission_time_end') ?? '')
  const estimatedDurationHoursRaw = formData.get('estimated_duration_hours')
  const budgetRaw = formData.get('budget')

  if (!title) {
    return { error: 'Le titre de la mission est requis' }
  }
  if (!categoryId) {
    return { error: 'Merci de choisir une catégorie' }
  }

  const { data: mission, error } = await supabase
    .from('missions')
    .insert({
      employer_id: user.id,
      category_id: categoryId,
      title,
      description: description || null,
      location_address: locationAddress || null,
      location_lat: null,
      location_lng: null,
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

  redirect(`/dashboard?created=${status}`)
}
