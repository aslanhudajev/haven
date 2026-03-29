import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@shared/config/supabase';

/** Valid HTTP Content-Type; `image/jpg` is not a real MIME type and breaks previews. */
function mimeForReceipt(extRaw: string): string {
  const ext = extRaw.toLowerCase().split('?')[0] ?? 'jpg';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
    case 'heif':
      return 'image/heic';
    default:
      return 'image/jpeg';
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const clean = base64.replace(/\s/g, '');
  const binary = atob(clean);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * React Native: `fetch(fileUri)` often returns an empty blob for `file://` / `ph://` assets.
 * Read bytes via expo-file-system (base64) instead. Web keeps fetch+blob.
 */
async function readUriForUpload(uri: string): Promise<ArrayBuffer | Blob> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    return response.blob();
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!base64 || base64.length === 0) {
      throw new Error('empty_base64');
    }
    return base64ToArrayBuffer(base64);
  } catch {
    const response = await fetch(uri);
    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error(
        'Could not read the image file. Try choosing from the photo library instead of the camera, or restart the app.',
      );
    }
    return blob;
  }
}

export async function uploadReceipt(
  familyId: string,
  userId: string,
  fileUri: string,
): Promise<string> {
  const ext = (fileUri.split('.').pop() ?? 'jpg').split('?')[0] ?? 'jpg';
  const fileName = `${Date.now()}.${ext}`;
  const path = `${familyId}/${userId}/${fileName}`;
  const contentType = mimeForReceipt(ext);

  const body = await readUriForUpload(fileUri);

  const { error } = await supabase.storage
    .from('receipts')
    .upload(path, body, { contentType, upsert: false });

  if (error) throw error;

  // Private bucket: store path in DB; use createSignedUrl when rendering.
  return path;
}
