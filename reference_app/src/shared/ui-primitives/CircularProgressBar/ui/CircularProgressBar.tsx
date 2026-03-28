import {useFont} from '@shopify/react-native-skia'
import {useEffect} from 'react'
import {View} from 'react-native'
import {useSharedValue, withTiming} from 'react-native-reanimated'
import {CircularProgressBarUi} from './CircularProgressBarUi'

const RADIUS = 60
const STROKE_WIDTH = 18

export const CircularProgressBar = ({
  percentageValue,
  radius = RADIUS,
  strokeWidth = STROKE_WIDTH,
  additionalText,
  offsetY,
}: Props) => {
  const percentage = useSharedValue(0)
  const end = useSharedValue(0)
  const font = useFont(require('@assets/fonts/OpenSans-Bold.ttf'), 30)
  const fontSecondary = useFont(require('@assets/fonts/OpenSans-Regular.ttf'), 16)

  useEffect(() => {
    percentage.value = withTiming(percentageValue, {duration: 700})
    end.value = withTiming(percentageValue / 100, {duration: 700})
  }, [percentageValue])

  if (!font || !fontSecondary) {
    return <View />
  }

  return (
    <CircularProgressBarUi
      radius={radius}
      strokeWidth={strokeWidth}
      font={font}
      percentage={percentage}
      end={end}
      fontSecondary={fontSecondary}
      additionalText={additionalText}
      offsetY={offsetY}
    />
  )
}

// TYPES

type Props = {
  percentageValue: number
  strokeWidth: number
  radius: number
  additionalText?: string
  offsetY?: number
}
