import {getLocales, useLocales} from 'expo-localization'
import {createContext, useLayoutEffect, useEffect, useState, useContext} from 'react'
import {
  constantStorage,
  STORAGE_CONSTANT_PREFERRED_LANGUAGE,
} from '@shared/storage/contstant-storage'
import i18n from './i18n'
import {LanguageList} from './model/localize'
import type {LanguageType} from './model/localize'
import type {FC, ReactNode} from 'react'

const deviceLanguage = getLocales()[0]?.languageCode ?? LanguageList.EN
const defaultLanguage = ['en', 'ru', 'es', 'de', 'pt', 'fr'].includes(deviceLanguage)
  ? (deviceLanguage as LanguageType)
  : LanguageList.EN

export const LanguageProvider: FC<LanguageProviderProps> = ({children}) => {
  const [language, setLanguage] = useState<LanguageType>(defaultLanguage)
  const locales = useLocales()
  const locale = locales[0]

  useLayoutEffect(() => {
    const persistedLanguage = constantStorage.getItem(
      STORAGE_CONSTANT_PREFERRED_LANGUAGE
    ) as LanguageType

    if (persistedLanguage) {
      setLanguage(persistedLanguage)
    } else if (locale) {
      setLanguage(locale.languageCode as LanguageType)
    }
  }, [])

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language)
      constantStorage.setItem(STORAGE_CONSTANT_PREFERRED_LANGUAGE, language)
    }
  }, [language])

  return <LocaleContext.Provider value={{language, setLanguage}}>{children}</LocaleContext.Provider>
}

// PARTS

export const LocaleContext = createContext<{
  language: string
  setLanguage: (language: LanguageType) => void
}>({
  language: defaultLanguage,
  setLanguage: () => {},
})

export function useLocale() {
  const {language, setLanguage} = useContext(LocaleContext)
  return {language, setLanguage}
}

// TYPES

interface LanguageProviderProps {
  children: ReactNode
}
