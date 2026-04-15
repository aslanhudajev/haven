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

function pctUsed(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.round((spent / budget) * 100);
}

export function BudgetProgressWidget({ purchases, categories, categoryBudgets, currency }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  if (categoryBudgets.length === 0) return null;

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const spendByCat = new Map<string, number>();
  purchases.forEach((p) => {
    if (!p.category_id || p.is_recurring) return;
    spendByCat.set(p.category_id, (spendByCat.get(p.category_id) ?? 0) + p.amount_cents);
  });

  const rows = categoryBudgets
    .map((b) => {
      const cat = catMap.get(b.category_id);
      const spent = spendByCat.get(b.category_id) ?? 0;
      const pct = pctUsed(spent, b.amount_cents);
      return { budget: b, cat, spent, pct };
    })
    .filter((r) => r.cat)
    .sort((a, b) => b.pct - a.pct);

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>Category budgets</Text>
      {rows.map(({ budget, cat, spent, pct }) => {
        if (!cat) return null;
        const over = spent > budget.amount_cents;
        const warn = pct >= 75 && !over;
        const barColor = over ? '#FF3B30' : warn ? '#FF9F0A' : cat.color;
        const widthPct = Math.min((spent / budget.amount_cents) * 100, 100);
        return (
          <View key={budget.id} style={styles.row}>
            <View style={styles.rowTop}>
              <View style={[styles.dot, { backgroundColor: cat.color }]} />
              <Text style={[styles.catName, { color: theme.text }]} numberOfLines={1}>
                {cat.name}
              </Text>
              <Text style={[styles.amounts, { color: theme.textSecondary }]}>
                {formatMoney(spent, currency)} / {formatMoney(budget.amount_cents, currency)}
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
              <View style={[styles.fill, { width: `${widthPct}%`, backgroundColor: barColor }]} />
            </View>
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
    marginBottom: 2,
  },
  row: { gap: 6 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  catName: { flex: 1, fontSize: 15, fontWeight: '600' },
  amounts: { fontSize: 13, fontWeight: '500' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
