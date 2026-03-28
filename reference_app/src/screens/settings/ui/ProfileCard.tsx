import {IconChevronRight, IconCrown} from '@tabler/icons-react-native'
import {useRouter} from 'expo-router'
import {Pressable, View} from 'react-native'
import {useUserEntitlements} from '@entities/subscription'
import {UserAvatar, useUserStore} from '@entities/user'
import {Badge} from '@shared/ui/badge'
import {Text} from '@shared/ui/text'

export function ProfileCard() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const {isPro} = useUserEntitlements()

  return (
    <Pressable
      className="flex flex-row items-center justify-between gap-4 px-3 py-2 active:bg-muted-foreground/20"
      onPress={() => router.push('/profile')}
    >
      <UserAvatar fallbackClassName="bg-background" className="h-16 w-16" />
      <View className="flex-1 justify-center gap-1.5">
        <Text className="line-clamp-1 font-semiBold">{user?.full_name ?? user?.email}</Text>
        <Badge variant="default" className="flex-row gap-1 self-start rounded-md">
          {isPro && <IconCrown className="size-4 text-primary-foreground" />}
          <Text className="font-medium text-sm">{isPro ? 'Pro' : 'Free'}</Text>
        </Badge>
      </View>
      <IconChevronRight className="h-6 w-6 text-foreground" />
    </Pressable>
  )
}
