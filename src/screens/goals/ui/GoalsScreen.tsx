import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getGoals, type Goal } from '@entities/goal';
import { formatMoney } from '@shared/lib/format';
import { Colors, Spacing } from '@shared/lib/theme';
import { useAppGateContext } from '@app/providers/AppGateProvider';

export default function GoalsScreen() {
  const router = useRouter();
  const { family } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const currency = family?.currency ?? 'SEK';

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!family?.id) return;
    setLoading(true);
    try {
      const list = await getGoals(family.id);
      setGoals(list);
    } catch {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [family?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!family) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>No family</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.md,
          paddingBottom: insets.bottom + 88,
        }}
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 48 }} />
        ) : goals.length === 0 ? (
          <View style={styles.emptyBlock}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name="flag-outline" size={36} color={theme.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No goals yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Create one to track savings as a household—trips, buffers, big purchases, and more.
            </Text>
            <Pressable
              style={[styles.emptyCta, { backgroundColor: theme.accent }]}
              onPress={() => router.push('/(app)/create-goal' as Href)}
            >
              <Text style={styles.emptyCtaText}>Start a goal</Text>
            </Pressable>
          </View>
        ) : (
          goals.map((g) => {
            const current = g.current_cents ?? 0;
            const pct = Math.min(Math.round((current / g.target_cents) * 100), 100);
            const done = Boolean(g.completed_at);
            return (
              <Pressable
                key={g.id}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/goal/[id]',
                    params: { id: g.id },
                  } as unknown as Href)
                }
                style={[styles.row, { backgroundColor: theme.backgroundElement }]}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${g.color}22` }]}>
                  <Ionicons
                    name={g.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={g.color}
                  />
                </View>
                <View style={styles.rowMid}>
                  <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                    {g.name}
                    {done ? ' ✓' : ''}
                  </Text>
                  <Text style={[styles.sub, { color: theme.textSecondary }]}>
                    {formatMoney(current, currency)} / {formatMoney(g.target_cents, currency)}
                  </Text>
                  <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
                    <View style={[styles.fill, { width: `${pct}%`, backgroundColor: g.color }]} />
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <Pressable
        style={[styles.fab, { backgroundColor: theme.accent }]}
        onPress={() => router.push('/(app)/create-goal' as Href)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBlock: {
    marginTop: 40,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 320,
  },
  emptyCta: {
    minHeight: 48,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCtaText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMid: { flex: 1, gap: 6 },
  name: { fontSize: 17, fontWeight: '600' },
  sub: { fontSize: 14, fontWeight: '500' },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
