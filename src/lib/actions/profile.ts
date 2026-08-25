'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

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

  const { error } = await supabase
    .from('candidate_profiles')
    .update({
      bio: bio || null,
      skills: skills.length > 0 ? skills : null,
      years_experience: yearsExperienceRaw ? Number(yearsExperienceRaw) : null,
      hourly_rate: hourlyRateRaw ? Number(hourlyRateRaw) : null,
      employment_status: employmentStatus,
    })
    .eq('user_id', user.id)

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

  const { error } = await supabase
    .from('employer_profiles')
    .update({
      company_name: companyName || null,
      bio: bio || null,
    })
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}
