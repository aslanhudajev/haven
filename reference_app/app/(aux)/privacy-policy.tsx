import * as Linking from 'expo-linking'
import {ScrollView} from 'react-native'
import {Separator} from '@shared/ui/separator'
import {Text} from '@shared/ui/text'

export default function PrivacyScreen() {
  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-2">
      <Text>
        NativeLaunch is a developer template designed to help you kickstart your own mobile app
        projects. This template itself does not collect, store, or process any personal data.
      </Text>

      <Text className="mt-2 font-semiBold text-xl">Use of Third-Party Services</Text>
      <Text>
        While the template may include integrations with third-party services (such as Supabase,
        Sentry, or RevenueCat), any data collection or processing is handled solely by those
        providers. Please refer to their respective privacy policies if you enable and configure
        these services in your own project.
      </Text>

      <Text className="mt-2 font-semiBold text-xl">Your Responsibility</Text>
      <Text>
        If you use NativeLaunch as the foundation for your own app, you are responsible for
        complying with applicable data privacy regulations (such as GDPR, CCPA, etc.) based on how
        you use and extend the template.
      </Text>

      <Text className="mt-2 font-semiBold text-xl">Contact Us</Text>
      <Text>Have questions about this Privacy Policy? Contact us at:</Text>
      <Text>
        Email:{' '}
        <Text
          className="text-blue-600"
          onPress={() => Linking.openURL('mailto:jonypopovv@gmail.com')}
        >
          jonypopovv@gmail.com
        </Text>
      </Text>

      <Separator className="mx-auto my-3 w-[70%]" />
      <Text className="text-center text-muted-foreground">Last updated: 07/06/2025</Text>
    </ScrollView>
  )
}
