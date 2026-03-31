import { Platform } from 'react-native';

/** Pastel tile backgrounds for purchase rows (light) — cycles by row index */
export const purchaseIconTilePaletteLight = [
  '#FEE2E2',
  '#FEF3C7',
  '#DBEAFE',
  '#EDE9FE',
  '#CFFAFE',
  '#FCE7F3',
] as const;

export const purchaseIconTilePaletteDark = [
  '#7F1D1D',
  '#78350F',
  '#1E3A5F',
  '#4C1D95',
  '#164E63',
  '#831843',
] as const;

function lightPalette() {
  const surface0 = '#F8FAFC';
  const surface1 = '#FFFFFF';
  const surface2 = '#EEF2FF';
  return {
    surface0,
    surface1,
    surface2,
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    /** Primary CTA / key emphasis — warm rose, not teal */
    accent: '#E11D48',
    accentMuted: '#FFE4E6',
    success: '#15803D',
    warning: '#B45309',
    danger: '#DC2626',
    /** Large currency amounts */
    moneyHighlight: '#BE123C',
    borderSubtle: '#E2E8F0',
    borderStrong: '#CBD5E1',
    overlay: 'rgba(15, 23, 42, 0.5)',
    /** Dashboard / marketing screen background (LinearGradient stops) */
    heroGradientStart: '#3730A3',
    heroGradientMid: '#5B21B6',
    heroGradientEnd: '#F8FAFC',
    /** Budget progress track (tinted, not flat gray) */
    progressTrack: '#E0E7FF',
    progressGradientStart: '#4F46E5',
    progressGradientEnd: '#E11D48',
    /** iOS shadowColor for cards / FAB (opacity applied in shadows.ts) */
    shadowTint: '#6366F1',
    /** Grouped list row dividers */
    listDivider: '#EDE9FE',
    /** @deprecated use surface0 — kept for existing screens */
    background: surface0,
    /** @deprecated use surface1 */
    backgroundElement: surface1,
    /** @deprecated use surface2 */
    backgroundSelected: surface2,
  } as const;
}

function darkPalette() {
  const surface0 = '#0B0F14';
  const surface1 = '#141C26';
  const surface2 = '#1E2A3A';
  return {
    surface0,
    surface1,
    surface2,
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#FB7185',
    accentMuted: '#4C0519',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#F87171',
    moneyHighlight: '#FDA4AF',
    borderSubtle: '#2D3A4D',
    borderStrong: '#475569',
    overlay: 'rgba(0, 0, 0, 0.55)',
    heroGradientStart: '#1E1B4B',
    heroGradientMid: '#312E81',
    heroGradientEnd: '#0B0F14',
    progressTrack: '#312E81',
    progressGradientStart: '#818CF8',
    progressGradientEnd: '#FB7185',
    shadowTint: '#818CF8',
    listDivider: '#3730A3',
    background: surface0,
    backgroundElement: surface1,
    backgroundSelected: surface2,
  } as const;
}

export const Colors = {
  light: lightPalette(),
  dark: darkPalette(),
} as const;

export type ThemeColors = (typeof Colors)[keyof typeof Colors];
export type ThemeColor = keyof ThemeColors;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 64,
} as const;
