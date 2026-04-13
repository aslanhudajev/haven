import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Colors, Spacing } from '@shared/lib/theme';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IoniconName;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function HouseholdPathCard({ icon, title, subtitle, onPress }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundElement,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={26} color={theme.accent} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.md,
  },
  pressed: { opacity: 0.85 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 4 },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 15, lineHeight: 21 },
});
