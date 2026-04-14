export type SpendEntry = {
  userId: string;
  name: string;
  totalCents: number;
  /** Monthly income in cents; when all members set, fair share is income-weighted. */
  incomeCents?: number | null;
};

export type Settlement = {
  from: { userId: string; name: string };
  to: { userId: string; name: string };
  amountCents: number;
};

function fairShareCents(entries: SpendEntry[], total: number): Map<string, number> {
  const map = new Map<string, number>();
  const allHaveIncome = entries.every((e) => e.incomeCents != null && (e.incomeCents ?? 0) > 0);
  const totalIncome = allHaveIncome ? entries.reduce((sum, e) => sum + (e.incomeCents ?? 0), 0) : 0;

  if (allHaveIncome && totalIncome > 0) {
    entries.forEach((e) => {
      map.set(e.userId, Math.round(total * ((e.incomeCents ?? 0) / totalIncome)));
    });
    return map;
  }

  const even = Math.round(total / entries.length);
  entries.forEach((e) => map.set(e.userId, even));
  return map;
}

/** Returns userId -> share percent (0–100) when income split applies; otherwise null. */
export function computeSplitRatio(entries: SpendEntry[]): Map<string, number> | null {
  const allHaveIncome = entries.every((e) => e.incomeCents != null && (e.incomeCents ?? 0) > 0);
  if (!allHaveIncome || entries.length < 2) return null;
  const totalIncome = entries.reduce((sum, e) => sum + (e.incomeCents ?? 0), 0);
  if (totalIncome <= 0) return null;
  const map = new Map<string, number>();
  entries.forEach((e) => map.set(e.userId, Math.round(((e.incomeCents ?? 0) / totalIncome) * 100)));
  return map;
}

/**
 * Given each member's total spend, calculates the minimum set of transfers
 * to settle all debts. Uses a greedy algorithm: pair the biggest debtor
 * with the biggest creditor repeatedly.
 */
export function calculateSettlements(entries: SpendEntry[]): Settlement[] {
  if (entries.length < 2) return [];

  const total = entries.reduce((sum, e) => sum + e.totalCents, 0);
  const fairByUser = fairShareCents(entries, total);

  const balances = entries.map((e) => ({
    userId: e.userId,
    name: e.name,
    balance: e.totalCents - (fairByUser.get(e.userId) ?? 0),
  }));

  const debtors = balances.filter((b) => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter((b) => b.balance > 0).sort((a, b) => b.balance - a.balance);

  const settlements: Settlement[] = [];
  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debt = Math.abs(debtors[di].balance);
    const credit = creditors[ci].balance;
    const amount = Math.min(debt, credit);

    if (amount > 0) {
      settlements.push({
        from: { userId: debtors[di].userId, name: debtors[di].name },
        to: { userId: creditors[ci].userId, name: creditors[ci].name },
        amountCents: amount,
      });
    }

    debtors[di].balance += amount;
    creditors[ci].balance -= amount;

    if (debtors[di].balance === 0) di++;
    if (creditors[ci].balance === 0) ci++;
  }

  return settlements;
}
