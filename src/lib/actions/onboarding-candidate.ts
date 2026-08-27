'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export interface OnboardingResult {
  error?: string
  success?: boolean
}

interface LanguageEntry {
  language: string
  is_native: boolean
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

// Single submission at the end of step 8 (bio) — creates the profiles row,
// the fully-populated candidate_profiles row (including the mandatory
// photo, uploaded here), and the four child tables in one pass. The wizard
// hard-navigates to /dashboard?onboarded=1 right after this succeeds, where
// step 9's suggested missions are computed and shown — see
// getSuggestedMissionsForCandidate in dashboard-data.ts. That's not just
// convenience: any 'use server' action call (this one included) triggers an
// implicit refresh of the current route after it resolves, and this route
// (/dashboard/onboarding) shares app/dashboard/layout.tsx's "kick out once
// onboarded" redirect with /dashboard — so rendering step 9 in place here
// would get redirected out from under itself the moment the profile row
// above exists.
export async function submitCandidateOnboarding(formData: FormData): Promise<OnboardingResult> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/auth/login')
  }

  // --- step 1 ---
  const gender = String(formData.get('gender') ?? '').trim()
  const firstName = String(formData.get('first_name') ?? '').trim()
  const lastName = String(formData.get('last_name') ?? '').trim()
  const locationAddress = String(formData.get('location_address') ?? '').trim()
  const locationLatRaw = formData.get('location_lat')
  const locationLngRaw = formData.get('location_lng')
  const locationLat = locationLatRaw ? Number(locationLatRaw) : NaN
  const locationLng = locationLngRaw ? Number(locationLngRaw) : NaN

  if (!gender || !firstName || !lastName || !locationAddress || Number.isNaN(locationLat) || Number.isNaN(locationLng)) {
    return { error: 'Merci de compléter toutes les informations de l’étape 1.' }
  }

  // --- step 2 ---
  const birthDate = String(formData.get('birth_date') ?? '').trim()
  const birthPlace = String(formData.get('birth_place') ?? '').trim()
  const nativeLanguage = String(formData.get('native_language') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const phoneVisible = formData.get('phone_visible') === 'true'
  const languages = parseJsonArray<LanguageEntry>(formData.get('languages_json'))

  if (!birthDate || !birthPlace || !nativeLanguage || !phone) {
    return { error: 'Merci de compléter toutes les informations de l’étape 2.' }
  }

  // --- step 3 ---
  const photoFile = formData.get('photo')
  if (!(photoFile instanceof File) || photoFile.size === 0) {
    return { error: 'Une photo de profil est obligatoire.' }
  }

  // --- step 4 ---
  const serviceCategoryIds = formData.getAll('service_categories').map(String).filter(Boolean)
  if (serviceCategoryIds.length === 0) {
    return { error: 'Merci de sélectionner au moins un type de service.' }
  }

  // --- step 5 (optional) ---
  const supplementCodes = formData.getAll('supplements').map(String).filter(Boolean)

  // --- step 6 ---
  const experienceLevel = String(formData.get('experience_level') ?? '').trim()
  const hourlyRateRaw = formData.get('hourly_rate')
  const hourlyRate = hourlyRateRaw ? Number(hourlyRateRaw) : NaN
  const employmentStatus = String(formData.get('employment_status') ?? '').trim()
  if (!experienceLevel || Number.isNaN(hourlyRate) || hourlyRate <= 0 || !employmentStatus) {
    return { error: 'Merci de compléter votre expérience et votre tarif.' }
  }

  // --- step 7 (optional) ---
  const skills = parseJsonArray<{ category_id: string; skill_tag: string }>(formData.get('skills_json'))

  // --- step 8 ---
  const bioTitle = String(formData.get('bio_title') ?? '').trim()
  const bioText = String(formData.get('bio_text') ?? '').trim()
  if (bioTitle.length < 10 || bioTitle.length > 60) {
    return { error: 'Le titre doit contenir entre 10 et 60 caractères.' }
  }
  if (bioText.length < 30 || bioText.length > 2000) {
    return { error: 'La présentation doit contenir entre 30 et 2000 caractères.' }
  }

  // --- upload photo ---
  // No upsert: each path is timestamp-suffixed and therefore always unique,
  // and upsert would force an ON CONFLICT DO UPDATE codepath that needs a
  // SELECT policy on storage.objects to evaluate the conflict target — one
  // this bucket intentionally doesn't have.
  const photoPath = `${user.id}/${Date.now()}-${photoFile.name}`
  const { error: uploadError } = await supabase.storage.from('candidate-photos').upload(photoPath, photoFile)
  if (uploadError) {
    return { error: `Échec de l'upload de la photo : ${uploadError.message}` }
  }
  const {
    data: { publicUrl: photoUrl },
  } = supabase.storage.from('candidate-photos').getPublicUrl(photoPath)

  // --- profiles ---
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: `${firstName} ${lastName}`.trim(),
    phone,
    is_employer: false,
    is_candidate: true,
    is_verified: false,
    verification_type: null,
    account_status: 'active',
    avatar_url: null,
  })
  if (profileError) {
    return { error: profileError.message }
  }

  // --- candidate_profiles ---
  const { error: candidateProfileError } = await supabase.from('candidate_profiles').upsert(
    {
      user_id: user.id,
      bio: null,
      years_experience: null,
      skills: null,
      languages: null,
      hourly_rate: hourlyRate,
      availability_status: 'available',
      employment_status: employmentStatus,
      location_address: locationAddress,
      location_lat: locationLat,
      location_lng: locationLng,
      radius_km: 20,
      rating: 0,
      total_missions_completed: 0,
      response_rate: 0,
      no_show_count: 0,
      gender,
      birth_date: birthDate,
      birth_place: birthPlace,
      native_language: nativeLanguage,
      phone_visible: phoneVisible,
      photo_url: photoUrl,
      experience_level: experienceLevel,
      bio_title: bioTitle,
      bio_text: bioText,
      verification_status: 'unverified',
      verification_document_url: null,
    },
    { onConflict: 'user_id' }
  )
  if (candidateProfileError) {
    return { error: candidateProfileError.message }
  }

  // --- child tables: delete-then-insert so a resubmission stays idempotent ---
  await supabase.from('candidate_languages').delete().eq('candidate_id', user.id)
  if (languages.length > 0) {
    await supabase.from('candidate_languages').insert(
      languages
        .filter((entry) => entry.language && entry.language.trim())
        .map((entry) => ({ candidate_id: user.id, language: entry.language.trim(), is_native: Boolean(entry.is_native) }))
    )
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

  // No revalidatePath here — see the comment above this function. The
  // client does a hard navigation right after this returns, which always
  // reads fully fresh data on its own.
  return { success: true }
}
