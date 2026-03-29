import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  IS_ONBOARDED: 'haven:is_onboarded',
  SUB_OVERRIDE: 'haven:sub_override',
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

/** When active, the app treats the user as unsubscribed regardless of RevenueCat state. */
export async function getSubOverride(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEYS.SUB_OVERRIDE);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setSubOverride(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.SUB_OVERRIDE, String(value));
}
