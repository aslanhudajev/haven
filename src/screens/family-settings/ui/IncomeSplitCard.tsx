import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { FamilyMember } from '@entities/family';
import { updateMemberIncome } from '@entities/family';
import { getErrorMessage } from '@shared/lib/errors';
import { fromCents, toCents } from '@shared/lib/format';
import type { ThemeColors } from '@shared/lib/theme';
import { Button, Card, Input } from '@shared/ui';

function memberLabel(m: FamilyMember): string {
  return m.profile?.full_name?.trim() || 'Member';
}

type Props = {
  members: FamilyMember[];
  currency: string;
  theme: ThemeColors;
  refresh: () => void;
};

export function IncomeSplitCard({ members, currency, theme, refresh }: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next: Record<string, string> = {};
    members.forEach((m) => {
      next[m.id] =
        m.income_cents != null && m.income_cents > 0 ? String(fromCents(m.income_cents)) : '';
    });
    setInputs(next);
  }, [members]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const m of members) {
        const raw = inputs[m.id]?.trim();
        if (raw && (isNaN(parseFloat(raw)) || parseFloat(raw) <= 0)) {
          Alert.alert('Invalid', `Enter a positive amount for ${memberLabel(m)}`);
          return;
        }
        const cents = raw ? toCents(parseFloat(raw)) : null;
        const prev = m.income_cents ?? null;
        if (cents === prev) continue;
        await updateMemberIncome(m.id, cents);
      }
      refresh();
      Alert.alert(
        'Saved',
        'Income amounts updated. Settlement uses these when all members have income set.',
      );
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not save income'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={styles.section}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>Income (optional)</Text>
      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        When everyone has income set, fair share in reports uses income weights instead of 50/50.
      </Text>
      {members.map((m) => (
        <View key={m.id} style={styles.row}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {memberLabel(m)}
          </Text>
          <Input
            value={inputs[m.id] ?? ''}
            onChangeText={(v) => setInputs((prev) => ({ ...prev, [m.id]: v }))}
            placeholder={`${currency}`}
            keyboardType="decimal-pad"
            style={{
              borderColor: theme.backgroundSelected,
              backgroundColor: theme.background,
              flex: 1,
              maxWidth: 140,
            }}
          />
        </View>
      ))}
      <Button title="Save income" onPress={() => void handleSave()} loading={saving} />
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
  hint: { fontSize: 14, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  name: { flex: 1, fontSize: 15, fontWeight: '500' },
});

/** Non-owners: edit only their own income row. */
export function IncomeSelfCard({
  member,
  currency,
  theme,
  refresh,
}: {
  member: FamilyMember | null;
  currency: string;
  theme: ThemeColors;
  refresh: () => void;
}) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!member) return;
    setValue(
      member.income_cents != null && member.income_cents > 0
        ? String(fromCents(member.income_cents))
        : '',
    );
  }, [member]);

  if (!member) return null;

  const handleSave = async () => {
    const raw = value.trim();
    if (raw && (isNaN(parseFloat(raw)) || parseFloat(raw) <= 0)) {
      Alert.alert('Invalid', 'Enter a positive amount or leave empty to clear.');
      return;
    }
    const cents = raw ? toCents(parseFloat(raw)) : null;
    const prev = member.income_cents ?? null;
    if (cents === prev) return;
    setSaving(true);
    try {
      await updateMemberIncome(member.id, cents);
      refresh();
      Alert.alert('Saved', 'Your income was updated.');
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not save income'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={styles.section}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>Your income (optional)</Text>
      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        Helps calculate a fair split in period reports when everyone has income set.
      </Text>
      <Input
        value={value}
        onChangeText={setValue}
        placeholder={`${currency}`}
        keyboardType="decimal-pad"
        style={{
          borderColor: theme.backgroundSelected,
          backgroundColor: theme.background,
        }}
      />
      <Button title="Save" onPress={() => void handleSave()} loading={saving} />
    </Card>
  );
}
