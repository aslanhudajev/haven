const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const monthsShort = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Monthly: "March 2026"
 * Weekly/biweekly: "25 Mar – 7 Apr"
 */
export function formatPeriodName(
  start: Date,
  end?: Date,
): string {
  if (!end) return `${months[start.getMonth()]} ${start.getFullYear()}`;

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${start.getDate()} – ${end.getDate()} ${monthsShort[start.getMonth()]} ${start.getFullYear()}`;
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameYear) {
    return `${start.getDate()} ${monthsShort[start.getMonth()]} – ${end.getDate()} ${monthsShort[end.getMonth()]}`;
  }

  return `${start.getDate()} ${monthsShort[start.getMonth()]} ${start.getFullYear()} – ${end.getDate()} ${monthsShort[end.getMonth()]} ${end.getFullYear()}`;
}

/** "1 Mar – 31 Mar" */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  return `${s.getDate()} ${monthsShort[s.getMonth()]} – ${e.getDate()} ${monthsShort[e.getMonth()]}`;
}

/** "29 Mar 2026" */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getDate()} ${monthsShort[d.getMonth()]} ${d.getFullYear()}`;
}

/** "2026-03-01" in UTC — from `Date`’s instant (can differ from local calendar day). */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calendar YYYY-MM-DD in the device local timezone. Use for `periods.starts_at` /
 * `ends_at` and for comparing “today” to those columns so rotation matches
 * `computeCurrentPeriodDates` (which uses local `Date` components).
 */
export function toLocalCalendarISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * True when local “today” is strictly after `endsAt` (inclusive end date in DB).
 */
export function isLocalCalendarDateAfterInclusiveEnd(endsAt: string, now = new Date()): boolean {
  return toLocalCalendarISODate(now) > endsAt;
}

/** @deprecated Use isLocalCalendarDateAfterInclusiveEnd (same behavior now). */
export const isUtcDateAfterInclusiveEnd = isLocalCalendarDateAfterInclusiveEnd;
