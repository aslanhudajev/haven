import { useState } from 'react';
import { Alert, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile } from '@entities/profile';
import { useAuth } from '@app/providers/AuthProvider';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { Button, Input } from '@shared/ui';
import { Colors, Spacing } from '@shared/lib/theme';

const schema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingProfileScreen() {
  const { user } = useAuth();
  const { refresh } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '' },
  });

  const onSubmit = async ({ fullName }: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user.id, {
        full_name: fullName,
        onboarding_completed: true,
      });
      refresh();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not save profile');
    } finally {
      setLoading(false);
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
      <View style={styles.header}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={[styles.title, { color: theme.text }]}>What should we call you?</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Set your display name so your family knows who you are.
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Display name"
              placeholder="e.g. Alex"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.fullName?.message}
              autoFocus
            />
          )}
        />
      </View>

      <View style={styles.actions}>
        <Button title="Continue" onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginTop: 48, marginBottom: 40 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 17, textAlign: 'center', lineHeight: 24 },
  form: { flex: 1 },
  actions: { gap: 12 },
});
