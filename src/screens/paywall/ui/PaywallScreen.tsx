import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  REVENUECAT_ENABLED,
  checkSubscription,
  getSubscriptionTier,
  syncRevenueCatSubscription,
} from '@entities/subscription';
import { supabase } from '@shared/config/supabase';
import { Colors } from '@shared/lib/theme';
import { Button } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

const ACCENT = '#208AEF';

export default function PaywallScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { refresh, family, isOwner } = useAppGateContext();
  const [restoring, setRestoring] = useState(false);
  const attempted = useRef(false);

  const isRenewal = !!user && !!family && isOwner && !family.is_active;

  const presentPaywall = async () => {
    if (!REVENUECAT_ENABLED) return;
    try {
      const RevenueCatUI = (await import('react-native-purchases-ui')).default;
      const { PAYWALL_RESULT } = await import('react-native-purchases-ui');
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: 'pro_access',
      });
      if (
        result === PAYWALL_RESULT.PURCHASED ||
        result === PAYWALL_RESULT.RESTORED ||
        result === PAYWALL_RESULT.NOT_PRESENTED
      ) {
        await syncAfterPurchase();
        refresh();
      }
    } catch {
      // RevenueCat UI not available
    }
  };

  const syncAfterPurchase = async () => {
    if (!user) return;
    try {
      if (REVENUECAT_ENABLED) {
        await syncRevenueCatSubscription();
        if (family && (await checkSubscription())) {
          const tier = await getSubscriptionTier();
          await supabase
            .from('families')
            .update({ is_active: true, max_members: tier.maxMembers })
            .eq('id', family.id);
        }
      } else if (family) {
        const tier = await getSubscriptionTier();
        await supabase
          .from('families')
          .update({ is_active: true, max_members: tier.maxMembers })
          .eq('id', family.id);
      }
    } catch (err) {
      console.warn('Post-purchase sync failed:', err);
    }
  };

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    const timer = setTimeout(presentPaywall, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleRestore = async () => {
    if (!REVENUECAT_ENABLED) return;
    setRestoring(true);
    try {
      const Purchases = (await import('react-native-purchases')).default;
      await Purchases.restorePurchases();
      await syncAfterPurchase();
      refresh();
    } catch {
      // restore not available
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
