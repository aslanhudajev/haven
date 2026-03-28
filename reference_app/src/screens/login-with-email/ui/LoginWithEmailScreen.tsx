import {toast} from '@backpackapp-io/react-native-toast'
import {useState} from 'react'
import {Image, Keyboard, ScrollView, View} from 'react-native'
import {loginByEmail, requestOtp} from '@entities/auth'
import {useTranslation} from '@shared/i18n'
import {Text} from '@shared/ui/text'
import {
  FinalForm,
  FinalFormButtons,
  FinalFormFields,
  FinalFormProvider,
  InputField,
  useFinalForm,
} from '@shared/ui-primitives/FinalFormKit'
import {ScreenContent} from '@shared/ui-primitives/ScreenContent'
import {loginWithEmailFormSchema, verifyEmailFormSchema} from './LoginWithEmailForm.schema'

export default function LoginWithEmailScreen() {
  const {t} = useTranslation('LoginWithEmailScreen')
  const [mode, setMode] = useState<'signUp' | 'signIn'>('signUp')
  const [verifying, setVerifying] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const authForm = useFinalForm({
    schema: loginWithEmailFormSchema,
    defaultValues: {
      email: '',
    },
    shouldResetAfterSubmit: false,
    async onSubmit(values) {
      try {
        Keyboard.dismiss()
        const {error} = await requestOtp(values.email)
        if (error) {
          toast.error(t('errorOTP', {message: `${error.message}`}))
        } else {
          setUserEmail(values.email)
          setMode('signIn') // FIXME
          setVerifying(true)
        }
      } catch (error) {
        toast.error(t('error', {message: `${error}`}))
      }
    },
  })

  const verifyForm = useFinalForm({
    schema: verifyEmailFormSchema,
    defaultValues: {
      code: '',
    },
    async onSubmit(values) {
      try {
        Keyboard.dismiss()
        await loginByEmail({
          email: userEmail,
          code: values.code,
        })
      } catch (error) {
        toast.error(t('error', {message: `${error}`}))
      }
    },
  })

  return (
    <ScreenContent excludeEdges={['top', 'bottom']}>
      <ScrollView
        className="px-6 py-3"
        contentContainerClassName="flex-1"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center justify-center mb-12 gap-6">
          <Image
            source={require('@assets/images/icon.png')}
            alt="logo"
            style={{width: 90, height: 90}}
            className="rounded-xl border-2 border-stone-800"
          />
          <View className="items-center">
            <Text className="text-3xl font-medium text-foreground text-center">{t(`title`)}</Text>
            <Text className="font-medium text-muted-foreground">{t(`subTitle`)}</Text>
          </View>
        </View>
        <FinalFormProvider {...authForm}>
          <FinalForm>
            <FinalFormFields>
              <InputField
                name="email"
                label={t(`email`)}
                placeholder={t(`descEmail`)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </FinalFormFields>
            {!verifying && <FinalFormButtons submitText={t('btnContinue')} />}
          </FinalForm>
        </FinalFormProvider>
        {verifying && (
          <FinalFormProvider {...verifyForm}>
            <View className="mt-3 gap-4">
              <InputField
                name="code"
                label={t(`verificationCode`)}
                placeholder={t(`enterCode`)}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoFocus
                // onEndEditing={verifyEmailForm.handleSubmit(onVerify)}
              />
              <FinalFormButtons submitText={mode === 'signUp' ? t(`signUp`) : t(`signIn`)} />
            </View>
          </FinalFormProvider>
        )}
      </ScrollView>
    </ScreenContent>
  )
}
