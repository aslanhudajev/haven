import {toast} from '@backpackapp-io/react-native-toast'
import {zodResolver} from '@hookform/resolvers/zod'
import {dequal} from 'dequal'
import {useEffect} from 'react'
import {
  useForm,
  type UseFormProps,
  type UseFormReturn,
  type SubmitHandler,
  type SubmitErrorHandler,
  type DefaultValues,
} from 'react-hook-form'
import {useChanged} from '@shared/lib/state'
import type {z} from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodType = z.ZodType<any, any, any>

interface UseFinalFormProps<TSchema extends AnyZodType, TContext = unknown>
  extends Omit<UseFormProps<z.input<TSchema>, TContext, z.output<TSchema>>, 'resolver'> {
  schema: TSchema
  defaultValues?: DefaultValues<z.input<TSchema>>
  isLoading?: boolean
  onSuccess?: () => void
  onError?: (error: unknown) => void
  onSubmit?: (payload: z.output<TSchema>) => Promise<unknown> | void
  shouldResetAfterSubmit?: boolean
}

export interface UseFinalFormReturn<TSchema extends AnyZodType, TContext = unknown>
  extends UseFormReturn<z.input<TSchema>, TContext, z.output<TSchema>> {
  isLoading: boolean
}

export function useFinalForm<TSchema extends AnyZodType, TContext = unknown>({
  schema,
  isLoading = false,
  values,
  defaultValues,
  onSubmit,
  onError,
  onSuccess,
  shouldResetAfterSubmit = true,
  ...props
}: UseFinalFormProps<TSchema, TContext>): UseFinalFormReturn<TSchema, TContext> {
  const defaultValuesMemoized = useChanged(defaultValues, dequal)

  const form = useForm<z.input<TSchema>, TContext, z.output<TSchema>>({
    mode: 'all',
    resetOptions: {
      keepDirtyValues: true,
      keepErrors: true,
      ...props.resetOptions,
    },
    shouldFocusError: true,
    values: values,
    defaultValues: defaultValues,
    ...props,
    resolver: zodResolver(schema),
  })

  const {
    handleSubmit: handleSubmitNative,
    reset,
    formState,
    formState: {submitCount},
  } = form

  useEffect(() => {
    if (defaultValuesMemoized) {
      reset(defaultValuesMemoized, {
        // Reset default values but keep dirty
        keepErrors: true,
        keepDirty: true,
        keepTouched: true,
        keepIsValid: true,
        keepIsSubmitted: true,
        keepIsSubmitSuccessful: true,
        keepSubmitCount: true,
        keepValues: false,
        keepDirtyValues: true,
        keepDefaultValues: false,
      })
    }
  }, [defaultValuesMemoized])

  // It's recommended to reset inside useEffect after submission (https://react-hook-form.com/api/useform/reset/).
  useEffect(() => {
    if (submitCount && shouldResetAfterSubmit) {
      const {isSubmitSuccessful} = formState
      if (isSubmitSuccessful) {
        // Reset all
        reset(undefined, {
          keepErrors: false,
          keepDirty: false,
          keepTouched: false,
          keepIsValid: false,
          keepIsSubmitted: false,
          keepIsSubmitSuccessful: false,
          keepSubmitCount: false,
          keepValues: false,
          keepDirtyValues: false,
          keepDefaultValues: false,
        })
      }
    }
  }, [submitCount, shouldResetAfterSubmit])

  const handleSubmit = (
    onValid: SubmitHandler<z.output<TSchema>>,
    onInvalid?: SubmitErrorHandler<z.input<TSchema>>
  ) =>
    handleSubmitNative(async (data) => {
      try {
        await onSubmit?.(data)

        if (onSuccess) {
          onSuccess()
        } else {
          /*enqueueSnackbar('Operation completed successfully', {
            variant: 'success',
          })*/
        }

        onValid(data)
      } catch (error) {
        if (onError) {
          onError(error)
        } else {
          toast.error('Some fields are invalid')
        }
      }
    }, onInvalid)

  return {
    ...form,
    isLoading,
    handleSubmit,
  }
}
