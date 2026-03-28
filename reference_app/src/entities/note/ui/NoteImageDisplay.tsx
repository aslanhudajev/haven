import {IconArrowLeft} from '@tabler/icons-react-native'
import * as FileSystem from 'expo-file-system/legacy'
import {useEffect, useState} from 'react'
import {Image, Pressable, Modal, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {Button} from '@shared/ui/button'
import {downloadAndCacheImage} from '../libs/downloadAndCacheImage'
import {getSignedUrlFromPath} from '../libs/getSignedUrlFromPath'
import {CACHE_DIR_FOR_NOTE_IMG} from '../model/constants'
import {DeleteNoteImageButton} from './DeleteNoteImageButton'

export const NoteImageDisplay = ({
  image_path,
  localUri,
  noteId,
  onDelete,
}: NoteImageDisplayProps) => {
  const [uri, setUri] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const load = async () => {
      if (localUri) {
        setUri(localUri)
        return
      }

      if (!image_path) return

      const fileUri = `${CACHE_DIR_FOR_NOTE_IMG}${noteId}.jpg`
      const fileInfo = await FileSystem.getInfoAsync(fileUri)

      if (fileInfo.exists) {
        setUri(fileUri)
        return
      }

      const signedUrl = await getSignedUrlFromPath(image_path)
      if (!signedUrl) return

      if (noteId) {
        const local = await downloadAndCacheImage(signedUrl, noteId)
        setUri(local)
      }
    }

    load()
  }, [image_path, noteId, localUri])

  if (!uri) return null

  return (
    <>
      <Pressable onPress={() => setFullscreen(true)} className="flex-1">
        <Image source={{uri}} className="w-full h-full rounded-xl" resizeMode="cover" />
      </Pressable>

      <Modal animationType="fade" visible={fullscreen} transparent statusBarTranslucent={true}>
        <View className="flex-1 bg-black justify-center items-center relative">
          <View
            className="absolute top-0 left-0 right-0 z-10 flex-row justify-between px-4"
            style={{paddingTop: insets.top + 12}}
          >
            <Button size="icon" variant="ghost" onPress={() => setFullscreen(false)}>
              <IconArrowLeft className="h-6 w-6 text-foreground" />
            </Button>
            {noteId && (
              <DeleteNoteImageButton
                noteId={noteId}
                onComplete={() => {
                  onDelete?.()
                  setUri(null)
                  setFullscreen(false)
                }}
              />
            )}
          </View>
          <Image source={{uri}} className="w-full h-full" resizeMode="contain" />
        </View>
      </Modal>
    </>
  )
}

//TYPES

interface NoteImageDisplayProps {
  noteId?: string
  image_path?: string | null
  localUri?: string | null
  onDelete?: () => void
}
