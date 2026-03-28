import {BottomSheetModalProvider} from '@gorhom/bottom-sheet'
import React, {useRef} from 'react'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
// eslint-disable-next-line import/no-restricted-paths
import * as Bottom from '@widgets/sheet'
import SheetContext, {AppSheet} from './context'
import type {SheetProvider as ProviderType} from './context'
import type {BottomSheetModal} from '@gorhom/bottom-sheet'
import type {FC} from 'react'

interface SheetProviderProps {
  children: React.ReactNode
}

export const SheetProvider: FC<SheetProviderProps> = ({children}) => {
  const initialSheetContext: ProviderType = {
    [AppSheet.INFO]: useRef<BottomSheetModal>(null),
  }

  return (
    <SheetContext.Provider value={initialSheetContext}>
      <GestureHandlerRootView style={{flex: 1}}>
        <BottomSheetModalProvider>
          <Bottom.SheetInfo />
          {children}
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SheetContext.Provider>
  )
}
