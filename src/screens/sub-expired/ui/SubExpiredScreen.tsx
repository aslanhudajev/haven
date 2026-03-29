import { useState } from 'react';
import { Alert, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';
import { logout } from '@entities/auth';
import { leaveFamily } from '@entities/family';
import { Button } from '@shared/ui';
import { Colors, Spacing } from '@shared/lib/theme';

export default function SubExpiredScreen() {
  const { refresh } = useAppGateContext();
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [leaving, setLeaving] = useState(false);

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

  const handleLeaveFamily = () => {
    if (!user) return;
    Alert.alert(
      'Leave this family?',
      'You will need to create or join another family to use FiftyFifty again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave family',
          style: 'destructive',
          onPress: async () => {
            setLeaving(true);
            try {
              await leaveFamily(user.id);
              refresh();
              router.replace('/(onboarding)/create-family');
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'Could not leave family');
            } finally {
              setLeaving(false);
            }
          },
        },
      ],
    );
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
          title="Leave family"
          onPress={handleLeaveFamily}
          loading={leaving}
          variant="secondary"
        />
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
