import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategories, type Category } from '@entities/category';
import { upsertCategoryBudget } from '@entities/category-budget';
import { getErrorMessage } from '@shared/lib/errors';
import { formatMoney, toCents } from '@shared/lib/format';
import { Colors, Spacing } from '@shared/lib/theme';
import { Button, Input } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';

export default function SetBudgetsScreen() {
  const { family, refresh } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!family?.id) return;
    setLoading(true);
    try {
      const cats = await getCategories(family.id);
      setCategories(cats);
      const next: Record<string, string> = {};
      cats.forEach((c) => {
        next[c.id] = '';
      });
      setInputs(next);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [family?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const liveTotal = useMemo(
    () =>
      Object.values(inputs).reduce((sum, v) => {
        const n = parseFloat(v);
        return sum + (Number.isNaN(n) || n <= 0 ? 0 : toCents(n));
      }, 0),
    [inputs],
  );

  const handleContinue = async () => {
    if (!family) return;
    let countPositive = 0;
    for (const c of categories) {
      const raw = inputs[c.id]?.trim();
      if (!raw) continue;
      const n = parseFloat(raw);
      if (!Number.isNaN(n) && n > 0) countPositive += 1;
    }
    if (countPositive === 0) {
      Alert.alert('Budgets required', 'Set at least one category budget to continue.');
      return;
    }
    setSaving(true);
    try {
      for (const c of categories) {
        const raw = inputs[c.id]?.trim();
        if (!raw) continue;
        const num = parseFloat(raw);
        if (Number.isNaN(num) || num <= 0) continue;
        await upsertCategoryBudget({
          familyId: family.id,
          categoryId: c.id,
          amountCents: toCents(num),
        });
      }
      refresh();
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not save budgets'));
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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.emoji}>💰</Text>
          <Text style={[styles.title, { color: theme.text }]}>Set your budgets</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            How much should your household spend per category each period? You can change these
            later in settings.
          </Text>
        </View>

        {loading ? (
          <Text style={{ color: theme.textSecondary }}>Loading…</Text>
        ) : (
          <>
            <Text style={[styles.totalLine, { color: theme.accent }]}>
              Total: {formatMoney(liveTotal, family.currency)} per period
            </Text>
            {categories.map((c) => (
              <View key={c.id} style={styles.row}>
                <Text style={[styles.catName, { color: theme.text }]} numberOfLines={1}>
                  {c.name}
                </Text>
                <Input
                  value={inputs[c.id] ?? ''}
                  onChangeText={(v) => setInputs((prev) => ({ ...prev, [c.id]: v }))}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  style={{
                    borderColor: theme.backgroundSelected,
                    backgroundColor: theme.backgroundElement,
                    flex: 1,
                    maxWidth: 120,
                  }}
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <Button title="Continue" onPress={() => void handleContinue()} loading={saving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 17, textAlign: 'center', lineHeight: 24 },
  totalLine: { fontSize: 16, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  catName: { flex: 1, fontSize: 16, fontWeight: '500' },
  actions: { paddingTop: 12 },
});
