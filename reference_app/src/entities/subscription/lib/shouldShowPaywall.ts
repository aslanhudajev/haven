import {globalStorage, STORAGE_CONSTANT_LAST_PAYWALL_DATE} from '@shared/storage/global-storage'

export const shouldShowPaywall = (intervalDays = 7): boolean => {
  const lastShownDate = globalStorage.getItem(STORAGE_CONSTANT_LAST_PAYWALL_DATE)
  if (!lastShownDate) {
    return true
  }

  const lastDate = new Date(lastShownDate)
  const now = new Date()

  const diffTime = now.getTime() - lastDate.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)

  return diffDays >= intervalDays
}

export const updatePaywallDate = () => {
  globalStorage.setItem(STORAGE_CONSTANT_LAST_PAYWALL_DATE, new Date().toISOString())
}
