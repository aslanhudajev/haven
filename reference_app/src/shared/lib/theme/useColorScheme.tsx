import {useColorScheme as useNativewindColorScheme} from 'nativewind'

export function useColorScheme() {
  const {colorScheme, setColorScheme} = useNativewindColorScheme()
  return {
    colorScheme: colorScheme ?? 'dark',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
  }
}
