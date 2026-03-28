import {IconPlus} from '@tabler/icons-react-native'
import {useRouter} from 'expo-router'
import React, {useState} from 'react'
import {View, TouchableOpacity} from 'react-native'
import {NoteListGroup} from 'src/widgets/note-list'
import {TimeRangeControl} from '@widgets/time-range-control'
import {UserAvatar} from '@entities/user'
import {ScreenContent} from '@shared/ui-primitives/ScreenContent'
import {NotesView} from '../model/types'
import {SelectView} from './SelectView'
import type {TimeRange} from '../model/types'

const NotesScreen = () => {
  const router = useRouter()

  const [timeRange, setTimeRange] = useState<TimeRange>({
    from: undefined,
    to: undefined,
  })
  const {from, to} = timeRange
  const [view, setView] = useState<NotesView>(NotesView.All)

  const handleSetTimeRange = (timeRange: TimeRange) => {
    setTimeRange({
      from: timeRange.from,
      to: timeRange.to,
    })
  }

  return (
    <ScreenContent excludeEdges={['bottom']}>
      <View className="flex flex-row items-center justify-between gap-4 bg-background px-4 pb-2">
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/profile')}>
          <UserAvatar />
        </TouchableOpacity>
        <SelectView value={view} onSelect={setView} onTimeRangeChange={handleSetTimeRange} />
      </View>
      <View className="flex-1 px-4">
        {view !== NotesView.All && (
          <TimeRangeControl
            filter={view}
            timeRange={{
              from: from!,
              to: to!,
            }}
            onTimeRangeChange={handleSetTimeRange}
          />
        )}
        <NoteListGroup from={from} to={to} showEmptyState />
        <View className="absolute bottom-6 right-6 z-50">
          <TouchableOpacity
            onPress={() => router.push('/note/create')}
            className={'bg-secondary rounded-full w-16 h-16 items-center justify-center shadow-lg'}
            activeOpacity={0.8}
          >
            <IconPlus className="size-10 text-primary" />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContent>
  )
}

export default NotesScreen
