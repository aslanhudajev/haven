import {useCallback} from 'react'
import {useNotesStore} from '@entities/note'

export const useLoadState = () => {
  const fetchNotes = useNotesStore((state) => state.fetchNotes)

  return useCallback(async () => {
    try {
      await fetchNotes()
    } catch (e) {
      console.log('error', e)
    }
  }, [fetchNotes])
}
