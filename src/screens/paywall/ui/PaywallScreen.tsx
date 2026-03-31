import { LinearGradient } from 'expo-linear-gradient';
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
import { Colors, Radii, fontFamily } from '@shared/lib/theme';
import { Button } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

const PAYWALL_LOG = '[Haven:paywall]';

function pwLog(...args: unknown[]) {
  if (__DEV__) console.log(PAYWALL_LOG, ...args);
}

export default function PaywallScreen() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[scheme];
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

  const onGradient = scheme === 'dark' ? '#F8FAFC' : '#FFFFFF';
  const onGradientMuted = scheme === 'dark' ? 'rgba(248,250,252,0.75)' : 'rgba(255,255,255,0.85)';

  return (
    <View style={styles.fill}>
      <LinearGradient
        colors={[theme.heroGradientStart, theme.heroGradientMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 24,
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>✨</Text>
          <Text style={[styles.title, { color: onGradient, fontFamily: fontFamily.display }]}>
            {isRenewal ? 'Renew Subscription' : 'Unlock FiftyFifty'}
          </Text>
          <Text style={[styles.subtitle, { color: onGradientMuted, fontFamily: fontFamily.body }]}>
            {isRenewal
              ? 'Your subscription has expired. Renew to continue.'
              : 'Subscribe to get full access'}
          </Text>
        </View>

        <View
          style={[
            styles.featureCard,
            { backgroundColor: theme.surface1, borderColor: theme.listDivider },
          ]}
        >
          {features.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text
                style={[
                  styles.featureLabel,
                  { color: theme.text, fontFamily: fontFamily.bodyMedium },
                ]}
              >
                {f.label}
              </Text>
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
                <LinearGradient
                  colors={[theme.progressGradientStart, theme.progressGradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mainButtonGradient}
                />
                <Text style={[styles.mainButtonText, { fontFamily: fontFamily.bodySemiBold }]}>
                  View Plans
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.restoreButton, pressed && styles.buttonPressed]}
                onPress={handleRestore}
                disabled={restoring}
              >
                {restoring ? (
                  <ActivityIndicator size="small" color={onGradientMuted} />
                ) : (
                  <Text
                    style={[
                      styles.restoreText,
                      { color: onGradientMuted, fontFamily: fontFamily.body },
                    ]}
                  >
                    Restore Purchases
                  </Text>
                )}
              </Pressable>
              {isRenewal && (
                <Pressable
                  style={({ pressed }) => [styles.restoreButton, pressed && styles.buttonPressed]}
                  onPress={() => router.push('/(app)/(tabs)/settings')}
                >
                  <Text
                    style={[
                      styles.restoreText,
                      { color: onGradientMuted, fontFamily: fontFamily.body },
                    ]}
                  >
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
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginTop: 32, marginBottom: 28 },
  headerEmoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 30, letterSpacing: -0.5, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 17, lineHeight: 24, textAlign: 'center' },
  featureCard: {
    borderRadius: Radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  featureIcon: { fontSize: 26 },
  featureLabel: { fontSize: 16, flex: 1 },
  actions: { marginTop: 'auto', gap: 12, paddingBottom: 16 },
  mainButton: {
    height: 56,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainButtonGradient: { ...StyleSheet.absoluteFillObject },
  mainButtonText: { color: '#FFFFFF', fontSize: 17 },
  restoreButton: { height: 44, justifyContent: 'center', alignItems: 'center' },
  restoreText: { fontSize: 15 },
  buttonPressed: { opacity: 0.85 },
});
