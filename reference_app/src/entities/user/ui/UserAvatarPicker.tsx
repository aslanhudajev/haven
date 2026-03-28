import {BottomSheetView} from '@gorhom/bottom-sheet'
import {IconChevronRight, IconTrash, IconCameraPlus, IconPencil} from '@tabler/icons-react-native'
import {useCallback, useRef, useState} from 'react'
import * as React from 'react'
import {ActivityIndicator, Alert, Pressable, TouchableOpacity, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useTranslation} from '@shared/i18n'
import {useColorPalette} from '@shared/lib/palette'
import {cn} from '@shared/lib/utils'
import {Avatar, AvatarImage, AvatarFallback} from '@shared/ui/avatar'
import {Text} from '@shared/ui/text'
import {BottomSheet} from '@shared/ui-primitives/Sheet'
import {removeAvatar} from '../libs/removeAvatar'
import {uploadAvatar} from '../libs/uploadAvatar'
import {useUserStore} from '../model/user-store'
import type {BottomSheetModal} from '@gorhom/bottom-sheet'

export const UserAvatarPicker = ({
  imageUrl,
  className,
  fallbackClassName,
  fallbackLabelClassName,
}: UserAvatarProps) => {
  const {t} = useTranslation('UserAvatarPicker')
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const {bottom} = useSafeAreaInsets()
  const {getColor} = useColorPalette()
  const user = useUserStore((state) => state.user)
  const updateUser = useUserStore((state) => state.updateUser)
  const shortName = user?.full_name?.split(' ')[0].slice(0, 2)
  const [loading, setLoading] = useState<boolean>(false)

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handleImageUpload = async () => {
    bottomSheetModalRef.current?.close()
    try {
      setLoading(true)
      const imagePath = await uploadAvatar(user!.id)
      if (!imagePath) {
        setLoading(false)
        return
      }
      await updateUser(user!.id, {avatar_url: imagePath})
      setLoading(false)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLoading(false)
      Alert.alert(t('avatar.upload.error'))
    }
  }

  const handleImageRemove = async () => {
    bottomSheetModalRef.current?.close()
    try {
      setLoading(true)
      await removeAvatar(user!.id)
      await updateUser(user!.id, {avatar_url: null})
      setLoading(false)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLoading(false)
      Alert.alert(t('avatar.remove.error'))
    }
  }

  return (
    <>
      <TouchableOpacity onPress={handlePresentModalPress} activeOpacity={0.7} disabled={loading}>
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
            <Text
              className={cn(
                'font-semiBold uppercase leading-tight text-4xl',
                fallbackLabelClassName
              )}
            >
              {shortName ?? 'US'}
            </Text>
          </AvatarFallback>
        </Avatar>
        <View className="absolute right-2 bottom-2 bg-gray-300 dark:bg-gray-500 rounded-full p-1">
          <IconPencil size={16} color={getColor('--secondary-foreground')} />
        </View>
        {loading && (
          <View
            className={cn(
              'absolute h-12 w-12 items-center justify-center rounded-full bg-muted/70',
              className
            )}
          >
            <ActivityIndicator size="large" />
          </View>
        )}
      </TouchableOpacity>
      <BottomSheet ref={bottomSheetModalRef} index={0} enableDynamicSizing>
        <BottomSheetView
          style={{
            paddingBottom: bottom + 20,
          }}
        >
          <Text className="px-6 mb-5 text-foreground text-xl">{t('title')}</Text>
          <Pressable
            onPress={handleImageUpload}
            className="flex h-14 flex-row items-center justify-between gap-4 px-6 active:bg-muted"
          >
            <View className="flex flex-row items-center gap-6">
              <View className="flex items-center justify-center rounded-lg h-10 w-10 bg-green-200 dark:bg-green-700">
                <IconCameraPlus className="h-7 w-7 text-foreground" />
              </View>
              <Text className="text-lg">{t('addAvatar')}</Text>
            </View>
            <IconChevronRight className="size-6 text-foreground" />
          </Pressable>
          <Pressable
            onPress={handleImageRemove}
            className="flex h-14 flex-row items-center justify-between gap-4 px-6 active:bg-muted"
          >
            <View className="flex flex-row items-center gap-6">
              <View className="flex items-center justify-center rounded-lg h-10 w-10 bg-rose-200 dark:bg-rose-700">
                <IconTrash className="h-7 w-7 text-foreground" />
              </View>
              <Text className="text-lg text-red-500">{t('removeAvatar')}</Text>
            </View>
            <IconChevronRight className="size-6 text-foreground" />
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </>
  )
}

// TYPES

type UserAvatarProps = {
  imageUrl?: string
  className?: string
  fallbackClassName?: string
  fallbackLabelClassName?: string
}
