import { useState } from 'react';
import { Alert, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { logout } from '@entities/auth';
import { Button } from '@shared/ui';
import { Colors, Spacing } from '@shared/lib/theme';

export default function SubExpiredScreen() {
  const { refresh } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>⏸️</Text>
        <Text style={[styles.title, { color: theme.text }]}>Subscription Expired</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your family owner's subscription has expired. Ask them to renew it to
          continue using FiftyFifty.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Refresh" onPress={handleRefresh} loading={refreshing} />
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 12 },
  subtitle: { fontSize: 17, textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
  actions: { gap: 12 },
});
