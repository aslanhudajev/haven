import '../global.css'

import NetInfo from '@react-native-community/netinfo'
import {ThemeProvider, DarkTheme, DefaultTheme} from '@react-navigation/native'
import {PortalHost} from '@rn-primitives/portal'
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister'
import {focusManager, onlineManager} from '@tanstack/react-query'
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import * as NavigationBar from 'expo-navigation-bar'
import * as Notifications from 'expo-notifications'
import {Stack} from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import {StatusBar} from 'expo-status-bar'
import {cssInterop} from 'nativewind'
import {useEffect, useState} from 'react'
import {AppState, type AppStateStatus, Platform} from 'react-native'
import {KeyboardProvider} from 'react-native-keyboard-controller'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {Svg} from 'react-native-svg'
import {initSentry} from '@shared/config/sentry'
import {LanguageProvider} from '@shared/i18n'
import {useNotificationObserver, useOneSignal} from '@shared/lib/notifications'
import {useColorPalette} from '@shared/lib/palette'
import {useColorScheme} from '@shared/lib/theme'
import {SheetProvider} from '@shared/sheet-provider'
import {queryStorage} from '@shared/storage/query-storage'
import {useUserSettingsStore} from '@shared/stores/user-settings'
import {ToastRoot} from '@shared/toast/ToastRoot'
import {queryClient} from '../libs/queryClient'
import {AuthProvider} from '../providers/AuthProvider'
import {CustomPaletteWrapper} from '../providers/CustomPaletteWrapper'
import 'react-native-reanimated'
// Polyfill Intl for iOS hermes
// (1) Always required
import '@formatjs/intl-getcanonicallocales/polyfill-force'
import '@formatjs/intl-locale/polyfill-force'
// (2) Required for Intl.RelativeTimeFormat and Intl.DateTimeFormat
import '@formatjs/intl-pluralrules/polyfill-force'
import '@formatjs/intl-pluralrules/locale-data/en'
import '@formatjs/intl-numberformat/polyfill-force'
import '@formatjs/intl-numberformat/locale-data/en'
import '@formatjs/intl-relativetimeformat/polyfill-force'
import '@formatjs/intl-relativetimeformat/locale-data/en'

const SentryInstance = initSentry()

// Online status management
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active')
  }
}

const asyncStoragePersister = createAsyncStoragePersister({
  storage: queryStorage,
})

cssInterop(Svg, {
  className: {
    target: 'style',
    nativeStyleToProp: {width: true, height: true},
  },
})

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 300,
  fade: true,
})

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../../ReactotronConfig')
}

function RootLayout() {
  const {colorScheme, setColorScheme} = useColorScheme()
  const {getColor} = useColorPalette()
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false)
  const preferredTheme = useUserSettingsStore((state) => state.preferredTheme)

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(getColor('--background'))
      NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark')
    }
  }, [colorScheme])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange)

    const loadTheme = async () => {
      if (!preferredTheme) {
        setIsColorSchemeLoaded(true)
        return
      }
      if (preferredTheme !== colorScheme) {
        setColorScheme(preferredTheme)

        setIsColorSchemeLoaded(true)
        return
      }
      setIsColorSchemeLoaded(true)
    }

    loadTheme()

    return () => subscription.remove()
  }, [])

  useOneSignal()

  if (!isColorSchemeLoaded) {
    return null
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}

export default SentryInstance ? SentryInstance.wrap(RootLayout) : RootLayout

// PARTS

function RootLayoutNav() {
  const {colorScheme} = useColorScheme()
  const {getColor} = useColorPalette()
  useNotificationObserver()

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{persister: asyncStoragePersister}}
    >
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <CustomPaletteWrapper>
              <StatusBar backgroundColor={getColor('--background')} />
              <LanguageProvider>
                <SheetProvider>
                  <Stack>
                    <Stack.Screen name="index" options={{headerShown: false}} />
                    <Stack.Screen name="(app)" options={{headerShown: false, animation: 'none'}} />
                    <Stack.Screen name="(auth)" options={{headerShown: false, animation: 'none'}} />
                    <Stack.Screen
                      name="(aux)"
                      options={{headerShown: false, presentation: 'modal'}}
                    />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <ToastRoot />
                  <PortalHost />
                </SheetProvider>
              </LanguageProvider>
            </CustomPaletteWrapper>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  )
}
