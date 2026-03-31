import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { FamilyMember } from '@entities/family';
import type { Purchase } from '@entities/purchase';
import { formatMoney } from '@shared/lib/format';
import { calculateSettlements, type Settlement } from '@shared/lib/settlement';
import { Colors, Radii, Spacing, cardElevation, fontFamily } from '@shared/lib/theme';

type Props = {
  purchases: Purchase[];
  members: FamilyMember[];
  budgetCents: number | null;
  currency?: string;
};

type StatusKind = 'on_track' | 'almost' | 'over';

function budgetStatus(
  budgetCents: number | null,
  totalSpent: number,
): { kind: StatusKind; label: string } | null {
  if (budgetCents == null || budgetCents <= 0) return null;
  if (totalSpent > budgetCents) return { kind: 'over', label: 'Over budget' };
  const pct = (totalSpent / budgetCents) * 100;
  if (pct >= 90) return { kind: 'almost', label: 'Almost at limit' };
  return { kind: 'on_track', label: 'On track' };
}

export function BalanceCardWidget({ purchases, members, budgetCents, currency = 'SEK' }: Props) {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[scheme];

  const totalSpent = purchases.reduce((sum, p) => sum + p.amount_cents, 0);

  const spendByUser = members.map((m) => ({
    userId: m.user_id,
    name: m.profile?.full_name || 'Anonymous',
    totalCents: purchases
      .filter((p) => p.user_id === m.user_id)
      .reduce((sum, p) => sum + p.amount_cents, 0),
  }));

  const settlements = calculateSettlements(spendByUser);

  const targetPct =
    budgetCents != null && budgetCents > 0 ? Math.min((totalSpent / budgetCents) * 100, 100) : 0;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(targetPct, { duration: 520 });
  }, [targetPct, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const overBudget = budgetCents != null && totalSpent > budgetCents;
  const status = budgetStatus(budgetCents, totalSpent);
  const remaining =
    budgetCents != null && budgetCents > 0 ? Math.max(budgetCents - totalSpent, 0) : 0;

  const pillStyle = (kind: StatusKind) => {
    if (kind === 'over') {
      return { bg: theme.accentMuted, fg: theme.danger };
    }
    if (kind === 'almost') {
      return {
        bg: scheme === 'dark' ? '#422006' : '#FEF3C7',
        fg: scheme === 'dark' ? theme.warning : '#B45309',
      };
    }
    return { bg: theme.accentMuted, fg: theme.accent };
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface1, borderRadius: Radii.xl },
        cardElevation(scheme),
      ]}
    >
      <View style={styles.cardInner}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFamily.bodyMedium },
              ]}
            >
              Total spent
            </Text>
            <Text
              style={[
                styles.amount,
                { color: theme.moneyHighlight, fontFamily: fontFamily.displayBold },
              ]}
            >
              {formatMoney(totalSpent)}
            </Text>
            {status && budgetCents != null && (
              <View style={styles.statusRow}>
                <View style={[styles.pill, { backgroundColor: pillStyle(status.kind).bg }]}>
                  <Text
                    style={[
                      styles.pillText,
                      { color: pillStyle(status.kind).fg, fontFamily: fontFamily.bodySemiBold },
                    ]}
                  >
                    {status.label}
                  </Text>
                </View>
                {!overBudget && (
                  <Text
                    style={[
                      styles.remainingText,
                      { color: theme.textSecondary, fontFamily: fontFamily.body },
                    ]}
                  >
                    {formatMoney(remaining, currency)} left
                  </Text>
                )}
              </View>
            )}
          </View>
          {budgetCents != null && (
            <View style={styles.budgetCol}>
              <Text
                style={[
                  styles.label,
                  { color: theme.textSecondary, fontFamily: fontFamily.bodyMedium },
                ]}
              >
                Budget
              </Text>
              <Text
                style={[styles.budgetAmount, { color: theme.text, fontFamily: fontFamily.display }]}
              >
                {formatMoney(budgetCents, currency)}
              </Text>
            </View>
          )}
        </View>

        {budgetCents != null && (
          <View style={[styles.progressTrack, { backgroundColor: theme.progressTrack }]}>
            <Animated.View style={[styles.progressClip, barStyle]}>
              {overBudget ? (
                <View style={[styles.progressFill, { backgroundColor: theme.danger }]} />
              ) : (
                <LinearGradient
                  colors={[theme.progressGradientStart, theme.progressGradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressFill}
                />
              )}
            </Animated.View>
          </View>
        )}

        {spendByUser.length > 0 && (
          <View style={styles.breakdown}>
            {spendByUser.map((entry) => (
              <View key={entry.userId} style={styles.breakdownRow}>
                <Text
                  style={[styles.breakdownName, { color: theme.text, fontFamily: fontFamily.body }]}
                >
                  {entry.name}
                </Text>
                <Text
                  style={[
                    styles.breakdownAmount,
                    { color: theme.textSecondary, fontFamily: fontFamily.bodyMedium },
                  ]}
                >
                  {formatMoney(entry.totalCents, currency)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {settlements.length > 0 && (
          <View
            style={[
              styles.settlements,
              {
                borderTopColor: theme.borderSubtle,
                backgroundColor: theme.surface2,
                borderRadius: Radii.md,
              },
            ]}
          >
            <Text
              style={[
                styles.settlementsTitle,
                { color: theme.textSecondary, fontFamily: fontFamily.bodyMedium },
              ]}
            >
              Settlement
            </Text>
            {settlements.map((s: Settlement, i: number) => (
              <Text
                key={i}
                style={[styles.settlementRow, { color: theme.text, fontFamily: fontFamily.body }]}
              >
                {s.from.name} → {s.to.name}: {formatMoney(s.amountCents, currency)}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardInner: { padding: Spacing.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  amount: { fontSize: 34, letterSpacing: -1 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full },
  pillText: { fontSize: 12 },
  remainingText: { fontSize: 13 },
  budgetCol: { alignItems: 'flex-end' },
  budgetAmount: { fontSize: 22 },
  progressTrack: { height: 10, borderRadius: 5, marginTop: Spacing.md, overflow: 'hidden' },
  progressClip: { height: '100%', overflow: 'hidden', borderRadius: 5 },
  progressFill: { width: '100%', height: '100%' },
  breakdown: { marginTop: Spacing.lg, gap: 10 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownName: { fontSize: 15 },
  breakdownAmount: { fontSize: 15 },
  settlements: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  settlementsTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  settlementRow: { fontSize: 15, marginBottom: 4 },
});
