import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { Category } from '@entities/category';
import type { CategoryBudget } from '@entities/category-budget';
import type { Purchase } from '@entities/purchase';
import { formatMoney } from '@shared/lib/format';
import { Colors, Spacing } from '@shared/lib/theme';

type Props = {
  purchases: Purchase[];
  categories: Category[];
  categoryBudgets: CategoryBudget[];
  currency: string;
};

export function CategoryBreakdownWidget({
  purchases,
  categories,
  categoryBudgets,
  currency,
}: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const budgetByCat = new Map(categoryBudgets.map((b) => [b.category_id, b]));
  const spendByCat = new Map<string | 'uncategorized', number>();

  purchases.forEach((p) => {
    if (p.is_recurring) return;
    const key = p.category_id ?? 'uncategorized';
    spendByCat.set(key, (spendByCat.get(key) ?? 0) + p.amount_cents);
  });

  const entries = [...spendByCat.entries()]
    .map(([key, spent]) => {
      if (key === 'uncategorized') {
        return {
          key: 'uncategorized',
          name: 'Uncategorized',
          icon: 'ellipsis-horizontal-outline' as const,
          color: theme.textSecondary,
          spent,
          budgetCents: null as number | null,
        };
      }
      const cat = catMap.get(key);
      const b = budgetByCat.get(key);
      return {
        key,
        name: cat?.name ?? 'Category',
        icon: (cat?.icon ?? 'pricetag-outline') as keyof typeof Ionicons.glyphMap,
        color: cat?.color ?? theme.accent,
        spent,
        budgetCents: b?.amount_cents ?? null,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  if (entries.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>By category</Text>
      {entries.map((e) => {
        const pct =
          e.budgetCents != null && e.budgetCents > 0
            ? Math.round((e.spent / e.budgetCents) * 100)
            : null;
        const over = e.budgetCents != null && e.spent > e.budgetCents;
        const warn = pct != null && pct >= 75 && !over;
        const barColor = over ? '#FF3B30' : warn ? '#FF9F0A' : e.color;
        const widthPct =
          e.budgetCents != null && e.budgetCents > 0
            ? Math.min((e.spent / e.budgetCents) * 100, 100)
            : e.spent > 0
              ? 100
              : 0;

        return (
          <View key={String(e.key)} style={styles.row}>
            <View style={styles.rowTop}>
              <View style={[styles.iconWrap, { backgroundColor: `${e.color}22` }]}>
                <Ionicons name={e.icon} size={18} color={e.color} />
              </View>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                {e.name}
              </Text>
              <Text style={[styles.amounts, { color: theme.textSecondary }]}>
                {formatMoney(e.spent, currency)}
                {e.budgetCents != null ? ` / ${formatMoney(e.budgetCents, currency)}` : ''}
              </Text>
            </View>
            {e.budgetCents != null ? (
              <>
                <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
                  <View
                    style={[styles.fill, { width: `${widthPct}%`, backgroundColor: barColor }]}
                  />
                </View>
                {pct != null ? (
                  <Text
                    style={[
                      styles.pct,
                      { color: over ? '#FF3B30' : warn ? '#FF9F0A' : theme.textSecondary },
                    ]}
                  >
                    {pct}%
                  </Text>
                ) : null}
              </>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: 14,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  row: { gap: 6 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1, fontSize: 16, fontWeight: '600' },
  amounts: { fontSize: 14, fontWeight: '500' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  pct: { fontSize: 13, fontWeight: '600', alignSelf: 'flex-end' },
});
