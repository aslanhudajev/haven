export enum LanguageList {
  EN = 'en',
  RU = 'ru',
  ES = 'es',
  PT = 'pt',
  DE = 'de',
  FR = 'fr',
}

export type LanguageType = Lowercase<keyof typeof LanguageList>
