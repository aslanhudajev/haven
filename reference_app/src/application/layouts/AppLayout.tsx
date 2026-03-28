import {Stack, useRouter, usePathname} from 'expo-router'
import {useEffect} from 'react'
import {Platform} from 'react-native'
import Purchases from 'react-native-purchases'
import {useLoadState} from '@features/load-state'
import {shouldShowPaywall, useInitializePurchases} from '@entities/subscription'
import {useUserStore} from '@entities/user'
import {REVENUECAT_ENABLED} from '@shared/config/revenueCat'
import {useTranslation} from '@shared/i18n'
import {useScheduleNotificationSync} from '@shared/lib/notifications'
import {useColorPalette} from '@shared/lib/palette'
import {BackButton} from './ui/BackButton'

export default function AppLayout() {
  const {t} = useTranslation('AppLayout')
  const loadState = useLoadState()
  const user = useUserStore((state) => state.user)
  const {getColor} = useColorPalette()
  const router = useRouter()
  const pathname = usePathname()
  const showPaywall = shouldShowPaywall()
  useInitializePurchases()
  useScheduleNotificationSync({isSignedIn: Boolean(user)})

  useEffect(() => {
    if (user && pathname !== '/profile') {
      loadState()

      if (REVENUECAT_ENABLED) {
        Purchases.logIn(user.id).then((data) => {
          if (data.customerInfo.activeSubscriptions.length === 0 && showPaywall) {
            setTimeout(() => {
              router.push('/paywall')
            }, 3000)
          }
        })
        Purchases.setAttributes({
          email: user!.email,
          displayName: user?.full_name,
        })
      }
    }
  }, [])

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
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: getColor('--background'),
        },
        headerLeft: () => <BackButton />,
        ...(Platform.OS === 'android' && {
          animation: 'ios_from_right',
        }),
      }}
    >
      <Stack.Screen name="(tabs)" options={{headerShown: false}} />
      <Stack.Screen
        name="note/[id]"
        options={{
          presentation: 'modal',
          headerTitle: t('headerTitle.noteOverview'),
          ...(Platform.OS === 'android' && {
            headerShown: true,
            headerTitle: t('headerTitle.transaction'),
          }),
        }}
      />
      <Stack.Screen
        name="note/create"
        options={{
          presentation: 'modal',
          headerTitle: t('headerTitle.createNote'),
          headerStyle: {
            backgroundColor: getColor('--background'),
          },
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerTitle: t('headerTitle.profile'),
        }}
      />
      <Stack.Screen
        name="profile-remove"
        options={{
          headerTitle: t('headerTitle.removeAccount'),
        }}
      />
      <Stack.Screen
        name="appearance"
        options={{
          headerTitle: t('headerTitle.appearance'),
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          headerTitle: t('headerTitle.languages'),
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          presentation: 'modal',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="faq"
        options={{
          headerTitle: t('headerTitle.faq'),
        }}
      />
      <Stack.Screen
        name="components/animated-number"
        options={{
          headerTitle: t('headerTitle.animatedNumber'),
        }}
      />
      <Stack.Screen
        name="components/month-selector"
        options={{
          headerTitle: t('headerTitle.monthSelector'),
        }}
      />
      <Stack.Screen
        name="components/time-range-control"
        options={{
          headerTitle: t('headerTitle.timeRangeControl'),
        }}
      />
      <Stack.Screen
        name="components/sheet"
        options={{
          headerTitle: t('headerTitle.sheet'),
        }}
      />
      <Stack.Screen
        name="components/color-picker"
        options={{
          headerTitle: t('headerTitle.colorPicker'),
        }}
      />
      <Stack.Screen
        name="components/date-picker"
        options={{
          headerTitle: t('headerTitle.datePicker'),
        }}
      />
      <Stack.Screen
        name="components/confirmation-dialog"
        options={{
          headerTitle: t('headerTitle.confirmationDialog'),
        }}
      />
      <Stack.Screen
        name="components/toast"
        options={{
          headerTitle: t('headerTitle.toast'),
        }}
      />
      <Stack.Screen
        name="components/donut-chart"
        options={{
          headerTitle: t('headerTitle.donutChart'),
        }}
      />
      <Stack.Screen
        name="components/month-year-picker"
        options={{
          headerTitle: t('headerTitle.monthYearPicker'),
        }}
      />
      <Stack.Screen
        name="components/text-ticker"
        options={{
          headerTitle: t('headerTitle.textPicker'),
        }}
      />
      <Stack.Screen
        name="components/numeric-pad"
        options={{
          headerTitle: t('headerTitle.numericPad'),
        }}
      />
      <Stack.Screen
        name="components/date-formatter"
        options={{
          headerTitle: t('headerTitle.dateFormatter'),
        }}
      />
      <Stack.Screen
        name="components/money-formatter"
        options={{
          headerTitle: t('headerTitle.moneyFormatter'),
        }}
      />
      <Stack.Screen
        name="components/relative-time-formatter"
        options={{
          headerTitle: t('headerTitle.relativeTimeFormatter'),
        }}
      />
    </Stack>
  )
}
