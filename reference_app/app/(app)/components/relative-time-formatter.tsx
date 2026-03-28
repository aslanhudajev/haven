import React from 'react'
import {ScrollView, View} from 'react-native'
import {Trans, useTranslation} from '@shared/i18n'
import {useRelativeTimeFormatter} from '@shared/lib/format'
import {Text} from '@shared/ui/text'

export default function RelativeTimeFormatterScreen() {
  const {t} = useTranslation('RelativeTimeFormatterScreen')
  const formatRelativeTime = useRelativeTimeFormatter()

  const today = new Date()
  const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  const inOneDay = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc.1')}
          i18nKey="RelativeTimeFormatterScreen.desc.1"
          components={{bold1: <Text className="font-medium text-foreground" />}}
          parent={Text}
          className="text-muted-foreground"
        />
        <Trans
          // {t('desc.2')}
          i18nKey="RelativeTimeFormatterScreen.desc.2"
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
          <Text className="text-muted-foreground text-sm">Today</Text>
          <Text className="text-foreground text-base">{formatRelativeTime(today)}</Text>
        </View>
        <View className="gap-1">
          <Text className="text-muted-foreground text-sm">Yesterday</Text>
          <Text className="text-foreground text-base">{formatRelativeTime(yesterday)}</Text>
        </View>
        <View className="gap-1">
          <Text className="text-muted-foreground text-sm">Two days ago</Text>
          <Text className="text-foreground text-base">{formatRelativeTime(twoDaysAgo)}</Text>
        </View>
        <View className="gap-1">
          <Text className="text-muted-foreground text-sm">In one day</Text>
          <Text className="text-foreground text-base">{formatRelativeTime(inOneDay)}</Text>
        </View>
        <View className="gap-1">
          <Text className="text-muted-foreground text-sm">In three days</Text>
          <Text className="text-foreground text-base">{formatRelativeTime(inThreeDays)}</Text>
        </View>
      </View>
    </ScrollView>
  )
}
