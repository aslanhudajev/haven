import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createFamily, getFamily, useFamilyStore } from '@entities/family';
import { createPeriod, getActivePeriod } from '@entities/period';
import {
  REVENUECAT_ENABLED,
  checkSubscription,
  getSubscriptionTier,
  syncRevenueCatSubscription,
} from '@entities/subscription';
import { useAuth } from '@app/providers/AuthProvider';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { supabase } from '@shared/config/supabase';
import { Button, Input } from '@shared/ui';
import { Colors, Spacing } from '@shared/lib/theme';
import { toCents } from '@shared/lib/format';
import { runSerialized } from '@shared/lib/async/runSerialized';
import { periodLog } from '@shared/lib/debug/periodLog';
import type { Cadence } from '@shared/lib/period';

const CADENCES: { value: Cadence; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  budget: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateFamilyScreen() {
  const { user } = useAuth();
  const { refresh } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [anchorDay, setAnchorDay] = useState(1);
  const setFamily = useFamilyStore((s) => s.setFamily);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', budget: '' },
  });

  const onSubmit = async ({ name, budget }: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      const budgetNum = budget ? parseFloat(budget) : null;
      const family = await createFamily(
        {
          name,
          budget_cents: budgetNum ? toCents(budgetNum) : null,
          period_cadence: cadence,
          period_anchor_day: anchorDay,
        },
        user.id,
      );

      await runSerialized(`dashboard-period:${family.id}`, async () => {
        const existing = await getActivePeriod(family.id);
        if (existing) {
          periodLog('create_family.skip_period_exists', {
            familyId: family.id,
            periodId: existing.id,
            ends_at: existing.ends_at,
          });
          return;
        }
        await createPeriod({
          familyId: family.id,
          cadence,
          anchorDay,
        });
      });

      if (!REVENUECAT_ENABLED) {
        await supabase
          .from('families')
          .update({ is_active: true, max_members: 10 })
          .eq('id', family.id);
      } else {
        await syncRevenueCatSubscription();
        let latest = await getFamily(user.id);
        if (latest && !latest.is_active && (await checkSubscription())) {
          const tier = await getSubscriptionTier();
          await supabase
            .from('families')
            .update({ is_active: true, max_members: tier.maxMembers })
            .eq('id', latest.id);
          latest = await getFamily(user.id);
        }
      }

      const latest = await getFamily(user.id);
      if (!latest) {
        throw new Error('Could not load family after creation');
      }

      setFamily(latest);
      refresh();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not create family');
    } finally {
      setLoading(false);
    }
  };

  const isMonthly = cadence === 'monthly';
  const budgetCadenceLabel =
    cadence === 'weekly' ? 'Weekly' : cadence === 'biweekly' ? 'Biweekly' : 'Monthly';

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
          <Text style={styles.emoji}>👨‍👩‍👧‍👦</Text>
          <Text style={[styles.title, { color: theme.text }]}>Create your family</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Set up your household to start tracking shared expenses
          </Text>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Family name"
              placeholder="e.g. The Smiths"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              autoFocus
            />
          )}
        />

        <Controller
          control={control}
          name="budget"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={`${budgetCadenceLabel} budget (SEK, optional)`}
              placeholder="e.g. 5000"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
            />
          )}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Budget cycle
          </Text>
          <View style={[styles.segmented, { backgroundColor: theme.backgroundElement }]}>
            {CADENCES.map((c) => (
              <Pressable
                key={c.value}
                style={[
                  styles.segment,
                  cadence === c.value && [
                    styles.segmentActive,
                    { backgroundColor: theme.accent },
                  ],
                ]}
                onPress={() => {
                  setCadence(c.value);
                  setAnchorDay(c.value === 'monthly' ? 1 : 1);
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: cadence === c.value ? '#fff' : theme.text },
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            {isMonthly ? 'Cycle starts on day' : 'Cycle starts on'}
          </Text>
          {isMonthly ? (
            <MonthDayPicker value={anchorDay} onChange={setAnchorDay} theme={theme} />
          ) : (
            <WeekdayPicker value={anchorDay} onChange={setAnchorDay} theme={theme} />
          )}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button title="Create Family" onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </View>
  );
}

function WeekdayPicker({
  value,
  onChange,
  theme,
}: {
  value: number;
  onChange: (v: number) => void;
  theme: (typeof Colors)['light'];
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
              { backgroundColor: active ? theme.accent : theme.backgroundElement },
            ]}
            onPress={() => onChange(dayNum)}
          >
            <Text
              style={[styles.weekdayText, { color: active ? '#fff' : theme.text }]}
            >
              {day}
            </Text>
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
  theme: (typeof Colors)['light'];
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
              { backgroundColor: active ? theme.accent : theme.backgroundElement },
            ]}
            onPress={() => onChange(d)}
          >
            <Text style={[styles.dayCellText, { color: active ? '#fff' : theme.text }]}>
              {d}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: { alignItems: 'center', marginTop: 16, marginBottom: 32 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 17, textAlign: 'center', lineHeight: 24 },
  section: { marginTop: 20 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentActive: {},
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
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellText: { fontSize: 15, fontWeight: '500' },
  actions: { paddingTop: 12 },
});
