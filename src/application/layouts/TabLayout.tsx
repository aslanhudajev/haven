import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  countArchivedUnsettledPeriods,
  getLedgerPeriods,
  useLedgerTabBadgeStore,
} from '@entities/period';
import { Colors } from '@shared/lib/theme';
import { useAppGateContext } from '@app/providers/AppGateProvider';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { family } = useAppGateContext();
  const unsettledCount = useLedgerTabBadgeStore((s) => s.unsettledArchivedCount);
  const clearLedgerBadge = useLedgerTabBadgeStore((s) => s.clear);

  useEffect(() => {
    if (!family) {
      clearLedgerBadge();
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const ledger = await getLedgerPeriods(family.id);
        if (!cancelled) {
          useLedgerTabBadgeStore
            .getState()
            .setUnsettledArchivedCount(countArchivedUnsettledPeriods(ledger));
        }
      } catch {
        /* badge is best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [family, clearLedgerBadge]);

  const ledgerBadge =
    family && unsettledCount > 0
      ? unsettledCount > 99
        ? '99+'
        : String(unsettledCount)
      : undefined;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTintColor: theme.text,
        headerStyle: { backgroundColor: theme.background },
        tabBarStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ledger"
        options={{
          title: 'Ledger',
          tabBarBadge: ledgerBadge,
          tabBarBadgeStyle: { backgroundColor: '#FF3B30' },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
