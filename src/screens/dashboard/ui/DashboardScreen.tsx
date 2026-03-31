import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BalanceCardWidget } from '@widgets/balance-card';
import { PurchaseListWidget } from '@widgets/purchase-list';
import { useFamilyStore, getFamily, getMembers } from '@entities/family';
import { usePeriodStore, ensureActivePeriodForDashboard } from '@entities/period';
import { usePurchaseStore, getPurchases } from '@entities/purchase';
import { runSerialized } from '@shared/lib/async';
import { periodLog } from '@shared/lib/debug';
import { formatDateRange } from '@shared/lib/format';
import {
  Colors,
  Motion,
  Radii,
  Spacing,
  cardElevation,
  fabElevation,
  fontFamily,
} from '@shared/lib/theme';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const gate = useAppGateContext();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();

  const setFamily = useFamilyStore((s) => s.setFamily);
  const setMembers = useFamilyStore((s) => s.setMembers);
  const members = useFamilyStore((s) => s.members);

  const activePeriod = usePeriodStore((s) => s.activePeriod);
  const setActivePeriod = usePeriodStore((s) => s.setActivePeriod);

  const purchases = usePurchaseStore((s) => s.purchases);
  const setPurchases = usePurchaseStore((s) => s.setPurchases);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const family = gate.family;

  const fabScale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

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
          const p = await getPurchases(currentPeriod.id);
          if (cancelled) return;
          setPurchases(p);
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
    setRefreshing(true);
    try {
      const fam = await getFamily(user!.id);
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
          setPurchases(await getPurchases(period.id));
        }
      }
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  const gradientBg = (
    <LinearGradient
      colors={[theme.heroGradientStart, theme.heroGradientMid, theme.heroGradientEnd]}
      locations={[0, 0.38, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );

  if (loading) {
    return (
      <View style={styles.fill}>
        {gradientBg}
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </View>
    );
  }

  if (!family) {
    return (
      <View style={styles.fill}>
        {gradientBg}
        <View style={[styles.centered, { paddingTop: insets.top, paddingHorizontal: 32 }]}>
          <Text style={styles.emoji}>👨‍👩‍👧‍👦</Text>
          <Text
            style={[styles.title, { color: theme.surface1, fontFamily: fontFamily.displayBold }]}
          >
            No family yet
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: 'rgba(255,255,255,0.85)', fontFamily: fontFamily.body },
            ]}
          >
            Create a family to start tracking expenses
          </Text>
          <Pressable
            style={[styles.createBtn, { backgroundColor: theme.surface1 }]}
            onPress={() => router.replace('/(onboarding)/create-family')}
          >
            <Text
              style={[
                styles.createBtnText,
                { color: theme.accent, fontFamily: fontFamily.bodySemiBold },
              ]}
            >
              Create Family
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {gradientBg}
      <ScrollView
        style={styles.scrollTransparent}
        contentContainerStyle={{ paddingTop: insets.top + Spacing.md, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.surface1}
          />
        }
      >
        <View
          style={[
            styles.hero,
            { backgroundColor: theme.surface1, borderColor: theme.listDivider },
            cardElevation(scheme),
          ]}
        >
          <View style={styles.heroContent}>
            <Text
              style={[styles.familyName, { color: theme.text, fontFamily: fontFamily.displayBold }]}
            >
              {family.name}
            </Text>
            {activePeriod && (
              <Text
                style={[
                  styles.periodRange,
                  { color: theme.textSecondary, fontFamily: fontFamily.body },
                ]}
              >
                {formatDateRange(activePeriod.starts_at, activePeriod.ends_at)}
              </Text>
            )}
          </View>
        </View>

        <BalanceCardWidget
          purchases={purchases}
          members={members}
          budgetCents={family.budget_cents}
          currency={family.currency}
        />

        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.text, fontFamily: fontFamily.display }]}>
            Purchases
          </Text>
        </View>

        <PurchaseListWidget
          currentUserId={user!.id}
          currency={family.currency}
          onPressPurchase={(p) =>
            router.push({
              pathname: '/(app)/edit-purchase',
              params: { purchaseId: p.id },
            })
          }
        />
      </ScrollView>

      <AnimatedPressable
        style={[fabStyle, styles.fab, fabElevation(scheme)]}
        onPressIn={() => {
          fabScale.value = withSpring(Motion.pressScale, Motion.springDefault);
        }}
        onPressOut={() => {
          fabScale.value = withSpring(1, Motion.springDefault);
        }}
        onPress={() => router.push('/(app)/add-purchase')}
      >
        <LinearGradient
          colors={[theme.progressGradientStart, theme.progressGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        />
        <Ionicons name="add" size={30} color="#FFFFFF" style={styles.fabIcon} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollTransparent: { flex: 1, backgroundColor: 'transparent' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 28, marginBottom: 8 },
  subtitle: { fontSize: 17, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  createBtn: {
    height: 48,
    paddingHorizontal: 32,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtnText: { fontSize: 17 },
  hero: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  heroContent: { padding: Spacing.lg },
  familyName: { fontSize: 26, letterSpacing: -0.5 },
  periodRange: { fontSize: 15, marginTop: 6 },
  listHeader: { paddingHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: Spacing.sm },
  listTitle: { fontSize: 20 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 16,
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabGradient: { ...StyleSheet.absoluteFillObject },
  fabIcon: { position: 'absolute' },
});
