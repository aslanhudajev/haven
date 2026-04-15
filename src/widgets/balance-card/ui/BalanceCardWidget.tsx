import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { FamilyMember } from '@entities/family';
import type { Purchase } from '@entities/purchase';
import { formatMoney } from '@shared/lib/format';
import { calculateSettlements, computeSplitRatio, type Settlement } from '@shared/lib/settlement';
import { Colors, Spacing } from '@shared/lib/theme';

type Props = {
  purchases: Purchase[];
  /** Goal contributions in the active period, by user (counts toward settlement). */
  goalSpendByUser?: Record<string, number>;
  members: FamilyMember[];
  budgetCents: number | null;
  currency?: string;
};

export function BalanceCardWidget({
  purchases,
  goalSpendByUser = {},
  members,
  budgetCents,
  currency = 'SEK',
}: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const discretionaryTotal = purchases
    .filter((p) => !p.is_recurring)
    .reduce((sum, p) => sum + p.amount_cents, 0);
  const recurringTotal = purchases
    .filter((p) => p.is_recurring)
    .reduce((sum, p) => sum + p.amount_cents, 0);
  const purchaseTotal = discretionaryTotal + recurringTotal;
  const goalTotal = Object.values(goalSpendByUser).reduce((s, n) => s + n, 0);
  const totalSpent = purchaseTotal + goalTotal;

  const spendByUser = members.map((m) => ({
    userId: m.user_id,
    name: m.profile?.full_name || 'Anonymous',
    totalCents:
      purchases.filter((p) => p.user_id === m.user_id).reduce((sum, p) => sum + p.amount_cents, 0) +
      (goalSpendByUser[m.user_id] ?? 0),
    incomeCents: m.income_cents,
  }));

  const settlements = calculateSettlements(spendByUser);
  const splitRatio = computeSplitRatio(spendByUser);
  const splitLabel =
    splitRatio && members.length >= 2
      ? members
          .map((m) => {
            const p = splitRatio.get(m.user_id);
            return p != null ? `${m.profile?.full_name || 'Member'} ${p}%` : null;
          })
          .filter(Boolean)
          .join(' · ')
      : null;

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Period total</Text>
          <Text style={[styles.amount, { color: theme.text }]}>
            {formatMoney(totalSpent, currency)}
          </Text>
          {recurringTotal > 0 || goalTotal > 0 ? (
            <Text style={[styles.composition, { color: theme.textSecondary }]}>
              {[
                `Spending: ${formatMoney(discretionaryTotal, currency)}`,
                recurringTotal > 0 ? `Fixed: ${formatMoney(recurringTotal, currency)}` : null,
                goalTotal > 0 ? `Goals: ${formatMoney(goalTotal, currency)}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          ) : null}
        </View>
        {budgetCents != null && (
          <View style={styles.budgetCol}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Budget</Text>
            <Text style={[styles.budgetAmount, { color: theme.text }]}>
              {formatMoney(budgetCents, currency)}
            </Text>
          </View>
        )}
      </View>

      {budgetCents != null && (
        <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min((discretionaryTotal / budgetCents) * 100, 100)}%`,
                backgroundColor: discretionaryTotal > budgetCents ? '#FF3B30' : theme.accent,
              },
            ]}
          />
        </View>
      )}

      {splitLabel ? (
        <Text style={[styles.splitHint, { color: theme.textSecondary }]}>
          Fair split (income): {splitLabel}
        </Text>
      ) : null}

      {spendByUser.length > 0 && (
        <View style={styles.breakdown}>
          {spendByUser.map((entry) => (
            <View key={entry.userId} style={styles.breakdownRow}>
              <Text style={[styles.breakdownName, { color: theme.text }]}>{entry.name}</Text>
              <Text style={[styles.breakdownAmount, { color: theme.textSecondary }]}>
                {formatMoney(entry.totalCents, currency)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {settlements.length > 0 && (
        <View style={styles.settlements}>
          <Text style={[styles.settlementsTitle, { color: theme.textSecondary }]}>Settlement</Text>
          {settlements.map((s: Settlement, i: number) => (
            <Text key={i} style={[styles.settlementRow, { color: theme.text }]}>
              {s.from.name} → {s.to.name}: {formatMoney(s.amountCents, currency)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', marginBottom: 4 },
  amount: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  composition: { fontSize: 13, fontWeight: '500', marginTop: 6 },
  budgetCol: { alignItems: 'flex-end' },
  budgetAmount: { fontSize: 20, fontWeight: '600' },
  progressTrack: { height: 6, borderRadius: 3, marginTop: 16, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  splitHint: { fontSize: 13, marginTop: 12, lineHeight: 18 },
  breakdown: { marginTop: 20, gap: 8 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownName: { fontSize: 15 },
  breakdownAmount: { fontSize: 15, fontWeight: '500' },
  settlements: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  settlementsTitle: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  settlementRow: { fontSize: 15, marginBottom: 4 },
});
