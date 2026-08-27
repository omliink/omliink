import { createServerSupabaseClient } from './supabase-server'

// Single source of truth for the admin route prefix — deliberately obscure
// rather than /admin (defense in depth against automated scans; the actual
// authorization boundary is is_admin_user()/requireAdminUser(), unaffected
// by this path). Every internal link, redirect, and revalidatePath() call
// for the admin surface goes through this constant so a future rename never
// requires re-grepping the codebase for a hardcoded string again.
export const ADMIN_BASE_PATH = '/ops-9k3xq7wmvz2r'

/**
 * Re-checks is_admin against the database on every call — used at the top
 * of the admin layout (gates page rendering) AND independently at the top
 * of every admin Server Action (gates the mutation itself). Neither trusts
 * the other: a client-side render decision is never sufficient authorization
 * for a privileged write, and RLS policies using is_admin_user() are the
 * final backstop even if this check were ever bypassed or missing somewhere.
 *
 * Returns null for "not admin" (covers both logged-out and logged-in
 * non-admin) rather than throwing, so callers choose how to react —
 * notFound() for a page, an error state for a Server Action.
 */
export async function requireAdminUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return null

  return { supabase, user }
}
