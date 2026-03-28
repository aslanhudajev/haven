import React, {useRef, useState} from 'react'
import {View, useWindowDimensions} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
} from 'react-native-reanimated'
import {useTranslation} from '@shared/i18n'
import {ScreenContent} from '@shared/ui-primitives/ScreenContent'
import CICDPipeline from './CICDPipeline'
import CustomButton from './CustomButton'
import FeatureGrid from './FeatureGrid'
import Logos from './Logos'
import Pagination from './Pagination'
import SlideWelcome from './Slide'
import type {ReactNode} from 'react'
import type {ViewToken} from 'react-native'

const WelcomeScreen = React.memo(function WelcomeScreen() {
  const {t} = useTranslation('WelcomeScreen')
  const {width: SCREEN_WIDTH} = useWindowDimensions()
  const flatListRef = useAnimatedRef<Animated.FlatList<DataItem>>()
  const x = useSharedValue(0)
  const flatListIndex = useSharedValue(0)

  const slideWidth = SCREEN_WIDTH > 600 ? SCREEN_WIDTH * 0.6 : SCREEN_WIDTH

  const [viewedSlides, setViewedSlides] = useState<Set<number>>(new Set())
  const onViewableItemsChanged = useRef(({viewableItems}: {viewableItems: ViewToken[]}) => {
    const index = viewableItems[0]?.index ?? 0
    flatListIndex.value = index
    setViewedSlides((prev) => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }).current

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x
    },
  })

  const data: DataItem[] = [
    {
      id: 1,
      slideComponent: (
        <View className="w-full h-[400px] items-center justify-center">
          <Logos />
        </View>
      ),
      title: t('slide1.title'),
      text: t('slide1.text'),
    },
    {
      id: 2,
      slideComponent: (
        <View className="w-full h-[400px] items-center justify-center">
          <FeatureGrid shouldAnimate={viewedSlides.has(1)} />
        </View>
      ),
      title: t('slide2.title'),
      text: t('slide2.text'),
    },
    {
      id: 3,
      slideComponent: (
        <View className="w-full h-[400px] items-center justify-center">
          <CICDPipeline shouldAnimate={viewedSlides.has(2)} />
        </View>
      ),
      title: t('slide3.title'),
      text: t('slide3.desc'),
    },
  ]

  return (
    <ScreenContent excludeEdges={['top', 'bottom']}>
      <View className="flex-1 bg-background pt-4 pb-9 sm:mx-auto sm:max-w-xl justify-center items-center">
        <Animated.FlatList
          ref={flatListRef}
          onScroll={onScroll}
          data={data}
          renderItem={({item, index}) => (
            <SlideWelcome item={item} index={index} width={slideWidth} x={x} />
          )}
          scrollEventThrottle={16}
          horizontal={true}
          bounces={false}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            minimumViewTime: 300,
            viewAreaCoveragePercentThreshold: 10,
          }}
        />
        <View className="flex-row justify-between items-center mx-6 py-6">
          <Pagination data={data} x={x} screenWidth={slideWidth} />
          <CustomButton
            flatListRef={flatListRef}
            flatListIndex={flatListIndex}
            dataLength={data.length}
          />
        </View>
      </View>
    </ScreenContent>
  )
})

export default WelcomeScreen

// TYPES

export type DataItem = {
  id: number
  slideComponent: ReactNode
  title: string
  text: string
}
