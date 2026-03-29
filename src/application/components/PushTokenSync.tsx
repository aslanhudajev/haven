import { useEffect, useRef } from 'react';
import { upsertPushToken } from '@entities/profile';
import { registerForPushNotifications } from '@shared/lib/notifications';
import { useAuth } from '@app/providers/AuthProvider';

export function PushTokenSync() {
  const { user } = useAuth();
  const lastSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      lastSyncedRef.current = null;
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const token = await registerForPushNotifications();
        if (cancelled || !token) return;
        const key = `${user.id}:${token}`;
        if (key === lastSyncedRef.current) return;
        await upsertPushToken(user.id, token);
        lastSyncedRef.current = key;
      } catch (e) {
        console.warn('Push token sync failed:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return null;
}
