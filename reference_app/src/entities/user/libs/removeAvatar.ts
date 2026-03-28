import {supabase} from '@shared/config/supabase'

export const removeAvatar = async (userId: string): Promise<void> => {
  try {
    // Delete existing avatar files for this user
    const {data: existingFiles} = await supabase.storage.from('avatars').list('', {search: userId})
    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map((file) => `${file.name}`)
      const {error: deleteError} = await supabase.storage.from('avatars').remove(filesToRemove)
      if (deleteError) {
        throw new Error('Error deleting old avatar:', deleteError)
      }
    }
  } catch (error) {
    console.log('error', error)
    throw error
  }
}
