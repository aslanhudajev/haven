import {useTranslation as useI18NextTranslation} from 'react-i18next'

export const useTranslation = (group: string) => {
  const {t, i18n} = useI18NextTranslation(undefined, {keyPrefix: group})
  const hasTranslation = (key: string) => i18n.exists(`${group}.${key}`)

  return {t, hasTranslation}
}
