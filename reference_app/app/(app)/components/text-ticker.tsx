import React, {useState} from 'react'
import {ScrollView, View} from 'react-native'
import {useTranslation, Trans} from '@shared/i18n'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'
import {TextTicker} from '@shared/ui-primitives/TextTicker'

export default function TextTickerScreen() {
  const {t} = useTranslation('TextTickerScreen')
  const [value, setValue] = useState(100)

  const randomize = () => {
    const random = Math.floor(Math.random() * 10000) + 1
    setValue(random)
  }

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-6">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc')}
          i18nKey="TextTickerScreen.desc"
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
          <Text className="text-muted-foreground">{t('features.5')}</Text>
        </View>
      </View>
      <TextTicker
        value={value}
        className="text-center text-6xl text-foreground leading-tight"
        suffix="$"
        suffixClassName="ml-2 top-1 text-muted-foreground overflow-visible"
      />
      <Button onPress={randomize}>
        <Text>{t('generateRandom')}</Text>
      </Button>
    </ScrollView>
  )
}
