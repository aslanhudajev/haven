import {Pressable, View} from 'react-native'
import {useColorScheme} from '@shared/lib/theme'
import {colorsPrimary} from '../../../config/colors'
import type {TColor} from '../../../config/colors/types'

export function ColorPickerOption({onChange, value, color}: ColorPickerOptionProps) {
  const {colorScheme} = useColorScheme()

  const handleClick = (color: TColor) => {
    if (color === value) {
      onChange(null)
    } else {
      onChange(color)
    }
  }

  return (
    <Pressable onPress={() => handleClick(color)}>
      <View
        style={{
          padding: 4,
          borderRadius: 999,
          borderWidth: 4,
          borderColor: value === color ? colorsPrimary[color][colorScheme] : 'transparent',
        }}
      >
        <View
          className="w-10 h-10 rounded-full"
          style={{backgroundColor: colorsPrimary[color][colorScheme]}}
        />
      </View>
    </Pressable>
  )
}

// TYPES

interface ColorPickerOptionProps {
  onChange(color: TColor | null): void
  value: TColor
  color: TColor
  className?: string
}
