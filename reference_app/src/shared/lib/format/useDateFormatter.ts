import {useCallback} from 'react'

export const useDateFormatter: TUseDateFormatter = () => {
  const locale = 'en-GB'

  return useCallback(
    (date, options = {}) => {
      const {variant = 'variant1', timeZone, skipTime = false} = options

      if (variant === 'variant1') {
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: skipTime ? undefined : 'numeric',
          minute: skipTime ? undefined : 'numeric',
          second: skipTime ? undefined : 'numeric',
          timeZone,
        }).format(new Date(date))
      } else {
        return new Intl.DateTimeFormat(locale, {
          hour: 'numeric',
          minute: 'numeric',
        }).format(new Date(date))
      }
    },
    [locale]
  )
}

// TYPES

type TUseDateFormatter = () => TFormatDate
type TFormatDate = (date: string | number | Date, options?: TFormatDateOptions) => string
type TFormatDateOptions = {
  variant?: 'variant1' | 'variant2'
  timeZone?: string
  skipTime?: boolean
}
