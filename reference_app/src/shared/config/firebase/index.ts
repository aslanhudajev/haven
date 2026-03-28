import {
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
  type FirebaseAnalyticsTypes,
} from '@react-native-firebase/analytics'
import {getApp, getApps} from '@react-native-firebase/app'

type Analytics = FirebaseAnalyticsTypes.Module

let analyticsInstance: Analytics | null = null

function ensureAnalytics(): Analytics | null {
  if (analyticsInstance) {
    return analyticsInstance
  }

  if (getApps().length === 0) {
    if (__DEV__) {
      console.warn('[firebaseAnalytics] Firebase not initialized')
    }
    return null
  }

  const app = getApp()
  const analytics = getAnalytics(app)

  if (!__DEV__) {
    setAnalyticsCollectionEnabled(analytics, true)
  }

  analyticsInstance = analytics
  return analytics
}

export const firebaseAnalytics = {
  async logEvent(name: string, params?: Record<string, unknown>) {
    const analytics = ensureAnalytics()

    if (!analytics) return

    await logEvent(analytics, name, params)
  },
}
