import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="create-family" />
      <Stack.Screen name="set-budgets" />
      <Stack.Screen name="sub-expired" />
    </Stack>
  );
}
