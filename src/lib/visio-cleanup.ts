import type { createServerSupabaseClient } from './supabase-server'

type SupabaseServerClient = Awaited<ReturnType<typeof createServerSupabaseClient>>

// Only meetings that haven't actually happened yet get cancelled — a
// completed or currently in-progress call is left as a historical record,
// and 'cancelled' itself is excluded so this stays idempotent.
const CANCELLABLE_VISIO_STATUSES = ['proposed', 'accepted', 'no_show_employer', 'no_show_candidate']

/**
 * Called whenever an application is rejected (individually, or swept up by
 * another candidate being hired) — cancels that candidate's visio_meeting
 * if it hasn't been held yet, so a rejected candidate never sees a
 * lingering "join the call" button.
 */
export async function cancelPendingVisioForApplication(
  supabase: SupabaseServerClient,
  applicationId: string
): Promise<void> {
  await supabase
    .from('visio_meetings')
    .update({ status: 'cancelled' })
    .eq('application_id', applicationId)
    .in('status', CANCELLABLE_VISIO_STATUSES)
}
