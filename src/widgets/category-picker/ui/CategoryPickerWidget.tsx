import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { Category } from '@entities/category';
import { Colors, Spacing, type ThemeColors } from '@shared/lib/theme';

type Props = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label?: string;
};

export function CategoryPickerWidget({
  categories,
  selectedId,
  onSelect,
  label = 'Category',
}: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map((c) => (
          <Chip
            key={c.id}
            category={c}
            selected={selectedId === c.id}
            theme={theme}
            onPress={() => onSelect(c.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Chip({
  category,
  selected,
  theme,
  onPress,
}: {
  category: Category;
  selected: boolean;
  theme: ThemeColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? `${category.color}33` : theme.backgroundElement,
          borderColor: selected ? category.color : theme.backgroundSelected,
        },
      ]}
    >
      <Ionicons
        name={category.icon as keyof typeof Ionicons.glyphMap}
        size={18}
        color={selected ? category.color : theme.textSecondary}
      />
      <Text
        style={[styles.chipText, { color: selected ? theme.text : theme.textSecondary }]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  row: { flexDirection: 'row', gap: 8, paddingRight: Spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    maxWidth: 200,
  },
  chipText: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
});
