import React, {useEffect} from 'react'
import {View, Image} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import type {ImageSourcePropType} from 'react-native'

const iconSize = 50

const icons: {source: ImageSourcePropType; width: number}[][] = [
  [
    {source: require('@assets/logos/expo.webp'), width: 140},
    {source: require('@assets/logos/tailwind.webp'), width: 200},
  ],
  [
    {source: require('@assets/logos/revenueCut.webp'), width: 195},
    {source: require('@assets/logos/react.webp'), width: 125},
  ],
  [
    {source: require('@assets/logos/sentry.webp'), width: 135},
    {source: require('@assets/logos/typescript.webp'), width: 185},
  ],
  [
    {source: require('@assets/logos/supabase.webp'), width: 180},
    {source: require('@assets/logos/google-analytics.webp'), width: 130},
  ],
  [
    {source: require('@assets/logos/rnr.webp'), width: 95},
    {source: require('@assets/logos/formatjs.webp'), width: 160},
    {source: require('@assets/logos/localization.webp'), width: 55},
  ],
  [
    {source: require('@assets/logos/reanimated.webp'), width: 150},
    {source: require('@assets/logos/zod.webp'), width: 50},
    {source: require('@assets/logos/zustand.webp'), width: 130},
  ],
]

const AnimatedIcon = ({
  source,
  width,
  delay,
}: {
  source: ImageSourcePropType
  width: number
  delay: number
}) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(10)

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      })
      translateY.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      })
    }, delay)

    return () => clearTimeout(timeout)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Image
        source={source}
        style={{
          width,
          height: iconSize,
          resizeMode: 'contain',
        }}
      />
    </Animated.View>
  )
}

const Logos = () => {
  return (
    <View className="gap-4 px-6">
      {icons.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-between gap-4">
          {row.map(({source, width}, iconIndex) => {
            const globalIndex = rowIndex * 3 + iconIndex
            return (
              <AnimatedIcon
                key={iconIndex}
                source={source}
                width={width}
                delay={globalIndex * 50}
              />
            )
          })}
        </View>
      ))}
    </View>
  )
}

export default Logos
