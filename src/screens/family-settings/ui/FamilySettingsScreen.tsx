import { useState, useEffect } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFamilyStore,
  getMembers,
  createInvite,
  updateFamily,
  removeFamilyMember,
  transferFamilyOwnership,
  type FamilyMember,
  type Family,
} from '@entities/family';
import { getErrorMessage } from '@shared/lib/errors';
import { toCents, fromCents, formatMoney } from '@shared/lib/format';
import type { Cadence } from '@shared/lib/period';
import { inviteDeepLink } from '@shared/lib/storage';
import { Colors, Spacing, type ThemeColors } from '@shared/lib/theme';
import { Button, Input, Card } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

const CADENCES: { value: Cadence; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
];

const CURRENCIES = ['SEK', 'EUR', 'USD', 'NOK', 'DKK', 'GBP'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function FamilySettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { family: gateFamily, isOwner, refresh } = useAppGateContext();
  const setFamily = useFamilyStore((s) => s.setFamily);
  const members = useFamilyStore((s) => s.members);
  const setMembers = useFamilyStore((s) => s.setMembers);

  useEffect(() => {
    if (gateFamily?.id) {
      getMembers(gateFamily.id).then(setMembers).catch(console.warn);
    }
  }, [gateFamily?.id]);

  if (!gateFamily) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.empty, { color: theme.textSecondary }]}>No family found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      >
        <MembersSection
          members={members}
          isOwner={isOwner}
          family={gateFamily}
          user={user}
          theme={theme}
          refresh={refresh}
          setMembers={setMembers}
        />

        {isOwner ? (
          <OwnerSettings
            family={gateFamily}
            theme={theme}
            setFamily={setFamily}
            refresh={refresh}
          />
        ) : (
          <MemberReadOnly family={gateFamily} theme={theme} />
        )}
      </ScrollView>
    </View>
  );
}

function MembersSection({
  members,
  isOwner,
  family,
  user,
  theme,
  refresh,
  setMembers,
}: {
  members: FamilyMember[];
  isOwner: boolean;
  family: Family;
  user: { id: string } | null;
  theme: ThemeColors;
  refresh: () => void;
  setMembers: (m: FamilyMember[]) => void;
}) {
  const [inviting, setInviting] = useState(false);
  const atCapacity = members.length >= family.max_members;

  const reloadMembers = async () => {
    const list = await getMembers(family.id);
    setMembers(list);
  };

  const handleRemoveMember = (m: FamilyMember) => {
    const name = m.profile?.full_name || 'This member';
    Alert.alert('Remove member?', `${name} will lose access to this family.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFamilyMember(m.id);
            await reloadMembers();
            refresh();
          } catch (err: unknown) {
            Alert.alert('Error', getErrorMessage(err, 'Could not remove member'));
          }
        },
      },
    ]);
  };

  const handleTransferTo = (m: FamilyMember) => {
    const name = m.profile?.full_name || 'This member';
    Alert.alert(
      'Transfer ownership?',
      `${name} will become the owner. You will stay in the family as a member.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          onPress: async () => {
            try {
              await transferFamilyOwnership(m.user_id);
              await reloadMembers();
              refresh();
              Alert.alert(
                'Ownership transferred',
                'Billing may need to be active on the new owner’s account for the family to stay unlocked. They may need to subscribe or restore purchases in the App Store under their Apple ID.',
                [{ text: 'OK' }],
              );
            } catch (err: unknown) {
              Alert.alert('Error', getErrorMessage(err, 'Could not transfer ownership'));
            }
          },
        },
      ],
    );
  };

  const handleInvite = async () => {
    if (!user) return;
    setInviting(true);
    try {
      const invite = await createInvite(family.id, user.id);
      const link = inviteDeepLink(invite.code);
      const message = [
        `Join my family "${family.name}" on FiftyFifty!`,
        '',
        `Open in the app: ${link}`,
        '',
        `If the link doesn’t work, open FiftyFifty, choose “Join a household,” and enter this code:`,
        invite.code,
      ].join('\n');
      await Share.share(
        Platform.OS === 'ios' ? { message, url: link } : { message },
      );
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not create invite'));
    } finally {
      setInviting(false);
    }
  };

  return (
    <Card style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Members</Text>
        <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
          {members.length} / {family.max_members}
        </Text>
      </View>
      {members.map((m) => {
        const canManage = isOwner && user && m.user_id !== user.id && m.role === 'member';
        return (
          <View key={m.id} style={styles.memberRow}>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: theme.text }]}>
                {m.profile?.full_name || 'Anonymous'}
              </Text>
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor:
                      m.role === 'owner' ? theme.accent + '18' : theme.backgroundElement,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    { color: m.role === 'owner' ? theme.accent : theme.textSecondary },
                  ]}
                >
                  {m.role}
                </Text>
              </View>
            </View>
            {canManage && (
              <View style={styles.memberActions}>
                <Pressable onPress={() => handleTransferTo(m)} hitSlop={8}>
                  <Text style={[styles.memberActionText, { color: theme.accent }]}>Make owner</Text>
                </Pressable>
                <Pressable onPress={() => handleRemoveMember(m)} hitSlop={8}>
                  <Text style={styles.memberActionRemove}>Remove</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
      {isOwner && !atCapacity && (
        <Button
          title="Invite Member"
          onPress={handleInvite}
          loading={inviting}
          variant="secondary"
          style={{ marginTop: 12 }}
        />
      )}
      {isOwner && atCapacity && (
        <View style={[styles.limitBanner, { backgroundColor: '#FF9F0A18' }]}>
          <Text style={styles.limitText}>
            Member limit reached ({family.max_members}). Upgrade your plan to add more.
          </Text>
        </View>
      )}
    </Card>
  );
}

function MemberReadOnly({ family, theme }: { family: Family; theme: ThemeColors }) {
  const cadenceLabel =
    CADENCES.find((c) => c.value === family.period_cadence)?.label ?? family.period_cadence;

  const anchorLabel =
    family.period_cadence === 'monthly'
      ? `Day ${family.period_anchor_day}`
      : (WEEKDAYS[family.period_anchor_day - 1] ?? `Day ${family.period_anchor_day}`);

  return (
    <>
      <View style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
        <Text style={[styles.bannerText, { color: theme.textSecondary }]}>
          Only the family owner can edit settings
        </Text>
      </View>

      <Card style={styles.section}>
        <ReadOnlyRow label="Family name" value={family.name} theme={theme} />
        <ReadOnlyRow
          label="Budget"
          value={family.budget_cents ? formatMoney(family.budget_cents) : 'Not set'}
          theme={theme}
        />
        <ReadOnlyRow label="Currency" value={family.currency} theme={theme} />
        <ReadOnlyRow label="Budget cycle" value={cadenceLabel} theme={theme} />
        <ReadOnlyRow label="Cycle starts on" value={anchorLabel} theme={theme} last />
      </Card>
    </>
  );
}

function ReadOnlyRow({
  label,
  value,
  theme,
  last,
}: {
  label: string;
  value: string;
  theme: ThemeColors;
  last?: boolean;
}) {
  return (
    <View style={[styles.readOnlyRow, last && { borderBottomWidth: 0 }]}>
      <Text style={[styles.readOnlyLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.readOnlyValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function OwnerSettings({
  family,
  theme,
  setFamily,
  refresh,
}: {
  family: Family;
  theme: ThemeColors;
  setFamily: (f: Family) => void;
  refresh: () => void;
}) {
  const [name, setName] = useState(family.name);
  const [budgetStr, setBudgetStr] = useState(
    family.budget_cents ? String(fromCents(family.budget_cents)) : '',
  );
  const [currency, setCurrency] = useState(family.currency);
  const [cadence, setCadence] = useState<Cadence>(family.period_cadence);
  const [anchorDay, setAnchorDay] = useState(family.period_anchor_day);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const markDirty = () => {
    if (!dirty) setDirty(true);
  };
  const isMonthly = cadence === 'monthly';

  const handleSave = async () => {
    setSaving(true);
    try {
      const budgetNum = budgetStr ? parseFloat(budgetStr) : null;
      const updated = await updateFamily(family.id, {
        name: name.trim(),
        budget_cents: budgetNum ? toCents(budgetNum) : null,
        currency,
        period_cadence: cadence,
        period_anchor_day: anchorDay,
      });
      setFamily(updated);
      setDirty(false);
      refresh();
      Alert.alert('Saved', 'Family settings updated.');
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not save settings'));
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    borderColor: theme.backgroundSelected,
    backgroundColor: theme.background,
  };

  return (
    <>
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>General</Text>
        <Input
          label="Family name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            markDirty();
          }}
          placeholder="Family name"
          style={inputStyle}
        />
        <View style={styles.budgetInputRow}>
          <View style={{ flex: 1 }}>
            <Input
              label="Budget per period"
              value={budgetStr}
              onChangeText={(v) => {
                setBudgetStr(v);
                markDirty();
              }}
              placeholder="e.g. 5000"
              keyboardType="numeric"
              style={inputStyle}
            />
          </View>
          <View style={styles.currencyPill}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Currency</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.currencyScroll}
            >
              <View style={styles.currencyRow}>
                {CURRENCIES.map((c) => {
                  const active = currency === c;
                  return (
                    <Pressable
                      key={c}
                      style={[
                        styles.currencyChip,
                        {
                          backgroundColor: active ? theme.accent : 'transparent',
                          borderColor: active ? theme.accent : theme.backgroundSelected,
                        },
                      ]}
                      onPress={() => {
                        setCurrency(c);
                        markDirty();
                      }}
                    >
                      <Text style={[styles.currencyText, { color: active ? '#fff' : theme.text }]}>
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Schedule</Text>
        <Text style={[styles.scheduleHint, { color: theme.textSecondary }]}>
          Changes take effect next period
        </Text>
        <View style={[styles.segmented, { backgroundColor: theme.backgroundSelected }]}>
          {CADENCES.map((c) => (
            <Pressable
              key={c.value}
              style={[styles.segment, cadence === c.value && { backgroundColor: theme.accent }]}
              onPress={() => {
                setCadence(c.value);
                setAnchorDay(c.value === 'monthly' ? 1 : 1);
                markDirty();
              }}
            >
              <Text
                style={[styles.segmentText, { color: cadence === c.value ? '#fff' : theme.text }]}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 16 }]}>
          {isMonthly ? 'Starts on day' : 'Starts on'}
        </Text>
        {isMonthly ? (
          <MonthDayPicker
            value={anchorDay}
            onChange={(v) => {
              setAnchorDay(v);
              markDirty();
            }}
            theme={theme}
          />
        ) : (
          <WeekdayPicker
            value={anchorDay}
            onChange={(v) => {
              setAnchorDay(v);
              markDirty();
            }}
            theme={theme}
          />
        )}
      </Card>

      {dirty && <Button title="Save Changes" onPress={handleSave} loading={saving} />}
    </>
  );
}

function WeekdayPicker({
  value,
  onChange,
  theme,
}: {
  value: number;
  onChange: (v: number) => void;
  theme: ThemeColors;
}) {
  return (
    <View style={styles.weekdayRow}>
      {WEEKDAYS.map((day, i) => {
        const dayNum = i + 1;
        const active = value === dayNum;
        return (
          <Pressable
            key={day}
            style={[
              styles.weekdayChip,
              { backgroundColor: active ? theme.accent : theme.backgroundSelected },
            ]}
            onPress={() => onChange(dayNum)}
          >
            <Text style={[styles.weekdayText, { color: active ? '#fff' : theme.text }]}>{day}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MonthDayPicker({
  value,
  onChange,
  theme,
}: {
  value: number;
  onChange: (v: number) => void;
  theme: ThemeColors;
}) {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <View style={styles.dayGrid}>
      {days.map((d) => {
        const active = value === d;
        return (
          <Pressable
            key={d}
            style={[
              styles.dayCell,
              { backgroundColor: active ? theme.accent : theme.backgroundSelected },
            ]}
            onPress={() => onChange(d)}
          >
            <Text style={[styles.dayCellText, { color: active ? '#fff' : theme.text }]}>{d}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  empty: { fontSize: 17, textAlign: 'center', marginTop: 64 },

  section: { marginBottom: Spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  memberCount: { fontSize: 13, fontWeight: '600' },

  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  memberName: { fontSize: 17, fontWeight: '500', flexShrink: 1 },
  memberActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberActionText: { fontSize: 14, fontWeight: '600' },
  memberActionRemove: { fontSize: 14, fontWeight: '600', color: '#FF3B30' },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },

  limitBanner: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  limitText: { fontSize: 14, fontWeight: '500', color: '#FF9F0A', textAlign: 'center' },

  banner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  bannerText: { fontSize: 14, textAlign: 'center', fontWeight: '500' },

  readOnlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
  readOnlyLabel: { fontSize: 15 },
  readOnlyValue: { fontSize: 15, fontWeight: '600' },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 4,
  },
  scheduleHint: { fontSize: 13, marginBottom: 12 },

  budgetInputRow: {},
  currencyPill: { marginBottom: 4 },
  currencyScroll: { marginTop: 2 },
  currencyRow: { flexDirection: 'row', gap: 8 },
  currencyChip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyText: { fontSize: 14, fontWeight: '600' },

  segmented: { flexDirection: 'row', borderRadius: 10, padding: 3 },
  segment: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: { fontSize: 15, fontWeight: '500' },

  weekdayRow: { flexDirection: 'row', gap: 6 },
  weekdayChip: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayText: { fontSize: 13, fontWeight: '600' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellText: { fontSize: 15, fontWeight: '500' },
});
