import {IconBackspace} from '@tabler/icons-react-native'
import * as Haptics from 'expo-haptics'
import {View} from 'react-native'
import Animated from 'react-native-reanimated'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {cn} from '@shared/lib/utils'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'

const buttonKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0']

export function NumericPad({
  disabled,
  value = 0,
  onValueChange,
  maxValue = 9999999999,
  className,
}: NumericPadProps) {
  const {bottom} = useSafeAreaInsets()

  function handleKeyPress(key: string) {
    let newValue: number

    if (key === '000') {
      newValue = value * 1000
    } else {
      newValue = value * 10 + Number(key)
    }

    if (newValue > maxValue) {
      return
    }

    onValueChange?.(newValue)
  }

  function handleDelete() {
    const newValue = Math.floor(value / 10)
    onValueChange?.(newValue)
  }

  function handleClear() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onValueChange?.(0)
  }

  return (
    <Animated.View
      className={cn('flex-row flex-wrap content-center items-center bg-background', className)}
      style={{paddingBottom: bottom}}
    >
      {buttonKeys.map((buttonKey) => (
        <View key={buttonKey} className="w-[33.33%] p-1.5">
          <Button
            disabled={disabled}
            onPress={() => handleKeyPress(buttonKey)}
            variant="ghost"
            size="lg"
            className="bg-zinc-200 dark:bg-zinc-900"
          >
            <Text className="!text-2xl font-semiBold">{buttonKey}</Text>
          </Button>
        </View>
      ))}
      <View className="w-[33.33%] p-1.5">
        <Button
          disabled={disabled}
          onPress={handleDelete}
          onLongPress={handleClear}
          variant="secondary"
          size="lg"
        >
          <IconBackspace className="size-7 text-secondary-foreground" />
        </Button>
      </View>
    </Animated.View>
  )
}

// TYPES

type NumericPadProps = {
  disabled?: boolean
  value: number
  onValueChange?: (value: number) => void
  maxValue?: number
  className?: string
}
