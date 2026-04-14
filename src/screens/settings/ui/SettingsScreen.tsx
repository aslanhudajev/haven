import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { deleteAccount, logout } from '@entities/auth';
import { useCategoryStore } from '@entities/category';
import { useCategoryBudgetStore } from '@entities/category-budget';
import { useFamilyStore } from '@entities/family';
import { useGoalStore } from '@entities/goal';
import { useLedgerTabBadgeStore, usePeriodStore } from '@entities/period';
import { getProfile, updateProfile } from '@entities/profile';
import { usePurchaseStore } from '@entities/purchase';
import { useRecurringCostStore } from '@entities/recurring-cost';
import { REVENUECAT_ENABLED } from '@entities/subscription';
import { supabase } from '@shared/config/supabase';
import { getErrorMessage } from '@shared/lib/errors';
import { Colors, Spacing } from '@shared/lib/theme';
import { Button, Card, Input } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user } = useAuth();
  const { family, isOwner, refresh } = useAppGateContext();
  const [profileName, setProfileName] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const p = await getProfile(user.id);
      setProfileName(p?.full_name?.trim() ?? '');
    } catch {
      setProfileName('');
    }
  }, [user?.id]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setProfileSaving(true);
    try {
      await updateProfile(user.id, { full_name: profileName.trim() || '' });
      setEditingProfile(false);
      refresh();
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not save profile'));
    } finally {
      setProfileSaving(false);
    }
  };
  const clearFamily = useFamilyStore((s) => s.clear);
  const clearPeriod = usePeriodStore((s) => s.clear);
  const clearLedgerBadge = useLedgerTabBadgeStore((s) => s.clear);
  const clearPurchases = usePurchaseStore((s) => s.clear);
  const clearCategories = useCategoryStore((s) => s.clear);
  const clearCategoryBudgets = useCategoryBudgetStore((s) => s.clear);
  const clearGoals = useGoalStore((s) => s.clear);
  const clearRecurring = useRecurringCostStore((s) => s.clear);

  const clearDomainStores = () => {
    clearFamily();
    clearPeriod();
    clearLedgerBadge();
    clearPurchases();
    clearCategories();
    clearCategoryBudgets();
    clearGoals();
    clearRecurring();
  };

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
            clearDomainStores();
            refresh();
          } catch (err: unknown) {
            Alert.alert('Error', getErrorMessage(err, 'Something went wrong'));
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account and profile. If you own a family, that family and its data are removed for all members. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              clearDomainStores();
              if (REVENUECAT_ENABLED) {
                try {
                  const Purchases = (await import('react-native-purchases')).default;
                  await Purchases.logOut();
                } catch {}
              }
              await logout();
              await AsyncStorage.clear();
            } catch (err: unknown) {
              Alert.alert('Error', getErrorMessage(err, 'Could not delete account'));
            }
          },
        },
      ],
    );
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
              clearDomainStores();

              if (REVENUECAT_ENABLED) {
                try {
                  const Purchases = (await import('react-native-purchases')).default;
                  await Purchases.logOut();
                } catch {}
              }

              await logout();
              await AsyncStorage.clear();
            } catch (err: unknown) {
              Alert.alert('Reset error', getErrorMessage(err, 'Reset failed'));
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
            clearDomainStores();
            await logout();
          } catch (err: unknown) {
            Alert.alert('Error', getErrorMessage(err, 'Sign out failed'));
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

      <Card style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Profile</Text>
        {editingProfile ? (
          <>
            <Input
              label="Display name"
              value={profileName}
              onChangeText={setProfileName}
              placeholder="Your name"
              autoCapitalize="words"
            />
            <View style={styles.profileActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setEditingProfile(false);
                  void loadProfile();
                }}
                style={styles.profileBtnHalf}
              />
              <Button
                title="Save"
                onPress={() => void handleSaveProfile()}
                loading={profileSaving}
                style={styles.profileBtnHalf}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.value, { color: theme.text }]}>{profileName || 'Not set'}</Text>
            <Pressable onPress={() => setEditingProfile(true)} hitSlop={8}>
              <Text style={[styles.hint, { color: theme.accent }]}>Edit name</Text>
            </Pressable>
          </>
        )}
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
        <Pressable onPress={() => router.push('/(app)/goals' as Href)}>
          <Card style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Goals</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              Shared savings targets for your household
            </Text>
            <Text style={[styles.hint, { color: theme.accent }]}>Open →</Text>
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
          <Text style={styles.dangerText}>{isOwner ? 'Delete Family' : 'Leave Family'}</Text>
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

      <Pressable
        style={({ pressed }) => [
          styles.deleteAccountButton,
          { borderColor: '#FF3B30' },
          pressed && styles.pressed,
        ]}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.deleteAccountText}>Delete account</Text>
      </Pressable>

      {__DEV__ && (
        <Pressable
          style={({ pressed }) => [styles.devResetButton, pressed && styles.pressed]}
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
  profileActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  profileBtnHalf: { flex: 1 },
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
  deleteAccountButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  deleteAccountText: { fontSize: 16, fontWeight: '500', color: '#FF3B30' },
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
