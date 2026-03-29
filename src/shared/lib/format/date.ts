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

/** "2026-03-01" — ISO date string for Supabase `date` columns. */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}
