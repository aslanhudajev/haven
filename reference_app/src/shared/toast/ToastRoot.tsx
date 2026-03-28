import {Toasts} from '@backpackapp-io/react-native-toast'
import {useColorPalette} from '@shared/lib/palette'

export function ToastRoot() {
  const {getColor} = useColorPalette()

  return (
    <Toasts
      defaultStyle={{
        view: {backgroundColor: getColor('--muted')},
        text: {color: getColor('--foreground')},
      }}
    />
  )
}
