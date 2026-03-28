import {IconTrash} from '@tabler/icons-react-native'
import * as FileSystem from 'expo-file-system'
import {useState} from 'react'
import {Button} from '@shared/ui/button'
import {ConfirmationDialog} from '@shared/ui-primitives/ConfirmationDialog'
import {LoadingModal} from '@shared/ui-primitives/LoadingModal'
import {removeNoteImage} from '../libs/removeNoteImage'
import {CACHE_DIR_FOR_NOTE_IMG} from '../model/constants'
import {useNotesStore} from '../model/note-store'

export const DeleteNoteImageButton = ({
  noteId,
  onComplete,
  beforeDelete,
}: DeleteNoteImageButtonProps) => {
  const getNote = useNotesStore((state) => state.getNote)
  const updateNote = useNotesStore((state) => state.updateNote)

  const [loadingModal, setLoadingModal] = useState(false)
  const [confirmationIsOpen, setConfirmationIsOpen] = useState(false)

  const note = getNote(noteId)

  const onDelete = async () => {
    beforeDelete?.()
    try {
      setLoadingModal(true)
      await handleDelete()
      setLoadingModal(false)
      onComplete?.()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setLoadingModal(false)
    }
  }

  const handleDelete = async () => {
    const image_path = note?.image_path
    if (!image_path) return

    await removeNoteImage(image_path)
    const fileUri = `${CACHE_DIR_FOR_NOTE_IMG}${noteId}.jpg`
    await FileSystem.deleteAsync(fileUri, {idempotent: true})

    await updateNote(noteId, {image_path: null})
    onDelete()
  }

  const closeConfirmation = () => setConfirmationIsOpen(false)
  const openConfirmation = () => setConfirmationIsOpen(true)

  return (
    <>
      <Button size="icon" variant="ghost" onPress={openConfirmation}>
        <IconTrash className="size-7 text-foreground" />
      </Button>
      <ConfirmationDialog
        title="Are you sure?"
        open={confirmationIsOpen}
        onCancel={closeConfirmation}
        onContinue={onDelete}
      />
      <LoadingModal modalVisible={loadingModal} />
    </>
  )
}

// TYPES

interface DeleteNoteImageButtonProps {
  noteId: string
  onComplete?: () => void
  beforeDelete?(): void
  className?: string
}
