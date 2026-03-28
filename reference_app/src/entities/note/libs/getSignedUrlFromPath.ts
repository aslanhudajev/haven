import {supabase} from '@shared/config/supabase'

export const getSignedUrlFromPath = async (imagePath: string): Promise<string | null> => {
  if (!imagePath) return null

  const {data, error} = await supabase.storage
    .from('notes-images')
    .createSignedUrl(imagePath, 60 * 60 * 24 * 30) // 30 days

  if (error) {
    throw new Error(`Failed to create signed URL ${error.message}`)
  }

  return data?.signedUrl ?? null
}
