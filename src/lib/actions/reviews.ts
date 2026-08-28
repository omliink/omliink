'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-service'
import { createNotification } from '@/lib/notifications-helpers'

export interface ReviewFormState {
  error?: string
  success?: boolean
}

// Recomputes the reviewed person's aggregate rating (simple average across
// every review they've received) via service_role, since
// candidate_profiles.rating/employer_profiles.rating are protected by the
// privileged-column triggers from the RLS audit sprint. Writes to whichever
// of the two profile tables actually applies — a profile is never both.
async function recomputeAggregateRating(service: ReturnType<typeof createServiceRoleClient>, toUserId: string) {
  const [{ data: reviews }, { data: toProfile }] = await Promise.all([
    service.from('reviews').select('rating').eq('to_user_id', toUserId),
    service.from('profiles').select('is_employer, is_candidate').eq('id', toUserId).maybeSingle(),
  ])

  const ratings = (reviews ?? []).map((r) => r.rating)
  if (ratings.length === 0) return
  const average = Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 100) / 100

  if (toProfile?.is_candidate) {
    await service.from('candidate_profiles').update({ rating: average }).eq('user_id', toUserId)
  }
  if (toProfile?.is_employer) {
    await service.from('employer_profiles').update({ rating: average }).eq('user_id', toUserId)
  }
}

export async function submitReview(
  missionId: string,
  toUserId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const rating = Number(formData.get('rating'))
  const comment = String(formData.get('comment') ?? '').trim()

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: 'Merci de choisir une note entre 1 et 5 étoiles.' }
  }

  // No pre-check of mission/participant state here — the RLS policy
  // (reviews_insert_valid_participant, is_valid_mission_review) is the
  // actual authority: mission completed, from/to are really the employer
  // and hired candidate of this mission. A rejected insert just surfaces
  // as a generic error below rather than a duplicated business-rule check.
  const { error } = await supabase.from('reviews').insert({
    mission_id: missionId,
    from_user_id: user.id,
    to_user_id: toUserId,
    rating,
    comment: comment || null,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Vous avez déjà laissé un avis pour cette mission.' }
    return { error: "Impossible d'enregistrer cet avis." }
  }

  const service = createServiceRoleClient()
  await recomputeAggregateRating(service, toUserId)

  await createNotification(supabase, {
    userId: toUserId,
    type: 'review_received',
    title: 'Nouvel avis reçu',
    message: `Vous avez reçu un nouvel avis (${rating}/5) pour une mission terminée.`,
    relatedId: missionId,
  })

  revalidatePath(`/dashboard/missions/${missionId}`)
  return { success: true }
}
