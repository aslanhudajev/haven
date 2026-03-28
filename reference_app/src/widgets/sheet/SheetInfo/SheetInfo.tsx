import React, {useEffect} from 'react'
import {View} from 'react-native'
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated'
import {useTranslation} from '@shared/i18n'
import {useSheet, AppSheet} from '@shared/sheet-provider/context'
import {Text} from '@shared/ui/text'
import {SheetModal} from '@shared/ui-primitives/Sheet'

export const SheetInfo = React.memo(function SheetInfo() {
  const {[AppSheet.INFO]: progressRef} = useSheet()
  const {t} = useTranslation('SheetInfo')

  const progressOpacity = useSharedValue(0)
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
  }))

  useEffect(() => {
    progressOpacity.value = withTiming(1, {duration: 800})
  }, [])

  return (
    <SheetModal name={AppSheet.INFO} snapPoints={[280]} ref={progressRef}>
      <View className="flex-1 px-4">
        <Animated.View className="gap-4 items-center" style={progressAnimatedStyle}>
          <Text className="text-lg text-muted-foreground text-center">{t('bodyText')}</Text>
        </Animated.View>
      </View>
    </SheetModal>
  )
})
