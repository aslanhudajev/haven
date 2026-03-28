import {toast} from '@backpackapp-io/react-native-toast'
import {IconFaceId} from '@tabler/icons-react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import {useEffect, useState} from 'react'
import {SettingCard} from '@widgets/settings-card'
import {useTranslation} from '@shared/i18n'
import {cn} from '@shared/lib/utils'
import {useUserSettingsStore} from '@shared/stores/user-settings'
import {Switch} from '@shared/ui/switch'

export function SettingCardLocalAuth() {
  const {t} = useTranslation('SettingCardLocalAuth')
  const [isBiometricSupported, setIsBiometricSupported] = useState(false)
  const enabledLocalAuth = useUserSettingsStore((state) => state.enabledLocalAuth)
  const setEnabledLocalAuth = useUserSettingsStore((state) => state.setEnabledLocalAuth)

  useEffect(() => {
    ;(async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      setIsBiometricSupported(compatible && enrolled)
    })()
  }, [])

  async function handleToggleLocalAuth(enabled: boolean) {
    const result = await LocalAuthentication.authenticateAsync({
      // disableDeviceFallback: true,
    })
    if (result.success) {
      setEnabledLocalAuth(enabled)
    } else {
      toast.error(result.warning ?? `Unknown error`)
    }
  }

  if (!isBiometricSupported) {
    return null
  }

  return (
    <SettingCard
      className="border-b border-background dark:border-muted"
      title={t('title')}
      icon={IconFaceId}
      rightSection={
        <Switch
          checked={enabledLocalAuth}
          onCheckedChange={handleToggleLocalAuth}
          className={cn(!enabledLocalAuth && '!bg-muted-foreground/30')}
        />
      }
      iconClassName="bg-cyan-200 dark:bg-cyan-700"
    />
  )
}
