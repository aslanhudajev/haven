type SpendEntry = {
  userId: string;
  name: string;
  totalCents: number;
};

export type Settlement = {
  from: { userId: string; name: string };
  to: { userId: string; name: string };
  amountCents: number;
};

/**
 * Given each member's total spend, calculates the minimum set of transfers
 * to settle all debts. Uses a greedy algorithm: pair the biggest debtor
 * with the biggest creditor repeatedly.
 */
export function calculateSettlements(entries: SpendEntry[]): Settlement[] {
  if (entries.length < 2) return [];

  const total = entries.reduce((sum, e) => sum + e.totalCents, 0);
  const fair = Math.round(total / entries.length);

  const balances = entries.map((e) => ({
    userId: e.userId,
    name: e.name,
    balance: e.totalCents - fair,
  }));

  const debtors = balances
    .filter((b) => b.balance < 0)
    .sort((a, b) => a.balance - b.balance);
  const creditors = balances
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance);

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
