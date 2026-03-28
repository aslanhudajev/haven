import React, {useState} from 'react'
import {ScrollView, View} from 'react-native'
import {Trans, useTranslation} from '@shared/i18n'
import {Text} from '@shared/ui/text'
import {DatePicker} from '@shared/ui-primitives/DatePicker'

export default function DatePickerScreen() {
  const {t} = useTranslation('DatePickerScreen')
  const [date, setDate] = useState<string | undefined>(new Date().toDateString())

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc.1')}
          i18nKey="DatePickerScreen.desc.1"
          components={{bold1: <Text className="font-medium text-foreground" />}}
          parent={Text}
          className="text-muted-foreground"
        />
        <Trans
          // {t('desc.2')}
          i18nKey="DatePickerScreen.desc.2"
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
        </View>
      </View>
      <DatePicker
        value={date}
        onChange={setDate}
        minimumDate={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
        maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
      />
    </ScrollView>
  )
}
