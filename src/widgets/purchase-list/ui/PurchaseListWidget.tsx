import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { usePurchaseStore, type Purchase } from '@entities/purchase';
import { formatMoney } from '@shared/lib/format';
import {
  Colors,
  Motion,
  Radii,
  Spacing,
  cardElevation,
  fontFamily,
  purchaseIconTilePaletteDark,
  purchaseIconTilePaletteLight,
  type ThemeColors,
} from '@shared/lib/theme';
import type { ComponentProps } from 'react';

type Props = {
  currentUserId: string;
  currency?: string;
  onPressPurchase?: (purchase: Purchase) => void;
};

const ICON_KEYS = [
  'cart-outline',
  'restaurant-outline',
  'car-outline',
  'home-outline',
  'film-outline',
  'cafe-outline',
] as const;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function PurchaseRow({
  item,
  currentUserId,
  currency,
  theme,
  scheme,
  index,
  total,
  onPress,
}: {
  item: Purchase;
  currentUserId: string;
  currency: string;
  theme: ThemeColors;
  scheme: 'light' | 'dark';
  index: number;
  total: number;
  onPress?: () => void;
}) {
  const isOwn = item.user_id === currentUserId;
  const name = item.profile?.full_name || 'Anonymous';
  const time = new Date(item.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const key = item.description || item.id || '';
  const h = hashString(key);
  const palette = scheme === 'dark' ? purchaseIconTilePaletteDark : purchaseIconTilePaletteLight;
  const tileBg = palette[h % palette.length];
  const iconName = ICON_KEYS[h % ICON_KEYS.length] as ComponentProps<typeof Ionicons>['name'];

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={[styles.iconTile, { backgroundColor: tileBg }]}>
        <Ionicons name={iconName} size={22} color={scheme === 'dark' ? '#F8FAFC' : theme.text} />
      </View>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowName, { color: theme.text, fontFamily: fontFamily.bodySemiBold }]}>
          {isOwn ? 'You' : name}
        </Text>
        {item.description ? (
          <Text
            style={[styles.rowDesc, { color: theme.textSecondary, fontFamily: fontFamily.body }]}
            numberOfLines={1}
          >
            {item.description}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowRight}>
        <Text
          style={[styles.rowAmount, { color: theme.text, fontFamily: fontFamily.bodySemiBold }]}
        >
          {formatMoney(item.amount_cents, currency)}
        </Text>
        <Text style={[styles.rowTime, { color: theme.textMuted, fontFamily: fontFamily.body }]}>
          {time}
        </Text>
      </View>
      {index < total - 1 ? (
        <View style={[styles.divider, { backgroundColor: theme.listDivider }]} />
      ) : null}
    </Pressable>
  );
}

export function PurchaseListWidget({ currentUserId, currency = 'SEK', onPressPurchase }: Props) {
  const purchases = usePurchaseStore((s) => s.purchases);
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[scheme];

  if (purchases.length === 0) {
    return (
      <View style={styles.empty}>
        <Text
          style={[styles.emptyText, { color: theme.textSecondary, fontFamily: fontFamily.body }]}
        >
          No purchases yet this period
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.groupCard,
        { backgroundColor: theme.surface1, borderRadius: Radii.xl, borderColor: theme.listDivider },
        cardElevation(scheme),
      ]}
    >
      {purchases.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeInDown.duration(Motion.durationNormal).delay(index * 42)}
        >
          <PurchaseRow
            item={item}
            currentUserId={currentUserId}
            currency={currency}
            theme={theme}
            scheme={scheme}
            index={index}
            total={purchases.length}
            onPress={() => onPressPurchase?.(item)}
          />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    marginHorizontal: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    position: 'relative',
  },
  rowPressed: { opacity: 0.92 },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowLeft: { flex: 1, marginRight: 12, minWidth: 0 },
  rowName: { fontSize: 16 },
  rowDesc: { fontSize: 14, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowAmount: { fontSize: 16 },
  rowTime: { fontSize: 12, marginTop: 2 },
  divider: {
    position: 'absolute',
    left: Spacing.md + 44 + 12,
    right: Spacing.md,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
  empty: { paddingVertical: 32, alignItems: 'center', paddingHorizontal: Spacing.lg },
  emptyText: { fontSize: 15, textAlign: 'center' },
});
