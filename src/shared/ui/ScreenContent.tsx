import { ScrollView, StyleSheet, View, useColorScheme, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@shared/lib/theme';

type Props = {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  padded?: boolean;
};

export function ScreenContent({ children, scrollable = false, style, padded = true }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const inner = (
    <View
      style={[
        styles.content,
        padded && { paddingHorizontal: Spacing.lg },
        { paddingBottom: insets.bottom + Spacing.lg },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {inner}
      </ScrollView>
    );
  }

  return <View style={[styles.container, { backgroundColor: theme.background }]}>{inner}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
