import {useQuery} from '@tanstack/react-query'
import Purchases from 'react-native-purchases'
import {useUserStore} from '../../user/model/user-store'
import type {CustomerInfo} from 'react-native-purchases'

export function usePurchasesPackages() {
  return useQuery({
    queryKey: ['offerings'],
    queryFn: Purchases.getOfferings,
    select: (state) => state.current?.availablePackages,
  })
}

export function useUserEntitlements(): TUseUserEntitlements {
  const user = useUserStore((state) => state.user)

  const {data: customerInfo, refetch} = useQuery({
    queryKey: ['entitlements', user?.id],
    queryFn: Purchases.getCustomerInfo,
    refetchInterval: 1000 * 60,
    enabled: !!user?.id,
    networkMode: 'online',
    gcTime: 0,
    staleTime: 0,
  })

  const isPro = !!customerInfo?.entitlements.active.pro?.isActive

  const entitlement = isPro ? 'pro' : 'trial'

  return {
    customerInfo,
    entitlement,
    isPro,
    refetch,
  }
}

// TYPES

type TUseUserEntitlements = {
  customerInfo: CustomerInfo | undefined
  entitlement: 'pro' | 'trial'
  isPro: boolean
  refetch: () => void
}
