import { computeCurrentPeriodDates, computeNextPeriodDates } from './computePeriodDates';

function expectYmd(d: Date, year: number, monthIndex: number, day: number) {
  expect(d.getFullYear()).toBe(year);
  expect(d.getMonth()).toBe(monthIndex);
  expect(d.getDate()).toBe(day);
  expect(d.getHours()).toBe(0);
  expect(d.getMinutes()).toBe(0);
  expect(d.getSeconds()).toBe(0);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86_400_000);
}

describe('computeCurrentPeriodDates (monthly)', () => {
  it('period containing ref when ref is on or after anchor', () => {
    const ref = new Date(2026, 2, 20);
    const { startsAt, endsAt } = computeCurrentPeriodDates('monthly', 15, ref);
    expectYmd(startsAt, 2026, 2, 15);
    expectYmd(endsAt, 2026, 3, 14);
  });

  it('rolls to previous month when ref is before anchor', () => {
    const ref = new Date(2026, 2, 10);
    const { startsAt, endsAt } = computeCurrentPeriodDates('monthly', 15, ref);
    expectYmd(startsAt, 2026, 1, 15);
    expectYmd(endsAt, 2026, 2, 14);
  });

  it('caps anchor day at 28 when anchor is 31', () => {
    const ref = new Date(2026, 2, 5);
    const { startsAt, endsAt } = computeCurrentPeriodDates('monthly', 31, ref);
    expectYmd(startsAt, 2026, 1, 28);
    expectYmd(endsAt, 2026, 2, 27);
  });

  it('month boundary when ref is on anchor day 1', () => {
    const ref = new Date(2026, 3, 1);
    const { startsAt, endsAt } = computeCurrentPeriodDates('monthly', 1, ref);
    expectYmd(startsAt, 2026, 3, 1);
    expectYmd(endsAt, 2026, 3, 30);
  });
});

describe('computeCurrentPeriodDates (weekly)', () => {
  it('week window is 7 calendar days from Monday anchor', () => {
    const ref = new Date(2026, 0, 7);
    const { startsAt, endsAt } = computeCurrentPeriodDates('weekly', 1, ref);
    expectYmd(startsAt, 2026, 0, 5);
    expectYmd(endsAt, 2026, 0, 11);
    expect(diffDays(endsAt, startsAt)).toBe(6);
  });

  it('startsAt and endsAt are midnight local', () => {
    const ref = new Date(2026, 4, 15, 14, 30, 45);
    const { startsAt, endsAt } = computeCurrentPeriodDates('weekly', 3, ref);
    expectYmd(startsAt, startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate());
    expectYmd(endsAt, endsAt.getFullYear(), endsAt.getMonth(), endsAt.getDate());
  });
});

describe('computeCurrentPeriodDates (biweekly)', () => {
  it('period span is 14 days inclusive (13 day delta)', () => {
    const ref = new Date(2026, 5, 10);
    const { startsAt, endsAt } = computeCurrentPeriodDates('biweekly', 3, ref);
    expect(diffDays(endsAt, startsAt)).toBe(13);
  });

  it('two refs inside the same 14-day window share startsAt and endsAt', () => {
    const ref1 = new Date(2026, 5, 10);
    const w1 = computeCurrentPeriodDates('biweekly', 3, ref1);
    const refInside = addDays(w1.startsAt, 6);
    const w2 = computeCurrentPeriodDates('biweekly', 3, refInside);
    expect(w2.startsAt.getTime()).toBe(w1.startsAt.getTime());
    expect(w2.endsAt.getTime()).toBe(w1.endsAt.getTime());
  });

  it('first day after endsAt lands in the next biweekly window (matches computeNextPeriodDates)', () => {
    const ref1 = new Date(2026, 5, 10);
    const first = computeCurrentPeriodDates('biweekly', 3, ref1);
    const nextFromApi = computeNextPeriodDates('biweekly', 3, first.endsAt);
    const refDayAfterEnd = addDays(first.endsAt, 1);
    const second = computeCurrentPeriodDates('biweekly', 3, refDayAfterEnd);
    expect(second.startsAt.getTime()).toBe(nextFromApi.startsAt.getTime());
    expect(second.endsAt.getTime()).toBe(nextFromApi.endsAt.getTime());
  });
});

describe('computeNextPeriodDates', () => {
  it('chains from previous endsAt as Date', () => {
    const prevEnd = new Date(2026, 2, 14);
    const next = computeNextPeriodDates('monthly', 15, prevEnd);
    const direct = computeCurrentPeriodDates('monthly', 15, new Date(2026, 2, 15));
    expect(next.startsAt.getTime()).toBe(direct.startsAt.getTime());
    expect(next.endsAt.getTime()).toBe(direct.endsAt.getTime());
  });
});
