import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  REQUIRED_ENTITLEMENT_ID,
  REVENUECAT_ENABLED,
  checkSubscription,
  getSubscriptionTier,
  resolveMaxMembersForTier,
  syncRevenueCatSubscription,
} from '@entities/subscription';
import { supabase } from '@shared/config/supabase';
import { Colors } from '@shared/lib/theme';
import { Button } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

const ACCENT = '#208AEF';
const PAYWALL_LOG = '[Haven:paywall]';

function pwLog(...args: unknown[]) {
  if (__DEV__) console.log(PAYWALL_LOG, ...args);
}

export default function PaywallScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { refresh, family, isOwner } = useAppGateContext();
  const [restoring, setRestoring] = React.useState(false);

  const isRenewal = !!user && !!family && isOwner && !family.is_active;

  const syncAfterPurchase = useCallback(async () => {
    pwLog('syncAfterPurchase start', { userId: user?.id ?? null });
    try {
      if (REVENUECAT_ENABLED) {
        const Purchases = (await import('react-native-purchases')).default;
        try {
          const syncRes = await Purchases.syncPurchasesForResult();
          pwLog('syncPurchasesForResult ok', {
            activeKeys: Object.keys(syncRes.customerInfo.entitlements.active),
          });
        } catch (e) {
          pwLog('syncPurchasesForResult failed (continuing)', e);
        }
      }

      if (!user) {
        pwLog('syncAfterPurchase: no user, stop');
        return;
      }

      if (REVENUECAT_ENABLED) {
        await syncRevenueCatSubscription();
        const active = await checkSubscription();
        pwLog('after edge sync: checkSubscription', { active });
        if (active) {
          const { data: owned } = await supabase
            .from('families')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle();
          if (owned) {
            const tier = await getSubscriptionTier();
            const { count, error: countErr } = await supabase
              .from('family_members')
              .select('*', { count: 'exact', head: true })
              .eq('family_id', owned.id);
            if (!countErr) {
              const maxMembers = resolveMaxMembersForTier(tier.maxMembers, count ?? 0);
              const { error: upErr } = await supabase
                .from('families')
                .update({ is_active: true, max_members: maxMembers })
                .eq('id', owned.id);
              pwLog('Supabase families update', {
                familyId: owned.id,
                maxMembers,
                error: upErr?.message ?? null,
              });
            }
          }
        }
      } else {
        const { data: owned } = await supabase
          .from('families')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();
        if (owned) {
          const tier = await getSubscriptionTier();
          const { count, error: countErr } = await supabase
            .from('family_members')
            .select('*', { count: 'exact', head: true })
            .eq('family_id', owned.id);
          if (!countErr) {
            const maxMembers = resolveMaxMembersForTier(tier.maxMembers, count ?? 0);
            await supabase
              .from('families')
              .update({ is_active: true, max_members: maxMembers })
              .eq('id', owned.id);
          }
        }
      }
    } catch (err) {
      console.warn(PAYWALL_LOG, 'syncAfterPurchase failed:', err);
    }
    pwLog('syncAfterPurchase end');
  }, [user]);

  const presentPaywall = useCallback(async () => {
    if (!REVENUECAT_ENABLED) return;
    try {
      const RevenueCatUI = (await import('react-native-purchases-ui')).default;
      const { PAYWALL_RESULT } = await import('react-native-purchases-ui');
      pwLog('presentPaywallIfNeeded start', {
        requiredEntitlementIdentifier: REQUIRED_ENTITLEMENT_ID,
      });
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: REQUIRED_ENTITLEMENT_ID,
      });
      pwLog('presentPaywallIfNeeded result', { result: String(result) });
      if (
        result === PAYWALL_RESULT.PURCHASED ||
        result === PAYWALL_RESULT.RESTORED ||
        result === PAYWALL_RESULT.NOT_PRESENTED
      ) {
        await syncAfterPurchase();
        pwLog('calling gate refresh() after paywall result');
        refresh();
      } else {
        pwLog('skipped syncAfterPurchase (dismissed / error result)');
      }
    } catch (e) {
      pwLog('presentPaywall error', e);
    }
  }, [syncAfterPurchase, refresh]);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => void presentPaywall(), 300);
      return () => clearTimeout(timer);
    }, [presentPaywall]),
  );

  const handleRestore = async () => {
    if (!REVENUECAT_ENABLED) return;
    setRestoring(true);
    try {
      const Purchases = (await import('react-native-purchases')).default;
      pwLog('restorePurchases start');
      const info = await Purchases.restorePurchases();
      pwLog('restorePurchases done', {
        activeKeys: Object.keys(info.entitlements.active),
      });
      await syncAfterPurchase();
      refresh();
    } catch (e) {
      pwLog('restorePurchases error', e);
    } finally {
      setRestoring(false);
    }
  };

  const handleDevContinue = () => {
    refresh();
  };

  const features = [
    { icon: '💰', label: 'Full access to FiftyFifty' },
    { icon: '🔒', label: 'Private & secure — always' },
    { icon: '⚡', label: 'All features, no limits' },
    { icon: '💎', label: 'Support indie development' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + 24,
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>✨</Text>
        <Text style={[styles.title, { color: theme.text }]}>
          {isRenewal ? 'Renew Subscription' : 'Unlock FiftyFifty'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isRenewal
            ? 'Your subscription has expired. Renew to continue.'
            : 'Subscribe to get full access'}
        </Text>
      </View>

      <View style={styles.features}>
        {features.map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={[styles.featureLabel, { color: theme.text }]}>{f.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {REVENUECAT_ENABLED ? (
          <>
            <Pressable
              style={({ pressed }) => [styles.mainButton, pressed && styles.buttonPressed]}
              onPress={presentPaywall}
            >
              <Text style={styles.mainButtonText}>View Plans</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.restoreButton, pressed && styles.buttonPressed]}
              onPress={handleRestore}
              disabled={restoring}
            >
              {restoring ? (
                <ActivityIndicator size="small" color={theme.textSecondary} />
              ) : (
                <Text style={[styles.restoreText, { color: theme.textSecondary }]}>
                  Restore Purchases
                </Text>
              )}
            </Pressable>
            {isRenewal && (
              <Pressable
                style={({ pressed }) => [styles.restoreButton, pressed && styles.buttonPressed]}
                onPress={() => router.push('/(app)/(tabs)/settings')}
              >
                <Text style={[styles.restoreText, { color: theme.textSecondary }]}>
                  Family & account settings
                </Text>
              </Pressable>
            )}
          </>
        ) : (
          <Button title="Continue (dev)" onPress={handleDevContinue} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginTop: 48, marginBottom: 48 },
  headerEmoji: { fontSize: 56, marginBottom: 20 },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 17, lineHeight: 24, textAlign: 'center' },
  features: { gap: 20, marginBottom: 48 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  featureIcon: { fontSize: 28 },
  featureLabel: { fontSize: 17, fontWeight: '500' },
  actions: { marginTop: 'auto', gap: 12, paddingBottom: 16 },
  mainButton: {
    backgroundColor: ACCENT,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  restoreButton: { height: 44, justifyContent: 'center', alignItems: 'center' },
  restoreText: { fontSize: 15 },
  buttonPressed: { opacity: 0.7 },
});
