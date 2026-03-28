import {
  IconAdjustments,
  IconBrandDatabricks,
  IconCropLandscape,
  IconHome,
} from '@tabler/icons-react-native'
import {Pressable, type PressableProps, View} from 'react-native'
import {Platform} from 'react-native'
import Animated from 'react-native-reanimated'
import {useTranslation} from '@shared/i18n'
import {cn} from '@shared/lib/utils'
import {Text} from '@shared/ui/text'
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs'
import type {IconProps} from '@tabler/icons-react-native'
import type {ComponentType} from 'react'

export function TabBottom({state, descriptors, navigation}: BottomTabBarProps) {
  return (
    <View
      className={cn(
        'w-full flex-row items-center justify-center gap-3 self-center border-t border-border bg-background',
        Platform.select({ios: 'pb-9', android: 'pb-4'})
      )}
    >
      <View className="flex-row items-center gap-5">
        {state.routes.map((route, index) => {
          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (state.index !== index && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }

          function onLongPress() {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            })
          }

          return (
            <TabBarItem
              key={route.key}
              icon={TAB_BAR_ICONS[route.name as keyof typeof TAB_BAR_ICONS]}
              name={route.name}
              focused={state.index === index}
              descriptor={descriptors[route.key]}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          )
        })}
      </View>
    </View>
  )
}

// PARTS

const TAB_BAR_ICONS = {
  index: IconHome,
  empty: IconCropLandscape,
  components: IconBrandDatabricks,
  settings: IconAdjustments,
}

function TabBarItem({
  icon: Icon,
  name,
  focused,
  descriptor,
  ...props
}: TabBarItemProps & PressableProps) {
  const {t} = useTranslation('TabBottom[Item]')
  const {options} = descriptor
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={focused ? {selected: true} : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      className={'h-14 w-16 items-center justify-center gap-1 pt-4'}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      {...props}
    >
      {focused && <Animated.View className="absolute top-0 h-[2px] w-full rounded-xl bg-primary" />}
      <Icon className={cn('size-8', focused ? 'text-primary' : 'text-muted-foreground/60')} />
      <Text
        className={cn('font-medium text-xs', focused ? 'text-primary' : 'text-muted-foreground/60')}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {t(name)}
      </Text>
    </Pressable>
  )
}

// TYPES

type TabBarItemProps = {
  focused: boolean
  icon: TablerIcon
  name: string
  descriptor: BottomTabBarProps['descriptors'][string]
}

type TablerIcon = ComponentType<IconProps>

// TRANSLATIONS

// t('index')
// t('components')
// t('settings')
