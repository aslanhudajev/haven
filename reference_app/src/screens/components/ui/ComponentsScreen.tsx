import {useScrollToTop} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import {IconChevronRight} from '@tabler/icons-react-native'
import {Link} from 'expo-router'
import {useRef, useState} from 'react'
import {View} from 'react-native'
import {cn} from '@shared/lib/utils'
import {Button} from '@shared/ui/button'
import {Input} from '@shared/ui/input'
import {Text} from '@shared/ui/text'
import {ScreenContent} from '@shared/ui-primitives/ScreenContent'
import type {Route} from 'expo-router'

export default function ComponentsScreen() {
  const [search, setSearch] = useState('')
  const ref = useRef(null)
  useScrollToTop(ref)

  const data = !search
    ? COMPONENTS
    : COMPONENTS.filter((item) => item.toLowerCase().includes(search.toLowerCase()))

  return (
    <ScreenContent excludeEdges={['top', 'bottom']} backgroundColor="bg-background">
      <View className="flex-1 px-4">
        <View className="py-4">
          <Input
            placeholder="Search UI..."
            clearButtonMode="always"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlashList
          ref={ref}
          data={data}
          className="native:overflow-hidden rounded-t-lg"
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) => (
            <Link href={`/components/${item}` as unknown as Route} asChild>
              <Button
                variant="secondary"
                size="lg"
                className={cn(
                  'bg-secondary/40 pl-4 pr-1.5 border-x border-t border-foreground/5 rounded-none flex-row justify-between',
                  index === 0 && 'rounded-t-lg',
                  index === data.length - 1 && 'border-b rounded-b-lg'
                )}
              >
                <Text className="text-xl">{toOptions(item)}</Text>
                <IconChevronRight className="text-foreground/50" />
              </Button>
            </Link>
          )}
          ListFooterComponent={<View className="py-4" />}
        />
      </View>
    </ScreenContent>
  )
}

function toOptions(name: string) {
  return name
    .split('-')
    .map(function (str: string) {
      return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase()
      })
    })
    .join(' ')
}

export const COMPONENTS = [
  'animated-number',
  'text-ticker',
  'sheet',
  'color-picker',
  'time-range-control',
  'month-selector',
  'date-picker',
  'month-year-picker',
  'relative-time-formatter',
  'date-formatter',
  'money-formatter',
  'donut-chart',
  'confirmation-dialog',
  'toast',
  'numeric-pad',
]
