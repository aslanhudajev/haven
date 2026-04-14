import { supabase } from '@shared/config/supabase';
import { getErrorMessage } from '@shared/lib/errors';

/**
 * Deletes the authenticated user via Edge Function (service role).
 * Caller should sign out and clear local state after success.
 */
export async function deleteAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke<{ ok?: boolean; error?: string }>(
    'delete-account',
    { body: {} },
  );

  if (error) {
    throw new Error(getErrorMessage(error, 'Could not delete account'));
  }
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    throw new Error(String(data.error));
  }
}
