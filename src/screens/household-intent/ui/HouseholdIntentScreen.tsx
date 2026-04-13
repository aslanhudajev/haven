import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HouseholdPathCard } from '@widgets/household-path-card';
import { saveHouseholdIntent } from '@shared/lib/storage';
import { Colors, Spacing } from '@shared/lib/theme';
import { ScreenContent } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';

export default function HouseholdIntentScreen() {
  const { refresh } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const chooseCreate = useCallback(async () => {
    await saveHouseholdIntent('create');
    refresh();
  }, [refresh]);

  const chooseJoin = useCallback(async () => {
    await saveHouseholdIntent('join');
    refresh();
  }, [refresh]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScreenContent scrollable padded style={{ paddingTop: insets.top + Spacing.lg }}>
        <View style={styles.header}>
          <View style={[styles.heroIconWrap, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="home-outline" size={32} color={theme.accent} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>How will you use FiftyFifty?</Text>
          <Text style={[styles.lede, { color: theme.textSecondary }]}>
            One subscription covers your household. Choose the path that fits you.
          </Text>
        </View>

        <View style={styles.cards}>
          <HouseholdPathCard
            icon="add-circle-outline"
            title="Start a household"
            subtitle="You’ll subscribe and create the family others can join."
            onPress={chooseCreate}
          />
          <HouseholdPathCard
            icon="people-outline"
            title="Join a household"
            subtitle="Someone already set things up—enter their invite code after you sign in."
            onPress={chooseJoin}
          />
        </View>
      </ScreenContent>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { marginBottom: Spacing.xl, alignItems: 'center' },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  lede: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  cards: { gap: Spacing.md },
});
