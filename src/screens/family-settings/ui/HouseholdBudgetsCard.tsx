import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { Category } from '@entities/category';
import { getCategories } from '@entities/category';
import {
  deleteCategoryBudget,
  getCategoryBudgets,
  upsertCategoryBudget,
  type CategoryBudget,
} from '@entities/category-budget';
import type { Family } from '@entities/family';
import { getErrorMessage } from '@shared/lib/errors';
import { formatMoney, fromCents, toCents } from '@shared/lib/format';
import type { ThemeColors } from '@shared/lib/theme';
import { Button, Card, Input } from '@shared/ui';

type Props = {
  family: Family;
  theme: ThemeColors;
  refresh: () => void;
};

export function HouseholdBudgetsCard({ family, theme, refresh }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, b] = await Promise.all([
        getCategories(family.id),
        getCategoryBudgets(family.id),
      ]);
      setCategories(cats);
      setBudgets(b);
      const next: Record<string, string> = {};
      cats.forEach((c) => {
        const row = b.find((x) => x.category_id === c.id);
        next[c.id] = row ? String(fromCents(row.amount_cents)) : '';
      });
      setInputs(next);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [family.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalBudgetCents = family.budget_cents;
  const allocatedCents = budgets.reduce((s, b) => s + b.amount_cents, 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const c of categories) {
        const raw = inputs[c.id]?.trim();
        const existing = budgets.find((x) => x.category_id === c.id);
        if (!raw) {
          if (existing) await deleteCategoryBudget(existing.id);
          continue;
        }
        const num = parseFloat(raw);
        if (isNaN(num) || num <= 0) continue;
        await upsertCategoryBudget({
          familyId: family.id,
          categoryId: c.id,
          amountCents: toCents(num),
        });
      }
      await load();
      refresh();
      Alert.alert('Saved', 'Category budgets updated.');
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not save budgets'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card style={styles.section}>
        <Text style={[styles.title, { color: theme.textSecondary }]}>Category budgets</Text>
        <Text style={{ color: theme.textSecondary }}>Loading…</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.section}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>Category budgets</Text>
      {totalBudgetCents != null ? (
        <View style={styles.summary}>
          <Text style={[styles.summaryText, { color: theme.text }]}>
            Total budget: {formatMoney(totalBudgetCents, family.currency)}
          </Text>
          <Text
            style={[
              styles.summaryText,
              {
                color: allocatedCents > totalBudgetCents ? '#FF3B30' : theme.textSecondary,
              },
            ]}
          >
            Allocated: {formatMoney(allocatedCents, family.currency)}
            {allocatedCents > totalBudgetCents
              ? ` (over by ${formatMoney(allocatedCents - totalBudgetCents, family.currency)})`
              : ''}
          </Text>
        </View>
      ) : (
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Set a total budget above to see allocation summary.
        </Text>
      )}
      {categories.map((c) => (
        <View key={c.id} style={styles.row}>
          <Text style={[styles.catName, { color: theme.text }]} numberOfLines={1}>
            {c.name}
          </Text>
          <Input
            value={inputs[c.id] ?? ''}
            onChangeText={(v) => setInputs((prev) => ({ ...prev, [c.id]: v }))}
            placeholder="—"
            keyboardType="decimal-pad"
            style={{
              borderColor: theme.backgroundSelected,
              backgroundColor: theme.background,
              flex: 1,
              maxWidth: 120,
            }}
          />
        </View>
      ))}
      <Button title="Save category budgets" onPress={() => void handleSave()} loading={saving} />
    </Card>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16, gap: 12 },
  title: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summary: { gap: 4, marginBottom: 8 },
  summaryText: { fontSize: 14, fontWeight: '500' },
  hint: { fontSize: 14, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  catName: { flex: 1, fontSize: 15, fontWeight: '500' },
});
