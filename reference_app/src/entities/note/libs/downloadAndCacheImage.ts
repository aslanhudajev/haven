import * as FileSystem from 'expo-file-system/legacy'
import {CACHE_DIR_FOR_NOTE_IMG} from '../model/constants'

export const downloadAndCacheImage = async (url: string, noteId: string): Promise<string> => {
  const fileUri = `${CACHE_DIR_FOR_NOTE_IMG}${noteId}.jpg`

  const fileInfo = await FileSystem.getInfoAsync(fileUri)
  if (fileInfo.exists) return fileUri

  try {
    await FileSystem.makeDirectoryAsync(CACHE_DIR_FOR_NOTE_IMG, {intermediates: true})

    const {uri} = await FileSystem.downloadAsync(url, fileUri)
    return uri
  } catch (err) {
    throw new Error(`Image download error ${err}`)
  }
}
