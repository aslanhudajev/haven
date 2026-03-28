import {toast} from '@backpackapp-io/react-native-toast'
import {IconExclamationCircle} from '@tabler/icons-react-native'
import {Alert, View} from 'react-native'
import {useHandleLogout} from '@features/logout'
import {deleteUser} from '@entities/user'
import {useTranslation} from '@shared/i18n'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'
import {ScreenContent} from '@shared/ui-primitives/ScreenContent'

export default function RemoveAccountScreen() {
  const {t} = useTranslation('RemoveAccountScreen')
  const {handleLogout} = useHandleLogout()

  const handleDeleteAccount = () => {
    Alert.alert('', t('areYouSure'), [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser()
            toast.success(t('success'))
            await handleLogout()
          } catch (error) {
            toast.error(String(error))
          }
        },
      },
    ])
  }

  return (
    <ScreenContent excludeEdges={['top', 'bottom']}>
      <View className="px-3 py-3 h-full justify-center">
        <View className="flex-1 items-center justify-center gap-6 mb-16">
          <IconExclamationCircle className="text-red-500 h-32 w-32" />
          <View className="gap-3">
            <Text className="text-2xl text-center">{t('warningTitle')}</Text>
            <Text className="text-lg text-center text-muted-foreground">{t('warningText')}</Text>
          </View>
        </View>
        <Button variant="destructive" className="mb-16" onPress={handleDeleteAccount}>
          <Text>{t('btnRemoveAccount')}</Text>
        </Button>
      </View>
    </ScreenContent>
  )
}
