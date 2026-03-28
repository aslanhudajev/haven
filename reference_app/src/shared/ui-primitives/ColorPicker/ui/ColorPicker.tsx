import {View} from 'react-native'
import type {TColor} from '@shared/config/colors'
import {colorsPrimary} from '@shared/config/colors'
import {Label} from '@shared/ui/label'
import {ColorPickerOption} from './ColorPickerOption'

export function ColorPicker({value, onChange, label}: ColorPickerProps) {
  return (
    <View className="gap-3">
      <Label nativeID={`label-${label}`}>{label}</Label>
      <View className="flex-row flex-wrap gap-0.5 justify-around -mx-2.5">
        {Object.keys(colorsPrimary).map((color) => {
          const typedColor = color as TColor
          return (
            <ColorPickerOption key={color} color={typedColor} onChange={onChange} value={value} />
          )
        })}
      </View>
    </View>
  )
}

// TYPES

interface ColorPickerProps {
  value: TColor
  onChange(color: TColor): void
  label?: string
}
