import {IconCheck} from '@tabler/icons-react-native'
import {useEffect} from 'react'
import {View, Image} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import Svg, {Path} from 'react-native-svg'
import {Text} from '@shared/ui/text'

const BASE_DELAY = 150

const CICDPipeline = ({shouldAnimate}: {shouldAnimate: boolean}) => {
  const iconSize = 42

  return (
    <View className="w-full gap-1 px-6">
      {/* 1. GitHub → ↓ */}
      <View className="w-full flex-row justify-between gap-4">
        <Image source={require('@assets/logos/github.webp')} className="w-16 h-16 ml-4" />
        <View className="flex-1 h-14 mt-8 mr-6">
          <ArrowRow right delay={0 * BASE_DELAY} shouldAnimate={shouldAnimate} />
        </View>
      </View>

      {/* 2. ↓ ← GitHub Actions */}
      <View className="w-full flex-row justify-between gap-3">
        <View className="flex-1 h-14 mt-8 ml-10">
          <ArrowRow delay={1 * BASE_DELAY} shouldAnimate={shouldAnimate} />
        </View>
        <Image source={require('@assets/logos/github-actions.webp')} className="w-16 h-16" />
      </View>

      {/* 3. Expo → ↓ */}
      <View className="w-full flex-row justify-between gap-3">
        <Image source={require('@assets/logos/expo.webp')} style={{width: 120, height: iconSize}} />
        <View className="flex-1 h-14 mt-4 mr-6">
          <ArrowRow right delay={2 * BASE_DELAY} shouldAnimate={shouldAnimate} />
        </View>
      </View>

      {/* 4. ↓ ← App stores */}
      <View className="w-full flex-row justify-between gap-3">
        <View className="flex-1 h-14 mt-6 ml-10">
          <ArrowRow delay={3 * BASE_DELAY} shouldAnimate={shouldAnimate} />
        </View>
        <Image source={require('@assets/logos/apps.webp')} className="w-28 h-14 ml-4" />
      </View>

      {/* 5. Version */}
      <View className="flex-row gap-2 items-center ">
        <View className="size-6 bg-green-700 items-center justify-center rounded-2xl">
          <IconCheck size={18} color="white" />
        </View>
        <Text className="text-xl font-semibold">v1.0.0</Text>
      </View>
    </View>
  )
}

export default CICDPipeline

// PARTS

const ArrowRow = ({
  right,
  delay,
  shouldAnimate,
}: {
  right?: boolean
  delay: number
  shouldAnimate: boolean
}) => {
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({opacity: opacity.value}))

  useEffect(() => {
    if (shouldAnimate) {
      opacity.value = withDelay(delay, withTiming(1, {duration: 400}))
    }
  }, [shouldAnimate])

  return (
    <Animated.View style={style} className="w-full flex-row opacity-0">
      {right ? (
        <>
          <View className="flex-1 -mr-3">
            <AnimatedArrowHorizontal delay={delay} shouldAnimate={shouldAnimate} />
          </View>
          <AnimatedArrowDown delay={delay + 100} shouldAnimate={shouldAnimate} />
        </>
      ) : (
        <>
          <AnimatedArrowDown delay={delay + 100} shouldAnimate={shouldAnimate} />
          <View className="flex-1 -ml-3">
            <AnimatedArrowHorizontal delay={delay} shouldAnimate={shouldAnimate} />
          </View>
        </>
      )}
    </Animated.View>
  )
}

const AnimatedArrowHorizontal = ({
  delay = 0,
  shouldAnimate,
}: {
  delay: number
  shouldAnimate: boolean
}) => {
  const height = 2
  const color = '#fff'
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({opacity: opacity.value}))

  useEffect(() => {
    if (shouldAnimate) {
      opacity.value = withDelay(delay, withTiming(1, {duration: 400}))
    }
  }, [shouldAnimate])

  return (
    <Animated.View style={[{flex: 1}, style]}>
      <Svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <Path d={`M0 ${height! / 2} H100`} stroke={color} strokeWidth={height} />
      </Svg>
    </Animated.View>
  )
}

const AnimatedArrowDown = ({delay = 0, shouldAnimate}: {delay: number; shouldAnimate: boolean}) => {
  const height = 40
  const color = '#fff'
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({opacity: opacity.value}))

  useEffect(() => {
    if (shouldAnimate) {
      opacity.value = withDelay(delay, withTiming(1, {duration: 400}))
    }
  }, [shouldAnimate])

  return (
    <Animated.View style={style}>
      <Svg width={20} height={height}>
        <Path d={`M10 0 V${height! - 6}`} stroke={color} strokeWidth={2} />
        <Path
          d={`M6 ${height! - 10} L10 ${height! - 4} L14 ${height! - 10}`}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  )
}
