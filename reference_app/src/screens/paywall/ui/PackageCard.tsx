import {Pressable, View} from 'react-native'
import {useTranslation} from '@shared/i18n'
import {cn} from '@shared/lib/utils'
import {Checkbox} from '@shared/ui/checkbox'
import {Text} from '@shared/ui/text'
import type {PurchasesPackage} from 'react-native-purchases'

export function PackageCard({
  data,
  selected,
  onSelect,
}: {
  data: PurchasesPackage
  selected: boolean
  onSelect?: () => void
}) {
  const {t} = useTranslation('PaywallScreen')

  const isAnnual = data.identifier.includes('annual')
  const isLifetime = data.identifier.includes('lifetime')
  const isMonthly = data.identifier.includes('monthly')

  const getLabel = () => {
    if (isLifetime) return t(`period.lifetime`)
    if (isAnnual) return `${t(`period.annual`)}`
    if (isMonthly) return `${t(`period.months`)}`
    return ''
  }

  const getPrice = () => {
    if (isLifetime) return data.product.priceString
    if (isAnnual) return data.product.pricePerYearString
    if (isMonthly) return data.product.pricePerMonthString
    return ''
  }

  const getSubLabel = () => {
    if (isLifetime) return t(`lifetimeAccess`) // e.g. "Lifetime access"
    if (isAnnual) return t(`billedAnnually`) // e.g. "Billed annually"
    if (isMonthly) return t(`billedMonthly`) // e.g. "Billed monthly"
    return ''
  }

  return (
    <Pressable
      className={cn(
        'flex-1 rounded-xl p-0.5 w-full border',
        selected ? 'bg-amber-900/15 border-amber-600' : 'border-stone-700'
      )}
      onPress={onSelect}
    >
      <View className="flex-row items-center justify-center rounded-xl px-4 py-3">
        {isAnnual && (
          <View
            className={cn(
              'absolute -top-3 left-6 flex items-center justify-center dark:bg-blue-900/60 bg-blue-300/60 px-3 py-0.5 rounded-xl',
              selected && 'dark:bg-blue-900 bg-blue-300'
            )}
          >
            <Text className="font-semiBold text-sm">{t(`savePercent`, {percent: '37%'})}</Text>
          </View>
        )}
        <View className="flex-row items-center gap-4">
          <Checkbox checked={selected} onCheckedChange={() => {}} className="active:bg-muted" />
          <Text className="font-semibold text-lg">{getLabel()}</Text>
        </View>
        <View className="flex-1 items-end gap-1">
          <Text className="line-clamp-1 shrink-0 font-bold text-2xl">{getPrice()}</Text>
          <Text className="line-clamp-1 shrink-0 text-md text-muted-foreground">
            {getSubLabel()}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}
