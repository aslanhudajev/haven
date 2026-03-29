import { Alert, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@shared/lib/theme';
import { logout } from '@entities/auth';
import { useFamilyStore } from '@entities/family';
import { usePeriodStore } from '@entities/period';
import { usePurchaseStore } from '@entities/purchase';
import { REVENUECAT_ENABLED } from '@entities/subscription';
import { useAuth } from '@app/providers/AuthProvider';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { Card } from '@shared/ui';
import { supabase } from '@shared/config/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user } = useAuth();
  const { family, isOwner, refresh } = useAppGateContext();
  const clearFamily = useFamilyStore((s) => s.clear);
  const clearPeriod = usePeriodStore((s) => s.clear);
  const clearPurchases = usePurchaseStore((s) => s.clear);

  const handleLeaveFamily = () => {
    if (!user || !family) return;

    const title = isOwner ? 'Delete Family?' : 'Leave Family?';
    const message = isOwner
      ? 'As the owner, this will delete the family for all members. This cannot be undone.'
      : 'You will be removed from this family. You can rejoin later with a new invite.';

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: isOwner ? 'Delete' : 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            if (isOwner) {
              await supabase.from('families').delete().eq('id', family.id);
            } else {
              await supabase
                .from('family_members')
                .delete()
                .eq('family_id', family.id)
                .eq('user_id', user.id);
            }
            clearFamily();
            clearPeriod();
            clearPurchases();
            refresh();
          } catch (err: any) {
            Alert.alert('Error', err.message ?? 'Something went wrong');
          }
        },
      },
    ]);
  };

  const handleDevReset = () => {
    Alert.alert(
      'Full Dev Reset',
      'This clears AsyncStorage, Zustand stores, signs out, and optionally resets RevenueCat. The app will restart at the welcome screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              clearFamily();
              clearPeriod();
              clearPurchases();

              if (REVENUECAT_ENABLED) {
                try {
                  const Purchases = (await import('react-native-purchases')).default;
                  await Purchases.logOut();
                } catch {}
              }

              await logout();
              await AsyncStorage.clear();
            } catch (err: any) {
              Alert.alert('Reset error', err.message);
            }
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Sign out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Card style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Account</Text>
        <Text style={[styles.value, { color: theme.text }]}>{user?.email ?? '—'}</Text>
      </Card>

      {family && (
        <Pressable onPress={() => router.push('/(app)/family-settings')}>
          <Card style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Family</Text>
            <Text style={[styles.value, { color: theme.text }]}>{family.name}</Text>
            <Text style={[styles.hint, { color: theme.accent }]}>Manage →</Text>
          </Card>
        </Pressable>
      )}

      {family && (
        <Pressable
          style={({ pressed }) => [
            styles.dangerButton,
            { borderColor: '#FF3B30' },
            pressed && styles.pressed,
          ]}
          onPress={handleLeaveFamily}
        >
          <Text style={styles.dangerText}>
            {isOwner ? 'Delete Family' : 'Leave Family'}
          </Text>
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          { borderColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>

      {__DEV__ && (
        <Pressable
          style={({ pressed }) => [
            styles.devResetButton,
            pressed && styles.pressed,
          ]}
          onPress={handleDevReset}
        >
          <Text style={styles.devResetText}>DEV: Full Reset</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  section: { marginBottom: Spacing.md },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: { fontSize: 17 },
  hint: { fontSize: 14, marginTop: 8 },
  dangerButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  dangerText: { fontSize: 17, fontWeight: '500', color: '#FF3B30' },
  logoutButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  pressed: { opacity: 0.7 },
  logoutText: { fontSize: 17, fontWeight: '500', color: '#FF3B30' },
  devResetButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  devResetText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
