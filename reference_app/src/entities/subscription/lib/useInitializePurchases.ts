import {useEffect} from 'react'
import {Platform} from 'react-native'
import Purchases, {LOG_LEVEL} from 'react-native-purchases'
import {Env} from '@shared/lib/env'

export function useInitializePurchases() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.ERROR)

    if (Platform.OS === 'ios') {
      if (__DEV__ && !Env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS) {
        console.warn(
          '[RevenueCat]: ⚠️ Disabled — no API key set for this platform. ' +
            'Add EXPO_PUBLIC_REVENUECAT_API_KEY_IOS or EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID' +
            ' in .env file.'
        )
      } else {
        Purchases.configure({
          apiKey: Env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
        })
      }
    } else if (Platform.OS === 'android') {
      if (__DEV__ && !Env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID) {
        console.warn(
          '[RevenueCat]: ⚠️ Disabled — no API key set for this platform. ' +
            'Add EXPO_PUBLIC_REVENUECAT_API_KEY_IOS or EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID' +
            ' in .env file.'
        )
      } else {
        Purchases.configure({
          apiKey: Env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
        })
      }
    }
  }, [])
}
