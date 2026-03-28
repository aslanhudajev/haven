import {useState} from 'react'
import {ScrollView, View} from 'react-native'
import {AnimatedNumber} from '@widgets/animated-number'
import {useTranslation, Trans} from '@shared/i18n'
import {cn} from '@shared/lib/utils'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'

export default function AnimatedNumberScreen() {
  const {t} = useTranslation('AnimatedNumberScreen')
  const [value, setValue] = useState(100)

  const randomize = () => {
    const random = Math.floor(Math.random() * 10000) + 1
    setValue(random)
  }

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc')}
          i18nKey="AnimatedNumberScreen.desc"
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
      <View className="flex gap-4 mb-6">
        <AnimatedNumber
          className="text-2xl font-semiBold text-primary "
          value={value}
          fractionDigits={0}
        />
        <AnimatedNumber
          className={cn('text-2xl font-semiBold text-primary', value > 0 && 'text-green-400')}
          value={value}
          currency="$"
          showSign
        />
      </View>
      <Button onPress={randomize}>
        <Text>{t('generateRandom')}</Text>
      </Button>
    </ScrollView>
  )
}
