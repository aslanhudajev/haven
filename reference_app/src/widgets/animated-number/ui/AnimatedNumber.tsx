import React, {useEffect, useState} from 'react'
import {runOnJS, useAnimatedReaction, useSharedValue, withTiming} from 'react-native-reanimated'
import {useMoneyFormatter} from '@shared/lib/format'
import {cn} from '@shared/lib/utils'
import {Text} from '@shared/ui/text'

export const AnimatedNumber = ({
  value,
  currency,
  duration = 200,
  fractionDigits,
  showSign = false,
  showPercent = false,
  className,
}: AnimatedNumberProps) => {
  const formatMoney = useMoneyFormatter()
  const [displayValue, setDisplayValue] = useState(value)

  const animatedValue = useSharedValue(value)

  useEffect(() => {
    animatedValue.value = withTiming(value, {duration})
  }, [value, duration])

  useAnimatedReaction(
    () => animatedValue.value,
    (val) => {
      runOnJS(setDisplayValue)(val)
    },
    []
  )

  let formatted: string
  if (currency) {
    formatted = formatMoney(displayValue, currency)
  } else {
    const rounded =
      fractionDigits !== undefined
        ? displayValue.toFixed(fractionDigits)
        : Number.isInteger(displayValue)
          ? displayValue.toString()
          : displayValue.toFixed(2)

    formatted = rounded
  }

  if (showSign && displayValue > 0) {
    formatted = `+${formatted}`
  }

  if (showPercent) {
    formatted += '%'
  }

  return (
    <Text
      className={cn('text-2xl font-semiBold text-primary text-right', className)}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {formatted}
    </Text>
  )
}

// TYPES

type AnimatedNumberProps = {
  value: number
  currency?: string
  duration?: number
  fractionDigits?: number
  showSign?: boolean
  showPercent?: boolean
  className?: string
}
