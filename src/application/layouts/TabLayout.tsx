import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  countArchivedUnsettledPeriods,
  getLedgerPeriods,
  useLedgerTabBadgeStore,
} from '@entities/period';
import { fontFamily, useTheme } from '@shared/lib/theme';
import { useAppGateContext } from '@app/providers/AppGateProvider';

export default function TabLayout() {
  const { colors: theme, tabBarShadow } = useTheme();
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
        headerTitleStyle: { fontFamily: fontFamily.bodySemiBold, fontSize: 17 },
        headerStyle: {
          backgroundColor: theme.surface0,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.listDivider,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.surface1,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.borderSubtle,
          paddingTop: 6,
          height: 62,
          ...tabBarShadow,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: { fontFamily: fontFamily.bodyMedium, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconWrap}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size + 1} color={color} />
              {focused ? <View style={[styles.tabDot, { backgroundColor: theme.accent }]} /> : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ledger"
        options={{
          title: 'Ledger',
          tabBarBadge: ledgerBadge,
          tabBarBadgeStyle: { backgroundColor: theme.danger, fontFamily: fontFamily.bodyBold },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size + 1} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconWrap}>
              <Ionicons
                name={focused ? 'settings' : 'settings-outline'}
                size={size + 1}
                color={color}
              />
              {focused ? <View style={[styles.tabDot, { backgroundColor: theme.accent }]} /> : null}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', minHeight: 28 },
  tabDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
});
