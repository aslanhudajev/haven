import { Alert, Pressable, StyleSheet, Text, View, useColorScheme, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Colors, Spacing } from '@shared/lib/theme';
import { formatMoney, formatDateRange } from '@shared/lib/format';
import { calculateSettlements, type Settlement } from '@shared/lib/settlement';
import { getPurchases, type Purchase } from '@entities/purchase';
import { useFamilyStore, type FamilyMember } from '@entities/family';
import { resolvePeriod } from '@entities/period';
import { useAuth } from '@app/providers/AuthProvider';
import { Card, Button } from '@shared/ui';

export default function PeriodReportScreen() {
  const { periodId, periodName, startsAt, endsAt, status: initialStatus } = useLocalSearchParams<{
    periodId: string;
    periodName: string;
    startsAt: string;
    endsAt: string;
    status: string;
  }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const members = useFamilyStore((s) => s.members);
  const { user } = useAuth();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [status, setStatus] = useState(initialStatus ?? 'archived');

  useEffect(() => {
    if (!periodId) return;
    getPurchases(periodId)
      .then(setPurchases)
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [periodId]);

  const totalSpent = purchases.reduce((sum, p) => sum + p.amount_cents, 0);

  const spendByUser = members.map((m: FamilyMember) => ({
    userId: m.user_id,
    name: m.profile?.full_name || 'Anonymous',
    totalCents: purchases
      .filter((p) => p.user_id === m.user_id)
      .reduce((sum, p) => sum + p.amount_cents, 0),
  }));

  const settlements = calculateSettlements(spendByUser);

  const handleResolve = () => {
    Alert.alert(
      'Mark as Settled?',
      'This confirms all debts for this period have been paid.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Settled',
          onPress: async () => {
            if (!periodId || !user) return;
            setResolving(true);
            try {
              await resolvePeriod(periodId, user.id);
              setStatus('resolved');
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'Could not resolve period');
            } finally {
              setResolving(false);
            }
          },
        },
      ],
    );
  };

  const isResolved = status === 'resolved';
  const canResolve = status === 'archived';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: theme.text }]}>{periodName}</Text>
          {isResolved && (
            <View style={styles.resolvedBadge}>
              <Text style={styles.resolvedBadgeText}>Settled</Text>
            </View>
          )}
        </View>
        {startsAt && endsAt && (
          <Text style={[styles.range, { color: theme.textSecondary }]}>
            {formatDateRange(startsAt, endsAt)}
          </Text>
        )}
      </View>

      <Card style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Total spent</Text>
        <Text style={[styles.totalAmount, { color: theme.text }]}>
          {formatMoney(totalSpent)}
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Per member</Text>
        {spendByUser.map((entry) => (
          <View key={entry.userId} style={styles.memberRow}>
            <Text style={[styles.memberName, { color: theme.text }]}>{entry.name}</Text>
            <Text style={[styles.memberAmount, { color: theme.textSecondary }]}>
              {formatMoney(entry.totalCents)}
            </Text>
          </View>
        ))}
      </Card>

      {settlements.length > 0 && (
        <Card style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Settlement</Text>
          {settlements.map((s: Settlement, i: number) => (
            <View key={i} style={styles.settlementRow}>
              <Text style={[styles.settlementText, { color: theme.text }]}>
                {s.from.name} owes {s.to.name}
              </Text>
              <Text style={[styles.settlementAmount, { color: theme.accent }]}>
                {formatMoney(s.amountCents)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Purchases ({purchases.length})
        </Text>
        {purchases.map((p) => (
          <View key={p.id} style={styles.purchaseRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.purchaseDesc, { color: theme.text }]}>
                {p.description || 'No description'}
              </Text>
              <Text style={[styles.purchaseBy, { color: theme.textSecondary }]}>
                {p.profile?.full_name || 'Anonymous'}
              </Text>
            </View>
            <Text style={[styles.purchaseAmount, { color: theme.text }]}>
              {formatMoney(p.amount_cents)}
            </Text>
          </View>
        ))}
      </Card>

      {canResolve && (
        <View style={styles.resolveAction}>
          <Button
            title="Mark as Settled"
            onPress={handleResolve}
            loading={resolving}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, marginBottom: Spacing.lg },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  range: { fontSize: 15, marginTop: 4 },
  resolvedBadge: {
    backgroundColor: '#34C75920',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resolvedBadgeText: { color: '#34C759', fontSize: 13, fontWeight: '600' },
  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionLabel: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', marginBottom: 8 },
  totalAmount: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  memberName: { fontSize: 16 },
  memberAmount: { fontSize: 16, fontWeight: '500' },
  settlementRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  settlementText: { fontSize: 16 },
  settlementAmount: { fontSize: 16, fontWeight: '600' },
  purchaseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  purchaseDesc: { fontSize: 15 },
  purchaseBy: { fontSize: 13, marginTop: 2 },
  purchaseAmount: { fontSize: 15, fontWeight: '600' },
  resolveAction: { marginHorizontal: Spacing.lg, marginTop: Spacing.md },
});
