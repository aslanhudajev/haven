import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  BottomSheetModal,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet'
import {BlurView} from '@react-native-community/blur'
import {forwardRef, useCallback} from 'react'
import {Pressable, Keyboard, View, Platform} from 'react-native'
import {FullWindowOverlay} from 'react-native-screens'
import {useColorPalette} from '@shared/lib/palette'
import type {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types'
import type {ReactNode} from 'react'

export const BottomSheet = forwardRef<BottomSheetModalMethods, BottomSheetProps>(
  function BottomSheet(props, ref) {
    const {children, ...rest} = props
    const {getColor} = useColorPalette()

    const backdropComponent = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.9}
          appearsOnIndex={1}
          disappearsOnIndex={-1}
          enableTouchThrough
        >
          <BlurView
            style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
            blurType="light"
            blurAmount={20}
            reducedTransparencyFallbackColor="dark"
          />
        </BottomSheetBackdrop>
      ),
      []
    )

    const containerComponent = useCallback(
      (props: {children?: React.ReactNode}) => (
        <FullWindowOverlay>{props.children}</FullWindowOverlay>
      ),
      []
    )

    const backgroundComponent = useCallback(
      (props: BottomSheetBackgroundProps) => (
        <View className="overflow-hidden rounded-xl bg-background" {...props} />
      ),
      []
    )

    return (
      <BottomSheetModal
        ref={ref}
        handleIndicatorStyle={{backgroundColor: getColor('--foreground')}}
        backdropComponent={backdropComponent}
        containerComponent={Platform.OS === 'ios' ? containerComponent : undefined}
        backgroundComponent={backgroundComponent}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        enablePanDownToClose
        enableDismissOnClose
        {...rest}
      >
        <Pressable onPress={Keyboard.dismiss} className="flex-1">
          {children}
        </Pressable>
      </BottomSheetModal>
    )
  }
)

// TYPES

type BottomSheetProps = BottomSheetModalProps & {
  children?: ReactNode
}
