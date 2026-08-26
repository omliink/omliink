import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Bypasses RLS with the service role key. Only for trusted server-to-server
 * contexts with no user session to scope the request to — currently just
 * the Stripe webhook handler, which needs to update a contract's
 * payment_status regardless of which party's action triggered the payment.
 * Never import this from a Server Action or page that runs on behalf of a
 * signed-in user's request — use createServerSupabaseClient for that.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
