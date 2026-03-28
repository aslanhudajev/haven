import {IconChevronLeft, IconChevronRight} from '@tabler/icons-react-native'
import {View} from 'react-native'
import {useLocale} from '@shared/i18n'
import type {TDateISO} from '@shared/lib/dates'
import {daysUntilEndOfMonth} from '@shared/lib/dates'
import {cn} from '@shared/lib/utils'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'
import {
  startOfDay,
  startOfYear,
  endOfYear,
  addMonths,
  addYears,
  subtractMonths,
  subtractYears,
} from '../libs/dateActions'
import {formatDateRange} from '../libs/formatDateRange'
import {TimeRangeControlConst} from '../model/types'
import type {TTimeRangeControl} from '../model/types'

export function TimeRangeControl({
  filter,
  timeRange,
  onTimeRangeChange,
  className,
  showDaysUntilEndOfMonth = false,
}: TimeRangeControlProps) {
  const {language} = useLocale()
  function handlePrevious() {
    if (filter === TimeRangeControlConst.ByMonth) {
      const to = new Date(timeRange.to)
      const endOfMonth = new Date(to.getFullYear(), to.getMonth(), 0)
      endOfMonth.setHours(23, 59, 59, 999)

      onTimeRangeChange({
        from: startOfDay(subtractMonths(timeRange.from, 1)).toISOString(),
        to: endOfMonth.toISOString(),
      })
    } else if (filter === TimeRangeControlConst.ByYear) {
      onTimeRangeChange({
        from: startOfYear(subtractYears(timeRange.from, 1)).toISOString(),
        to: endOfYear(subtractYears(timeRange.to, 1)).toISOString(),
      })
    }
  }

  function handleNext() {
    if (filter === TimeRangeControlConst.ByMonth) {
      const to = new Date(timeRange.to)
      const endOfMonth = new Date(to.getFullYear(), to.getMonth() + 2, 0)
      endOfMonth.setHours(23, 59, 59, 999)

      onTimeRangeChange({
        from: startOfDay(addMonths(timeRange.from, 1)).toISOString(),
        to: endOfMonth.toISOString(),
      })
    } else if (filter === TimeRangeControlConst.ByYear) {
      onTimeRangeChange({
        from: startOfYear(addYears(timeRange.from, 1)).toISOString(),
        to: endOfYear(addYears(timeRange.to, 1)).toISOString(),
      })
    }
  }

  return (
    <View className={cn('h-12 w-full flex-row items-center justify-between gap-2', className)}>
      <Button size="icon" variant="secondary" onPress={handlePrevious}>
        <IconChevronLeft className="size-6 text-secondary-foreground" />
      </Button>
      <View className="items-center">
        <Text className="font-medium text-xl">
          {formatDateRange(timeRange.from, timeRange.to, {locale: language})}
        </Text>
        {showDaysUntilEndOfMonth && (
          <Text className="text-xs text-muted-foreground -mb-1">{`${daysUntilEndOfMonth()} days left`}</Text>
        )}
      </View>
      <Button size="icon" variant="secondary" onPress={handleNext}>
        <IconChevronRight className="size-6 text-secondary-foreground" />
      </Button>
    </View>
  )
}

// TYPES

interface TimeRangeControlProps {
  filter: TTimeRangeControl
  timeRange: TimeRange
  onTimeRangeChange: (timeRange: TimeRange) => void
  className?: string
  showDaysUntilEndOfMonth?: boolean
}

type TimeRange = {
  from: TDateISO
  to: TDateISO
}
