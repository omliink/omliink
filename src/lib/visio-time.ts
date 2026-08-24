/**
 * `visio_meetings.proposed_date` / `scheduled_date` are stored in a Postgres
 * `timestamp` (no time zone) column. Postgres normalizes an incoming
 * timestamptz-ish value to UTC and then drops the offset marker, so what
 * comes back out is a naive "YYYY-MM-DDTHH:mm:ss" string that is actually
 * UTC — just unmarked. Re-attach the "Z" before parsing; otherwise
 * `new Date(...)` ambiguously treats it as local time of whichever process
 * happens to parse it, which is how a meeting time silently drifted by two
 * hours during testing.
 */
export function parseVisioTimestamp(value: string): Date {
  const hasOffset = value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value)
  return new Date(hasOffset ? value : `${value}Z`)
}

export const VISIO_JOIN_WINDOW_MINUTES_BEFORE = 10
export const VISIO_NO_SHOW_WINDOW_MINUTES_AFTER = 15

/**
 * Whether a visio meeting can be joined right now: either already
 * in_progress, or accepted with a scheduled_date within the join window
 * (10 min before through 15 min after — matching generateVisioToken's
 * server-side check in src/lib/actions/visio.ts).
 */
export function canJoinVisio(
  meeting: { status: string; scheduled_date: string | null },
  now: number
): boolean {
  if (meeting.status === 'in_progress') return true
  if (meeting.status !== 'accepted' || !meeting.scheduled_date) return false
  const minutesUntil = (parseVisioTimestamp(meeting.scheduled_date).getTime() - now) / 60000
  return minutesUntil <= VISIO_JOIN_WINDOW_MINUTES_BEFORE && minutesUntil >= -VISIO_NO_SHOW_WINDOW_MINUTES_AFTER
}
