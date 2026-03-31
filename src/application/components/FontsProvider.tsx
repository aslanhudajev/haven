import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import { useFonts } from 'expo-font';
import type { ReactNode } from 'react';

/**
 * Loads DM Sans + Sora before the app tree renders.
 */
export function FontsProvider({ children }: { children: ReactNode }) {
  const [loaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  if (!loaded) {
    return null;
  }

  return <>{children}</>;
}
