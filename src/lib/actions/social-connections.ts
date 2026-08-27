'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export interface SocialConnectionFormState {
  error?: string
  success?: boolean
}

// --- Employer: Connecter Pajemploi ---
export async function connectPajemploi(
  _prevState: SocialConnectionFormState,
  formData: FormData
): Promise<SocialConnectionFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const accountNumber = String(formData.get('provider_account_number') ?? '').trim()
  const dateOfBirth = String(formData.get('date_of_birth') ?? '').trim()
  const mandateAccepted = formData.get('mandate_accepted') === 'true'

  if (!accountNumber || !dateOfBirth) {
    return { error: 'Merci de compléter votre numéro Pajemploi et votre date de naissance.' }
  }
  if (!mandateAccepted) {
    return { error: 'Merci de reconnaître et accepter le mandat pour continuer.' }
  }

  const { error } = await supabase.from('employer_social_connections').upsert(
    {
      employer_id: user.id,
      provider: 'pajemploi',
      connection_status: 'pending_verification',
      provider_account_number: accountNumber,
      date_of_birth: dateOfBirth,
      mandate_accepted_at: new Date().toISOString(),
    },
    { onConflict: 'employer_id,provider' }
  )
  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

// --- Employer: Connecter CESU — "J'ai déjà un compte CESU" ---
export async function connectCesuExisting(
  _prevState: SocialConnectionFormState,
  formData: FormData
): Promise<SocialConnectionFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const accountNumber = String(formData.get('provider_account_number') ?? '').trim()
  const dateOfBirth = String(formData.get('date_of_birth') ?? '').trim()
  const mandateAccepted = formData.get('mandate_accepted') === 'true'

  if (!accountNumber || !dateOfBirth) {
    return { error: 'Merci de compléter votre numéro CESU et votre date de naissance.' }
  }
  if (!mandateAccepted) {
    return { error: 'Merci de reconnaître et accepter le mandat pour continuer.' }
  }

  const { error } = await supabase.from('employer_social_connections').upsert(
    {
      employer_id: user.id,
      provider: 'cesu',
      connection_status: 'pending_verification',
      cesu_path: 'existing',
      provider_account_number: accountNumber,
      date_of_birth: dateOfBirth,
      mandate_accepted_at: new Date().toISOString(),
      civility: null,
      first_name: null,
      last_name: null,
      phone: null,
      address: null,
    },
    { onConflict: 'employer_id,provider' }
  )
  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

// --- Employer: Connecter CESU — "Je n'ai pas de compte CESU" ---
export async function connectCesuNew(
  _prevState: SocialConnectionFormState,
  formData: FormData
): Promise<SocialConnectionFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const civility = String(formData.get('civility') ?? '').trim()
  const firstName = String(formData.get('first_name') ?? '').trim()
  const lastName = String(formData.get('last_name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim()
  const mandateAccepted = formData.get('mandate_accepted') === 'true'

  if (!civility || !firstName || !lastName || !phone || !address) {
    return { error: 'Merci de compléter tous les champs du formulaire.' }
  }
  if (!mandateAccepted) {
    return { error: 'Merci de reconnaître et accepter le mandat pour continuer.' }
  }

  const { error } = await supabase.from('employer_social_connections').upsert(
    {
      employer_id: user.id,
      provider: 'cesu',
      connection_status: 'pending_verification',
      cesu_path: 'new',
      civility,
      first_name: firstName,
      last_name: lastName,
      phone,
      address,
      mandate_accepted_at: new Date().toISOString(),
      provider_account_number: null,
      date_of_birth: null,
    },
    { onConflict: 'employer_id,provider' }
  )
  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}
