import { calculateSettlements, type Settlement } from './settlement';

function assertPositiveAmounts(s: Settlement[]) {
  for (const x of s) {
    expect(x.amountCents).toBeGreaterThan(0);
  }
}

function assertConservation(
  entries: { userId: string; totalCents: number }[],
  settlements: Settlement[],
) {
  const total = entries.reduce((sum, e) => sum + e.totalCents, 0);
  const fair = Math.round(total / entries.length);
  const net = new Map<string, number>();
  for (const e of entries) {
    net.set(e.userId, (net.get(e.userId) ?? 0) + (e.totalCents - fair));
  }
  for (const st of settlements) {
    net.set(st.from.userId, (net.get(st.from.userId) ?? 0) + st.amountCents);
    net.set(st.to.userId, (net.get(st.to.userId) ?? 0) - st.amountCents);
  }
  for (const v of net.values()) {
    expect(v).toBe(0);
  }
}

describe('calculateSettlements', () => {
  it('returns empty array when entries is empty', () => {
    expect(calculateSettlements([])).toEqual([]);
  });

  it('returns empty array when only one member', () => {
    expect(calculateSettlements([{ userId: 'a', name: 'A', totalCents: 100 }])).toEqual([]);
  });

  it('returns empty when two members spent equally', () => {
    expect(
      calculateSettlements([
        { userId: 'a', name: 'A', totalCents: 40 },
        { userId: 'b', name: 'B', totalCents: 40 },
      ]),
    ).toEqual([]);
  });

  it('two members, one paid everything', () => {
    const s = calculateSettlements([
      { userId: 'a', name: 'Alice', totalCents: 100 },
      { userId: 'b', name: 'Bob', totalCents: 0 },
    ]);
    expect(s).toHaveLength(1);
    expect(s[0]).toEqual({
      from: { userId: 'b', name: 'Bob' },
      to: { userId: 'a', name: 'Alice' },
      amountCents: 50,
    });
    assertPositiveAmounts(s);
  });

  it('three members, simple imbalance', () => {
    const s = calculateSettlements([
      { userId: 'a', name: 'A', totalCents: 90 },
      { userId: 'b', name: 'B', totalCents: 30 },
      { userId: 'c', name: 'C', totalCents: 30 },
    ]);
    expect(s).toHaveLength(2);
    expect(s[0]).toMatchObject({ from: { userId: 'b' }, to: { userId: 'a' }, amountCents: 20 });
    expect(s[1]).toMatchObject({ from: { userId: 'c' }, to: { userId: 'a' }, amountCents: 20 });
    assertPositiveAmounts(s);
    assertConservation(
      [
        { userId: 'a', totalCents: 90 },
        { userId: 'b', totalCents: 30 },
        { userId: 'c', totalCents: 30 },
      ],
      s,
    );
  });

  it('rounding when total cents not divisible by member count (residual creditor, no transfers)', () => {
    const s = calculateSettlements([
      { userId: 'a', name: 'A', totalCents: 34 },
      { userId: 'b', name: 'B', totalCents: 33 },
      { userId: 'c', name: 'C', totalCents: 33 },
    ]);
    expect(s).toEqual([]);
  });

  it('names preserved on settlement edges', () => {
    const s = calculateSettlements([
      { userId: 'x', name: 'Xavier', totalCents: 100 },
      { userId: 'y', name: 'Yvonne', totalCents: 0 },
    ]);
    expect(s[0].from.name).toBe('Yvonne');
    expect(s[0].to.name).toBe('Xavier');
  });

  it('deterministic ordering for the same multiset', () => {
    const entries = [
      { userId: 'a', name: 'A', totalCents: 90 },
      { userId: 'b', name: 'B', totalCents: 30 },
      { userId: 'c', name: 'C', totalCents: 30 },
    ];
    const a = calculateSettlements([...entries]);
    const b = calculateSettlements([...entries]);
    expect(a).toEqual(b);
  });
});
