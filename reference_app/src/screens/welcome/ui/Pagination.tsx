import React from 'react'
import {View} from 'react-native'
import Animated, {useAnimatedStyle, interpolate, Extrapolation} from 'react-native-reanimated'
import type {DataItem} from './WelcomeScreen'
import type {SharedValue} from 'react-native-reanimated'

const Pagination: React.FC<PaginationProps> = ({data, x, screenWidth}) => {
  return (
    <View className="flex-row h-[40px] justify-center items-center mx-4 gap-4">
      {data.map((_, i) => (
        <PaginationComp i={i} x={x} screenWidth={screenWidth} key={i} />
      ))}
    </View>
  )
}

export default Pagination

// PARTS

const PaginationComp: React.FC<PaginationCompProps> = ({i, x, screenWidth}) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const widthAnimation = interpolate(
      x.value,
      [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
      [10, 20, 10],
      Extrapolation.CLAMP
    )
    const opacityAnimation = interpolate(
      x.value,
      [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    )
    return {
      width: widthAnimation,
      opacity: opacityAnimation,
    }
  })

  return (
    <Animated.View style={[animatedDotStyle]} className="h-[10px] bg-foreground rounded-full" />
  )
}

// TYPES

type PaginationProps = {
  data: DataItem[]
  x: SharedValue<number>
  screenWidth: number
}

type PaginationCompProps = {
  i: number
  x: SharedValue<number>
  screenWidth: number
}
