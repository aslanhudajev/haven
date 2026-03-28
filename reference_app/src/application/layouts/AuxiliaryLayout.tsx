import {Stack} from 'expo-router'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useTranslation} from '@shared/i18n'
import {useColorPalette} from '@shared/lib/palette'
import {BackButton} from './ui/BackButton'

export default function AuxiliaryLayout() {
  const {t} = useTranslation('AuxiliaryLayout')
  const {getColor} = useColorPalette()

  return (
    <SafeAreaView className="flex-1 bg-background">
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
        <Stack.Screen
          name="privacy-policy"
          options={{
            presentation: 'modal',
            headerTitle: t('headerTitle.privacyPolicy'),
          }}
        />
        <Stack.Screen
          name="terms-of-service"
          options={{
            presentation: 'modal',
            headerTitle: t('headerTitle.termsConditions'),
          }}
        />
      </Stack>
    </SafeAreaView>
  )
}
