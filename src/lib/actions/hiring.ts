'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createNotification } from '@/lib/notifications-helpers'
import { cancelPendingVisioForApplication } from '@/lib/visio-cleanup'

// Employer's final hiring decision. Moved here from visio.ts's
// endVisioMeeting (Sprint 3) because hiring — not the visio ending — is now
// what confirms the mission and generates the contract, since several
// candidates can be interviewed before this point.
export async function chooseCandidate(applicationId: string, missionId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: mission } = await supabase.from('missions').select('*').eq('id', missionId).maybeSingle()
  if (!mission || mission.employer_id !== user.id) {
    throw new Error('Non autorisé')
  }

  const { data: chosenApplication, error: chooseError } = await supabase
    .from('applications')
    .update({ status: 'hired', responded_at: new Date().toISOString() })
    .eq('id', applicationId)
    .eq('mission_id', missionId)
    .select('candidate_id')
    .single()

  if (chooseError) {
    throw new Error(chooseError.message)
  }

  const { data: rejectedApplications, error: rejectError } = await supabase
    .from('applications')
    .update({ status: 'rejected', responded_at: new Date().toISOString() })
    .eq('mission_id', missionId)
    .neq('id', applicationId)
    .in('status', ['pending', 'interviewing'])
    .select('id, candidate_id')

  if (rejectError) {
    throw new Error(rejectError.message)
  }

  await Promise.all(
    (rejectedApplications ?? []).map(async (rejected) => {
      await cancelPendingVisioForApplication(supabase, rejected.id)
      await createNotification(supabase, {
        userId: rejected.candidate_id,
        type: 'application_rejected',
        title: 'Candidature refusée',
        message: `Votre candidature pour "${mission.title}" a été refusée.`,
        relatedId: missionId,
      })
    })
  )

  const { error: missionUpdateError } = await supabase
    .from('missions')
    .update({ status: 'assigned' })
    .eq('id', missionId)
  if (missionUpdateError) {
    console.error('[chooseCandidate] mission status update failed', { missionId, error: missionUpdateError })
  }

  await createNotification(supabase, {
    userId: chosenApplication.candidate_id,
    type: 'application_hired',
    title: 'Vous avez été choisi(e) !',
    message: `Félicitations, vous avez été choisi(e) pour "${mission.title}".`,
    relatedId: missionId,
  })

  const { data: existingContract } = await supabase
    .from('contracts')
    .select('id')
    .eq('mission_id', missionId)
    .maybeSingle()

  if (!existingContract) {
    const { error: contractInsertError } = await supabase.from('contracts').insert({
      mission_id: missionId,
      candidate_id: chosenApplication.candidate_id,
      employer_id: mission.employer_id,
      status: 'pending',
      total_amount: mission.budget,
      payment_status: 'pending',
    })
    if (contractInsertError) {
      console.error('[chooseCandidate] contract insert failed', { missionId, error: contractInsertError })
    }

    await Promise.all([
      createNotification(supabase, {
        userId: mission.employer_id,
        type: 'contract_ready',
        title: 'Contrat prêt à signer',
        message: `Le contrat pour "${mission.title}" est prêt à être signé.`,
        relatedId: missionId,
      }),
      createNotification(supabase, {
        userId: chosenApplication.candidate_id,
        type: 'contract_ready',
        title: 'Contrat prêt à signer',
        message: `Le contrat pour "${mission.title}" est prêt à être signé.`,
        relatedId: missionId,
      }),
    ])
  }

  revalidatePath(`/dashboard/missions/${missionId}`)
}
