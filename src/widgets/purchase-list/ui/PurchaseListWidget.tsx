import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { usePurchaseStore, type Purchase } from '@entities/purchase';
import { Colors, Spacing } from '@shared/lib/theme';
import { formatMoney } from '@shared/lib/format';

type Props = {
  currentUserId: string;
  currency?: string;
  onPressPurchase?: (purchase: Purchase) => void;
};

function PurchaseRow({
  item,
  currentUserId,
  currency,
  theme,
  onPress,
}: {
  item: Purchase;
  currentUserId: string;
  currency: string;
  theme: (typeof Colors)['dark'];
  onPress?: () => void;
}) {
  const isOwn = item.user_id === currentUserId;
  const name = item.profile?.full_name || 'Anonymous';
  const time = new Date(item.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <Text style={[styles.rowName, { color: theme.text }]}>
          {isOwn ? 'You' : name}
        </Text>
        {item.description ? (
          <Text style={[styles.rowDesc, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowAmount, { color: theme.text }]}>
          {formatMoney(item.amount_cents, currency)}
        </Text>
        <Text style={[styles.rowTime, { color: theme.textSecondary }]}>{time}</Text>
      </View>
    </Pressable>
  );
}

export function PurchaseListWidget({
  currentUserId,
  currency = 'SEK',
  onPressPurchase,
}: Props) {
  const purchases = usePurchaseStore((s) => s.purchases);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  if (purchases.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No purchases yet this period
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {purchases.map((item, index) => (
        <View key={item.id}>
          {index > 0 && (
            <View style={[styles.separator, { backgroundColor: theme.backgroundElement }]} />
          )}
          <PurchaseRow
            item={item}
            currentUserId={currentUserId}
            currency={currency}
            theme={theme}
            onPress={() => onPressPurchase?.(item)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  rowPressed: { opacity: 0.6 },
  rowLeft: { flex: 1, marginRight: 16 },
  rowName: { fontSize: 16, fontWeight: '500' },
  rowDesc: { fontSize: 14, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowAmount: { fontSize: 16, fontWeight: '600' },
  rowTime: { fontSize: 12, marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth },
  empty: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontSize: 15 },
});
