import {forwardRef} from 'react'
import {Image, Pressable, View} from 'react-native'
import {cn} from '@shared/lib/utils'
import {Text} from '../../../ui/text'
import type {SvgProps} from 'react-native-svg'

const MenuItem = forwardRef(function MenuItem(
  {label, icon: Icon, image, rightSection, onPress, className, disabled}: MenuItemProps,
  ref: React.ForwardedRef<React.ElementRef<typeof Pressable>>
) {
  return (
    <Pressable
      onPress={onPress}
      ref={ref}
      disabled={disabled}
      className={cn(
        'flex h-14 flex-row items-center justify-between gap-4 px-6 active:bg-muted',
        disabled && 'opacity-50',
        className
      )}
    >
      <View className="flex flex-row items-center gap-6">
        {Icon && <Icon className="h-5 w-5 text-foreground" />}
        {image && <Image source={{uri: image}} className="h-5 w-7 text-foreground" alt="item" />}
        <Text>{label}</Text>
      </View>
      {rightSection}
    </Pressable>
  )
})

export default MenuItem

// TYPES

type MenuItemProps = {
  label: string
  icon?: React.ComponentType<SvgProps>
  image?: string | undefined
  rightSection?: React.ReactNode
  onPress?: () => void
  className?: string
  disabled?: boolean
}
