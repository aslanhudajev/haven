import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

/** Prefer server-side Expo push; local scheduling can double-notify if both are enabled. */
export async function schedulePeriodEndNotification(periodName: string, endsAt: Date) {
  const now = new Date();
  const secondsUntilEnd = Math.max(Math.floor((endsAt.getTime() - now.getTime()) / 1000), 10);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Period ended',
      body: `${periodName}'s report is ready! Check who owes whom.`,
      data: { type: 'period_end', periodName },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntilEnd,
    },
  });
}
