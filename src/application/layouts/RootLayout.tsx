import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@shared/lib/notifications';
import { FontsProvider } from '../components/FontsProvider';
import { PushTokenSync } from '../components/PushTokenSync';
import { RootErrorBoundary } from '../components/RootErrorBoundary';
import { RootNavigationHooks } from '../components/RootNavigationHooks';
import { queryClient } from '../libs/queryClient';
import { AppGateProvider } from '../providers/AppGateProvider';
import { AuthProvider } from '../providers/AuthProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <FontsProvider>
          <AuthProvider>
            <AppGateProvider>
              <PushTokenSync />
              <RootErrorBoundary>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <RootNavigationHooks />
                  <Stack screenOptions={{ animation: 'none' }}>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                    <Stack.Screen name="(app)" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="paywall"
                      options={{ headerShown: false, gestureEnabled: false }}
                    />
                    <Stack.Screen
                      name="invite/[code]"
                      options={{ headerShown: false, presentation: 'modal' }}
                    />
                  </Stack>
                </ThemeProvider>
              </RootErrorBoundary>
            </AppGateProvider>
          </AuthProvider>
        </FontsProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
