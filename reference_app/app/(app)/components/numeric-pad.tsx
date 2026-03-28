import React from 'react'
import {ScrollView, View} from 'react-native'
import {Trans, useTranslation} from '@shared/i18n'
import {Text} from '@shared/ui/text'
import {NumericPad} from '@shared/ui-primitives/NumericPad'

export default function NumericPadScreen() {
  const {t} = useTranslation('NumericPadScreen')

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc.1')}
          i18nKey="NumericPadScreen.desc.1"
          components={{bold1: <Text className="font-medium text-foreground" />}}
          parent={Text}
          className="text-muted-foreground"
        />
        <Trans
          // {t('desc.2')}
          i18nKey="NumericPadScreen.desc.2"
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

      <NumericPad value={3} />
    </ScrollView>
  )
}
