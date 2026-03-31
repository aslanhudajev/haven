/**
 * Font family names must match `useFonts` keys in RootLayout.
 * Falls back to system sans if fonts are not loaded.
 */
export const fontFamily = {
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
  display: 'Sora_600SemiBold',
  displayBold: 'Sora_700Bold',
} as const;

export type FontFamilyKey = keyof typeof fontFamily;
