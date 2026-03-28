import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import React, {forwardRef, useCallback} from 'react'
import {Keyboard, Pressable, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useColorPalette} from '@shared/lib/palette'
import type {ReactNode} from 'react'

type DetachedContentProps = {
  children: ReactNode
  bottomInset?: number
  name: string
  detached?: boolean
  onDismiss?: () => void
  snapPoints?: number[]
}

export const SheetComponent = forwardRef<BottomSheetModal, DetachedContentProps>(
  function SheetComponent(props, ref) {
    const {children, detached = true, bottomInset = 80, ...rest} = props
    const {bottom: safeBottom} = useSafeAreaInsets()
    const {getColor} = useColorPalette()

    const backgroundComponent = useCallback(
      (props: BottomSheetBackgroundProps) => (
        <View
          className="overflow-hidden rounded-xl bg-background mx-4 border border-primary/10"
          {...props}
        />
      ),
      []
    )

    const backdropComponent = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          enableTouchThrough
        />
      ),
      []
    )

    return (
      <BottomSheetModal
        ref={ref}
        enablePanDownToClose
        animateOnMount
        enableDynamicSizing
        backdropComponent={backdropComponent}
        backgroundComponent={backgroundComponent}
        detached={detached}
        keyboardBehavior={'interactive'}
        keyboardBlurBehavior={'restore'}
        bottomInset={bottomInset}
        handleIndicatorStyle={{
          backgroundColor: getColor('--foreground'),
        }}
        {...rest}
      >
        <Pressable onPress={Keyboard.dismiss} className="flex-1 px-4 py-2">
          <BottomSheetView style={{paddingBottom: safeBottom, flex: 1}}>{children}</BottomSheetView>
        </Pressable>
      </BottomSheetModal>
    )
  }
)
