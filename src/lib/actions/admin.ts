'use server'

import { revalidatePath } from 'next/cache'
import { ADMIN_BASE_PATH, requireAdminUser } from '@/lib/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createNotification } from '@/lib/notifications-helpers'
import { MISSION_REPORT_REASON_LABELS } from '@/lib/mission-report-reasons'

export interface AdminActionState {
  error?: string
  success?: boolean
}

const NOT_AUTHORIZED: AdminActionState = { error: 'Non autorisé.' }

// Short-lived on purpose (5 min) — this URL, once generated, is usable by
// anyone who has it for its whole lifetime; a long expiry would turn one
// accidental paste/log/share into a standing leak of an identity document.
const SIGNED_URL_TTL_SECONDS = 300

// --- Vérifications candidats ---

export async function getVerificationDocumentSignedUrl(
  candidateId: string
): Promise<{ url?: string; error?: string }> {
  const admin = await requireAdminUser()
  if (!admin) return { error: 'Non autorisé.' }

  const { data: candidateProfile } = await admin.supabase
    .from('candidate_profiles')
    .select('verification_document_url')
    .eq('user_id', candidateId)
    .maybeSingle()

  if (!candidateProfile?.verification_document_url) {
    return { error: 'Aucun document de vérification pour ce candidat.' }
  }

  const { data, error } = await admin.supabase.storage
    .from('verification-documents')
    .createSignedUrl(candidateProfile.verification_document_url, SIGNED_URL_TTL_SECONDS)

  if (error || !data?.signedUrl) {
    return { error: error?.message ?? "Impossible de générer l'URL du document." }
  }

  return { url: data.signedUrl }
}

export async function approveVerification(candidateId: string): Promise<AdminActionState> {
  const admin = await requireAdminUser()
  if (!admin) return NOT_AUTHORIZED

  const { error } = await admin.supabase
    .from('candidate_profiles')
    .update({ verification_status: 'verified' })
    .eq('user_id', candidateId)
  if (error) return { error: error.message }

  await createNotification(admin.supabase, {
    userId: candidateId,
    type: 'verification_approved',
    title: 'Profil vérifié',
    message: 'Votre profil a été vérifié. Le badge de vérification est maintenant visible sur votre profil.',
  })

  revalidatePath(`${ADMIN_BASE_PATH}/verifications`)
  revalidatePath(ADMIN_BASE_PATH)
  return { success: true }
}

export async function rejectVerification(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdminUser()
  if (!admin) return NOT_AUTHORIZED

  const candidateId = String(formData.get('candidate_id') ?? '')
  const reason = String(formData.get('reason') ?? '').trim()
  if (!candidateId) return { error: 'Candidat introuvable.' }

  const { error } = await admin.supabase
    .from('candidate_profiles')
    .update({ verification_status: 'rejected' })
    .eq('user_id', candidateId)
  if (error) return { error: error.message }

  await createNotification(admin.supabase, {
    userId: candidateId,
    type: 'verification_rejected',
    title: 'Vérification refusée',
    message: reason
      ? `Votre demande de vérification a été refusée. Raison : ${reason}`
      : 'Votre demande de vérification a été refusée. Vous pouvez soumettre un nouveau document.',
  })

  revalidatePath(`${ADMIN_BASE_PATH}/verifications`)
  revalidatePath(ADMIN_BASE_PATH)
  return { success: true }
}

// --- Codes promo ---

export async function createPromoCode(_prevState: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdminUser()
  if (!admin) return NOT_AUTHORIZED

  const code = String(formData.get('code') ?? '').trim().toUpperCase()
  const discountType = String(formData.get('discount_type') ?? '')
  const discountValueRaw = formData.get('discount_value')
  const validFrom = String(formData.get('valid_from') ?? '').trim()
  const validUntil = String(formData.get('valid_until') ?? '').trim()
  const maxUsesRaw = String(formData.get('max_uses') ?? '').trim()

  if (!code) return { error: 'Merci de renseigner un code.' }
  if (!['percent', 'fixed'].includes(discountType)) return { error: 'Type de réduction invalide.' }

  const discountValue = discountValueRaw ? Number(discountValueRaw) : NaN
  if (Number.isNaN(discountValue) || discountValue <= 0) {
    return { error: 'La valeur de réduction doit être un nombre positif.' }
  }
  if (discountType === 'percent' && discountValue > 100) {
    return { error: 'Un pourcentage de réduction ne peut pas dépasser 100.' }
  }

  let maxUses: number | null = null
  if (maxUsesRaw) {
    maxUses = Number(maxUsesRaw)
    if (Number.isNaN(maxUses) || maxUses <= 0) {
      return { error: "Le nombre d'utilisations max doit être un entier positif." }
    }
  }

  const { error } = await admin.supabase.from('promo_codes').insert({
    code,
    discount_type: discountType,
    discount_value: discountValue,
    valid_from: validFrom || null,
    valid_until: validUntil || null,
    max_uses: maxUses,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Ce code existe déjà.' }
    return { error: error.message }
  }

  revalidatePath(`${ADMIN_BASE_PATH}/promo-codes`)
  revalidatePath(ADMIN_BASE_PATH)
  return { success: true }
}

export async function deactivatePromoCode(promoCodeId: string): Promise<AdminActionState> {
  const admin = await requireAdminUser()
  if (!admin) return NOT_AUTHORIZED

  const { error } = await admin.supabase.from('promo_codes').update({ active: false }).eq('id', promoCodeId)
  if (error) return { error: error.message }

  revalidatePath(`${ADMIN_BASE_PATH}/promo-codes`)
  revalidatePath(ADMIN_BASE_PATH)
  return { success: true }
}

// --- CESU / Pajemploi ---

export async function markSocialConnectionConnected(connectionId: string): Promise<AdminActionState> {
  const admin = await requireAdminUser()
  if (!admin) return NOT_AUTHORIZED

  // connection_status drives employer-facing display (SocialConnectionsBlock);
  // updated_at (existing trigger) already gives an audit timestamp for when
  // this was marked done — no extra column needed just for that.
  const { error } = await admin.supabase
    .from('employer_social_connections')
    .update({ connection_status: 'connected' })
    .eq('id', connectionId)
  if (error) return { error: error.message }

  revalidatePath(`${ADMIN_BASE_PATH}/cesu-pajemploi`)
  revalidatePath(ADMIN_BASE_PATH)
  return { success: true }
}

// --- Modération missions ---

async function markPendingReportsReviewed(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  missionId: string,
  adminUserId: string
) {
  await supabase
    .from('mission_reports')
    .update({ status: 'reviewed', reviewed_at: new Date().toISOString(), reviewed_by: adminUserId })
    .eq('mission_id', missionId)
    .eq('status', 'pending')
}

export async function suspendMission(missionId: string): Promise<AdminActionState> {
  const admin = await requireAdminUser()
  if (!admin) return NOT_AUTHORIZED

  const { data: mission } = await admin.supabase
    .from('missions')
    .select('employer_id, title, moderation_status')
    .eq('id', missionId)
    .maybeSingle()
  if (!mission) return { error: 'Mission introuvable.' }
  if (mission.moderation_status === 'suspended') return { error: 'Cette mission est déjà suspendue.' }
  if (mission.moderation_status === 'removed') return { error: 'Cette mission a été supprimée, elle ne peut plus être suspendue.' }

  const { data: pendingReports } = await admin.supabase
    .from('mission_reports')
    .select('reason')
    .eq('mission_id', missionId)
    .eq('status', 'pending')

  const { error } = await admin.supabase
    .from('missions')
    .update({ moderation_status: 'suspended' })
    .eq('id', missionId)
  if (error) return { error: error.message }

  if (pendingReports && pendingReports.length > 0) {
    await markPendingReportsReviewed(admin.supabase, missionId, admin.user.id)
  }

  const reasons = [...new Set((pendingReports ?? []).map((r) => MISSION_REPORT_REASON_LABELS[r.reason] ?? r.reason))]
  const reasonSuffix = reasons.length > 0 ? ` Motif signalé : ${reasons.join(', ')}.` : ''

  await createNotification(admin.supabase, {
    userId: mission.employer_id,
    type: 'mission_suspended',
    title: 'Mission suspendue',
    message: `Votre mission "${mission.title}" a été suspendue par notre équipe de modération.${reasonSuffix}`,
    relatedId: missionId,
  })

  revalidatePath(`${ADMIN_BASE_PATH}/missions`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function reactivateMission(missionId: string): Promise<AdminActionState> {
  const admin = await requireAdminUser()
  if (!admin) return NOT_AUTHORIZED

  const { data: mission } = await admin.supabase
    .from('missions')
    .select('moderation_status')
    .eq('id', missionId)
    .maybeSingle()
  if (!mission) return { error: 'Mission introuvable.' }
  // Deliberately one-way: a removed mission is never reactivated through
  // this action, only a suspended one — "suppression définitive" stays
  // definitive from the UI's perspective even though it's just a status
  // value underneath.
  if (mission.moderation_status !== 'suspended') {
    return { error: 'Seule une mission suspendue peut être réactivée.' }
  }

  const { error } = await admin.supabase
    .from('missions')
    .update({ moderation_status: 'normal' })
    .eq('id', missionId)
  if (error) return { error: error.message }

  revalidatePath(`${ADMIN_BASE_PATH}/missions`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function removeMission(missionId: string): Promise<AdminActionState> {
  const admin = await requireAdminUser()
  if (!admin) return NOT_AUTHORIZED

  const { data: mission } = await admin.supabase
    .from('missions')
    .select('employer_id, title, moderation_status')
    .eq('id', missionId)
    .maybeSingle()
  if (!mission) return { error: 'Mission introuvable.' }
  if (mission.moderation_status === 'removed') return { error: 'Cette mission est déjà supprimée.' }

  const { data: hiredApplication } = await admin.supabase
    .from('applications')
    .select('id')
    .eq('mission_id', missionId)
    .eq('status', 'hired')
    .maybeSingle()
  if (hiredApplication) {
    return {
      error:
        'Impossible de supprimer : un candidat a déjà été embauché sur cette mission (contrat généré). Suspendez-la si besoin plutôt que de la supprimer.',
    }
  }

  const { data: activeApplications } = await admin.supabase
    .from('applications')
    .select('id, candidate_id')
    .eq('mission_id', missionId)
    .in('status', ['pending', 'interviewing'])

  const { error } = await admin.supabase.from('missions').update({ moderation_status: 'removed' }).eq('id', missionId)
  if (error) return { error: error.message }

  if (activeApplications && activeApplications.length > 0) {
    await admin.supabase
      .from('applications')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('mission_id', missionId)
      .in('status', ['pending', 'interviewing'])

    await Promise.all(
      activeApplications.map((application) =>
        createNotification(admin.supabase, {
          userId: application.candidate_id,
          type: 'application_rejected',
          title: 'Candidature refusée',
          message: `Votre candidature pour "${mission.title}" a été refusée : la mission a été retirée par notre équipe de modération.`,
          relatedId: missionId,
        })
      )
    )
  }

  const { data: pendingReports } = await admin.supabase
    .from('mission_reports')
    .select('id')
    .eq('mission_id', missionId)
    .eq('status', 'pending')
  if (pendingReports && pendingReports.length > 0) {
    await markPendingReportsReviewed(admin.supabase, missionId, admin.user.id)
  }

  await createNotification(admin.supabase, {
    userId: mission.employer_id,
    type: 'mission_removed',
    title: 'Mission supprimée',
    message: `Votre mission "${mission.title}" a été supprimée par notre équipe de modération.`,
    relatedId: missionId,
  })

  revalidatePath(`${ADMIN_BASE_PATH}/missions`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function dismissMissionReport(reportId: string): Promise<AdminActionState> {
  const admin = await requireAdminUser()
  if (!admin) return NOT_AUTHORIZED

  const { error } = await admin.supabase
    .from('mission_reports')
    .update({ status: 'dismissed', reviewed_at: new Date().toISOString(), reviewed_by: admin.user.id })
    .eq('id', reportId)
  if (error) return { error: error.message }

  revalidatePath(`${ADMIN_BASE_PATH}/missions`)
  return { success: true }
}
