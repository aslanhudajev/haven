import { supabase } from '@shared/config/supabase';

const SIGNED_URL_TTL_SEC = 3600;

/**
 * `purchases.receipt_url` stores the object path inside the `receipts` bucket
 * (`familyId/userId/file.ext`). Legacy rows may still hold a full http(s) URL from public bucket era.
 */
export function storagePathFromReceiptValue(value: string | null | undefined): string | null {
  if (value == null || value === '') return null;
  const v = value.trim();
  if (!v.startsWith('http')) return v;

  const m = v.match(/\/object\/(?:public|sign)\/receipts\/([^?]+)/);
  if (!m?.[1]) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

export async function getReceiptSignedUrl(
  receiptUrlOrPath: string | null | undefined,
  expiresIn = SIGNED_URL_TTL_SEC,
): Promise<string | null> {
  const path = storagePathFromReceiptValue(receiptUrlOrPath);
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function removeReceiptFromStorage(receiptUrlOrPath: string | null | undefined) {
  const path = storagePathFromReceiptValue(receiptUrlOrPath);
  if (!path) return;
  await supabase.storage.from('receipts').remove([path]);
}
