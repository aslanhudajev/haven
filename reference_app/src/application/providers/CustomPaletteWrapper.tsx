import {vars} from 'nativewind'
import {View, type ViewProps} from 'react-native'
import {useColorPalette} from '@shared/lib/palette'

export function CustomPaletteWrapper(props: ViewProps) {
  const {colorPalette} = useColorPalette()

  return <View {...props} style={[{flex: 1}, props.style, vars(colorPalette)]} />
}
