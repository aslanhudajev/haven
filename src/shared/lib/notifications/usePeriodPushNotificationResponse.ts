import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

function navigateFromPayload(data: Record<string, unknown>) {
  const periodId = data.periodId;
  if (typeof periodId !== 'string' || !periodId) return;
  router.push({
    pathname: '/(app)/period-report',
    params: {
      periodId,
      periodName: String(data.periodName ?? ''),
      startsAt: String(data.startsAt ?? ''),
      endsAt: String(data.endsAt ?? ''),
      status: String(data.status ?? 'archived'),
    },
  });
}

export function usePeriodPushNotificationResponse() {
  useEffect(() => {
    let mounted = true;

    const handle = (notification: Notifications.Notification) => {
      const raw = notification.request.content.data;
      if (!raw || typeof raw !== 'object') return;
      navigateFromPayload(raw as Record<string, unknown>);
    };

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!mounted || !response?.notification) return;
      handle(response.notification);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handle(response.notification);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
}
