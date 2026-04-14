import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createGoal } from '@entities/goal';
import { getErrorMessage } from '@shared/lib/errors';
import { toCents } from '@shared/lib/format';
import { Colors, Spacing } from '@shared/lib/theme';
import { Button, Input } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

const GOAL_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'flag-outline',
  'airplane-outline',
  'home-outline',
  'car-outline',
  'gift-outline',
  'heart-outline',
];

const GOAL_COLORS = ['#208AEF', '#34C759', '#FF9F0A', '#AF52DE', '#FF3B30', '#30D158'];

export default function CreateGoalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { family } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [targetStr, setTargetStr] = useState('');
  const [icon, setIcon] = useState<(typeof GOAL_ICONS)[number]>('flag-outline');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user || !family) return;
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Give your goal a short name.');
      return;
    }
    const n = parseFloat(targetStr);
    if (isNaN(n) || n <= 0) {
      Alert.alert('Target amount', 'Enter a valid target amount.');
      return;
    }
    setSaving(true);
    try {
      await createGoal({
        familyId: family.id,
        userId: user.id,
        name: trimmed,
        targetCents: toCents(n),
        icon,
        color,
      });
      router.back();
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not create goal'));
    } finally {
      setSaving(false);
    }
  };

  if (!family) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>No family</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Goal name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Summer trip"
        />
        <Input
          label={`Target (${family.currency})`}
          value={targetStr}
          onChangeText={setTargetStr}
          placeholder="0"
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Icon</Text>
        <View style={styles.iconRow}>
          {GOAL_ICONS.map((ic) => {
            const active = icon === ic;
            return (
              <Pressable
                key={ic}
                style={[
                  styles.iconChip,
                  {
                    borderColor: active ? theme.accent : theme.backgroundSelected,
                    backgroundColor: active ? `${theme.accent}22` : theme.backgroundElement,
                  },
                ]}
                onPress={() => setIcon(ic)}
              >
                <Ionicons name={ic} size={22} color={active ? theme.accent : theme.text} />
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
        <View style={styles.colorRow}>
          {GOAL_COLORS.map((c) => {
            const active = color === c;
            return (
              <Pressable
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  active && styles.colorDotRing,
                  active && { borderColor: theme.text },
                ]}
                onPress={() => setColor(c)}
              />
            );
          })}
        </View>

        <Button title="Create goal" onPress={() => void submit()} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 8,
  },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  iconChip: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotRing: { borderWidth: 3, borderColor: '#fff' },
});
