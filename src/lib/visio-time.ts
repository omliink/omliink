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
