import React, {useState} from 'react'
import {ScrollView, View} from 'react-native'
import {Trans, useTranslation} from '@shared/i18n'
import type {TDateISO} from '@shared/lib/dates'
import {endOfMonth, startOfMonth} from '@shared/lib/dates'
import {Text} from '@shared/ui/text'
import {MonthYearPicker} from '@shared/ui-primitives/MonthYearPicker'

export default function MonthYearPickerScreen() {
  const {t} = useTranslation('MonthYearPickerScreen')

  const [timeRange, setTimeRange] = useState<TimeRange>({
    from: startOfMonth.toISOString(),
    to: endOfMonth.toISOString(),
  })

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
          i18nKey="MonthYearPickerScreen.desc.1"
          components={{bold1: <Text className="font-medium text-foreground" />}}
          parent={Text}
          className="text-muted-foreground"
        />
        <Trans
          // {t('desc.2')}
          i18nKey="MonthYearPickerScreen.desc.2"
          components={{bold1: <Text className="font-medium text-foreground" />}}
          parent={Text}
          className="text-muted-foreground"
        />
        <View className="h-px bg-border" />
        <View className="flex flex-col gap-1">
          <Text className="text-muted-foreground">{t('features.1')}</Text>
          <Text className="text-muted-foreground">{t('features.2')}</Text>
          <Text className="text-muted-foreground">{t('features.3')}</Text>
          <Text className="text-muted-foreground">{t('features.4')}</Text>
          <Text className="text-muted-foreground">{t('features.5')}</Text>
        </View>
      </View>
      <MonthYearPicker
        timeRange={{
          from: timeRange.from!,
          to: timeRange.to!,
        }}
        onChange={handleSetTimeRange}
      />
    </ScrollView>
  )
}

type TimeRange = {
  from?: TDateISO
  to?: TDateISO
}
