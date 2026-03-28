import * as Notifications from 'expo-notifications'
import {useCallback, useEffect} from 'react'
import {Platform} from 'react-native'
import {useTranslation} from '@shared/i18n'
import {useUserSettingsStore} from '@shared/stores/user-settings'

export function useScheduleNotification() {
  const {t} = useTranslation('useScheduleNotification')

  async function scheduleReminderNotification() {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: t(`title`),
        body: t(`body`),
        data: {
          url: '/note/create',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 18,
        minute: 0,
        channelId: Platform.OS === 'android' ? 'reminders' : undefined,
      },
    })
  }

  async function cancelAllScheduledNotifications() {
    return Notifications.cancelAllScheduledNotificationsAsync()
  }

  return {
    scheduleReminderNotification,
    cancelAllScheduledNotifications,
  }
}

export function useScheduleNotificationSync({isSignedIn}: {isSignedIn: boolean}) {
  const enabledPushNotifications = useUserSettingsStore((state) => state.enabledPushNotifications)
  const {scheduleReminderNotification, cancelAllScheduledNotifications} = useScheduleNotification()

  const triggerScheduleNotification = useCallback(async () => {
    const {status} = await Notifications.getPermissionsAsync()
    if (status === 'granted') {
      await cancelAllScheduledNotifications()
      await scheduleReminderNotification()
    }
  }, [scheduleReminderNotification, cancelAllScheduledNotifications])

  useEffect(() => {
    if (!isSignedIn) {
      return
    }
    if (isSignedIn && enabledPushNotifications) {
      triggerScheduleNotification()
    } else {
      cancelAllScheduledNotifications()
    }
  }, [enabledPushNotifications, triggerScheduleNotification, cancelAllScheduledNotifications])
}
