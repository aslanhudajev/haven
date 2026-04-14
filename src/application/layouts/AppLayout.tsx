import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@shared/lib/theme';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: theme.text,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.background },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-purchase"
        options={{ presentation: 'modal', headerTitle: 'Add Purchase' }}
      />
      <Stack.Screen
        name="edit-purchase"
        options={{ presentation: 'modal', headerTitle: 'Purchase' }}
      />
      <Stack.Screen name="family-settings" options={{ headerTitle: 'Family Settings' }} />
      <Stack.Screen name="period-report" options={{ headerTitle: 'Period Report' }} />
      <Stack.Screen name="period-ledger" options={{ headerTitle: 'Ledger' }} />
      <Stack.Screen name="goals" options={{ headerTitle: 'Goals' }} />
      <Stack.Screen name="create-goal" options={{ headerTitle: 'New goal' }} />
      <Stack.Screen name="goal/[id]" options={{ headerTitle: 'Goal' }} />
      <Stack.Screen name="recurring-costs" options={{ headerTitle: 'Fixed costs' }} />
    </Stack>
  );
}
