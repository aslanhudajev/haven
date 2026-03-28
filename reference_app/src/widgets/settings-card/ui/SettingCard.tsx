import {Pressable, View} from 'react-native'
import {cn} from '@shared/lib/utils'
import {Text} from '@shared/ui/text'
import type {IconProps} from '@tabler/icons-react-native'
import type {ComponentType, ReactNode} from 'react'

export const SettingCard = ({
  title,
  description,
  icon: Icon,
  rightSection,
  onPress,
  disabled = false,
  className,
  iconClassName,
  titleClassName,
  descClassName,
}: SettingCardProps) => {
  return (
    <Pressable
      className={cn(
        'flex flex-row items-center justify-between gap-1 px-3 py-2 active:bg-muted-foreground/10',
        disabled && 'opacity-50',
        className
      )}
      onPress={onPress}
      disabled={disabled}
    >
      <View className="flex flex-row gap-3 items-center">
        {Icon && (
          <View className="flex items-center justify-center rounded-lg h-10 w-10">
            <Icon className={cn('size-7 text-foreground', iconClassName)} />
          </View>
        )}
        <View className="flex justify-center">
          <Text className={cn('text-lg font-medium -mt-1', titleClassName)}>{title}</Text>
          {description && (
            <Text className={cn('text-muted-foreground text-xs -mt-0.5', descClassName)}>
              {description}
            </Text>
          )}
        </View>
      </View>
      {rightSection}
    </Pressable>
  )
}

// TYPES

interface SettingCardProps {
  title: string
  icon?: ComponentType<IconProps>
  rightSection?: ReactNode
  description?: string
  onPress?(): void
  disabled?: boolean
  className?: string
  iconClassName?: string
  titleClassName?: string
  descClassName?: string
}
