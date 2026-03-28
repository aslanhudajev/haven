import * as FileSystem from 'expo-file-system/legacy'
import {CACHE_DIR_FOR_NOTE_IMG} from '../model/constants'

export const clearNoteImagesCache = async () => {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR_FOR_NOTE_IMG)
  if (dirInfo.exists) {
    try {
      await FileSystem.deleteAsync(CACHE_DIR_FOR_NOTE_IMG, {idempotent: true})
    } catch (err) {
      throw new Error(`Failed to clear cache: ${err}`)
    }
  }
}
