import {useCallback, useEffect, useState} from 'react'
import {useNotesStore} from '../model/note-store'

const PAGE_SIZE = 20

export const useNotes = ({startDate, endDate}: UseNotesOptions = {}) => {
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const notes = useNotesStore((state) => state.notes)
  const fetchNotes = useNotesStore((state) => state.fetchNotes)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    try {
      const before = notes.length
      await fetchNotes({
        page,
        limit: PAGE_SIZE,
        startDate,
        endDate,
      })
      const after = useNotesStore.getState().notes.length
      const loaded = after - before

      if (loaded < PAGE_SIZE) setHasMore(false)
      setPage((prev) => prev + 1)
    } catch (e) {
      console.error('loadMore error:', e)
    } finally {
      setIsLoading(false)
    }
  }, [page, isLoading, hasMore, notes.length, startDate, endDate])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await fetchNotes({
        page: 0,
        limit: PAGE_SIZE,
        startDate,
        endDate,
      })

      setPage(1)
      setHasMore(true)
    } catch (e) {
      console.error('refresh error:', e)
    } finally {
      setIsRefreshing(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    refresh()
  }, [startDate, endDate])

  return {
    notes,
    loadMore,
    isLoading,
    isRefreshing,
    hasMore,
    refresh,
  }
}

// TYPES

type UseNotesOptions = {
  startDate?: string
  endDate?: string
}
