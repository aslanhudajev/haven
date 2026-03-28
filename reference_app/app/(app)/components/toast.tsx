import {toast} from '@backpackapp-io/react-native-toast'
import React from 'react'
import {ScrollView, View} from 'react-native'
import {Trans, useTranslation} from '@shared/i18n'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'

export default function ToastScreen() {
  const {t} = useTranslation('ToastScreen')

  const handleShowError = () => {
    toast.error('Missing RevenueCat API key')
  }

  const handleShowSuccess = () => {
    toast.success('Subscription restored successfully')
  }

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc.1')}
          i18nKey="ToastScreen.desc.1"
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
      <View className="gap-3">
        <Button onPress={handleShowError}>
          <Text>Show error toast</Text>
        </Button>
        <Button variant="outline" onPress={handleShowSuccess}>
          <Text>Show success toast</Text>
        </Button>
      </View>
    </ScrollView>
  )
}
