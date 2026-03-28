import {Link} from 'expo-router'
import React from 'react'
import {View, Pressable} from 'react-native'
import {useTranslation} from '@shared/i18n'
import type {TDateISO} from '@shared/lib/dates'
import {useDateFormatter} from '@shared/lib/format'
import {cn} from '@shared/lib/utils'
import {Text} from '@shared/ui/text'
import {NoteImageDisplay} from '../ui/NoteImageDisplay'

export const NoteCard = React.memo(function NoteCard(props: NoteCardProps) {
  const {t} = useTranslation('NoteCardProps')
  const {id, note, onBack} = props
  const {title, content, created_at, image_path} = note
  const formatDate = useDateFormatter()

  return (
    <Link
      asChild
      push
      href={{
        pathname: '/note/[id]',
        params: {id: id, back: String(onBack)},
      }}
    >
      <Pressable className="flex flex-row items-center justify-between gap-4 px-4 py-2.5 mb-2 bg-secondary active:bg-secondary/60 rounded-md">
        <View className="flex flex-1 justify-center gap-2">
          {title && (
            <Text numberOfLines={1} className="flex-1 font-medium text-xl">
              {title}
            </Text>
          )}
          <Text
            numberOfLines={2}
            className={cn(
              'flex-1 leading-2 text-muted-foreground/95',
              !title && 'font-medium text-xl text-primary'
            )}
          >
            {content}
          </Text>
          <View className={cn('flex flex-row gap-1')}>
            <Text className={cn('text-muted-foreground/60 text-sm')}>
              {t('atDate', {date: formatDate(created_at, {variant: 'variant2'})})}
            </Text>
          </View>
        </View>
        {id && image_path && (
          <View className="w-[80px] h-[70px] rounded-md overflow-hidden bg-muted">
            <NoteImageDisplay image_path={image_path} noteId={id} />
          </View>
        )}
      </Pressable>
    </Link>
  )
})

// TYPES

interface NoteCardProps {
  id: string
  note: {
    title?: string | null
    content: string
    created_at: TDateISO
    image_path?: string | null
  }
  onBack?: boolean
}
