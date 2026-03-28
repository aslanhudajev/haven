import Constants from 'expo-constants'
import {useTranslation} from '@shared/i18n'
import {Text} from '@shared/ui/text'

export const AppVersion = () => {
  const {t} = useTranslation('AppVersion')
  const version = Constants.expoConfig?.version

  return <Text className="text-muted-foreground">{t('version', {version})}</Text>
}
