import { supabase } from '@shared/config/supabase';

export async function upsertPushToken(userId: string, expoPushToken: string): Promise<void> {
  const { error } = await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      expo_push_token: expoPushToken,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    if (error.code === 'PGRST205') {
      return;
    }
    throw error;
  }
}
