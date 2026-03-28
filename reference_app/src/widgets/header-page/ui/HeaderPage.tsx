import {useRouter} from 'expo-router'
import {TouchableOpacity, View} from 'react-native'
import {UserAvatar, useUserStore} from '@entities/user'
import {useTranslation} from '@shared/i18n'
import LoadingTypography from '@shared/ui-primitives/LoadingTypography'

export const HeaderPage = () => {
  const {t} = useTranslation('HeaderPage')
  const router = useRouter()

  const user = useUserStore((state) => state.user)

  return (
    <TouchableOpacity
      className="flex-row items-center gap-3"
      activeOpacity={0.8}
      onPress={() => router.push('/profile')}
    >
      <UserAvatar />
      <View className="flex-col gap-1">
        <LoadingTypography
          loading={!user}
          className="text-muted-foreground "
          classes={{skeleton: 'w-[60px]'}}
        >
          {t('hello')}
        </LoadingTypography>
        <LoadingTypography
          loading={!user}
          className="font-medium"
          classes={{skeleton: 'w-[100px]'}}
        >
          {user?.full_name}
        </LoadingTypography>
      </View>
    </TouchableOpacity>
  )
}
