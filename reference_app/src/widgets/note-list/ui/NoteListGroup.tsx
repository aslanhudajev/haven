import {FlashList} from '@shopify/flash-list'
import {IconNotes} from '@tabler/icons-react-native'
import {useMemo, useRef, useState} from 'react'
import {View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {NoteCard, useNotes} from 'src/entities/note'
import {useTranslation} from '@shared/i18n'
import type {TDateISO} from '@shared/lib/dates'
import {getDatesDiffInDays} from '@shared/lib/dates'
import {useRelativeTimeFormatter, useDateFormatter} from '@shared/lib/format'
import {Text} from '@shared/ui/text'
import {groupNotesByDate} from '../lib/groupToFlatList'
import {ListSkeleton} from './ListSkeleton'
import type {TSectionHeader} from '../lib/groupToFlatList'
import type {FlashListRef} from '@shopify/flash-list'
import type {ReactElement} from 'react'
import type {Note} from 'src/entities/note'

export const NoteListGroup = ({
  from,
  to,
  showEmptyState = false,
  ListHeaderComponent,
  onBack,
}: NoteListGroupProps) => {
  const {t} = useTranslation('NoteListGroup')
  const {bottom} = useSafeAreaInsets()
  const [height, setHeight] = useState(0)
  const list = useRef<FlashListRef<Note | TSectionHeader> | null>(null)

  const formatRelativeTime = useRelativeTimeFormatter()
  const formatDate = useDateFormatter()

  const {notes, loadMore, isLoading, isRefreshing, hasMore} = useNotes({
    startDate: from,
    endDate: to,
  })

  const formatLocalDate = (localDate: string) => {
    const daysDifference = getDatesDiffInDays(Date.now(), localDate)
    const shouldUseRelative = Math.abs(daysDifference) <= 1
    return shouldUseRelative
      ? formatRelativeTime(localDate)
      : formatDate(localDate, {skipTime: true})
  }

  const notesByDate = useMemo(() => groupNotesByDate(notes, list), [notes])

  return (
    <FlashList
      ref={list}
      className="flex-1"
      contentContainerStyle={{paddingBottom: bottom}}
      data={notesByDate}
      keyExtractor={(item) => ('date' in item ? item.date : item.id)}
      renderItem={({item: note}) => {
        if ('date' in note) {
          return (
            <View className="flex-row justify-between align-center border-border border-b-[0.5px] py-2 pt-4">
              <Text className="text-foreground/70 capitalize">{formatLocalDate(note.date)}</Text>
            </View>
          )
        } else {
          return (
            <NoteCard
              id={note.id}
              note={{
                title: note.title,
                content: note?.content,
                created_at: note.created_at as TDateISO,
                image_path: note.image_path,
              }}
              onBack={onBack}
            />
          )
        }
      }}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={isLoading || isRefreshing ? <ListSkeleton /> : null}
      overrideProps={{
        contentContainerStyle: {flexGrow: 1},
      }}
      onLayout={(e) => {
        const {height} = e.nativeEvent.layout
        setHeight(height)
      }}
      onEndReached={hasMore ? loadMore : undefined}
      onEndReachedThreshold={0.8}
      ListEmptyComponent={
        showEmptyState && !isLoading && !isRefreshing ? (
          <View className="justify-center items-center h-full" style={{height: height - 100}}>
            <IconNotes className="size-16 text-muted-foreground" />
            <Text className="mt-6 text-center text-muted-foreground">{t('notFound.title')}</Text>
            <Text className="text-center text-muted-foreground">{t('notFound.body')}</Text>
          </View>
        ) : null
      }
    />
  )
}

// TYPES

interface NoteListGroupProps {
  from?: string
  to?: string
  showEmptyState?: boolean
  ListHeaderComponent?: ReactElement
  onBack?: boolean
}
