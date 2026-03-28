import {useCallback, useEffect, useState} from 'react'
import {AppState, type AppStateStatus} from 'react-native'
import {globalStorage} from '@shared/storage/global-storage'
import {useUserSettingsStore} from '@shared/stores/user-settings'

// 30 seconds
const BIO_AUTH_EXPIRATION_TIME = 1000 * 30

export function useLocalAuth() {
  const [shouldAuthLocal, setShouldAuthLocal] = useState(false)
  const enabledLocalAuth = useUserSettingsStore((state) => state.enabledLocalAuth)

  const changeAppStateListener = useCallback(
    async (status: AppStateStatus) => {
      if (!enabledLocalAuth) {
        globalStorage.removeItem('movedToBackgroundAt')
        return
      }

      if (status === 'background') {
        const date = Date.now()
        globalStorage.setItem('movedToBackgroundAt', date.toString())
      }

      if (status === 'active') {
        const date = globalStorage.getItem('movedToBackgroundAt')
        if (date && Date.now() - Number(date) >= BIO_AUTH_EXPIRATION_TIME) {
          globalStorage.removeItem('movedToBackgroundAt')
          setShouldAuthLocal(true)
        }
      }
    },
    [enabledLocalAuth]
  )

  useEffect(() => {
    const subscription = AppState.addEventListener('change', changeAppStateListener)
    return subscription.remove
  }, [changeAppStateListener])

  return {
    shouldAuthLocal,
    setShouldAuthLocal,
  }
}
