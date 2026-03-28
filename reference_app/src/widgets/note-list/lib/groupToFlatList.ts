import {convertDateToLocalISOString} from '@shared/lib/dates'
import type {FlashListRef} from '@shopify/flash-list'
import type {RefObject} from 'react'
import type {Note} from 'src/entities/note'

export const groupNotesByDate = (
  notes: Note[],
  list: RefObject<FlashListRef<SectionItem> | null>
): SectionItem[] => {
  const sorted = [...notes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return sorted.reduce<SectionItem[]>((flatList, note) => {
    const date = convertDateToLocalISOString(note.created_at, {skipTime: true})
    const lastItem = flatList[flatList.length - 1]

    const lastItemDate =
      lastItem && 'created_at' in lastItem
        ? convertDateToLocalISOString(lastItem.created_at, {skipTime: true})
        : null

    if (lastItemDate !== date) {
      flatList.push({date})
    }

    flatList.push(note)
    list?.current?.prepareForLayoutAnimationRender()
    return flatList
  }, [])
}

// TYPES

export type TSectionHeader = {
  date: string
}

type SectionItem = Note | TSectionHeader
