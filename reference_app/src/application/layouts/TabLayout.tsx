import {Tabs} from 'expo-router'
import {useTranslation} from '@shared/i18n'
import {useColorPalette} from '@shared/lib/palette'
import {TabBottom} from './ui/TabBottom'

export default function TabLayout() {
  const {t} = useTranslation('TabLayout')
  const {getColor} = useColorPalette()

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTintColor: getColor('--foreground'),
        headerTitleStyle: {
          fontFamily: 'OpenSans-Medium',
          fontSize: 16,
          color: getColor('--foreground'),
        },
        headerStyle: {
          backgroundColor: getColor('--background'),
        },
      }}
      tabBar={(props) => <TabBottom {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="components"
        options={{
          title: t('title.components'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('title.settings'),
        }}
      />
    </Tabs>
  )
}
