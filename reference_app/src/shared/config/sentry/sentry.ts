import * as Sentry from '@sentry/react-native'
import {Env} from '@shared/lib/env'

export const initSentry = () => {
  const dsn = Env.EXPO_PUBLIC_SENTRY_DSN
  if (!dsn) {
    if (__DEV__) {
      console.warn('[Sentry]: ⚠️ Disabled — DSN not set in .env file. Skipping initialization.')
    }
    return null
  }

  Sentry.init({
    dsn,
    sendDefaultPii: true,
  })

  return Sentry
}
