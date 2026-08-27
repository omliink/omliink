'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Database } from '@/types/database.types'

type CandidateProfileUpdate = Database['public']['Tables']['candidate_profiles']['Update']

export interface ProfileFormState {
  error?: string
  success?: boolean
}

function parseJsonArray<T>(raw: FormDataEntryValue | null): T[] {
  if (typeof raw !== 'string' || !raw.trim()) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

// --- Candidate: Photo ---
export async function updateCandidatePhoto(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const photoFile = formData.get('photo')
  if (!(photoFile instanceof File) || photoFile.size === 0) {
    return { error: 'Merci de sélectionner une photo.' }
  }

  const photoPath = `${user.id}/${Date.now()}-${photoFile.name}`
  const { error: uploadError } = await supabase.storage.from('candidate-photos').upload(photoPath, photoFile)
  if (uploadError) {
    return { error: `Échec de l'upload : ${uploadError.message}` }
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from('candidate-photos').getPublicUrl(photoPath)

  const { error } = await supabase.from('candidate_profiles').update({ photo_url: publicUrl }).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

// --- Candidate: Mes informations personnelles ---
export async function updateCandidateInfo(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const gender = String(formData.get('gender') ?? '').trim()
  const firstName = String(formData.get('first_name') ?? '').trim()
  const lastName = String(formData.get('last_name') ?? '').trim()
  const birthDate = String(formData.get('birth_date') ?? '').trim()
  const birthPlace = String(formData.get('birth_place') ?? '').trim()
  const nativeLanguage = String(formData.get('native_language') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const phoneVisible = formData.get('phone_visible') === 'true'
  const languages = parseJsonArray<{ language: string; is_native: boolean }>(formData.get('languages_json'))

  if (!gender || !firstName || !lastName) {
    return { error: 'Merci de compléter le sexe, le prénom et le nom.' }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: `${firstName} ${lastName}`.trim(), phone: phone || null })
    .eq('id', user.id)
  if (profileError) return { error: profileError.message }

  const candidatePayload: CandidateProfileUpdate = {
    gender,
    birth_date: birthDate || null,
    birth_place: birthPlace || null,
    native_language: nativeLanguage || null,
    phone_visible: phoneVisible,
  }

  // Same rule as onboarding: the BAN autocomplete only submits a matching
  // lat/lng pair when a suggestion was actually selected — no selection
  // means "leave the previously saved location untouched".
  const locationAddressRaw = String(formData.get('location_address') ?? '').trim()
  const locationLatRaw = formData.get('location_lat')
  const locationLngRaw = formData.get('location_lng')
  if (locationLatRaw && locationLngRaw) {
    const lat = Number(locationLatRaw)
    const lng = Number(locationLngRaw)
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      candidatePayload.location_address = locationAddressRaw || null
      candidatePayload.location_lat = lat
      candidatePayload.location_lng = lng
    }
  }

  const radiusKmRaw = formData.get('radius_km')
  if (radiusKmRaw) {
    const radiusKm = Number(radiusKmRaw)
    if (!Number.isNaN(radiusKm)) {
      candidatePayload.radius_km = radiusKm
    }
  }

  const { error: candidateError } = await supabase
    .from('candidate_profiles')
    .update(candidatePayload)
    .eq('user_id', user.id)
  if (candidateError) return { error: candidateError.message }

  await supabase.from('candidate_languages').delete().eq('candidate_id', user.id)
  if (languages.length > 0) {
    await supabase.from('candidate_languages').insert(
      languages
        .filter((entry) => entry.language && entry.language.trim())
        .map((entry) => ({ candidate_id: user.id, language: entry.language.trim(), is_native: Boolean(entry.is_native) }))
    )
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

// --- Candidate: Statut ---
export async function updateCandidateStatus(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const employmentStatus = String(formData.get('employment_status') ?? '')
  if (!['particulier_employeur', 'auto_entrepreneur'].includes(employmentStatus)) {
    return { error: 'Merci de choisir un statut' }
  }

  const { error } = await supabase
    .from('candidate_profiles')
    .update({ employment_status: employmentStatus })
    .eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

// --- Candidate: Services et compétences ---
export async function updateCandidateServices(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const serviceCategoryIds = formData.getAll('service_categories').map(String).filter(Boolean)
  const supplementCodes = formData.getAll('supplements').map(String).filter(Boolean)
  const skills = parseJsonArray<{ category_id: string; skill_tag: string }>(formData.get('skills_json'))

  if (serviceCategoryIds.length === 0) {
    return { error: 'Merci de sélectionner au moins un type de service.' }
  }

  await supabase.from('candidate_service_types').delete().eq('candidate_id', user.id)
  await supabase
    .from('candidate_service_types')
    .insert(serviceCategoryIds.map((categoryId) => ({ candidate_id: user.id, category_id: categoryId })))

  await supabase.from('candidate_supplements').delete().eq('candidate_id', user.id)
  if (supplementCodes.length > 0) {
    await supabase
      .from('candidate_supplements')
      .insert(supplementCodes.map((code) => ({ candidate_id: user.id, supplement_code: code })))
  }

  await supabase.from('candidate_skills').delete().eq('candidate_id', user.id)
  if (skills.length > 0) {
    await supabase.from('candidate_skills').insert(
      skills
        .filter((entry) => entry.category_id && entry.skill_tag)
        .map((entry) => ({ candidate_id: user.id, category_id: entry.category_id, skill_tag: entry.skill_tag }))
    )
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

// --- Candidate: Expérience et tarif ---
export async function updateCandidateExperience(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const experienceLevel = String(formData.get('experience_level') ?? '').trim()
  const hourlyRateRaw = formData.get('hourly_rate')
  const hourlyRate = hourlyRateRaw ? Number(hourlyRateRaw) : NaN

  if (!experienceLevel || Number.isNaN(hourlyRate) || hourlyRate <= 0) {
    return { error: 'Merci de compléter votre expérience et votre tarif.' }
  }

  const { error } = await supabase
    .from('candidate_profiles')
    .update({ experience_level: experienceLevel, hourly_rate: hourlyRate })
    .eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

// --- Candidate: Bio / présentation ---
export async function updateCandidateBio(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const bioTitle = String(formData.get('bio_title') ?? '').trim()
  const bioText = String(formData.get('bio_text') ?? '').trim()

  if (bioTitle.length < 10 || bioTitle.length > 60) {
    return { error: 'Le titre doit contenir entre 10 et 60 caractères.' }
  }
  if (bioText.length < 30 || bioText.length > 2000) {
    return { error: 'La présentation doit contenir entre 30 et 2000 caractères.' }
  }

  const { error } = await supabase
    .from('candidate_profiles')
    .update({ bio_title: bioTitle, bio_text: bioText })
    .eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

// --- Shared: Mot de passe ---
const hasMinLength = (value: string) => value.length >= 12
const hasUppercase = (value: string) => /[A-Z]/.test(value)
const hasDigit = (value: string) => /[0-9]/.test(value)

export async function updatePassword(_prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')

  if (!hasMinLength(password) || !hasUppercase(password) || !hasDigit(password)) {
    return { error: 'Le mot de passe ne respecte pas les critères (12 caractères, 1 majuscule, 1 chiffre).' }
  }
  if (password !== confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  return { success: true }
}

// --- Employer: Photo ---
export async function updateEmployerPhoto(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const photoFile = formData.get('photo')
  if (!(photoFile instanceof File) || photoFile.size === 0) {
    return { error: 'Merci de sélectionner une photo.' }
  }

  const photoPath = `${user.id}/${Date.now()}-${photoFile.name}`
  const { error: uploadError } = await supabase.storage.from('employer-photos').upload(photoPath, photoFile)
  if (uploadError) {
    return { error: `Échec de l'upload : ${uploadError.message}` }
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from('employer-photos').getPublicUrl(photoPath)

  const { error } = await supabase.from('employer_profiles').update({ photo_url: publicUrl }).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

// --- Employer: Mes informations ---
export async function updateEmployerInfo(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const companyName = String(formData.get('company_name') ?? '').trim()
  const nationality = String(formData.get('nationality') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()

  const { error: profileError } = await supabase.from('profiles').update({ phone: phone || null }).eq('id', user.id)
  if (profileError) return { error: profileError.message }

  const { error } = await supabase
    .from('employer_profiles')
    .update({ company_name: companyName || null, nationality: nationality || null })
    .eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

// --- Employer: Bio / présentation ---
export async function updateEmployerBio(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const bio = String(formData.get('bio') ?? '').trim()

  const { error } = await supabase.from('employer_profiles').update({ bio: bio || null }).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}
