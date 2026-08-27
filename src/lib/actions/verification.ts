'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

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

  const documentFile = formData.get('document')
  if (!(documentFile instanceof File) || documentFile.size === 0) {
    return { error: 'Merci de sélectionner un fichier.' }
  }

  // No upsert: the path is timestamp-suffixed and always unique, and upsert
  // would need a SELECT policy on storage.objects (to evaluate the ON
  // CONFLICT arbiter) that this bucket intentionally doesn't have.
  const documentPath = `${user.id}/${Date.now()}-${documentFile.name}`
  const { error: uploadError } = await supabase.storage.from('verification-documents').upload(documentPath, documentFile)
  if (uploadError) {
    return { error: `Échec de l'upload : ${uploadError.message}` }
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
