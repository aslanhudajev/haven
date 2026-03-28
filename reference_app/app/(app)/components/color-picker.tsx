import React, {useState} from 'react'
import {ScrollView, View} from 'react-native'
import type {TColor} from '@shared/config/colors'
import {Trans, useTranslation} from '@shared/i18n'
import {Text} from '@shared/ui/text'
import {ColorPicker} from '@shared/ui-primitives/ColorPicker'

export default function ColorPickerScreen() {
  const {t} = useTranslation('ColorPickerScreen')
  const [color, setColor] = useState<TColor>('red')

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc')}
          i18nKey="ColorPickerScreen.desc"
          components={{
            bold1: <Text className="font-medium text-foreground" />,
          }}
          parent={Text}
          className="text-muted-foreground"
        />
        <View className="h-px bg-border" />
        <View className="flex flex-col gap-1">
          <Text className="text-muted-foreground">{t('features.1')}</Text>
          <Text className="text-muted-foreground">{t('features.2')}</Text>
          <Text className="text-muted-foreground">{t('features.3')}</Text>
          <Text className="text-muted-foreground">{t('features.4')}</Text>
          <Text className="text-muted-foreground">{t('features.4')}</Text>
        </View>
      </View>
      <ColorPicker label={t('color.label')} value={color} onChange={setColor} />
    </ScrollView>
  )
}
