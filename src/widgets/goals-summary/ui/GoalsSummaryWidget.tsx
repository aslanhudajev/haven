import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { Goal } from '@entities/goal';
import { Colors, Spacing } from '@shared/lib/theme';

type Props = {
  goals: Goal[];
};

export function GoalsSummaryWidget({ goals }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const active = goals.filter((g) => !g.completed_at).slice(0, 3);
  if (active.length === 0) return null;

  return (
    <Pressable
      onPress={() => router.push('/(app)/goals' as Href)}
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textSecondary }]}>Goals</Text>
        <Text style={[styles.link, { color: theme.accent }]}>View all</Text>
      </View>
      {active.map((g) => {
        const current = g.current_cents ?? 0;
        const pct = Math.min(Math.round((current / g.target_cents) * 100), 100);
        return (
          <View key={g.id} style={styles.goalRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${g.color}22` }]}>
              <Ionicons name={g.icon as keyof typeof Ionicons.glyphMap} size={18} color={g.color} />
            </View>
            <View style={styles.goalMid}>
              <Text style={[styles.goalName, { color: theme.text }]} numberOfLines={1}>
                {g.name}
              </Text>
              <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
                <View style={[styles.fill, { width: `${pct}%`, backgroundColor: g.color }]} />
              </View>
            </View>
            <Text style={[styles.goalPct, { color: theme.textSecondary }]}>{pct}%</Text>
          </View>
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  link: { fontSize: 14, fontWeight: '600' },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalMid: { flex: 1, gap: 4 },
  goalName: { fontSize: 15, fontWeight: '600' },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  goalPct: { fontSize: 13, fontWeight: '600', width: 36, textAlign: 'right' },
});
