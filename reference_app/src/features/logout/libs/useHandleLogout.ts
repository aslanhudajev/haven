// eslint-disable-next-line import/no-restricted-paths
import {useResetStores} from '@features/reset-store'
import {logout} from '@entities/auth'
import {clearNoteImagesCache} from '@entities/note'
import {clearStorage} from '@shared/storage/clearStorage'

export function useHandleLogout() {
  const {handleResetStore} = useResetStores()

  const handleLogout = async () => {
    await logout()

    // Delay cleanup to align with Supabase SDK (onAuthStateChange uses setTimeout).
    // Prevents race where store resets before SIGNED_OUT is processed.
    setTimeout(async () => {
      await clearStorage()
      await handleResetStore()
      await clearNoteImagesCache()
    })
  }

  return {
    handleLogout,
  }
}
