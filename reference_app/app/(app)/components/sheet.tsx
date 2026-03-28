import React from 'react'
import {ScrollView, View} from 'react-native'
import {Trans, useTranslation} from '@shared/i18n'
import {useSheet, AppSheet} from '@shared/sheet-provider/context'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'

export default function SheetScreen() {
  const {t} = useTranslation('SheetScreen')
  const {[AppSheet.INFO]: infoRef} = useSheet()

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc')}
          i18nKey="SheetScreen.desc"
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
        </View>
      </View>
      <Button onPress={() => infoRef?.current?.present()}>
        <Text>{t('btnOpen')}</Text>
      </Button>
    </ScrollView>
  )
}
