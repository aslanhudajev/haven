import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { getErrorMessage } from '@shared/lib/errors';
import {
  APP_STORAGE_PENDING_INVITE_KEY,
  clearHouseholdIntent,
  saveHouseholdIntent,
} from '@shared/lib/storage';
import { Colors, Spacing } from '@shared/lib/theme';
import { Button, Input, ScreenContent } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(8, 'Code looks too short')
    .max(64, 'Code is too long')
    .regex(/^[a-fA-F0-9]+$/, 'Use only letters A–F and numbers'),
});

type FormData = z.infer<typeof schema>;

export default function EnterInviteCodeScreen() {
  const { refresh } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  });

  const onSubmit = useCallback(
    async ({ code }: FormData) => {
      setSubmitting(true);
      try {
        const normalized = code.trim().toLowerCase();
        await AsyncStorage.setItem(APP_STORAGE_PENDING_INVITE_KEY, normalized);
        await saveHouseholdIntent('join');
        refresh();
      } catch (err: unknown) {
        Alert.alert('Error', getErrorMessage(err, 'Could not save invite code'));
      } finally {
        setSubmitting(false);
      }
    },
    [refresh],
  );

  const switchToCreate = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(APP_STORAGE_PENDING_INVITE_KEY);
      await saveHouseholdIntent('create');
      refresh();
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not update your choice'));
    }
  }, [refresh]);

  const goBackToIntent = useCallback(async () => {
    try {
      await clearHouseholdIntent();
      refresh();
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not go back'));
    }
  }, [refresh]);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenContent scrollable padded style={{ paddingTop: insets.top + Spacing.md }}>
        <Pressable
          onPress={goBackToIntent}
          style={({ pressed }) => [styles.backRow, pressed && styles.backPressed]}
          accessibilityRole="button"
          accessibilityLabel="Back to household options"
        >
          <Ionicons name="chevron-back" size={22} color={theme.accent} />
          <Text style={[styles.backLabel, { color: theme.accent }]}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={[styles.heroIconWrap, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="keypad-outline" size={30} color={theme.accent} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Invite code</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Paste the code from your partner’s invite link or message. You’ll sign in next, then
            we’ll add you to their household.
          </Text>
        </View>

        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Family invite code"
              placeholder="e.g. a1b2c3…"
              value={value}
              onChangeText={(t) => onChange(t.replace(/\s/g, ''))}
              onBlur={onBlur}
              error={errors.code?.message}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              editable={!submitting}
            />
          )}
        />

        <Button title="Continue" onPress={handleSubmit(onSubmit)} loading={submitting} />

        <View style={styles.switchRow}>
          <Button
            title="I’m the one subscribing"
            onPress={switchToCreate}
            variant="ghost"
            disabled={submitting}
          />
        </View>
      </ScreenContent>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.md,
  },
  backPressed: { opacity: 0.6 },
  backLabel: { fontSize: 17, fontWeight: '600' },
  header: { marginBottom: Spacing.lg, alignItems: 'center' },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: Spacing.xs,
  },
  switchRow: { marginTop: Spacing.md },
});
