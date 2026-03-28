import {toast} from '@backpackapp-io/react-native-toast'
import {IconCheck} from '@tabler/icons-react-native'
import {useMutation} from '@tanstack/react-query'
import {Link, useRouter} from 'expo-router'
import {useCallback, useEffect, useState} from 'react'
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import Purchases from 'react-native-purchases'
import {usePurchasesPackages, useUserEntitlements, updatePaywallDate} from '@entities/subscription'
import {firebaseAnalytics} from '@shared/config/firebase'
import {useTranslation} from '@shared/i18n'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'
import {ScreenContent} from '@shared/ui-primitives/ScreenContent'
import {PackageCard} from './PackageCard'
import type {PurchasesPackage} from 'react-native-purchases'

export default function PaywallScreen() {
  const {t} = useTranslation('PaywallScreen')
  const [duration, setDuration] = useState<'monthly' | 'annual' | 'lifetime'>('annual')
  const {data} = usePurchasesPackages()
  const {refetch} = useUserEntitlements()
  const router = useRouter()

  const {mutateAsync, isPending} = useMutation({
    mutationFn: (pkg: PurchasesPackage) => Purchases.purchasePackage(pkg),
    onSuccess() {
      refetch()
      router.back()
      toast.success(t(`paySuccess`))
    },
    onError(e) {
      refetch()
      router.back()
      toast.error(t(`payError`, {message: e.message}))
    },
  })

  const {mutateAsync: mutateRestore, isPending: isRestoring} = useMutation({
    mutationFn: Purchases.restorePurchases,
    onSuccess(result) {
      refetch()
      if (Object.keys(result.entitlements.active).length) {
        toast.success(t(`purchasesRestored`))
        router.back()
        Purchases.syncPurchases()
      } else {
        Alert.alert(t(`noActiveSubscriptions`))
      }
    },
    onError(error) {
      refetch()
      toast.error(error.message)
    },
  })
  const selectedPackage = data?.find((i) => i.identifier === `$rc_${duration}`)

  const options = [
    t(`growth.option1`),
    t(`growth.option2`),
    t(`growth.option3`),
    t(`growth.option4`),
  ]

  const handlePurchases = async () => {
    if (!selectedPackage) {
      return
    }
    await firebaseAnalytics?.logEvent('subscription_purchased', {
      subscription_plan: 'pro',
      subscription_duration: duration,
    })
    await mutateAsync(selectedPackage)
  }

  const renderHeaderRight = useCallback(() => {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => mutateRestore()}>
        <Text className="mx-auto text-center text-sm">{t(`restorePurchases`)}</Text>
      </TouchableOpacity>
    )
  }, [])

  useEffect(() => {
    return () => {
      updatePaywallDate()
    }
  }, [])

  return (
    <ScreenContent
      excludeEdges={['top']}
      navigationOptions={{
        headerRight: renderHeaderRight,
      }}
    >
      <ScrollView
        className="bg-background"
        contentContainerClassName="gap-3 px-4"
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{
          paddingTop: Platform.OS === 'ios' && Number(Platform.Version) >= 26 ? 20 : 0,
        }}
      >
        <View className="flex-row gap-2 justify-center items-center">
          <Text className="font-semiBold text-4xl text-primary text-center">NativeLaunch</Text>
          <View className="border border-[2px] rounded-xl border-stone-500 px-2 py-1 mb-1">
            <Text className="text-2xl font-semibold">PRO</Text>
          </View>
        </View>
        <Text className="font-semiBold text-xl text-primary text-center mb-3">{t(`title`)}</Text>
        <View className="gap-3 mb-4">
          {options.map((item) => (
            <View className="flex-row gap-3" key={item}>
              <IconCheck className="size-6 text-amount-positive" />
              <Text className="text-primary">{item}</Text>
            </View>
          ))}
        </View>
        <View className="mb-6">
          <Text className="mb-2 font-semiBold text-primary">Choose your duration:</Text>
          <View className="flex-col items-end gap-4">
            {data
              ?.sort((a, b) => a.product.price - b.product.price)
              .map((pkg) => (
                <PackageCard
                  key={pkg.identifier}
                  data={pkg}
                  selected={pkg.identifier === selectedPackage?.identifier}
                  onSelect={() => {
                    setDuration(
                      pkg.identifier.includes('annual')
                        ? 'annual'
                        : pkg.identifier.includes('monthly')
                          ? 'monthly'
                          : 'lifetime'
                    )
                  }}
                />
              ))}
          </View>
        </View>
        <Button className="mb-1" size="lg" disabled={!selectedPackage} onPress={handlePurchases}>
          <Text style={{fontSize: 18}}>{t(`btn.unlock`)}</Text>
        </Button>
        <View className="">
          <Text className="text-center text-muted-foreground text-xs">
            By continuing, you acknowledge that you understand and agree to our{' '}
            <Link href="/privacy-policy">
              <Text className="text-primary text-xs">Privacy Policy</Text>
            </Link>{' '}
            and{' '}
            <Text
              className="text-primary text-xs"
              onPress={() =>
                Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')
              }
            >
              Terms of Use
            </Text>
          </Text>
        </View>
      </ScrollView>
      {(isPending || isRestoring) && (
        <View className="absolute top-0 right-0 bottom-0 left-0 z-50 items-center justify-center bg-background/50">
          <ActivityIndicator size="large" />
        </View>
      )}
    </ScreenContent>
  )
}
