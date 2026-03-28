import {Path, Skia, Text} from '@shopify/react-native-skia'
import React from 'react'
import {useDerivedValue, withTiming} from 'react-native-reanimated'
import {useColorPalette} from '@shared/lib/palette'
import type {SkFont} from '@shopify/react-native-skia'
import type {SharedValue} from 'react-native-reanimated'

const MIN_ANGLE_TO_SHOW_LABEL = 10

const DonutPath = ({
  index,
  radius,
  strokeWidth,
  gap,
  decimals,
  padding,
  color,
  isSelected,
  animationDuration = 1000,
  label,
  labelFont,
}: Props) => {
  const {getColor} = useColorPalette()
  const centerX = radius + padding
  const centerY = radius + padding

  const animatedRadius = useDerivedValue(() => {
    return withTiming(isSelected ? radius + 10 : radius, {duration: 300})
  })

  const animatedStrokeWidth = useDerivedValue(() => {
    return withTiming(isSelected ? strokeWidth + 5 : strokeWidth, {duration: 300})
  })

  const animatedInnerRadius = useDerivedValue(() => {
    return animatedRadius.value - animatedStrokeWidth.value / 2
  })

  const path = useDerivedValue(() => {
    const path = Skia.Path.Make()
    path.addCircle(centerX, centerY, animatedInnerRadius.value)
    return path
  })

  const start = useDerivedValue(() => {
    const sum = decimals.value.slice(0, index).reduce((a, b) => a + b, 0)
    return withTiming(sum + index * gap, {duration: animationDuration})
  }, [])

  const end = useDerivedValue(() => {
    const sum = decimals.value.slice(0, index + 1).reduce((a, b) => a + b, 0)
    return withTiming(sum + index * gap, {duration: animationDuration})
  }, [])

  const labelAngle = useDerivedValue(() => {
    return ((start.value + end.value) / 2) * 2 * Math.PI
  })

  const labelOpacity = useDerivedValue(() => {
    const angleDeg = (end.value - start.value) * 360
    return angleDeg >= MIN_ANGLE_TO_SHOW_LABEL ? 1 : 0
  })

  const labelX = useDerivedValue(() => {
    return (
      (animatedInnerRadius.value + animatedStrokeWidth.value / 2 - 25) *
        Math.cos(labelAngle.value) +
      centerX
    )
  })

  const labelY = useDerivedValue(() => {
    return (
      (animatedInnerRadius.value + animatedStrokeWidth.value / 2 - 25) *
        Math.sin(labelAngle.value) +
      centerY
    )
  })

  const labelFontSize = 14
  const estimatedTextWidth = label.length * labelFontSize * 0.6

  const adjustedLabelX = useDerivedValue(() => labelX.value - estimatedTextWidth / 2)
  const adjustedLabelY = useDerivedValue(() => labelY.value + labelFontSize / 4)

  return (
    <>
      <Path
        path={path}
        color={color}
        style="stroke"
        strokeJoin="bevel"
        strokeWidth={animatedStrokeWidth}
        strokeCap="butt"
        start={start}
        end={end}
      />
      {label && labelFont && (
        <Text
          x={adjustedLabelX}
          y={adjustedLabelY}
          text={label}
          font={labelFont}
          color={getColor('--primary')}
          opacity={labelOpacity}
        />
      )}
    </>
  )
}

export default DonutPath

// TYPES

type Props = {
  index: number
  radius: number
  strokeWidth: number
  gap: number
  decimals: SharedValue<number[]>
  padding: number
  color: string
  label: string
  labelFont: SkFont
  isSelected?: boolean
  animationDuration?: number
}
