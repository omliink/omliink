'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function signContract(contractId: string, missionId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: contract } = await supabase.from('contracts').select('*').eq('id', contractId).maybeSingle()
  if (!contract || (contract.employer_id !== user.id && contract.candidate_id !== user.id)) {
    throw new Error('Non autorisé')
  }

  const isEmployer = user.id === contract.employer_id
  let nextStatus: string

  if (contract.status === 'pending') {
    nextStatus = isEmployer ? 'signed_by_employer' : 'signed_by_candidate'
  } else if (
    (contract.status === 'signed_by_employer' && !isEmployer) ||
    (contract.status === 'signed_by_candidate' && isEmployer)
  ) {
    nextStatus = 'signed'
  } else {
    // Already signed by this party, or fully signed — nothing left to do.
    return
  }

  const update: { status: string; signed_date?: string } = { status: nextStatus }
  if (nextStatus === 'signed') {
    update.signed_date = new Date().toISOString()
  }

  const { error } = await supabase.from('contracts').update(update).eq('id', contractId)
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/missions/${missionId}`)
}
