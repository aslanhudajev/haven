import {useCallback} from 'react'
import {currencyCodes} from '../../config/currencies'
import {useLocale} from '../../i18n'

export const useMoneyFormatter: TUseNumberFormatter = () => {
  const {language: locale} = useLocale()

  return useCallback(
    (number, currency?, options?) => {
      const {
        minimumFractionDigits = 0,
        maximumFractionDigits = 0,
        notation = 'standard',
        maximumSignificantDigits,
      } = options ?? {}
      if (currency && currencyCodes.includes(currency)) {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: minimumFractionDigits,
          maximumFractionDigits: maximumFractionDigits,
          notation: notation,
          maximumSignificantDigits: maximumSignificantDigits,
        }).format(number)
      }

      return (
        currency +
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(number)
      )
    },
    [locale]
  )
}

// TYPES

type TUseNumberFormatter = () => TFormatNumber
type TFormatNumber = (number: number, currency?: string, options?: TOptions) => string
type TOptions = {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact' | undefined
  maximumSignificantDigits?: number | undefined
}
