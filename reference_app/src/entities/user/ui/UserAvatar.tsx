import {memo} from 'react'
import {cn} from '@shared/lib/utils'
import {Avatar, AvatarImage, AvatarFallback} from '@shared/ui/avatar'
import {Text} from '@shared/ui/text'
import {useUserStore} from '../model/user-store'

export const UserAvatar = memo(function UserAvatar({
  imageUrl,
  className,
  fallbackClassName,
  fallbackLabelClassName,
}: UserAvatarProps) {
  const user = useUserStore((state) => state.user)
  const shortName = user?.full_name?.split(' ')[0].slice(0, 2)

  return (
    <Avatar
      alt={`${user?.full_name}'s avatar`}
      className={cn('h-12 w-12 border border-border bg-muted', className)}
    >
      <AvatarImage
        source={{
          uri: imageUrl ?? user?.avatar_url ?? undefined,
        }}
      />
      <AvatarFallback className={fallbackClassName}>
        <Text className={cn('font-semiBold uppercase leading-tight', fallbackLabelClassName)}>
          {shortName ?? 'US'}
        </Text>
      </AvatarFallback>
    </Avatar>
  )
})

// TYPES

type UserAvatarProps = {
  imageUrl?: string
  className?: string
  fallbackClassName?: string
  fallbackLabelClassName?: string
}
