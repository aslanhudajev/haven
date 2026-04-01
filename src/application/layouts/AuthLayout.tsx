import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      {/* Gate uses Redirect, not push—disable iOS swipe-back so users don’t land in stale routes. */}
      <Stack.Screen name="household-intent" options={{ gestureEnabled: false }} />
      <Stack.Screen name="enter-invite-code" options={{ gestureEnabled: false }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="verify-otp" />
    </Stack>
  );
}
