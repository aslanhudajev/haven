import React from 'react'
import {ScrollView, View} from 'react-native'
import {Trans, useTranslation} from '@shared/i18n'
import {useDateFormatter} from '@shared/lib/format'
import {Text} from '@shared/ui/text'

export default function DateFormatterScreen() {
  const {t} = useTranslation('DateFormatterScreen')
  const formatDate = useDateFormatter()

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc.1')}
          i18nKey="DateFormatterScreen.desc.1"
          components={{bold1: <Text className="font-medium text-foreground" />}}
          parent={Text}
          className="text-muted-foreground"
        />
        <Trans
          // {t('desc.2')}
          i18nKey="DateFormatterScreen.desc.2"
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
      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-sm text-muted-foreground">Default (variant1)</Text>
          <Text className="text-base text-foreground">{formatDate(new Date())}</Text>
        </View>
        <View className="gap-1">
          <Text className="text-sm text-muted-foreground">Time only (variant2)</Text>
          <Text className="text-base text-foreground">
            {formatDate(new Date(), {variant: 'variant2'})}
          </Text>
        </View>
        <View className="gap-1">
          <Text className="text-sm text-muted-foreground">Date only (skipTime: true)</Text>
          <Text className="text-base text-foreground">
            {formatDate(new Date(), {skipTime: true})}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
