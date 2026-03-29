export type Cadence = 'weekly' | 'biweekly' | 'monthly';

type PeriodDates = { startsAt: Date; endsAt: Date };

const EPOCH = new Date(2024, 0, 1);

function dayOfWeek(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 7 : d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / 86_400_000);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function computeMonthly(anchorDay: number, ref: Date): PeriodDates {
  const day = Math.min(anchorDay, 28);
  const startsAt = new Date(ref.getFullYear(), ref.getMonth(), day);

  if (ref.getDate() < day) {
    startsAt.setMonth(startsAt.getMonth() - 1);
  }

  const nextStart = new Date(startsAt.getFullYear(), startsAt.getMonth() + 1, day);
  const endsAt = addDays(nextStart, -1);

  return { startsAt, endsAt };
}

function computeWeekly(anchorDay: number, ref: Date): PeriodDates {
  const anchor = Math.max(1, Math.min(anchorDay, 7));
  const current = dayOfWeek(ref);
  const diff = (((current - anchor) % 7) + 7) % 7;
  const startsAt = addDays(ref, -diff);
  const endsAt = addDays(startsAt, 6);

  return { startsAt: startOfDay(startsAt), endsAt: startOfDay(endsAt) };
}

function computeBiweekly(anchorDay: number, ref: Date): PeriodDates {
  const anchor = Math.max(1, Math.min(anchorDay, 7));
  const epochDow = dayOfWeek(EPOCH);
  const epochAnchorOffset = (((anchor - epochDow) % 7) + 7) % 7;
  const firstAnchor = addDays(EPOCH, epochAnchorOffset);

  const totalDays = diffDays(startOfDay(ref), firstAnchor);
  const periodIndex = Math.floor(totalDays / 14);
  const startsAt = addDays(firstAnchor, periodIndex * 14);
  const endsAt = addDays(startsAt, 13);

  return { startsAt, endsAt };
}

export function computeCurrentPeriodDates(
  cadence: Cadence,
  anchorDay: number,
  referenceDate?: Date,
): PeriodDates {
  const ref = startOfDay(referenceDate ?? new Date());

  switch (cadence) {
    case 'monthly':
      return computeMonthly(anchorDay, ref);
    case 'weekly':
      return computeWeekly(anchorDay, ref);
    case 'biweekly':
      return computeBiweekly(anchorDay, ref);
  }
}

export function computeNextPeriodDates(
  cadence: Cadence,
  anchorDay: number,
  previousEndsAt: Date | string,
): PeriodDates {
  const prev = typeof previousEndsAt === 'string' ? new Date(previousEndsAt) : previousEndsAt;
  return computeCurrentPeriodDates(cadence, anchorDay, addDays(prev, 1));
}
