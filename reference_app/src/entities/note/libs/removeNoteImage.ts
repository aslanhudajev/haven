import {supabase} from '@shared/config/supabase'

export const removeNoteImage = async (imagePath: string): Promise<void> => {
  const {error} = await supabase.storage.from('notes-images').remove([imagePath])

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}
