import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import {supabase} from '@shared/config/supabase'

export const uploadAvatar = async (userId: string): Promise<string | undefined> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images, // Restrict to only images
    allowsMultipleSelection: false, // Can only select one image
    allowsEditing: true, // Allows the user to crop / rotate their photo before uploading it
    quality: 0.5,
    exif: false,
  })

  if (result.canceled || !result.assets || result.assets.length === 0) {
    console.log('User cancelled image picker.')
    return
  }

  const image = result.assets[0]

  if (!image.uri) {
    throw new Error('No image uri!')
  }

  const compressedImage = await ImageManipulator.manipulateAsync(
    image.uri,
    [{resize: {width: 100}}],
    {compress: 0.5, format: ImageManipulator.SaveFormat.JPEG}
  )

  const arraybuffer = await fetch(compressedImage.uri).then((res) => res.arrayBuffer())
  const fileExt = compressedImage.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
  const filePath = `${userId}.${fileExt}`

  try {
    // Delete existing avatar files for this user
    const {data: existingFiles} = await supabase.storage.from('avatars').list('', {search: userId})

    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map((file) => `${file.name}`)
      const {error: deleteError} = await supabase.storage.from('avatars').remove(filesToRemove)

      if (deleteError) {
        throw new Error(`Error deleting old avatar: ${deleteError}`)
      }
    }

    const {data, error} = await supabase.storage
      .from('avatars')
      .upload(filePath, arraybuffer, {contentType: image.mimeType ?? 'image/jpeg', upsert: true})

    if (error) {
      throw new Error(error.message)
    }

    const {data: urlData} = supabase.storage.from('avatars').getPublicUrl(data.path)
    return `${urlData.publicUrl}?t=${Date.now()}`
  } catch (error) {
    console.log('error', error)
    throw error
  }
}
