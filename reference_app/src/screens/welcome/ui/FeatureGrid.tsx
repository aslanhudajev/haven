import {
  IconDroplet,
  IconTypography,
  IconArrowsDiagonal,
  IconLayout,
  IconRuler,
  IconSun,
  IconGridDots,
} from '@tabler/icons-react-native'
import {useEffect} from 'react'
import {View, Text, Image} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'

const FeatureGrid = ({shouldAnimate}: FeatureGridProps) => {
  const height = useSharedValue(100)
  const opacity = useSharedValue(0)

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value,
  }))

  const featureOpacity = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  useEffect(() => {
    if (shouldAnimate) {
      height.value = withTiming(290, {duration: 500, easing: Easing.out(Easing.cubic)})
      opacity.value = withDelay(
        400,
        withTiming(1, {duration: 400, easing: Easing.out(Easing.cubic)})
      )
    }
  }, [shouldAnimate])

  return (
    <Animated.View
      style={[containerStyle]}
      className="mx-10 gap-4 items-center bg-zinc-800/60 border border-zinc-600 px-4 py-6 rounded-2xl relative"
    >
      <View className="absolute -top-9 bg-zinc-700 rounded-full">
        <View className="bg-zinc-700 p-3 rounded-full">
          <Image
            source={require('@assets/logos/tailwind2.webp')}
            className="w-12 h-12"
            resizeMode="contain"
          />
        </View>
      </View>
      <Animated.View style={[featureOpacity]}>
        <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-5 my-10">
          {features.map(({label, icon: Icon}, index) => (
            <View
              key={index}
              className="bg-zinc-600 rounded-md px-4 py-2 flex-row items-center gap-2"
            >
              <Icon size={16} color="white" />
              <Text className="text-white font-medium">{label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
      <View className="absolute -bottom-9 bg-zinc-700 rounded-full">
        <View className="bg-zinc-700 p-3 rounded-full">
          <Image
            source={require('@assets/logos/react2.webp')}
            className="w-12 h-12"
            resizeMode="contain"
          />
        </View>
      </View>
    </Animated.View>
  )
}

export default FeatureGrid

// PARTS

const features = [
  {label: 'Color', icon: IconDroplet},
  {label: 'Typography', icon: IconTypography},
  {label: 'Sizings', icon: IconArrowsDiagonal},
  {label: 'Spacing', icon: IconLayout},
  {label: 'Dimensions', icon: IconRuler},
  {label: 'Models', icon: IconSun},
  {label: 'Components', icon: IconGridDots},
]

// TYPES

type FeatureGridProps = {
  shouldAnimate: boolean
}
