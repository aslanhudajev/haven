import {IconCheck} from '@tabler/icons-react-native'
import {useRouter} from 'expo-router'
import {ScrollView} from 'react-native'
import {useTranslation, useLocale, LanguageList} from '@shared/i18n'
import {cn} from '@shared/lib/utils'
import MenuItem from '@shared/ui-primitives/MenuItem'

export default function LanguageScreen() {
  const router = useRouter()
  const {language, setLanguage} = useLocale()
  const {t} = useTranslation('LanguageScreen')

  return (
    <ScrollView className="bg-background">
      {Object.values(LanguageList).map((item, i) => {
        return (
          <MenuItem
            key={i}
            className={cn(language === item && 'bg-muted/50')}
            image={`https://flagcdn.com/w40/${item === 'en' ? 'us' : item}.jpg`}
            label={t(`lang[${item}]`)}
            rightSection={
              language === item && <IconCheck className="size-6 text-amount-positive" />
            }
            onPress={() => {
              setLanguage(item)
              router.back()
            }}
          />
        )
      })}
    </ScrollView>
  )
}

// t('lang[en]')'
// t('lang[ru]')'
// t('lang[es]')'
// t('lang[pt]')'
// t('lang[de]')'
// t('lang[fr]')'
