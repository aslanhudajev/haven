import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryPickerWidget } from '@widgets/category-picker';
import { getCategories, type Category } from '@entities/category';
import { getMembers, useFamilyStore, type FamilyMember } from '@entities/family';
import {
  createRecurringCost,
  deleteRecurringCost,
  getRecurringCosts,
  updateRecurringCost,
  type RecurringCost,
} from '@entities/recurring-cost';
import { getErrorMessage } from '@shared/lib/errors';
import { formatMoney, fromCents, toCents } from '@shared/lib/format';
import { Colors, Spacing } from '@shared/lib/theme';
import { Button, Input } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';

export default function RecurringCostsScreen() {
  const { family, isOwner } = useAppGateContext();
  const members = useFamilyStore((s) => s.members);
  const setMembers = useFamilyStore((s) => s.setMembers);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const [costs, setCosts] = useState<RecurringCost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringCost | null>(null);
  const [desc, setDesc] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [defaultPayerUserId, setDefaultPayerUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!family?.id) return;
    setLoading(true);
    try {
      const [c, cats] = await Promise.all([getRecurringCosts(family.id), getCategories(family.id)]);
      setCosts(c.filter((x) => x.is_active));
      setCategories(cats);
      const other = cats.find((x) => x.name === 'Other');
      setCategoryId((prev) => prev ?? other?.id ?? cats[0]?.id ?? null);
    } catch {
      setCosts([]);
    } finally {
      setLoading(false);
    }
  }, [family?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!family?.id || members.length > 0) return;
    getMembers(family.id).then(setMembers).catch(console.warn);
  }, [family?.id, members.length, setMembers]);

  const openAdd = () => {
    setEditing(null);
    setDesc('');
    setAmountStr('');
    const other = categories.find((x) => x.name === 'Other');
    setCategoryId(other?.id ?? categories[0]?.id ?? null);
    setDefaultPayerUserId(null);
    setModalOpen(true);
  };

  const openEdit = (c: RecurringCost) => {
    setEditing(c);
    setDesc(c.description);
    setAmountStr(String(fromCents(c.amount_cents)));
    setCategoryId(c.category_id);
    setDefaultPayerUserId(c.default_payer_id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const memberLabel = (m: FamilyMember) => m.profile?.full_name?.trim() || 'Member';

  const payerLabel = (userId: string | null) => {
    if (!userId) return 'Split evenly';
    const m = members.find((x) => x.user_id === userId);
    return m ? memberLabel(m) : 'Member';
  };

  const save = async () => {
    if (!family || !isOwner) return;
    const d = desc.trim();
    if (!d) {
      Alert.alert('Description', 'Enter a short description.');
      return;
    }
    const n = parseFloat(amountStr);
    if (isNaN(n) || n <= 0) {
      Alert.alert('Amount', 'Enter a valid amount.');
      return;
    }
    const cents = toCents(n);
    setSaving(true);
    try {
      if (editing) {
        await updateRecurringCost(editing.id, {
          description: d,
          amount_cents: cents,
          category_id: categoryId,
          default_payer_id: defaultPayerUserId,
        });
      } else {
        await createRecurringCost({
          familyId: family.id,
          description: d,
          amountCents: cents,
          categoryId: categoryId,
          defaultPayerId: defaultPayerUserId,
        });
      }
      closeModal();
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not save'));
    } finally {
      setSaving(false);
    }
  };

  const remove = (c: RecurringCost) => {
    if (!isOwner) return;
    Alert.alert('Remove fixed cost?', `"${c.description}" will stop appearing for new periods.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecurringCost(c.id);
            await load();
          } catch (err: unknown) {
            Alert.alert('Error', getErrorMessage(err, 'Could not remove'));
          }
        },
      },
    ]);
  };

  if (!family) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>No family</Text>
      </View>
    );
  }

  const catMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.md,
          paddingBottom: insets.bottom + (isOwner ? 88 : Spacing.lg),
        }}
      >
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          These items are added automatically at the start of each period. Anyone can claim them on
          the dashboard so the right person is counted as the payer.
        </Text>

        {loading ? (
          <Text style={{ color: theme.textSecondary, marginTop: 24 }}>Loading…</Text>
        ) : costs.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            {isOwner
              ? 'No fixed costs yet. Add rent, subscriptions, or other recurring items.'
              : 'No active fixed costs.'}
          </Text>
        ) : (
          costs.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => (isOwner ? openEdit(c) : undefined)}
              onLongPress={() => (isOwner ? remove(c) : undefined)}
              style={[styles.row, { backgroundColor: theme.backgroundElement }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>{c.description}</Text>
                <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
                  {formatMoney(c.amount_cents, family.currency)}
                  {c.category_id && catMap.get(c.category_id)
                    ? ` · ${catMap.get(c.category_id)!.name}`
                    : ''}
                  {' · '}
                  {payerLabel(c.default_payer_id)}
                </Text>
              </View>
              {isOwner ? (
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              ) : null}
            </Pressable>
          ))
        )}
      </ScrollView>

      {isOwner ? (
        <Pressable style={[styles.fab, { backgroundColor: theme.accent }]} onPress={openAdd}>
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      ) : null}

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalWrap, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={closeModal} hitSlop={12}>
              <Text style={[styles.modalCancel, { color: theme.accent }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editing ? 'Edit fixed cost' : 'New fixed cost'}
            </Text>
            <View style={{ width: 56 }} />
          </View>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: Spacing.lg,
              paddingBottom: insets.bottom + Spacing.lg,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Input label="Description" value={desc} onChangeText={setDesc} placeholder="Rent" />
            <Input
              label={`Amount (${family.currency})`}
              value={amountStr}
              onChangeText={setAmountStr}
              keyboardType="decimal-pad"
              placeholder="0"
            />
            {categories.length > 0 && categoryId ? (
              <CategoryPickerWidget
                categories={categories}
                selectedId={categoryId}
                onSelect={setCategoryId}
              />
            ) : null}

            <Text style={[styles.payerLabel, { color: theme.textSecondary }]}>Default payer</Text>
            <Text style={[styles.payerHint, { color: theme.textSecondary }]}>
              Used when the period is created; anyone can still claim the purchase later.
            </Text>
            <Pressable
              style={[
                styles.payerOption,
                {
                  backgroundColor:
                    defaultPayerUserId === null ? `${theme.accent}18` : theme.backgroundElement,
                },
              ]}
              onPress={() => setDefaultPayerUserId(null)}
            >
              <Text style={[styles.payerOptionText, { color: theme.text }]}>
                Split evenly (owner)
              </Text>
            </Pressable>
            {members.map((m) => (
              <Pressable
                key={m.id}
                style={[
                  styles.payerOption,
                  {
                    backgroundColor:
                      defaultPayerUserId === m.user_id
                        ? `${theme.accent}18`
                        : theme.backgroundElement,
                  },
                ]}
                onPress={() => setDefaultPayerUserId(m.user_id)}
              >
                <Text style={[styles.payerOptionText, { color: theme.text }]}>
                  {memberLabel(m)}
                </Text>
              </Pressable>
            ))}

            <Button
              title={editing ? 'Save' : 'Add fixed cost'}
              onPress={() => void save()}
              loading={saving}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  intro: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  empty: { fontSize: 16, marginTop: 24, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  rowTitle: { fontSize: 17, fontWeight: '600' },
  rowSub: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalWrap: { flex: 1, paddingTop: 8 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  modalCancel: { fontSize: 17, fontWeight: '500', width: 72 },
  modalTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center' },
  payerLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 4,
  },
  payerHint: { fontSize: 13, marginBottom: 10, marginLeft: 4 },
  payerOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  payerOptionText: { fontSize: 16, fontWeight: '500' },
});
