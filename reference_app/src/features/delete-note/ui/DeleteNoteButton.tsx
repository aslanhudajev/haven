import {toast} from '@backpackapp-io/react-native-toast'
import {IconTrash} from '@tabler/icons-react-native'
import {useRouter} from 'expo-router'
import {useState} from 'react'
import {ActivityIndicator} from 'react-native'
import type {NoteID} from '@entities/note'
import {useNotesStore} from '@entities/note'
import {useTranslation} from '@shared/i18n'
import {Button} from '@shared/ui/button'
import {ConfirmationDialog} from '@shared/ui-primitives/ConfirmationDialog'

export const DeleteNoteButton = ({id, beforeDelete}: DeleteNoteButtonProps) => {
  const {t} = useTranslation('DeleteCategoryButton')
  const router = useRouter()
  const deleteNote = useNotesStore((state) => state.deleteNote)

  const [loading, setLoading] = useState<boolean>(false)
  const [confirmationIsOpen, setConfirmationIsOpen] = useState(false)

  const onDelete = async () => {
    setLoading(true)
    beforeDelete?.()
    try {
      await deleteNote(id)
      router.back()
      setLoading(false)
    } catch (error) {
      toast.error(String(error))
      setLoading(false)
    }
  }

  const closeConfirmation = () => setConfirmationIsOpen(false)
  const openConfirmation = () => setConfirmationIsOpen(true)

  return (
    <>
      <Button size="icon" variant="ghost" onPress={openConfirmation}>
        {loading ? <ActivityIndicator /> : <IconTrash className="size-7 text-foreground" />}
      </Button>
      <ConfirmationDialog
        title={t('confirm.title')}
        description={t('confirm.body')}
        open={confirmationIsOpen}
        onCancel={closeConfirmation}
        onContinue={onDelete}
      />
    </>
  )
}

// TYPES

interface DeleteNoteButtonProps {
  id: NoteID
  beforeDelete?(): void
  className?: string
}
