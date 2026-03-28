import {Redirect, Stack, useSegments} from 'expo-router'
import {useColorPalette} from '@shared/lib/palette'
import {
  constantStorage,
  STORAGE_CONSTANT_IS_USER_ONBOARDED,
} from '@shared/storage/contstant-storage'
import {BackButton} from './ui/BackButton'

export default function AuthLayout() {
  const {getColor} = useColorPalette()
  const segments = useSegments()
  const isUserOnboarded = constantStorage.getBoolean(STORAGE_CONSTANT_IS_USER_ONBOARDED)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!isUserOnboarded && segments[1] === 'login') {
    return <Redirect href="/welcome" />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: getColor('--foreground'),
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: 'OpenSans-Medium',
          fontSize: 16,
          color: getColor('--foreground'),
        },
        headerStyle: {
          backgroundColor: getColor('--background'),
        },
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen name="welcome" options={{headerShown: false}} />
      <Stack.Screen name="login" options={{headerShown: false, animation: 'none'}} />
      <Stack.Screen name="login-with-email" options={{headerTitle: ''}} />
    </Stack>
  )
}
