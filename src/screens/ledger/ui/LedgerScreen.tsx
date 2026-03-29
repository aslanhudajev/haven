import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import {
  countArchivedUnsettledPeriods,
  getLedgerPeriods,
  type Period,
  useLedgerTabBadgeStore,
} from '@entities/period';
import { getPurchases } from '@entities/purchase';
import { Card } from '@shared/ui';
import { Colors, Spacing } from '@shared/lib/theme';
import { formatDateRange, formatMoney } from '@shared/lib/format';

type PeriodWithTotal = Period & { totalCents: number };

function ledgerStatusLabel(status: Period['status']): { text: string; settled: boolean; ongoing: boolean } {
  if (status === 'active') return { text: 'Ongoing', settled: false, ongoing: true };
  if (status === 'resolved') return { text: 'Settled', settled: true, ongoing: false };
  return { text: 'Unsettled', settled: false, ongoing: false };
}

export default function LedgerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { family } = useAppGateContext();
  const setUnsettledCount = useLedgerTabBadgeStore((s) => s.setUnsettledArchivedCount);

  const [periods, setPeriods] = useState<PeriodWithTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const skipNextFocusLoad = useRef(false);

  const loadPeriods = useCallback(async () => {
    if (!family) return;
    try {
      const ledger = await getLedgerPeriods(family.id);
      setUnsettledCount(countArchivedUnsettledPeriods(ledger));
      const withTotals = await Promise.all(
        ledger.map(async (p) => {
          const purchases = await getPurchases(p.id);
          const totalCents = purchases.reduce((sum, pur) => sum + pur.amount_cents, 0);
          return { ...p, totalCents };
        }),
      );
      setPeriods(withTotals);
    } catch (err) {
      console.warn('Ledger load error:', err);
    }
  }, [family?.id, setUnsettledCount]);

  useEffect(() => {
    skipNextFocusLoad.current = true;
    loadPeriods().finally(() => setLoading(false));
  }, [loadPeriods]);

  useFocusEffect(
    useCallback(() => {
      if (skipNextFocusLoad.current) {
        skipNextFocusLoad.current = false;
        return;
      }
      void loadPeriods();
    }, [loadPeriods]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPeriods();
    setRefreshing(false);
  }, [loadPeriods]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (periods.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={styles.emptyEmoji}>📒</Text>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Nothing in the ledger yet</Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Your current period and past periods will show up here
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textSecondary} />
        }
      >
        <View style={styles.list}>
          {periods.map((p) => {
            const { text: badgeText, settled, ongoing } = ledgerStatusLabel(p.status);

            return (
              <Pressable
                key={p.id}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/period-report',
                    params: {
                      periodId: p.id,
                      periodName: p.name,
                      startsAt: p.starts_at,
                      endsAt: p.ends_at,
                      status: p.status,
                    },
                  })
                }
              >
                <Card style={styles.periodCard}>
                  <View style={styles.periodTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.periodName, { color: theme.text }]}>{p.name}</Text>
                      <Text style={[styles.periodRange, { color: theme.textSecondary }]}>
                        {formatDateRange(p.starts_at, p.ends_at)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        ongoing && { backgroundColor: `${theme.accent}22` },
                        settled && { backgroundColor: '#34C75920' },
                        !ongoing && !settled && { backgroundColor: theme.backgroundSelected },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          ongoing && { color: theme.accent },
                          settled && { color: '#34C759' },
                          !ongoing && !settled && { color: theme.textSecondary },
                        ]}
                      >
                        {badgeText}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.periodBottom}>
                    <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                      Total spent
                    </Text>
                    <Text style={[styles.totalAmount, { color: theme.text }]}>
                      {formatMoney(p.totalCents)}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 17, textAlign: 'center', lineHeight: 24 },
  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.sm },
  periodCard: { gap: 12 },
  periodTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  periodName: { fontSize: 18, fontWeight: '600' },
  periodRange: { fontSize: 14, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  periodBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.15)',
  },
  totalLabel: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase' },
  totalAmount: { fontSize: 18, fontWeight: '700' },
});
