import {getLocales} from 'expo-localization'
import i18n, {type LanguageDetectorAsyncModule} from 'i18next'
import {initReactI18next} from 'react-i18next'
import de from '../assets/locales/de.json'
import en from '../assets/locales/en.json'
import es from '../assets/locales/es.json'
import fr from '../assets/locales/fr.json'
import pt from '../assets/locales/pt.json'
import ru from '../assets/locales/ru.json'
import {LanguageList} from './model/localize'

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect: (callback) => {
    try {
      const locales = getLocales()
      const languageCode = locales[0]?.languageCode || LanguageList.EN

      callback(languageCode)
    } catch (error) {
      console.error('Error detecting language:', error)
    }
  },
  init: () => {},
  cacheUserLanguage: () => {},
}

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    fallbackLng: LanguageList.EN,
    defaultNS: 'translations',
    resources: {
      en: {translations: en},
      ru: {translations: ru},
      es: {translations: es},
      pt: {translations: pt},
      de: {translations: de},
      fr: {translations: fr},
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
