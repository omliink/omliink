'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isOwnStoragePath } from '@/lib/storage-url'

export interface VerificationState {
  error?: string
  success?: boolean
}

export async function submitVerificationDocument(
  _prevState: VerificationState,
  formData: FormData
): Promise<VerificationState> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Uploaded client-side before this action is called (see
  // VerificationBanner) — a raw File here would cross the Server Action's
  // request body and hit Next.js's default 1MB limit, and ID
  // documents/scans routinely exceed that. Only the storage path travels
  // here (this bucket is private, so there's no public URL to store —
  // reads go through a signed URL generated on demand for admin review).
  const documentPath = String(formData.get('document_path') ?? '').trim()
  if (!documentPath || !isOwnStoragePath(documentPath, user.id)) {
    return { error: 'Merci de sélectionner un fichier.' }
  }

  const { error } = await supabase
    .from('candidate_profiles')
    .update({ verification_status: 'pending', verification_document_url: documentPath })
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}
