import {useCallback} from 'react'
import {getDatesDiffInDays} from '../dates/getDatesDiffInDays'

export const useRelativeTimeFormatter: TUseRelativeTimeFormatter = () => {
  const locale = 'en-GB'

  return useCallback(
    (date) => {
      const daysDifference = getDatesDiffInDays(Date.now(), date)

      return new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
      }).format(daysDifference, 'day')
    },
    [locale]
  )
}

// TYPES

type TUseRelativeTimeFormatter = () => TFormatRelativeTime
type TFormatRelativeTime = (date: string | number | Date) => string
