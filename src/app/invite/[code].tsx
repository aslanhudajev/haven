import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { isJoinFamilyError, joinFamily } from '@entities/family';
import {
  APP_STORAGE_PENDING_INVITE_KEY,
  clearHouseholdIntent,
  saveHouseholdIntent,
} from '@shared/lib/storage';
import { Colors } from '@shared/lib/theme';
import { Button } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useAuth();
  const { refresh } = useAppGateContext();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!code) return;
    await AsyncStorage.setItem(APP_STORAGE_PENDING_INVITE_KEY, code);
    await saveHouseholdIntent('join');

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    setJoining(true);
    try {
      await joinFamily(code);
      await AsyncStorage.removeItem(APP_STORAGE_PENDING_INVITE_KEY);
      refresh();
      router.replace('/(app)/(tabs)');
    } catch (err: unknown) {
      if (isJoinFamilyError(err)) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Could not join family');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleDeny = async () => {
    await AsyncStorage.removeItem(APP_STORAGE_PENDING_INVITE_KEY);
    await clearHouseholdIntent();
    refresh();
    router.replace('/');
  };

  if (joining) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.subtitle, { color: theme.textSecondary, marginTop: 16 }]}>
          Joining family...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.heroIconWrap, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="alert-circle-outline" size={40} color={theme.accent} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Oops</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{error}</Text>
        <Button
          title="Go Home"
          onPress={() => router.replace('/')}
          style={{ marginTop: 24, width: 200 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.heroIconWrap, { backgroundColor: theme.backgroundElement }]}>
        <Ionicons name="link-outline" size={40} color={theme.accent} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>Family Invite</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        You've been invited to join a family on FiftyFifty.
      </Text>
      <View style={styles.actions}>
        <Button title="Accept Invite" onPress={handleAccept} />
        <Button title="Deny" onPress={handleDeny} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  heroIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 17, textAlign: 'center', lineHeight: 24 },
  actions: { marginTop: 32, width: '100%', gap: 12 },
});
