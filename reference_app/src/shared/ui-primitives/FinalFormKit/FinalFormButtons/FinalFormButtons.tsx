import {useFormState, useFormContext} from 'react-hook-form'
import {ActivityIndicator, View} from 'react-native'
import type {ButtonProps} from '@shared/ui/button'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'
import type {ReactElement, ReactNode} from 'react'

export const FinalFormButtons: T = ({children, submitText, ...props}) => {
  const {isLoading, isSubmitting, disabled, isValid, isDirty} = useFormState()
  const {handleSubmit} = useFormContext()

  return (
    <View className="gap-3">
      <Button
        onPress={(event) => {
          handleSubmit(
            () => {
              // noop
            },
            (errors) => {
              console.log('Some fields are invalid', errors)
              //enqueueSnackbar('Some fields are invalid', {variant: 'error'})
            }
          )(event)
        }}
        disabled={disabled || !isValid || isLoading || isSubmitting || !isDirty}
        {...props}
      >
        {(isLoading || isSubmitting) && <ActivityIndicator size="small" />}
        <Text>{submitText}</Text>
      </Button>
      {children}
    </View>
  )
}

// TYPES

type T = (props: TProps) => ReactElement
type TProps = ButtonProps & {
  children?: ReactNode
  submitText?: string
}

export type {TProps as TFinalFormButtonsProps}
