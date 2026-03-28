import {forwardRef} from 'react'
import {useController} from 'react-hook-form'
import {Text, type TextInput, type TextInputProps, View} from 'react-native'
import {cn} from '@shared/lib/utils'
import {Label} from '@shared/ui/label'
import {Textarea} from '@shared/ui/textarea'
import type {RefObject, ReactNode} from 'react'

export const TextareaField = forwardRef(function TextareaField(
  {
    name,
    label,
    leftSection,
    rightSection,
    className,
    wrapperClassName,
    disabled,
    ...props
  }: InputFieldProps,
  ref: React.Ref<TextInput>
) {
  const {
    field: {onChange, onBlur, value},
    fieldState,
  } = useController({name})

  const refObject =
    typeof ref === 'object' && ref !== null ? (ref as RefObject<TextInput>) : undefined

  return (
    <View className={cn('gap-1', wrapperClassName)}>
      {!!label && <Label nativeID={`label-${name}`}>{label}</Label>}
      <View>
        {leftSection && <View className="absolute top-0 z-10">{leftSection}</View>}
        <Textarea
          ref={refObject}
          onChangeText={onChange}
          onBlur={onBlur}
          value={value?.toString()}
          className={cn(
            className,
            leftSection && 'pl-10',
            rightSection && 'pr-10',
            value?.toString() && 'border-stone-600'
          )}
          editable={!disabled}
          {...props}
        />
        {rightSection && <View className="absolute top-0 right-2">{rightSection}</View>}
      </View>
      {!!fieldState.error && (
        <Text className="font-regular text-destructive">{fieldState.error.message}</Text>
      )}
    </View>
  )
})

// TYPES

type InputFieldProps = TextInputProps & {
  name: string
  label?: string
  leftSection?: ReactNode
  rightSection?: ReactNode
  disabled?: boolean
  wrapperClassName?: string
}
