import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppProvider';
import { Colors } from '@/constants/theme';

const ACCENT = '#208AEF';

export default function PaywallScreen() {
  const { resetOnboarding, refreshSubscription } = useApp();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const [restoring, setRestoring] = useState(false);
  const attempted = useRef(false);

  const presentPaywall = async () => {
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: 'Haven Pro',
      });

      if (
        result === PAYWALL_RESULT.PURCHASED ||
        result === PAYWALL_RESULT.RESTORED ||
        result === PAYWALL_RESULT.NOT_PRESENTED
      ) {
        await refreshSubscription();
      }
    } catch {
      // react-native-purchases-ui doesn't work in Expo Go preview mode
    }
  };

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    const timer = setTimeout(presentPaywall, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await Purchases.restorePurchases();
      await refreshSubscription();
    } catch {
      // restore not available in preview mode
    } finally {
      setRestoring(false);
    }
  };

  const features = [
    { icon: '🏡', label: 'Full access to Haven' },
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
          Unlock Haven
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Subscribe to get full access
        </Text>
      </View>

      <View style={styles.features}>
        {features.map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={[styles.featureLabel, { color: theme.text }]}>
              {f.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.mainButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={presentPaywall}
        >
          <Text style={styles.mainButtonText}>View Plans</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.restoreButton,
            pressed && styles.buttonPressed,
          ]}
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

        <Pressable
          style={({ pressed }) => [
            styles.restartButton,
            pressed && styles.buttonPressed,
            { borderColor: theme.textSecondary + '40' },
          ]}
          onPress={resetOnboarding}
        >
          <Text style={[styles.restartText, { color: theme.textSecondary }]}>
            Restart Onboarding
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 48,
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
  features: {
    gap: 20,
    marginBottom: 48,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureLabel: {
    fontSize: 17,
    fontWeight: '500',
  },
  actions: {
    marginTop: 'auto',
    gap: 12,
    paddingBottom: 16,
  },
  mainButton: {
    backgroundColor: ACCENT,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  restoreButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 15,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  restartButton: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restartText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
