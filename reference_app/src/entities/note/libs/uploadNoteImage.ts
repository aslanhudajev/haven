import * as ImageManipulator from 'expo-image-manipulator'
import {supabase} from '@shared/config/supabase'
import {useUserStore} from '../../user/model/user-store'

export const uploadNoteImage = async (
  localUri: string,
  filePath: string
): Promise<string | null> => {
  const userId = useUserStore.getState().user?.id

  if (!localUri || !userId) return null

  const compressed = await ImageManipulator.manipulateAsync(localUri, [{resize: {width: 800}}], {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
  })

  const arrayBuffer = await fetch(compressed.uri).then((res) => res.arrayBuffer())

  const {error} = await supabase.storage.from('notes-images').upload(filePath, arrayBuffer, {
    contentType: 'image/jpeg',
  })

  if (error) {
    throw new Error(`Upload error: ${error.message}`)
  }

  return filePath
}
