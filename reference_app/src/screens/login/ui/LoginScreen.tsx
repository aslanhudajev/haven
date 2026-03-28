import {IconMail} from '@tabler/icons-react-native'
import {Link, useRouter} from 'expo-router'
import React, {useEffect, useState} from 'react'
import {View, ScrollView, ActivityIndicator, Platform, Dimensions} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import ExpoIcon from '@assets/logos/expo.svg'
import ReactIcon from '@assets/logos/react.svg'
import RevenueCatIcon from '@assets/logos/revenueCut.svg'
import SentryIcon from '@assets/logos/sentry.svg'
import SupabaseIcon from '@assets/logos/supabase.svg'
import TailwindIcon from '@assets/logos/tailwind.svg'
import TSIcon from '@assets/logos/typescript.svg'
import {loginByApple, loginByGoogle} from '@entities/auth'
import {GoogleIcon, AppleIcon} from '@shared/assets/svg-icons'
import {firebaseAnalytics} from '@shared/config/firebase'
import {supabase} from '@shared/config/supabase'
import {useTranslation} from '@shared/i18n'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'
import {ScreenContent} from '@shared/ui-primitives/ScreenContent'

export default function LoginScreen() {
  const {t} = useTranslation('LoginScreen')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const titleOpacity = useSharedValue(0)
  const titleTranslateY = useSharedValue(-10)
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{translateY: titleTranslateY.value}],
  }))

  const textOpacity = useSharedValue(0)

  const buttonOpacity = useSharedValue(0)
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }))

  const handleSignedUp = async (strategy: Strategy) => {
    try {
      setTimeout(() => setLoading(true), 100)
      if (strategy === 'oauth_apple') {
        await loginByApple().then(() => {
          setLoading(false)
        })
      } else {
        await loginByGoogle()
      }
      await firebaseAnalytics?.logEvent('user_signed_up', {strategy})
      setTimeout(() => setLoading(false), 1000)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    titleOpacity.value = withTiming(1, {duration: 1200, easing: Easing.out(Easing.cubic)})
    titleTranslateY.value = withTiming(0, {duration: 1500, easing: Easing.out(Easing.cubic)})

    textOpacity.value = withTiming(1, {duration: 800})
    buttonOpacity.value = withTiming(1, {duration: 800})
  }, [])

  return (
    <ScreenContent excludeEdges={['bottom']}>
      <ScrollView
        contentContainerClassName="flex-1 mb-6 px-6 sm:mx-auto sm:max-w-xl"
        showsVerticalScrollIndicator={false}
      >
        <DevWarningBanner />
        <View className="gap-4 mt-4">
          <Animated.View className="flex-row flex-wrap gap-3" style={titleAnimatedStyle}>
            <Text className="text-[28px] text-muted-foreground leading-[50px]">
              {t('welcomeTo')}{' '}
              <Text className="text-[33px] font-semibold text-primary">NativeLaunch</Text>
            </Text>
          </Animated.View>
        </View>
        <View className="flex-1 items-center justify-center">
          <IconCircle />
        </View>
        <Animated.View className="gap-3 w-full mb-3" style={buttonAnimatedStyle}>
          <Button
            variant="outline"
            className="border-stone-500"
            onPress={() => handleSignedUp('oauth_google')}
          >
            <GoogleIcon className="size-6 text-primary" />
            <Text>{t('btnSignGoogle')}</Text>
          </Button>
          {Platform.OS === 'ios' && (
            <Button
              variant="outline"
              className="border-stone-500"
              onPress={() => handleSignedUp('oauth_apple')}
            >
              <AppleIcon className="size-6 text-primary" />
              <Text>{t('btnSignApple')}</Text>
            </Button>
          )}
          <Button
            variant="outline"
            className="border-stone-500"
            onPress={() => router.push('/login-with-email')}
          >
            <IconMail className="size-6 text-primary" />
            <Text>{t(`btnSignEmail`)}</Text>
          </Button>
        </Animated.View>
        <Animated.View className="px-4 mb-3 sm:mb-5" style={buttonAnimatedStyle}>
          <Text className="mx-auto text-center text-muted-foreground text-sm">
            {t('continuing')}{' '}
            <Link href="/privacy-policy">
              <Text className="text-primary text-xs">{t('privacy')}</Text>
            </Link>{' '}
            {t('and')}{' '}
            <Link href="/terms-of-service">
              <Text className="text-primary text-xs">{t('terms')}</Text>
            </Link>
          </Text>
        </Animated.View>
        {loading && (
          <View className="absolute top-0 right-0 bottom-0 left-0 z-50 items-center justify-center bg-background/60">
            <ActivityIndicator size="large" />
          </View>
        )}
      </ScrollView>
    </ScreenContent>
  )
}

const icons = [ReactIcon, TailwindIcon, RevenueCatIcon, SentryIcon, SupabaseIcon, TSIcon]

function IconCircle() {
  const screenWidth = Dimensions.get('window').width
  const size = Math.min(screenWidth * 0.9, 600)
  const center = size / 2
  const radius = center - 40
  const iconSize = 45

  const expoScale = useSharedValue(0)
  const expoOpacity = useSharedValue(0)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const progresses = icons.map(() => useSharedValue(0))

  const expoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: expoScale.value}],
    opacity: expoOpacity.value,
  }))

  useEffect(() => {
    setTimeout(() => {
      progresses.forEach((progress) => {
        progress.value = withTiming(1, {
          duration: 600,
          easing: Easing.out(Easing.exp),
        })
      })
    }, 100)
    expoScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    })
    expoOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    })
  }, [])

  return (
    <View className="relative items-center justify-center" style={{width: size, height: size}}>
      <Animated.View
        className="absolute items-center justify-center z-10"
        style={{
          left: center - iconSize / 2,
          top: center - iconSize / 2,
          width: iconSize,
          height: iconSize,
          ...expoAnimatedStyle,
        }}
      >
        <ExpoIcon width={iconSize + 70} height={iconSize} />
      </Animated.View>

      {icons.map((Icon, index) => {
        const angle = (2 * Math.PI * index) / icons.length
        const targetX = center + radius * Math.cos(angle) - iconSize / 2
        const targetY = center + radius * Math.sin(angle) - iconSize / 2

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const animatedStyle = useAnimatedStyle(() => {
          const progress = progresses[index].value
          const x = center + (targetX - center) * progress
          const y = center + (targetY - center) * progress

          return {
            position: 'absolute',
            left: x,
            top: y,
            opacity: progress,
          }
        })

        return (
          <Animated.View
            key={index}
            className="absolute items-center justify-center"
            style={[
              {
                width: iconSize,
                height: iconSize,
              },
              animatedStyle,
            ]}
          >
            <Icon width={iconSize} height={iconSize} />
          </Animated.View>
        )
      })}
    </View>
  )
}

function DevWarningBanner() {
  const {t} = useTranslation('LoginScreen')
  if (supabase) return null

  return (
    <View className="rounded-md p-3 mb-4 border bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800">
      <Text className="text-yellow-800 font-medium dark:text-yellow-300">
        {t('supabaseNotConfigured')}
      </Text>
    </View>
  )
}

// TYPE

type Strategy = 'oauth_google' | 'oauth_apple'
