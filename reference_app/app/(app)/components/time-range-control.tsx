import {useState} from 'react'
import {ScrollView, View} from 'react-native'
import {TimeRangeControl} from '@widgets/time-range-control'
import {Trans, useTranslation} from '@shared/i18n'
import type {TDateISO} from '@shared/lib/dates'
import {endOfMonth, startOfMonth} from '@shared/lib/dates'
import {Text} from '@shared/ui/text'

export default function TimeRangeControlScreen() {
  const {t} = useTranslation('TimeRangeControlScreen')

  const [timeRange, setTimeRange] = useState<TimeRange>({
    from: startOfMonth.toISOString(),
    to: endOfMonth.toISOString(),
  })
  const {from, to} = timeRange

  const handleSetTimeRange = (timeRange: TimeRange) => {
    setTimeRange({
      from: timeRange.from,
      to: timeRange.to,
    })
  }

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc.1')}
          i18nKey="TimeRangeControlScreen.desc.1"
          components={{bold1: <Text className="font-medium text-foreground" />}}
          parent={Text}
          className="text-muted-foreground"
        />
        <Trans
          // {t('desc.2')}
          i18nKey="TimeRangeControlScreen.desc.2"
          components={{bold1: <Text className="font-medium text-foreground" />}}
          parent={Text}
          className="text-muted-foreground"
        />
        <View className="h-px bg-border" />
        <View className="flex flex-col gap-1">
          <Text className="text-muted-foreground">{t('features.1')}</Text>
          <Text className="text-muted-foreground">{t('features.2')}</Text>
          <Text className="text-muted-foreground">{t('features.3')}</Text>
        </View>
      </View>
      <TimeRangeControl
        filter="BY_MONTH"
        timeRange={{
          from: from!,
          to: to!,
        }}
        onTimeRangeChange={handleSetTimeRange}
      />
    </ScrollView>
  )
}

type TimeRange = {
  from?: TDateISO
  to?: TDateISO
}
