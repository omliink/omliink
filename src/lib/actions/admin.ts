'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminUser } from '@/lib/admin-auth'
import { createNotification } from '@/lib/notifications-helpers'

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

  revalidatePath('/admin/verifications')
  revalidatePath('/admin')
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

  revalidatePath('/admin/verifications')
  revalidatePath('/admin')
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

  revalidatePath('/admin/promo-codes')
  revalidatePath('/admin')
  return { success: true }
}

export async function deactivatePromoCode(promoCodeId: string): Promise<AdminActionState> {
  const admin = await requireAdminUser()
  if (!admin) return NOT_AUTHORIZED

  const { error } = await admin.supabase.from('promo_codes').update({ active: false }).eq('id', promoCodeId)
  if (error) return { error: error.message }

  revalidatePath('/admin/promo-codes')
  revalidatePath('/admin')
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

  revalidatePath('/admin/cesu-pajemploi')
  revalidatePath('/admin')
  return { success: true }
}
