import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { AppProvider, useApp } from '@/context/AppProvider';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isLoading, isOnboarded, isSubscribed } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isLoading) return;
    SplashScreen.hideAsync();

    const currentRoute = segments[0];
    const inOnboarding = currentRoute === 'onboarding';
    const inPaywall = currentRoute === 'paywall';

    if (!isOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (isOnboarded && !isSubscribed && !inPaywall) {
      router.replace('/paywall');
    } else if (isOnboarded && isSubscribed && (inOnboarding || inPaywall)) {
      router.replace('/');
    }
  }, [isLoading, isOnboarded, isSubscribed, segments]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="paywall"
          options={{ gestureEnabled: false }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
