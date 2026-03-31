import { Platform, type ViewStyle } from 'react-native';
import { Colors } from './colors';

/** Soft card lift — iOS tinted shadow + Android elevation */
export function cardElevation(scheme: 'light' | 'dark'): ViewStyle {
  const shadowTint = Colors[scheme].shadowTint;
  if (Platform.OS === 'ios') {
    return {
      shadowColor: shadowTint,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: scheme === 'dark' ? 0.32 : 0.2,
      shadowRadius: 18,
    };
  }
  return { elevation: 8 };
}

export function tabBarElevation(scheme: 'light' | 'dark'): ViewStyle {
  const shadowTint = Colors[scheme].shadowTint;
  if (Platform.OS === 'ios') {
    return {
      shadowColor: shadowTint,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: scheme === 'dark' ? 0.22 : 0.12,
      shadowRadius: 10,
    };
  }
  return { elevation: 8 };
}

/** FAB / small prominent controls */
export function fabElevation(scheme: 'light' | 'dark'): ViewStyle {
  const shadowTint = Colors[scheme].shadowTint;
  if (Platform.OS === 'ios') {
    return {
      shadowColor: shadowTint,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: scheme === 'dark' ? 0.38 : 0.28,
      shadowRadius: 14,
    };
  }
  return { elevation: 10 };
}
