'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

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

  const { error } = await supabase
    .from('applications')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', applicationId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/missions/${missionId}`)
}
