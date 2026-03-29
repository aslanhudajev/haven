import { supabase } from '@shared/config/supabase';

export async function uploadReceipt(
  familyId: string,
  userId: string,
  fileUri: string,
): Promise<string> {
  const ext = fileUri.split('.').pop() ?? 'jpg';
  const fileName = `${Date.now()}.${ext}`;
  const path = `${familyId}/${userId}/${fileName}`;

  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('receipts')
    .upload(path, blob, { contentType: `image/${ext}`, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('receipts').getPublicUrl(path);
  return data.publicUrl;
}
