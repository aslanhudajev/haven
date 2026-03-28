import {IconCircleCheckFilled} from '@tabler/icons-react-native'
import * as Haptics from 'expo-haptics'
import {useEffect} from 'react'
import {ScrollView, View, useWindowDimensions, StatusBar, Pressable} from 'react-native'
import {useTranslation} from '@shared/i18n'
import {useColorScheme, cn} from '@shared/lib/theme'
import {useUserSettingsStore} from '@shared/stores/user-settings'
import {Text} from '@shared/ui/text'

export default function AppearanceScreen() {
  const {t} = useTranslation('AppearanceScreen')
  const {colorScheme, setColorScheme} = useColorScheme()
  const width = useWindowDimensions().width

  const preferredTheme = useUserSettingsStore((state) => state.preferredTheme)
  const setPreferredTheme = useUserSettingsStore((state) => state.setPreferredTheme)

  const handleChange = (theme: TTheme['id']) => {
    setPreferredTheme(theme)
    setColorScheme(theme)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  useEffect(() => {
    if (colorScheme === 'dark') {
      StatusBar.setBarStyle('light-content')
    } else {
      StatusBar.setBarStyle('dark-content')
    }
  }, [colorScheme])

  const buttonWidth = (width - 12 * 4) / 2 - 8

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3">
      <View>
        <Text className="font-semiBold text-base text-foreground">{t('appTheme')}</Text>
        <Text className="mb-4 text-muted-foreground text-sm">{t('desc')}</Text>
        <View className="flex-row flex-wrap gap-4">
          <Pressable
            className={cn(
              '!border-2 !h-32 border-primary/30 rounded-xl p-1 active:bg-background',
              'light' === preferredTheme && '!border-primary'
            )}
            onPress={() => handleChange('light')}
            style={{width: buttonWidth}}
          >
            <View className="h-full flex-1 items-center justify-center rounded-md bg-white">
              <Text className="!text-5xl !text-black mb-2 font-semiBold">Aa</Text>
            </View>
            <View className="absolute right-1 bottom-1 left-1 w-full rounded-b-md bg-gray-200 py-1">
              <Text className="!text-xs text-center font-medium text-black uppercase">
                {t('theme.light')}
              </Text>
            </View>
            {'light' === preferredTheme && (
              <IconCircleCheckFilled
                strokeWidth={0.1}
                className="size-7 text-foreground absolute right-1.5 top-1.5"
              />
            )}
          </Pressable>
          <Pressable
            className={cn(
              '!border-2 !h-32 border-primary/30 rounded-xl p-1 active:bg-background',
              'dark' === preferredTheme && '!border-primary'
            )}
            onPress={() => handleChange('dark')}
            style={{width: buttonWidth}}
          >
            <View className="h-full flex-1 items-center justify-center rounded-md bg-black">
              <Text className="!text-5xl !text-white mb-2 font-semiBold">Aa</Text>
            </View>
            <View className="absolute right-1 bottom-1 left-1 w-full rounded-b-md bg-gray-700 py-1">
              <Text className="!text-xs text-center font-medium text-white uppercase">
                {t('theme.dark')}
              </Text>
            </View>
            {'dark' === preferredTheme && (
              <IconCircleCheckFilled
                strokeWidth={0.1}
                className="size-7 text-foreground absolute right-1.5 top-1.5"
              />
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}

// TYPES

type TTheme = {
  id: 'light' | 'dark' | 'system'
  label: string
}
