// Server-side guard for the "client uploads to Storage, then hands the
// resulting URL/path to a Server Action" pattern (photo blocks, verification
// document). Without this, a Server Action that just trusts whatever string
// the client sends would let anyone set their photo_url/
// verification_document_url to an arbitrary value instead of something they
// actually uploaded to their own folder — the upload itself is already
// folder-scoped by RLS on storage.objects, but the Server Action doesn't
// know that unless it re-checks the shape of what it's about to persist.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

// Public buckets (candidate-photos, employer-photos): the client calls
// getPublicUrl() after uploading, so the value crossing into the Server
// Action is the full public URL.
export function isOwnPublicStorageUrl(url: string, bucket: string, userId: string): boolean {
  if (!SUPABASE_URL) return false
  const expectedPrefix = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${userId}/`
  return url.startsWith(expectedPrefix)
}

// Private bucket (verification-documents): no public URL exists, the app
// stores the raw storage path and resolves a signed URL on demand (admin
// review). Same folder-scoping check, just against a path rather than a URL.
export function isOwnStoragePath(path: string, userId: string): boolean {
  return path.startsWith(`${userId}/`) && !path.includes('..')
}
