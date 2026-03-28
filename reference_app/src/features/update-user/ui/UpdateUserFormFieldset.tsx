import {IconBrandGoogle} from '@tabler/icons-react-native'
import {Controller, useFormContext} from 'react-hook-form'
import {View} from 'react-native'
import {UserAvatarPicker} from '@entities/user'
import {useTranslation} from '@shared/i18n'
import {Button} from '@shared/ui/button'
import {InputField} from '@shared/ui-primitives/FinalFormKit'

export const UpdateUserFormFieldset = () => {
  const {t} = useTranslation('UpdateUserFormFieldset')
  const {control} = useFormContext<UpdateUserFormData>()

  return (
    <>
      <Controller
        control={control}
        name="photoURL"
        render={({field: {value}}) => {
          return (
            <View className="items-center">
              <UserAvatarPicker imageUrl={value} className="h-36 w-36" />
            </View>
          )
        }}
      />
      <InputField
        name="name"
        label={t('name.label')}
        placeholder={t('name.placeholder')}
        autoCapitalize="words"
      />
      <InputField
        name="email"
        label={t('email.label')}
        placeholder={t('email.placeholder')}
        autoCapitalize="words"
        disabled
        className="!pl-[62px]"
        leftSection={
          <Button
            variant="ghost"
            className="!border-r !h-11 !py-0 !px-0 !w-16 rounded-r-none border-input"
          >
            <IconBrandGoogle className="size-5 text-foreground" />
          </Button>
        }
      />
    </>
  )
}

export interface UpdateUserFormData {
  photoURL: string
  name: string
  email: string
}
