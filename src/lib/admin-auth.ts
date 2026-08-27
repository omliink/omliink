import { createServerSupabaseClient } from './supabase-server'

/**
 * Re-checks is_admin against the database on every call — used at the top
 * of the /admin layout (gates page rendering) AND independently at the top
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
