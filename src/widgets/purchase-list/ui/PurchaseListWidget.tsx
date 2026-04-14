import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { Category } from '@entities/category';
import { usePurchaseStore, type Purchase } from '@entities/purchase';
import { formatMoney } from '@shared/lib/format';
import { Colors, Spacing, type ThemeColors } from '@shared/lib/theme';

type Props = {
  currentUserId: string;
  currency?: string;
  categories?: Category[];
  onPressPurchase?: (purchase: Purchase) => void;
  onDeletePurchase?: (purchase: Purchase) => void;
  onClaimRecurring?: (purchase: Purchase) => void;
};

function PurchaseRow({
  item,
  currentUserId,
  currency,
  theme,
  categories,
  onPress,
  onDelete,
  onClaim,
}: {
  item: Purchase;
  currentUserId: string;
  currency: string;
  theme: ThemeColors;
  categories?: Category[];
  onPress?: () => void;
  onDelete?: () => void;
  onClaim?: () => void;
}) {
  const isOwn = item.user_id === currentUserId;
  const name = item.profile?.full_name || 'Anonymous';
  const time = new Date(item.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const cat = item.category_id ? categories?.find((c) => c.id === item.category_id) : undefined;
  const recurring = item.is_recurring === true;

  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={onPress}
        onLongPress={
          isOwn && onDelete && !recurring
            ? () => {
                Alert.alert('Delete purchase?', 'This cannot be undone.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: onDelete },
                ]);
              }
            : undefined
        }
      >
        <View style={styles.rowLeft}>
          <View style={styles.nameRow}>
            {cat ? (
              <View style={[styles.catDot, { backgroundColor: cat.color }]} />
            ) : (
              <View style={[styles.catDot, { backgroundColor: theme.textSecondary }]} />
            )}
            <Text style={[styles.rowName, { color: theme.text }]}>{isOwn ? 'You' : name}</Text>
            {recurring ? (
              <Ionicons
                name="repeat-outline"
                size={16}
                color={theme.textSecondary}
                style={styles.recurringIcon}
              />
            ) : null}
          </View>
          {item.description ? (
            <Text style={[styles.rowDesc, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.description}
            </Text>
          ) : cat ? (
            <Text style={[styles.rowDesc, { color: theme.textSecondary }]} numberOfLines={1}>
              {cat.name}
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
      {recurring && !isOwn && onClaim ? (
        <Pressable onPress={onClaim} hitSlop={8} style={styles.claimBtn}>
          <Text style={[styles.claimText, { color: theme.accent }]}>I paid this</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PurchaseListWidget({
  currentUserId,
  currency = 'SEK',
  categories,
  onPressPurchase,
  onDeletePurchase,
  onClaimRecurring,
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
            categories={categories}
            onPress={() => onPressPurchase?.(item)}
            onDelete={onDeletePurchase ? () => onDeletePurchase(item) : undefined}
            onClaim={onClaimRecurring ? () => onClaimRecurring(item) : undefined}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowPressed: { opacity: 0.6 },
  rowLeft: { flex: 1, marginRight: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  recurringIcon: { marginLeft: 2 },
  rowName: { fontSize: 16, fontWeight: '500' },
  rowDesc: { fontSize: 14, marginTop: 2, marginLeft: 14 },
  rowRight: { alignItems: 'flex-end' },
  rowAmount: { fontSize: 16, fontWeight: '600' },
  rowTime: { fontSize: 12, marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth },
  empty: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontSize: 15 },
  claimBtn: { paddingLeft: 14, paddingBottom: 8 },
  claimText: { fontSize: 14, fontWeight: '600' },
});
