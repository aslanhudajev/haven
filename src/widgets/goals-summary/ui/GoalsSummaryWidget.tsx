import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { Goal } from '@entities/goal';
import { Colors, Spacing } from '@shared/lib/theme';

const GOALS_LIST = '/(app)/goals' as Href;
const CREATE_GOAL = '/(app)/create-goal' as Href;

type Props = {
  goals: Goal[];
};

export function GoalsSummaryWidget({ goals }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const active = goals.filter((g) => !g.completed_at).slice(0, 3);
  const hasActive = active.length > 0;
  const hasAnyGoal = goals.length > 0;
  const allComplete = hasAnyGoal && !hasActive;

  if (hasActive) {
    return (
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textSecondary }]}>Goals</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push(GOALS_LIST)} hitSlop={10}>
              <Text style={[styles.link, { color: theme.accent }]}>View all</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(CREATE_GOAL)}
              hitSlop={10}
              style={[styles.addIconBtn, { backgroundColor: theme.background }]}
              accessibilityLabel="New goal"
            >
              <Ionicons name="add" size={22} color={theme.accent} />
            </Pressable>
          </View>
        </View>
        <Pressable onPress={() => router.push(GOALS_LIST)}>
          {active.map((g) => {
            const current = g.current_cents ?? 0;
            const pct = Math.min(Math.round((current / g.target_cents) * 100), 100);
            return (
              <View key={g.id} style={styles.goalRow}>
                <View style={[styles.iconWrap, { backgroundColor: `${g.color}22` }]}>
                  <Ionicons
                    name={g.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={g.color}
                  />
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
      </View>
    );
  }

  if (allComplete) {
    return (
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textSecondary }]}>Goals</Text>
          <Pressable onPress={() => router.push(GOALS_LIST)} hitSlop={10}>
            <Text style={[styles.link, { color: theme.accent }]}>History</Text>
          </Pressable>
        </View>
        <View style={[styles.celebrateIcon, { backgroundColor: `${theme.accent}18` }]}>
          <Ionicons name="trophy-outline" size={28} color={theme.accent} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>All caught up</Text>
        <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
          Every goal is complete. Start another when you’re ready.
        </Text>
        <Pressable
          style={[styles.primaryCta, { backgroundColor: theme.accent }]}
          onPress={() => router.push(CREATE_GOAL)}
        >
          <Text style={styles.primaryCtaText}>New goal</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <Text style={[styles.title, { color: theme.textSecondary, marginBottom: Spacing.md }]}>
        Goals
      </Text>
      <View style={[styles.emptyHero, { backgroundColor: theme.background }]}>
        <Ionicons name="flag-outline" size={32} color={theme.accent} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Save for something together</Text>
      <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
        Set a shared target—a trip, a buffer, anything—and add contributions as you go. Everyone in
        your household can see progress here.
      </Text>
      <Pressable
        style={[styles.primaryCta, { backgroundColor: theme.accent }]}
        onPress={() => router.push(CREATE_GOAL)}
      >
        <Text style={styles.primaryCtaText}>Start a goal</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.ctaChevron} />
      </Pressable>
      <Pressable style={styles.secondaryCta} onPress={() => router.push(GOALS_LIST)} hitSlop={8}>
        <Text style={[styles.secondaryCtaText, { color: theme.accent }]}>Browse goals</Text>
      </Pressable>
    </View>
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyHero: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  celebrateIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  primaryCtaText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  ctaChevron: { marginTop: 1 },
  secondaryCta: { alignItems: 'center', paddingVertical: Spacing.md },
  secondaryCtaText: { fontSize: 15, fontWeight: '600' },
});
