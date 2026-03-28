import {Link, Stack, useRouter} from 'expo-router'
import {View} from 'react-native'
import {useTranslation} from '@shared/i18n'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'

export default function NotFoundScreen() {
  const router = useRouter()
  const {t} = useTranslation('NotFoundScreen')

  return (
    <>
      <Stack.Screen options={{title: 'Oops!'}} />
      <View className="flex-1 items-center justify-center gap-4 p-4">
        <Text className="font-medium">{t('title')} </Text>
        <View className="flex-row gap-4">
          <Button variant="outline" onPress={() => router.back()}>
            <Text>{t('goBack')}</Text>
          </Button>
          <Link href="/" asChild={true}>
            <Button>
              <Text>{t('goHome')}</Text>
            </Button>
          </Link>
        </View>
      </View>
    </>
  )
}
