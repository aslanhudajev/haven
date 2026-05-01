import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryBreakdownWidget } from '@widgets/category-breakdown';
import { getCategories } from '@entities/category';
import { getCategoryBudgets } from '@entities/category-budget';
import { useFamilyStore, type FamilyMember } from '@entities/family';
import { getGoalContributionsForPeriod } from '@entities/goal';
import {
  countArchivedUnsettledPeriods,
  getLedgerPeriods,
  resolvePeriod,
  useLedgerTabBadgeStore,
} from '@entities/period';
import { getPurchases, type Purchase } from '@entities/purchase';
import { getErrorMessage } from '@shared/lib/errors';
import {
  formatMoney,
  formatDateRange,
  isLocalCalendarDateAfterInclusiveEnd,
} from '@shared/lib/format';
import { calculateSettlements, type Settlement } from '@shared/lib/settlement';
import { Colors, Spacing } from '@shared/lib/theme';
import { Card, Button } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

export default function PeriodReportScreen() {
  const router = useRouter();
  const {
    periodId,
    periodName,
    startsAt,
    endsAt,
    status: initialStatus,
  } = useLocalSearchParams<{
    periodId: string;
    periodName: string;
    startsAt: string;
    endsAt: string;
    status: string;
  }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const members = useFamilyStore((s) => s.members);
  const { user } = useAuth();
  const { family } = useAppGateContext();
  const currency = family?.currency ?? 'SEK';
  const setUnsettledCount = useLedgerTabBadgeStore((s) => s.setUnsettledArchivedCount);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [goalContribTotalByUser, setGoalContribTotalByUser] = useState<Record<string, number>>({});
  const [reportCategories, setReportCategories] = useState<
    Awaited<ReturnType<typeof getCategories>>
  >([]);
  const [reportBudgets, setReportBudgets] = useState<
    Awaited<ReturnType<typeof getCategoryBudgets>>
  >([]);
  const [resolving, setResolving] = useState(false);
  const [status, setStatus] = useState(initialStatus ?? 'archived');

  useEffect(() => {
    if (!periodId || !family?.id) return;
    let cancelled = false;
    Promise.all([
      getPurchases(periodId),
      getCategories(family.id),
      getCategoryBudgets(family.id),
      getGoalContributionsForPeriod(periodId),
    ])
      .then(([p, c, b, gc]) => {
        if (!cancelled) {
          setPurchases(p);
          setReportCategories(c);
          setReportBudgets(b);
          const byUser: Record<string, number> = {};
          gc.forEach((row) => {
            byUser[row.user_id] = (byUser[row.user_id] ?? 0) + row.amount_cents;
          });
          setGoalContribTotalByUser(byUser);
        }
      })
      .catch(console.warn);
    return () => {
      cancelled = true;
    };
  }, [periodId, family?.id]);

  const discretionaryTotal = purchases
    .filter((p) => !p.is_recurring)
    .reduce((sum, p) => sum + p.amount_cents, 0);
  const recurringTotal = purchases
    .filter((p) => p.is_recurring)
    .reduce((sum, p) => sum + p.amount_cents, 0);
  const purchaseTotal = discretionaryTotal + recurringTotal;
  const goalContribTotal = Object.values(goalContribTotalByUser).reduce((s, n) => s + n, 0);
  const totalSpent = purchaseTotal + goalContribTotal;

  const spendByUser = members.map((m: FamilyMember) => ({
    userId: m.user_id,
    name: m.profile?.full_name || 'Anonymous',
    totalCents:
      purchases.filter((p) => p.user_id === m.user_id).reduce((sum, p) => sum + p.amount_cents, 0) +
      (goalContribTotalByUser[m.user_id] ?? 0),
    incomeCents: m.income_cents,
  }));

  const settlements = calculateSettlements(spendByUser);

  const effectiveBudgetCents = reportBudgets.reduce((s, b) => s + b.amount_cents, 0);

  const handleResolve = () => {
    Alert.alert('Mark as Settled?', 'This confirms all debts for this period have been paid.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Settled',
        onPress: async () => {
          if (!periodId || !user) return;
          setResolving(true);
          try {
            await resolvePeriod(periodId, user.id);
            setStatus('resolved');
            if (family) {
              try {
                const ledger = await getLedgerPeriods(family.id);
                setUnsettledCount(countArchivedUnsettledPeriods(ledger));
              } catch {
                /* badge refresh is best-effort */
              }
            }
          } catch (err: unknown) {
            Alert.alert('Error', getErrorMessage(err, 'Could not resolve period'));
          } finally {
            setResolving(false);
          }
        },
      },
    ]);
  };

  const isResolved = status === 'resolved';
  const isActive = status === 'active';
  const periodHasEnded = endsAt ? isLocalCalendarDateAfterInclusiveEnd(endsAt) : false;
  const canResolve = status === 'archived' && periodHasEnded;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: theme.text, flex: 1, minWidth: 0 }]}>
            {periodName}
          </Text>
          {isResolved && (
            <View style={styles.resolvedBadge}>
              <Text style={styles.resolvedBadgeText}>Settled</Text>
            </View>
          )}
          {isActive && (
            <View style={[styles.statusBadge, { backgroundColor: `${theme.accent}22` }]}>
              <Text style={[styles.statusBadgeText, { color: theme.accent }]}>Ongoing</Text>
            </View>
          )}
          {status === 'archived' && !isResolved && (
            <View style={[styles.statusBadge, { backgroundColor: theme.backgroundSelected }]}>
              <Text style={[styles.statusBadgeText, { color: theme.textSecondary }]}>
                Unsettled
              </Text>
            </View>
          )}
        </View>
        {startsAt && endsAt && (
          <Text style={[styles.range, { color: theme.textSecondary }]}>
            {formatDateRange(startsAt, endsAt)}
          </Text>
        )}
        <Pressable
          onPress={() => {
            if (!periodId || !periodName || !startsAt || !endsAt) return;
            router.push({
              pathname: '/(app)/period-ledger',
              params: {
                periodId,
                periodName,
                startsAt,
                endsAt,
                status,
              },
            } as unknown as Href);
          }}
          style={({ pressed }) => [styles.ledgerLink, pressed && { opacity: 0.7 }]}
        >
          <Text style={[styles.ledgerLinkText, { color: theme.accent }]}>
            Open chronological ledger →
          </Text>
        </Pressable>
      </View>

      <Card style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Total toward settlement
        </Text>
        <Text style={[styles.totalAmount, { color: theme.text }]}>
          {formatMoney(totalSpent, currency)}
        </Text>
        <View style={styles.totalBreakdown}>
          <Text style={[styles.totalBreakdownLine, { color: theme.textSecondary }]}>
            Spending: {formatMoney(discretionaryTotal, currency)}
          </Text>
          {recurringTotal > 0 ? (
            <Text style={[styles.totalBreakdownLine, { color: theme.textSecondary }]}>
              Fixed costs: {formatMoney(recurringTotal, currency)}
            </Text>
          ) : null}
          {goalContribTotal > 0 ? (
            <Text style={[styles.totalBreakdownLine, { color: theme.textSecondary }]}>
              Goal contributions: {formatMoney(goalContribTotal, currency)}
            </Text>
          ) : null}
        </View>
        {effectiveBudgetCents > 0 ? (
          <View style={[styles.totalBudgetTrack, { backgroundColor: theme.backgroundSelected }]}>
            <View
              style={[
                styles.totalBudgetFill,
                {
                  width: `${Math.min((discretionaryTotal / effectiveBudgetCents) * 100, 100)}%`,
                  backgroundColor:
                    discretionaryTotal > effectiveBudgetCents ? '#FF3B30' : theme.accent,
                },
              ]}
            />
          </View>
        ) : null}
      </Card>

      {reportCategories.length > 0 ? (
        <CategoryBreakdownWidget
          purchases={purchases}
          categories={reportCategories}
          categoryBudgets={reportBudgets}
          currency={currency}
        />
      ) : null}

      <Card style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Per member</Text>
        {spendByUser.map((entry) => (
          <View key={entry.userId} style={styles.memberRow}>
            <Text style={[styles.memberName, { color: theme.text }]}>{entry.name}</Text>
            <Text style={[styles.memberAmount, { color: theme.textSecondary }]}>
              {formatMoney(entry.totalCents, currency)}
            </Text>
          </View>
        ))}
      </Card>

      {settlements.length > 0 && (
        <Card style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Settlement</Text>
          {settlements.map((s: Settlement, i: number) => (
            <View key={i} style={styles.settlementRow}>
              <Text style={[styles.settlementText, { color: theme.text }]}>
                {s.from.name} owes {s.to.name}
              </Text>
              <Text style={[styles.settlementAmount, { color: theme.accent }]}>
                {formatMoney(s.amountCents, currency)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {isActive && (
        <View style={[styles.resolveAction, styles.pendingEndHint]}>
          <Text style={[styles.pendingEndText, { color: theme.textSecondary }]}>
            {
              'This period is still open. Settlement is available after the last day; you can review spending anytime.'
            }
          </Text>
        </View>
      )}
      {status === 'archived' && !periodHasEnded && (
        <View style={[styles.resolveAction, styles.pendingEndHint]}>
          <Text style={[styles.pendingEndText, { color: theme.textSecondary }]}>
            {"Settlement is available after this period's last day."}
          </Text>
        </View>
      )}
      {canResolve && (
        <View style={styles.resolveAction}>
          <Button title="Mark as Settled" onPress={handleResolve} loading={resolving} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, marginBottom: Spacing.lg },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  range: { fontSize: 15, marginTop: 4 },
  ledgerLink: { alignSelf: 'flex-start', marginTop: 12 },
  ledgerLinkText: { fontSize: 15, fontWeight: '600' },
  resolvedBadge: {
    backgroundColor: '#34C75920',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resolvedBadgeText: { color: '#34C759', fontSize: 13, fontWeight: '600' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: { fontSize: 13, fontWeight: '600' },
  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionLabel: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', marginBottom: 8 },
  totalAmount: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  totalBudgetTrack: { height: 8, borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  totalBudgetFill: { height: '100%', borderRadius: 4 },
  totalBreakdown: { marginTop: 10, gap: 2 },
  totalBreakdownLine: { fontSize: 14, fontWeight: '500' },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  memberName: { fontSize: 16 },
  memberAmount: { fontSize: 16, fontWeight: '500' },
  settlementRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  settlementText: { fontSize: 16 },
  settlementAmount: { fontSize: 16, fontWeight: '600' },
  resolveAction: { marginHorizontal: Spacing.lg, marginTop: Spacing.md },
  pendingEndHint: { marginTop: Spacing.sm },
  pendingEndText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
