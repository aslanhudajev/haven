import {useFont} from '@shopify/react-native-skia'
import React, {useMemo, useState} from 'react'
import {ScrollView, View} from 'react-native'
import {colorsPrimary} from '@shared/config/colors'
import type {TColor} from '@shared/config/colors'
import {Trans, useTranslation} from '@shared/i18n'
import {useColorScheme} from '@shared/lib/theme'
import {Text} from '@shared/ui/text'
import {DonutChart} from '@shared/ui-primitives/DonutChart'

const RADIUS = 160

export default function DonutChartScreen() {
  const {t} = useTranslation('DonutChartScreen')
  const {colorScheme} = useColorScheme()
  const [selected, setSelected] = useState<number | undefined>(undefined)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const selectedCategory = categories.find((c) => c.categoryId === selectedCategoryId)

  const _data = useMemo(() => {
    return categories?.map((stat, index) => {
      const colorPrimaryHex = colorsPrimary[stat.category?.color]

      return {
        id: stat.categoryId,
        value: stat.percentage,
        title: stat.category?.title ?? '',
        color: colorPrimaryHex ? colorPrimaryHex[colorScheme === 'dark' ? 'light' : 'dark'] : '',
        onPress: () => {
          setSelected(index === selected ? undefined : index)
          setSelectedCategoryId(index === selected ? undefined : stat.categoryId)
        },
      }
    })
  }, [categories, colorScheme, selected])

  const font = useFont(require('@assets/fonts/OpenSans-Bold.ttf'), 30)
  const smallFont = useFont(require('@assets/fonts/OpenSans-Regular.ttf'), 18)
  const labelFont = useFont(require('@assets/fonts/OpenSans-Regular.ttf'), 14)

  if (!font || !smallFont || !labelFont) {
    return <View />
  }

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc.1')}
          i18nKey="DonutChartScreen.desc.1"
          components={{bold1: <Text className="font-medium text-foreground" />}}
          parent={Text}
          className="text-muted-foreground"
        />
        <Trans
          // {t('desc.2')}
          i18nKey="DonutChartScreen.desc.2"
          components={{bold1: <Text className="font-medium text-foreground" />}}
          parent={Text}
          className="text-muted-foreground"
        />
        <View className="h-px bg-border" />
        <View className="flex flex-col gap-1">
          <Text className="text-muted-foreground">{t('features.1')}</Text>
          <Text className="text-muted-foreground">{t('features.2')}</Text>
          <Text className="text-muted-foreground">{t('features.3')}</Text>
          <Text className="text-muted-foreground">{t('features.4')}</Text>
        </View>
      </View>
      <View
        className="justify-center content-center"
        style={{
          width: RADIUS * 2 + 20 * 2,
          height: RADIUS * 2 + 20 * 2,
        }}
      >
        <DonutChart
          data={_data}
          categories={categories}
          centerText={{
            primary: selectedCategory?.category?.title ?? '',
            secondary: selectedCategory?.amount ?? 0,
          }}
          font={font}
          smallFont={smallFont}
          labelFont={labelFont}
          total={1000}
          selected={selected}
          currency="USD"
        />
      </View>
    </ScrollView>
  )
}

const categories: TCategoryStatistics[] = [
  {
    categoryId: '1',
    percentage: 35,
    amount: 350,
    category: {
      title: 'Food',
      color: 'red',
    },
  },
  {
    categoryId: '2',
    percentage: 25,
    amount: 250,
    category: {
      title: 'Transport',
      color: 'blue',
    },
  },
  {
    categoryId: '3',
    percentage: 20,
    amount: 200,
    category: {
      title: 'Entertainment',
      color: 'green',
    },
  },
  {
    categoryId: '4',
    percentage: 20,
    amount: 200,
    category: {
      title: 'Health',
      color: 'yellow',
    },
  },
]

// TYPES

type TCategoryStatistics = {
  categoryId: string
  category: TCategory
  amount: number
  percentage: number
}

interface TCategory {
  title: string
  color: TColor
}
