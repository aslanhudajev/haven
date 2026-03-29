import React from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppProvider';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { resetOnboarding } = useApp();

  const confirmReset = () => {
    Alert.alert(
      'Restart setup?',
      'You\u2019ll go through onboarding and subscription again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restart', style: 'destructive', onPress: resetOnboarding },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🏡</Text>
        <Text style={[styles.title, { color: theme.text }]}>Haven</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          You're all set. This is home.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.resetLink,
          { paddingBottom: Math.max(insets.bottom, 24) },
          pressed && styles.resetLinkPressed,
        ]}
        onPress={confirmReset}
      >
        <Text style={[styles.resetText, { color: theme.textSecondary }]}>
          Restart setup
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
  },
  resetLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  resetLinkPressed: {
    opacity: 0.5,
  },
  resetText: {
    fontSize: 14,
  },
});
