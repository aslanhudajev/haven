import {useNotesStore} from 'src/entities/note'
import {useUserStore} from '@entities/user'

export function useResetStores() {
  const resetUser = useUserStore((state) => state.reset)
  const resetNotes = useNotesStore((state) => state.reset)

  const handleResetStore = async () => {
    await resetUser()
    await resetNotes()
  }

  return {
    handleResetStore,
  }
}
