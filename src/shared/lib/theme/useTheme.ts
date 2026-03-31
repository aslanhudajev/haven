import { useColorScheme } from 'react-native';
import { Colors, Spacing, type ThemeColors } from './colors';
import { Motion } from './motion';
import { Radii } from './radii';
import { cardElevation, tabBarElevation } from './shadows';
import { fontFamily } from './typography';

export type AppTheme = {
  colors: ThemeColors;
  scheme: 'light' | 'dark';
  fontFamily: typeof fontFamily;
  radii: typeof Radii;
  spacing: typeof Spacing;
  motion: typeof Motion;
  cardShadow: ReturnType<typeof cardElevation>;
  tabBarShadow: ReturnType<typeof tabBarElevation>;
};

export function useTheme(): AppTheme {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  return {
    colors: Colors[scheme],
    scheme,
    fontFamily,
    radii: Radii,
    spacing: Spacing,
    motion: Motion,
    cardShadow: cardElevation(scheme),
    tabBarShadow: tabBarElevation(scheme),
  };
}
