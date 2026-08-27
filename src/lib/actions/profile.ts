'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Database } from '@/types/database.types'

type CandidateProfileUpdate = Database['public']['Tables']['candidate_profiles']['Update']
type EmployerProfileUpdate = Database['public']['Tables']['employer_profiles']['Update']

export interface ProfileFormState {
  error?: string
  success?: boolean
}

const EMPLOYMENT_STATUSES = ['particulier_employeur', 'auto_entrepreneur']

export async function updateCandidateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const bio = String(formData.get('bio') ?? '').trim()
  const skillsRaw = String(formData.get('skills') ?? '').trim()
  const yearsExperienceRaw = formData.get('years_experience')
  const hourlyRateRaw = formData.get('hourly_rate')
  const employmentStatus = String(formData.get('employment_status') ?? '')

  if (!EMPLOYMENT_STATUSES.includes(employmentStatus)) {
    return { error: 'Merci de choisir un statut' }
  }

  const skills = skillsRaw
    ? skillsRaw
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
    : []

  const updatePayload: CandidateProfileUpdate = {
    bio: bio || null,
    skills: skills.length > 0 ? skills : null,
    years_experience: yearsExperienceRaw ? Number(yearsExperienceRaw) : null,
    hourly_rate: hourlyRateRaw ? Number(hourlyRateRaw) : null,
    employment_status: employmentStatus,
  }

  // The address autocomplete only submits valid lat/lng (and a matching
  // formatted label) when a suggestion was actually selected — an
  // empty/unresolved address means "leave the previously saved location
  // untouched" rather than "clear it".
  const locationAddressRaw = String(formData.get('location_address') ?? '').trim()
  const locationLatRaw = formData.get('location_lat')
  const locationLngRaw = formData.get('location_lng')
  if (locationLatRaw && locationLngRaw) {
    const lat = Number(locationLatRaw)
    const lng = Number(locationLngRaw)
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      updatePayload.location_address = locationAddressRaw || null
      updatePayload.location_lat = lat
      updatePayload.location_lng = lng
    }
  }

  const radiusKmRaw = formData.get('radius_km')
  if (radiusKmRaw) {
    const radiusKm = Number(radiusKmRaw)
    if (!Number.isNaN(radiusKm)) {
      updatePayload.radius_km = radiusKm
    }
  }

  const { error } = await supabase.from('candidate_profiles').update(updatePayload).eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function updateEmployerProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const companyName = String(formData.get('company_name') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()
  const nationality = String(formData.get('nationality') ?? '').trim()

  const updatePayload: EmployerProfileUpdate = {
    company_name: companyName || null,
    bio: bio || null,
    nationality: nationality || null,
  }

  // Optional — the field is only present when the employer chose a new
  // file this submission; leaving it out entirely otherwise keeps
  // whatever photo_url is already saved untouched.
  const photoFile = formData.get('photo')
  if (photoFile instanceof File && photoFile.size > 0) {
    const photoPath = `${user.id}/${Date.now()}-${photoFile.name}`
    const { error: uploadError } = await supabase.storage.from('employer-photos').upload(photoPath, photoFile)
    if (uploadError) {
      return { error: `Échec de l'upload de la photo : ${uploadError.message}` }
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from('employer-photos').getPublicUrl(photoPath)
    updatePayload.photo_url = publicUrl
  }

  const { error } = await supabase.from('employer_profiles').update(updatePayload).eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}
