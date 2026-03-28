import {View, Modal, ActivityIndicator} from 'react-native'
import {Text} from '@shared/ui/text'

export const LoadingModal = ({
  title = 'Loading...',
  modalVisible = false,
  color,
  indicatorSize = 'large',
}: TProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      statusBarTranslucent={true}
    >
      <View className="flex-1 justify-center items-center bg-background/70">
        <View className="flex gap-2 m-3 rounded-xl bg-secondary p-5 items-center justify-center shadow-sm min-w-40">
          <ActivityIndicator size={indicatorSize} color={color} />
          <Text className="text-muted-foreground text-lg">{title}</Text>
        </View>
      </View>
    </Modal>
  )
}

// TYPES

type TProps = {
  modalVisible: boolean
  color?: string
  title?: string
  indicatorSize?: 'small' | 'large'
}
