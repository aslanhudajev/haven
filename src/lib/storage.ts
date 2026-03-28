import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  IS_ONBOARDED: 'haven:is_onboarded',
} as const;

export async function getIsOnboarded(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEYS.IS_ONBOARDED);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setIsOnboarded(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.IS_ONBOARDED, String(value));
}
