import * as Notifications from 'expo-notifications'
import {router} from 'expo-router'
import {useEffect} from 'react'
import type {Href} from 'expo-router'

export function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url
      if (url) {
        router.push(url as Href)
      }
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return
      }
      redirect(response?.notification)
    })

    // When the user tapped on a notification while the app is active/in the background
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification)
    })

    return () => {
      isMounted = false
      subscription.remove()
    }
  }, [])
}
