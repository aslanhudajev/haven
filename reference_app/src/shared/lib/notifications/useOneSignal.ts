import {useEffect} from 'react'
import {OneSignal, LogLevel} from 'react-native-onesignal'
import {Env} from '@shared/lib/env'

export function useOneSignal() {
  useEffect(() => {
    const appId = Env.EXPO_PUBLIC_ONESIGNAL_APP_ID

    if (!appId) {
      if (__DEV__) {
        console.warn(
          '[OneSignal]: ⚠️ Disabled — EXPO_PUBLIC_ONESIGNAL_APP_ID not set in .env file. Skipping initialization.'
        )
      }
      return
    }

    if (__DEV__) {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose)
    }

    OneSignal.initialize(appId)
  }, [])
}
