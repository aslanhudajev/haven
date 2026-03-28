import {toast} from '@backpackapp-io/react-native-toast'
import {IconBell} from '@tabler/icons-react-native'
import * as Notifications from 'expo-notifications'
import {useState} from 'react'
import {SettingCard} from '@widgets/settings-card'
import {useTranslation} from '@shared/i18n'
import {cn} from '@shared/lib/utils'
import {useUserSettingsStore} from '@shared/stores/user-settings'
import {Switch} from '@shared/ui/switch'

export function SettingCardNotifications() {
  const {t} = useTranslation('SettingCardNotifications')
  const enabledPushNotifications = useUserSettingsStore((state) => state.enabledPushNotifications)
  const setEnabledPushNotifications = useUserSettingsStore(
    (state) => state.setEnabledPushNotifications
  )
  const [loading, setLoading] = useState(false)

  const onToggle = async (checked: boolean) => {
    if (loading) return
    setLoading(true)
    try {
      if (checked) {
        const {status} = await Notifications.getPermissionsAsync()
        if (status !== 'granted') {
          const req = await Notifications.requestPermissionsAsync()
          if (req.status !== 'granted') {
            toast.error(t('notEnabled'))
            return
          }
        }
        setEnabledPushNotifications(true)
        toast.success(t('enabled'))
      } else {
        setEnabledPushNotifications(false)
        toast.success(t('disabled'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingCard
      className="border-b border-background dark:border-muted"
      title={t('title')}
      icon={IconBell}
      rightSection={
        <Switch
          checked={enabledPushNotifications}
          disabled={loading}
          onCheckedChange={onToggle}
          className={cn(!enabledPushNotifications && '!bg-muted-foreground/30')}
        />
      }
      iconClassName="text-teal-700 dark:text-teal-400"
    />
  )
}
