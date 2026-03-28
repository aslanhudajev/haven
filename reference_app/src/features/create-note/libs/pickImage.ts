import * as ImagePicker from 'expo-image-picker'
import uuid from 'react-native-uuid'
import {useUserStore} from '@entities/user'

export const pickImage = async (): Promise<{localUri: string; filePath: string} | undefined> => {
  const userId = useUserStore.getState().user?.id

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.7,
    exif: false,
  })

  if (result.canceled || !result.assets?.[0]?.uri) return

  const fileExt = result.assets[0].uri.split('.').pop()?.toLowerCase() ?? 'jpg'

  return {
    localUri: result.assets[0].uri,
    filePath: `${userId}/${String(uuid.v4())}.${fileExt}`,
  }
}
