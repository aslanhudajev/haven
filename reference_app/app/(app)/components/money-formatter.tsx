import React from 'react'
import {ScrollView, View} from 'react-native'
import {Trans, useTranslation} from '@shared/i18n'
import {useMoneyFormatter} from '@shared/lib/format'
import {Text} from '@shared/ui/text'

export default function MoneyFormatterScreen() {
  const {t} = useTranslation('MoneyFormatterScreen')
  const formatMoney = useMoneyFormatter()

  const amount = 3999
  const amount2 = 23200500
  const currency = 'USD'

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc.1')}
          i18nKey="MoneyFormatterScreen.desc.1"
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
          <Text className="text-sm text-muted-foreground">Standard format:</Text>
          <Text className="text-base text-foreground">{formatMoney(amount, currency)}</Text>
        </View>
        <View className="gap-1">
          <Text className="text-sm text-muted-foreground">Auto compact (small amount):</Text>
          <Text className="text-base text-foreground">
            {formatMoney(amount, currency, {
              notation: amount.toString().length > 7 ? 'compact' : 'standard',
              minimumFractionDigits: amount.toString().length > 7 ? 2 : 0,
              maximumFractionDigits: amount.toString().length > 7 ? 2 : 0,
            })}
          </Text>
        </View>
        <View className="gap-1">
          <Text className="text-sm text-muted-foreground">Auto compact (large amount):</Text>
          <Text className="text-base text-foreground">
            {formatMoney(amount2, currency, {
              notation: amount2.toString().length > 7 ? 'compact' : 'standard',
              minimumFractionDigits: amount2.toString().length > 7 ? 2 : 0,
              maximumFractionDigits: amount2.toString().length > 7 ? 2 : 0,
            })}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
