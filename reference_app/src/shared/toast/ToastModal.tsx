import {Toasts} from '@backpackapp-io/react-native-toast'
import {useColorPalette} from '@shared/lib/palette'

export function ToastModal() {
  const {getColor} = useColorPalette()

  return (
    <Toasts
      defaultStyle={{
        view: {
          backgroundColor: getColor('--muted'),
          borderWidth: 2,
          borderColor: getColor('--border'),
        },
        text: {color: getColor('--foreground')},
      }}
      providerKey="MODAL::1"
    />
  )
}
