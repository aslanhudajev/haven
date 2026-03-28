import {toast} from '@backpackapp-io/react-native-toast'
import {
  IconBook2,
  IconChevronRight,
  IconExternalLink,
  IconInfoCircle,
  IconLayoutDashboard,
  IconListSearch,
  IconLock,
  IconMessage2Share,
  IconNotes,
  IconShare,
  IconWorld,
} from '@tabler/icons-react-native'
import {useRouter} from 'expo-router'
import {Alert, Linking, Platform, ScrollView, Share, View} from 'react-native'
import {AppVersion} from '@widgets/app-version'
import {SettingCard, SettingCardGroup} from '@widgets/settings-card'
import {useUserEntitlements} from '@entities/subscription'
import {useTranslation, useLocale} from '@shared/i18n'
import {Text} from '@shared/ui/text'
import {ScreenContent} from '@shared/ui-primitives/ScreenContent'
import {ProfileCard} from './ProfileCard'
import {SettingCardLocalAuth} from './SettingCardLocalAuth'
import {SettingCardNotifications} from './SettingCardNotifications'

export default function SettingScreen() {
  const {t} = useTranslation('SettingScreen')
  const router = useRouter()
  const {language} = useLocale()
  const {isPro} = useUserEntitlements()

  async function handleShare() {
    try {
      await Share.share({
        message: t('share'),
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const sendFeedback = () => {
    const email = 'jonypopovv@gmail.com'
    const subject = 'Feedback for the app'
    const body = 'Hi! I wanted to share my feedback...'

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Error', 'Failed to open mail app')
    })
  }

  return (
    <ScreenContent excludeEdges={['top', 'bottom']} backgroundColor="bg-background">
      <ScrollView contentContainerClassName="p-4 gap-4">
        {!isPro && (
          <SettingCard
            className="!px-4 !h-20 border border-amber-600 bg-secondary rounded-lg"
            onPress={() => router.push('/paywall')}
            title={t('card.premium.title')}
            description={t('card.premium.desc')}
            rightSection={<IconLock className="h-6 w-6 text-muted-foreground" />}
            titleClassName="text-xl"
            descClassName="!text-base font-regular text-muted-foreground mt-0"
          />
        )}
        <SettingCardGroup>
          <ProfileCard />
        </SettingCardGroup>
        <SettingCardGroup title={t('group.app')}>
          <SettingCardLocalAuth />
          <SettingCardNotifications />
          <SettingCard
            className="border-b border-background dark:border-muted"
            onPress={() => router.push('/appearance')}
            title={t('card.appearance.title')}
            icon={IconLayoutDashboard}
            rightSection={<IconChevronRight className="h-6 w-6 text-foreground" />}
            iconClassName="text-teal-700 dark:text-teal-400"
          />
          <SettingCard
            className="border-b border-background dark:border-muted"
            onPress={() => router.push('/language')}
            title={t('card.language.title')}
            icon={IconWorld}
            rightSection={
              <View className="flex flex-row items-center gap-2">
                <Text className="text-muted-foreground uppercase">{language}</Text>
                <IconChevronRight className="h-6 w-6 text-foreground" />
              </View>
            }
            iconClassName="text-teal-700 dark:text-teal-400"
          />
        </SettingCardGroup>
        <SettingCardGroup title={t('group.others')}>
          <SettingCard
            className="border-b border-background dark:border-muted"
            onPress={() => router.push('/privacy-policy')}
            title={t('card.privacyPolicy.title')}
            icon={IconNotes}
            rightSection={<IconChevronRight className="h-6 w-6 text-foreground" />}
            iconClassName="text-indigo-700 dark:text-indigo-500"
          />
          <SettingCard
            className="border-b border-background dark:border-muted"
            onPress={() =>
              Platform.OS === 'ios'
                ? Linking.openURL(
                    'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
                  )
                : Linking.openURL('https://www.moneyplusapp.com/terms-of-service')
            }
            title={t('card.termsOfUse.title')}
            icon={IconBook2}
            rightSection={
              Platform.OS === 'ios' ? (
                <IconExternalLink className="h-6 w-6 text-foreground" />
              ) : (
                <IconChevronRight className="h-6 w-6 text-foreground" />
              )
            }
            iconClassName="text-indigo-700 dark:text-indigo-500"
          />
          <SettingCard
            className="border-b border-background dark:border-muted"
            onPress={() => router.push('/faq')}
            title={t('card.faq.title')}
            icon={IconListSearch}
            rightSection={<IconChevronRight className="h-6 w-6 text-foreground" />}
            iconClassName="text-indigo-700 dark:text-indigo-500"
          />
          <SettingCard
            className="border-b border-background dark:border-muted"
            onPress={sendFeedback}
            title={t('card.feedback.title')}
            icon={IconMessage2Share}
            rightSection={<IconChevronRight className="h-6 w-6 text-foreground" />}
            iconClassName="text-indigo-700 dark:text-indigo-500"
          />
          <SettingCard
            onPress={handleShare}
            title={t('card.share.title')}
            icon={IconShare}
            rightSection={<IconChevronRight className="h-6 w-6 text-foreground" />}
            iconClassName="text-indigo-700 dark:text-indigo-500"
          />
          <SettingCard
            onPress={() => Linking.openURL('https://www.moneyplusapp.com')}
            title={t('card.aboutApp.title')}
            icon={IconInfoCircle}
            rightSection={<IconExternalLink className="h-6 w-6 text-foreground" />}
            iconClassName="text-indigo-700 dark:text-indigo-500"
          />
        </SettingCardGroup>
        <View className="-mt-3 pb-1 justify-center items-center">
          <AppVersion />
        </View>
      </ScrollView>
    </ScreenContent>
  )
}
