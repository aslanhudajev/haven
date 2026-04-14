import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import {
  addGoalContribution,
  deleteGoal,
  getGoal,
  getGoalContributions,
  updateGoal,
  type Goal,
  type GoalContribution,
} from '@entities/goal';
import { usePeriodStore } from '@entities/period';
import { getErrorMessage } from '@shared/lib/errors';
import { formatMoney, toCents } from '@shared/lib/format';
import { Colors, Spacing } from '@shared/lib/theme';
import { Button, Input } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { family, isOwner } = useAppGateContext();
  const activePeriod = usePeriodStore((s) => s.activePeriod);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const currency = family?.currency ?? 'SEK';

  const [goal, setGoal] = useState<Goal | null>(null);
  const [contributions, setContributions] = useState<GoalContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    if (!id || !family?.id) return;
    setLoading(true);
    try {
      const g = await getGoal(id);
      if (!g || g.family_id !== family.id) {
        setGoal(null);
        setContributions([]);
        return;
      }
      setGoal(g);
      const rows = await getGoalContributions(id);
      setContributions(rows);
    } catch {
      setGoal(null);
    } finally {
      setLoading(false);
    }
  }, [id, family?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = goal?.current_cents ?? 0;
  const pct = goal ? Math.min(Math.round((current / goal.target_cents) * 100), 100) : 0;

  const canManage = goal && user && (goal.created_by === user.id || isOwner) && !goal.completed_at;

  const handleAddContribution = async () => {
    if (!user || !goal || goal.completed_at) return;
    if (!activePeriod) {
      Alert.alert(
        'No active period',
        'Contributions are tied to your household’s current period. Try again when a period is active.',
      );
      return;
    }
    const n = parseFloat(amountStr);
    if (isNaN(n) || n <= 0) {
      Alert.alert('Amount', 'Enter a positive amount.');
      return;
    }
    setAdding(true);
    try {
      await addGoalContribution({
        goalId: goal.id,
        userId: user.id,
        periodId: activePeriod.id,
        amountCents: toCents(n),
        note: note.trim() || null,
      });
      setAmountStr('');
      setNote('');
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not add contribution'));
    } finally {
      setAdding(false);
    }
  };

  const handleMarkComplete = () => {
    if (!goal) return;
    Alert.alert('Mark complete?', 'You can still view this goal in the list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          try {
            await updateGoal(goal.id, { completed_at: new Date().toISOString() });
            await load();
          } catch (err: unknown) {
            Alert.alert('Error', getErrorMessage(err, 'Could not update'));
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    if (!goal) return;
    Alert.alert('Delete goal?', 'This removes the goal and all contributions.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGoal(goal.id);
            router.back();
          } catch (err: unknown) {
            Alert.alert('Error', getErrorMessage(err, 'Could not delete'));
          }
        },
      },
    ]);
  };

  if (!family || loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Loading…</Text>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Goal not found</Text>
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
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
        <View style={[styles.headerCard, { backgroundColor: theme.backgroundElement }]}>
          <View style={[styles.iconWrap, { backgroundColor: `${goal.color}22` }]}>
            <Ionicons
              name={goal.icon as keyof typeof Ionicons.glyphMap}
              size={28}
              color={goal.color}
            />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{goal.name}</Text>
          {goal.completed_at ? (
            <Text style={[styles.badge, { color: '#34C759' }]}>Completed</Text>
          ) : null}
          <Text style={[styles.amountLine, { color: theme.textSecondary }]}>
            {formatMoney(current, currency)} / {formatMoney(goal.target_cents, currency)} ({pct}%)
          </Text>
          <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: goal.color }]} />
          </View>
        </View>

        {!goal.completed_at && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              Add contribution
            </Text>
            <Input
              label={`Amount (${currency})`}
              value={amountStr}
              onChangeText={setAmountStr}
              keyboardType="decimal-pad"
              placeholder="0"
            />
            <Input
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Sold old bike"
            />
            <Button
              title="Add to goal"
              onPress={() => void handleAddContribution()}
              loading={adding}
            />
          </>
        )}

        <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 20 }]}>
          History
        </Text>
        {contributions.length === 0 ? (
          <Text style={{ color: theme.textSecondary }}>No contributions yet.</Text>
        ) : (
          contributions.map((c) => (
            <View
              key={c.id}
              style={[styles.histRow, { borderBottomColor: theme.backgroundSelected }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.histAmt, { color: theme.text }]}>
                  +{formatMoney(c.amount_cents, currency)}
                </Text>
                {c.note ? (
                  <Text style={[styles.histNote, { color: theme.textSecondary }]}>{c.note}</Text>
                ) : null}
                <Text style={[styles.histMeta, { color: theme.textSecondary }]}>
                  {c.profile?.full_name?.trim() || 'Member'} ·{' '}
                  {new Date(c.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}

        {canManage ? (
          <View style={styles.actions}>
            {!goal.completed_at && pct >= 100 ? (
              <Button title="Mark complete" onPress={handleMarkComplete} />
            ) : null}
            <Pressable onPress={handleDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Delete goal</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  headerCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  badge: { fontSize: 14, fontWeight: '600' },
  amountLine: { fontSize: 15, fontWeight: '500' },
  track: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 3 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  histRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  histAmt: { fontSize: 16, fontWeight: '600' },
  histNote: { fontSize: 14, marginTop: 2 },
  histMeta: { fontSize: 12, marginTop: 4 },
  actions: { marginTop: 24, gap: 12 },
  deleteBtn: { alignItems: 'center', paddingVertical: 12 },
  deleteText: { fontSize: 16, fontWeight: '600', color: '#FF3B30' },
});
