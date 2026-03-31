import { ScrollView, StyleSheet, Text, View, useColorScheme, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, fontFamily } from '@shared/lib/theme';

type Props = {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  padded?: boolean;
  /** Optional large title + subtitle under safe area (hero screens) */
  heroTitle?: string;
  heroSubtitle?: string;
};

export function ScreenContent({
  children,
  scrollable = false,
  style,
  padded = true,
  heroTitle,
  heroSubtitle,
}: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const hero =
    heroTitle != null ? (
      <View style={[styles.hero, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={[styles.heroTitle, { color: theme.text, fontFamily: fontFamily.displayBold }]}>
          {heroTitle}
        </Text>
        {heroSubtitle ? (
          <Text
            style={[
              styles.heroSubtitle,
              { color: theme.textSecondary, fontFamily: fontFamily.body },
            ]}
          >
            {heroSubtitle}
          </Text>
        ) : null}
      </View>
    ) : null;

  const inner = (
    <>
      {hero}
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
    </>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.surface0 }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {inner}
      </ScrollView>
    );
  }

  return <View style={[styles.container, { backgroundColor: theme.surface0 }]}>{inner}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    marginTop: Spacing.sm,
    fontSize: 16,
    lineHeight: 22,
  },
});
