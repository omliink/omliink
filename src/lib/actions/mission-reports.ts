'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { MISSION_REPORT_REASON_OPTIONS } from '@/lib/mission-report-reasons'

export interface ReportMissionState {
  error?: string
  success?: boolean
}

const VALID_REASONS = new Set<string>(MISSION_REPORT_REASON_OPTIONS.map((option) => option.value))

export async function reportMission(
  missionId: string,
  _prevState: ReportMissionState,
  formData: FormData
): Promise<ReportMissionState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const reason = String(formData.get('reason') ?? '')
  const details = String(formData.get('details') ?? '').trim()

  if (!VALID_REASONS.has(reason)) {
    return { error: 'Merci de choisir un motif.' }
  }

  const { error } = await supabase.from('mission_reports').insert({
    mission_id: missionId,
    reporter_id: user.id,
    reason,
    details: details || null,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Vous avez déjà signalé cette mission.' }
    return { error: error.message }
  }

  revalidatePath(`/dashboard/missions/${missionId}`)
  return { success: true }
}
