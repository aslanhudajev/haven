import React from 'react'
import {View} from 'react-native'
import Animated, {useAnimatedStyle, interpolate, Extrapolation} from 'react-native-reanimated'
import {Text} from '@shared/ui/text'
import type {DataItem} from './WelcomeScreen'
import type {SharedValue} from 'react-native-reanimated'

const SlideWelcome = ({item, index, width, x}: SlideWelcomeProps) => {
  const imageAnimationStyle = useAnimatedStyle(() => {
    const opacityAnimation = interpolate(
      x.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0, 1, 0],
      Extrapolation.CLAMP
    )

    return {
      opacity: opacityAnimation,
    }
  })

  const textAnimationStyle = useAnimatedStyle(() => {
    const opacityAnimation = interpolate(
      x.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0, 1, 0],
      Extrapolation.CLAMP
    )

    return {
      opacity: opacityAnimation,
    }
  })

  return (
    <View className="flex-1 justify-around items-center pt-16" style={{width}}>
      <Animated.View style={imageAnimationStyle} className="overflow-hidden w-full">
        {item.slideComponent}
      </Animated.View>
      <Animated.View style={textAnimationStyle} className="flex-1 w-full gap-4 pt-8 px-10">
        <Text className="font-bold text-2xl">{item.title}</Text>
        <Text className="text-lg leading-8">{item.text}</Text>
      </Animated.View>
    </View>
  )
}

export default SlideWelcome

// TYPES

type SlideWelcomeProps = {
  item: DataItem
  index: number
  width: number
  x: SharedValue<number>
}
