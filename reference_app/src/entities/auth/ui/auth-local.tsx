import {IconFaceId, IconLock} from '@tabler/icons-react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import {useCallback, useEffect} from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useTranslation} from '@shared/i18n'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'

export function AuthLocal({onAuthenticated}: AuthLocalProps) {
  const {t} = useTranslation('AuthLocal')

  const handleAuthenticate = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      // disableDeviceFallback: true,
    })
    if (result.success) {
      onAuthenticated?.()
    }
  }, [onAuthenticated])

  useEffect(() => {
    handleAuthenticate()
  }, [])

  return (
    <SafeAreaView className="absolute top-0 right-0 bottom-0 left-0 z-50 flex-1 items-center justify-center gap-4 bg-background">
      <IconLock className="size-14 text-primary" />
      <Text className="mx-8">{t(`desc`)}</Text>
      <Button onPress={handleAuthenticate}>
        <IconFaceId className="size-6 text-primary-foreground" />
        <Text>{t(`unlock`)}</Text>
      </Button>
    </SafeAreaView>
  )
}

// TYPES

type AuthLocalProps = {
  onAuthenticated?: () => void
}
