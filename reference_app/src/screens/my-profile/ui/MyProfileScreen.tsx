import {toast} from '@backpackapp-io/react-native-toast'
import {type BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet'
import {IconChevronRight, IconDots, IconLogout, IconTrash} from '@tabler/icons-react-native'
import {useRouter} from 'expo-router'
import {useCallback, useRef} from 'react'
import {Alert, Keyboard, Pressable, ScrollView, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {SettingCardGroup} from '@widgets/settings-card'
import {useHandleLogout} from '@features/logout'
import {UpdateUserFormFieldset, updateUserFormSchema} from '@features/update-user'
import {useUserStore} from '@entities/user'
import {useTranslation} from '@shared/i18n'
import {cn} from '@shared/lib/utils'
import {Button} from '@shared/ui/button'
import {Separator} from '@shared/ui/separator'
import {Text} from '@shared/ui/text'
import {
  FinalForm,
  FinalFormButtons,
  FinalFormFields,
  FinalFormProvider,
  useFinalForm,
} from '@shared/ui-primitives/FinalFormKit'
import {ScreenContent} from '@shared/ui-primitives/ScreenContent'
import {BottomSheet} from '@shared/ui-primitives/Sheet'

export default function MyProfileScreen() {
  const {t} = useTranslation('MyProfileScreen')
  const {handleLogout} = useHandleLogout()
  const user = useUserStore((state) => state.user)
  const updateUser = useUserStore((state) => state.updateUser)

  const {avatar_url, full_name, email} = user ?? {}
  const sheetRef = useRef<BottomSheetModal>(null)
  const {bottom} = useSafeAreaInsets()
  const router = useRouter()

  const form = useFinalForm({
    schema: updateUserFormSchema,
    defaultValues: {
      photoURL: avatar_url ?? null,
      name: full_name ?? undefined,
      email: email ?? undefined,
    },
    async onSubmit(values) {
      try {
        Keyboard.dismiss()
        await updateUser(user!.id, {
          full_name: values.name,
        })
        toast.success(t('success'))
      } catch (error) {
        toast.error(t('error', {message: `${error}`}))
      }
    },
  })

  const renderHeaderRight = useCallback(() => {
    return (
      <Button
        size="icon"
        variant="ghost"
        onPress={() => {
          Keyboard.dismiss()
          sheetRef.current?.present()
        }}
      >
        <IconDots className="size-6 text-foreground" />
      </Button>
    )
  }, [])

  return (
    <ScreenContent
      excludeEdges={['top', 'bottom']}
      navigationOptions={{
        headerRight: renderHeaderRight,
      }}
    >
      <ScrollView
        className="px-6 py-3"
        contentContainerClassName="flex-1"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <FinalFormProvider {...form}>
          <FinalForm>
            <FinalFormFields>
              <UpdateUserFormFieldset />
            </FinalFormFields>
            <FinalFormButtons submitText={t('btnSave')} />
          </FinalForm>
        </FinalFormProvider>
        <Separator className="mt-10" />
        <View className="flex-1 justify-end mb-12">
          <SettingCardGroup>
            <Pressable
              className="flex flex-row items-center gap-2 px-3 py-2 active:bg-muted-foreground/20"
              onPress={() => {
                Alert.alert(t('areYouSure'), '', [
                  {
                    text: t('cancel'),
                    style: 'cancel',
                  },
                  {
                    text: t('signOut'),
                    style: 'destructive',
                    onPress: async () => {
                      await handleLogout()
                    },
                  },
                ])
              }}
            >
              <View className={cn('flex items-center justify-center rounded-lg h-10 w-10')}>
                <IconLogout className="text-red-500" />
              </View>
              <Text className="text-lg text-red-500 ">{t('signOut')}</Text>
            </Pressable>
          </SettingCardGroup>
        </View>
      </ScrollView>
      <BottomSheet ref={sheetRef} index={0} enableDynamicSizing>
        <BottomSheetView
          style={{
            paddingBottom: bottom,
          }}
        >
          <Pressable
            onPress={() => {
              router.push('/profile-remove')
              sheetRef.current?.close()
            }}
            className="flex h-14 flex-row items-center justify-between gap-4 px-6 active:bg-muted"
          >
            <View className="flex flex-row items-center gap-6">
              <View className="flex items-center justify-center rounded-lg h-10 w-10 bg-rose-200 dark:bg-rose-700">
                <IconTrash className="h-7 w-7 text-foreground" />
              </View>
              <Text className="text-lg text-red-500">{t('removeAccount')}</Text>
            </View>
            <IconChevronRight className="size-6 text-foreground" />
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </ScreenContent>
  )
}
