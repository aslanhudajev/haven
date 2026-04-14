import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategories, type Category } from '@entities/category';
import { getGoalContributionsForPeriod, type GoalContributionWithGoal } from '@entities/goal';
import {
  claimRecurringPurchase,
  deletePurchase,
  getPurchases,
  type Purchase,
} from '@entities/purchase';
import { getErrorMessage } from '@shared/lib/errors';
import { formatMoney } from '@shared/lib/format';
import { Colors, Spacing } from '@shared/lib/theme';
import { Card } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

type LedgerRow =
  | { kind: 'purchase'; at: string; purchase: Purchase }
  | { kind: 'goal'; at: string; contribution: GoalContributionWithGoal };

const PERIOD_REPORT = '/(app)/period-report' as Href;

export default function PeriodLedgerScreen() {
  const navigation = useNavigation();
  const { periodId, periodName, startsAt, endsAt, status } = useLocalSearchParams<{
    periodId: string;
    periodName: string;
    startsAt: string;
    endsAt: string;
    status: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const { family } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const currency = family?.currency ?? 'SEK';

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [goalRows, setGoalRows] = useState<GoalContributionWithGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: periodName || 'Ledger' });
  }, [navigation, periodName]);

  const load = useCallback(async () => {
    if (!periodId || !family?.id) return;
    try {
      const [p, g, cats] = await Promise.all([
        getPurchases(periodId),
        getGoalContributionsForPeriod(periodId),
        getCategories(family.id),
      ]);
      setPurchases(p);
      setGoalRows(g);
      setCategories(cats);
    } catch (e) {
      console.warn('Period ledger load:', e);
    }
  }, [periodId, family?.id]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      load().finally(() => {
        if (!cancelled) setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const rows = useMemo((): LedgerRow[] => {
    const list: LedgerRow[] = [
      ...purchases.map((purchase) => ({
        kind: 'purchase' as const,
        at: purchase.created_at,
        purchase,
      })),
      ...goalRows.map((contribution) => ({
        kind: 'goal' as const,
        at: contribution.created_at,
        contribution,
      })),
    ];
    list.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    return list;
  }, [purchases, goalRows]);

  const purchaseTotal = purchases.reduce((s, p) => s + p.amount_cents, 0);
  const goalTotal = goalRows.reduce((s, c) => s + c.amount_cents, 0);
  const periodTotal = purchaseTotal + goalTotal;

  const openReport = () => {
    router.push({
      pathname: PERIOD_REPORT,
      params: {
        periodId,
        periodName,
        startsAt,
        endsAt,
        status,
      },
    } as unknown as Href);
  };

  const handleDeletePurchase = (p: Purchase) => {
    Alert.alert('Delete purchase?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePurchase(p.id);
            await load();
          } catch (err: unknown) {
            Alert.alert('Error', getErrorMessage(err, 'Could not delete'));
          }
        },
      },
    ]);
  };

  const handleClaim = async (p: Purchase) => {
    if (!user) return;
    try {
      await claimRecurringPurchase(p.id, user.id);
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not update'));
    }
  };

  if (!periodId || !family) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Missing period</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.textSecondary}
        />
      }
    >
      <View style={styles.headerBlock}>
        <Text style={[styles.periodTitle, { color: theme.text }]}>{periodName}</Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {rows.length} event{rows.length === 1 ? '' : 's'} · {formatMoney(periodTotal, currency)}{' '}
          in period
        </Text>
      </View>

      <Pressable onPress={openReport}>
        <Card
          style={StyleSheet.flatten([styles.jumpCard, { borderColor: theme.backgroundSelected }])}
        >
          <View style={styles.jumpRow}>
            <Ionicons name="pie-chart-outline" size={22} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.jumpTitle, { color: theme.text }]}>Summary & settlement</Text>
              <Text style={[styles.jumpSub, { color: theme.textSecondary }]}>
                Budgets, fair share, and mark settled
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
        </Card>
      </Pressable>

      <Card style={styles.totalsCard}>
        <View style={styles.totalLine}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Purchases</Text>
          <Text style={[styles.totalValue, { color: theme.text }]}>
            {formatMoney(purchaseTotal, currency)}
          </Text>
        </View>
        <View style={styles.totalLine}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
            Goal contributions
          </Text>
          <Text style={[styles.totalValue, { color: theme.text }]}>
            {formatMoney(goalTotal, currency)}
          </Text>
        </View>
        <View style={[styles.totalLine, styles.totalStrong]}>
          <Text style={[styles.totalLabelStrong, { color: theme.text }]}>Total in period</Text>
          <Text style={[styles.totalValueStrong, { color: theme.text }]}>
            {formatMoney(periodTotal, currency)}
          </Text>
        </View>
      </Card>

      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
        Chronological ledger
      </Text>
      <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>
        Oldest first. Pull to refresh.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 32 }} />
      ) : rows.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textSecondary }]}>
          Nothing recorded this period yet.
        </Text>
      ) : (
        <View style={[styles.ledgerCard, { backgroundColor: theme.backgroundElement }]}>
          {rows.map((row, index) => {
            if (row.kind === 'purchase') {
              const p = row.purchase;
              const isOwn = user?.id === p.user_id;
              const name = p.profile?.full_name || 'Anonymous';
              const cat = p.category_id
                ? categories.find((c) => c.id === p.category_id)
                : undefined;
              const recurring = p.is_recurring === true;
              const time = new Date(p.created_at).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <View
                  key={`p-${p.id}`}
                  style={[
                    styles.ledgerRow,
                    index < rows.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.backgroundSelected,
                    },
                  ]}
                >
                  <Pressable
                    style={styles.ledgerRowMain}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/edit-purchase',
                        params: { purchaseId: p.id },
                      })
                    }
                    onLongPress={isOwn && !recurring ? () => handleDeletePurchase(p) : undefined}
                  >
                    <View style={[styles.typeIcon, { backgroundColor: theme.background }]}>
                      <Ionicons name="card-outline" size={18} color={theme.accent} />
                    </View>
                    <View style={styles.ledgerMid}>
                      <View style={styles.titleRow}>
                        {cat ? (
                          <View style={[styles.dot, { backgroundColor: cat.color }]} />
                        ) : (
                          <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
                        )}
                        <Text style={[styles.ledgerTitle, { color: theme.text }]} numberOfLines={2}>
                          {p.description || cat?.name || 'Purchase'}
                        </Text>
                        {recurring ? (
                          <Ionicons
                            name="repeat-outline"
                            size={14}
                            color={theme.textSecondary}
                            style={{ marginLeft: 4 }}
                          />
                        ) : null}
                      </View>
                      <Text style={[styles.ledgerMeta, { color: theme.textSecondary }]}>
                        {isOwn ? 'You' : name} · {time}
                      </Text>
                    </View>
                    <Text style={[styles.ledgerAmount, { color: theme.text }]}>
                      {formatMoney(p.amount_cents, currency)}
                    </Text>
                  </Pressable>
                  {recurring && !isOwn && user ? (
                    <Pressable onPress={() => void handleClaim(p)} style={styles.claimStrip}>
                      <Text style={[styles.claimText, { color: theme.accent }]}>I paid this</Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            }

            const c = row.contribution;
            const isOwn = user?.id === c.user_id;
            const name = c.profile?.full_name || 'Anonymous';
            const time = new Date(c.created_at).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <View
                key={`g-${c.id}`}
                style={[
                  styles.ledgerRow,
                  index < rows.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.backgroundSelected,
                  },
                ]}
              >
                <View style={styles.ledgerRowMain}>
                  <View style={[styles.typeIcon, { backgroundColor: `${c.goal.color}22` }]}>
                    <Ionicons
                      name={c.goal.icon as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={c.goal.color}
                    />
                  </View>
                  <View style={styles.ledgerMid}>
                    <Text style={[styles.ledgerTitle, { color: theme.text }]} numberOfLines={2}>
                      Goal: {c.goal.name}
                    </Text>
                    {c.note ? (
                      <Text
                        style={[styles.ledgerNote, { color: theme.textSecondary }]}
                        numberOfLines={2}
                      >
                        {c.note}
                      </Text>
                    ) : null}
                    <Text style={[styles.ledgerMeta, { color: theme.textSecondary }]}>
                      {isOwn ? 'You' : name} · {time}
                    </Text>
                  </View>
                  <Text style={[styles.ledgerAmount, { color: theme.text }]}>
                    {formatMoney(c.amount_cents, currency)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBlock: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, marginBottom: Spacing.md },
  periodTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  meta: { fontSize: 15, marginTop: 6 },
  jumpCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1 },
  jumpRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  jumpTitle: { fontSize: 16, fontWeight: '600' },
  jumpSub: { fontSize: 14, marginTop: 2 },
  totalsCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, gap: 10 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalStrong: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  totalLabel: { fontSize: 15 },
  totalValue: { fontSize: 15, fontWeight: '600' },
  totalLabelStrong: { fontSize: 16, fontWeight: '600' },
  totalValueStrong: { fontSize: 18, fontWeight: '700' },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.lg,
    marginBottom: 4,
  },
  sectionHint: { fontSize: 13, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  empty: { textAlign: 'center', marginTop: 24, paddingHorizontal: Spacing.xl, fontSize: 16 },
  ledgerCard: { marginHorizontal: Spacing.lg, borderRadius: 16, overflow: 'hidden' },
  ledgerRow: {},
  ledgerRowMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ledgerMid: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  ledgerTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  ledgerNote: { fontSize: 14, marginTop: 2 },
  ledgerMeta: { fontSize: 13, marginTop: 4 },
  ledgerAmount: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  claimStrip: { paddingBottom: 10, paddingLeft: 68 },
  claimText: { fontSize: 14, fontWeight: '600' },
});
