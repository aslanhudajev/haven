import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BalanceCardWidget } from '@widgets/balance-card';
import { BudgetProgressWidget } from '@widgets/budget-progress';
import { GoalsSummaryWidget } from '@widgets/goals-summary';
import { getCategories, useCategoryStore } from '@entities/category';
import { getCategoryBudgets, useCategoryBudgetStore } from '@entities/category-budget';
import { useFamilyStore, getFamily, getMembers } from '@entities/family';
import { getGoalContributionsForPeriod, getGoals, useGoalStore } from '@entities/goal';
import { usePeriodStore, ensureActivePeriodForDashboard } from '@entities/period';
import { getPurchases, usePurchaseStore } from '@entities/purchase';
import { runSerialized } from '@shared/lib/async';
import { periodLog } from '@shared/lib/debug';
import { formatDateRange } from '@shared/lib/format';
import { Colors, Spacing } from '@shared/lib/theme';
import { Card } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const gate = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const setFamily = useFamilyStore((s) => s.setFamily);
  const setMembers = useFamilyStore((s) => s.setMembers);
  const members = useFamilyStore((s) => s.members);

  const activePeriod = usePeriodStore((s) => s.activePeriod);
  const setActivePeriod = usePeriodStore((s) => s.setActivePeriod);

  const purchases = usePurchaseStore((s) => s.purchases);
  const setPurchases = usePurchaseStore((s) => s.setPurchases);

  const setCategories = useCategoryStore((s) => s.setCategories);
  const categories = useCategoryStore((s) => s.categories);
  const setCategoryBudgets = useCategoryBudgetStore((s) => s.setBudgets);
  const categoryBudgets = useCategoryBudgetStore((s) => s.budgets);
  const setGoals = useGoalStore((s) => s.setGoals);
  const goals = useGoalStore((s) => s.goals);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [goalSpendByUser, setGoalSpendByUser] = useState<Record<string, number>>({});

  const family = gate.family;

  useEffect(() => {
    if (!user || !family) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        periodLog('dashboard.effect.load', { familyId: family.id, userId: user.id });
        setFamily(family);

        const mems = await getMembers(family.id);
        if (cancelled) return;
        setMembers(mems);

        const currentPeriod = await runSerialized(`dashboard-period:${family.id}`, () =>
          ensureActivePeriodForDashboard({
            familyId: family.id,
            cadence: family.period_cadence,
            anchorDay: family.period_anchor_day,
          }),
        );

        if (cancelled) return;
        setActivePeriod(currentPeriod);

        if (currentPeriod) {
          const [p, cats, budgets, goalList, goalContribs] = await Promise.all([
            getPurchases(currentPeriod.id),
            getCategories(family.id),
            getCategoryBudgets(family.id),
            getGoals(family.id),
            getGoalContributionsForPeriod(currentPeriod.id),
          ]);
          if (cancelled) return;
          setPurchases(p);
          setCategories(cats);
          setCategoryBudgets(budgets);
          setGoals(goalList);
          const byUser: Record<string, number> = {};
          goalContribs.forEach((c) => {
            byUser[c.user_id] = (byUser[c.user_id] ?? 0) + c.amount_cents;
          });
          setGoalSpendByUser(byUser);
        } else {
          setGoalSpendByUser({});
        }
      } catch (err) {
        console.warn('Dashboard load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, family?.id]);

  const onRefresh = useCallback(async () => {
    if (!user) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    try {
      const fam = await getFamily(user.id);
      setFamily(fam);
      if (fam) {
        const mems = await getMembers(fam.id);
        setMembers(mems);
        const period = await runSerialized(`dashboard-period:${fam.id}`, () =>
          ensureActivePeriodForDashboard({
            familyId: fam.id,
            cadence: fam.period_cadence,
            anchorDay: fam.period_anchor_day,
          }),
        );
        setActivePeriod(period);
        if (period) {
          const [p, cats, budgets, goalList, goalContribs] = await Promise.all([
            getPurchases(period.id),
            getCategories(fam.id),
            getCategoryBudgets(fam.id),
            getGoals(fam.id),
            getGoalContributionsForPeriod(period.id),
          ]);
          setPurchases(p);
          setCategories(cats);
          setCategoryBudgets(budgets);
          setGoals(goalList);
          const byUser: Record<string, number> = {};
          goalContribs.forEach((c) => {
            byUser[c.user_id] = (byUser[c.user_id] ?? 0) + c.amount_cents;
          });
          setGoalSpendByUser(byUser);
        } else {
          setGoalSpendByUser({});
        }
      }
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  if (!user) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!family) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.background, paddingTop: insets.top }]}
      >
        <Text style={styles.emoji}>👨‍👩‍👧‍👦</Text>
        <Text style={[styles.title, { color: theme.text }]}>No family yet</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Create a family to start tracking expenses
        </Text>
        <Pressable
          style={[styles.createBtn, { backgroundColor: theme.accent }]}
          onPress={() => router.replace('/(onboarding)/create-family')}
        >
          <Text style={styles.createBtnText}>Create Family</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + Spacing.md, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.textSecondary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.familyName, { color: theme.text }]}>{family.name}</Text>
          {activePeriod && (
            <Text style={[styles.periodRange, { color: theme.textSecondary }]}>
              {formatDateRange(activePeriod.starts_at, activePeriod.ends_at)}
            </Text>
          )}
        </View>

        <BalanceCardWidget
          purchases={purchases}
          goalSpendByUser={goalSpendByUser}
          members={members}
          budgetCents={family.budget_cents}
          currency={family.currency}
        />

        <BudgetProgressWidget
          purchases={purchases}
          categories={categories}
          categoryBudgets={categoryBudgets}
          currency={family.currency}
        />

        <GoalsSummaryWidget goals={goals} />

        {activePeriod ? (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(app)/period-ledger',
                params: {
                  periodId: activePeriod.id,
                  periodName: activePeriod.name,
                  startsAt: activePeriod.starts_at,
                  endsAt: activePeriod.ends_at,
                  status: activePeriod.status,
                },
              } as unknown as Href)
            }
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          >
            <Card
              style={StyleSheet.flatten([
                styles.ledgerHint,
                { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
              ])}
            >
              <View style={styles.ledgerHintRow}>
                <Ionicons name="receipt-outline" size={22} color={theme.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ledgerHintTitle, { color: theme.text }]}>
                    Period activity & ledger
                  </Text>
                  <Text style={[styles.ledgerHintSub, { color: theme.textSecondary }]}>
                    Tap for every purchase and goal contribution in order. Older periods: Ledger
                    tab.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </View>
            </Card>
          </Pressable>
        ) : null}
      </ScrollView>

      <Pressable
        style={[styles.fab, { backgroundColor: theme.accent }]}
        onPress={() => router.push('/(app)/add-purchase')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 17, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  createBtn: {
    height: 48,
    paddingHorizontal: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  header: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  familyName: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  periodRange: { fontSize: 15, marginTop: 4 },
  ledgerHint: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  ledgerHintRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ledgerHintTitle: { fontSize: 16, fontWeight: '600' },
  ledgerHintSub: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '400', marginTop: -2 },
});
