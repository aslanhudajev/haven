import * as Linking from 'expo-linking'
import {ScrollView} from 'react-native'
import {Separator} from '@shared/ui/separator'
import {Text} from '@shared/ui/text'

export default function TermsScreen() {
  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-2">
      <Text className="mt-2 font-semiBold text-xl">1. Introduction</Text>
      <Text>
        Welcome to NativeLaunch. These Terms of Use ("Terms") govern your access to and use of the
        NativeLaunch codebase ("Template"), provided as a developer starter project. By using,
        downloading, or modifying this Template, you agree to be bound by these Terms.
      </Text>

      <Text className="mt-2 font-semiBold text-xl">2. License</Text>
      <Text>
        NativeLaunch is provided under a commercial license. You are permitted to use this Template
        for your own personal or commercial projects, but you may not redistribute, resell, or share
        the Template or its source code in any form.
      </Text>

      <Text className="mt-2 font-semiBold text-xl">3. No Warranty</Text>
      <Text>
        The Template is provided "as is", without warranty of any kind. We do not guarantee that the
        code will be error-free, secure, or meet your specific requirements.
      </Text>

      <Text className="mt-2 font-semiBold text-xl">4. Limitation of Liability</Text>
      <Text>
        In no event shall the creators of NativeLaunch be held liable for any damages arising from
        the use or inability to use this Template.
      </Text>

      <Text className="mt-2 font-semiBold text-xl">5. Changes to Terms</Text>
      <Text>
        We reserve the right to update these Terms at any time. Continued use of the Template after
        changes have been published constitutes your acceptance of the new Terms.
      </Text>

      <Text className="mt-2 font-semiBold text-xl">6. Contact</Text>
      <Text>If you have any questions about these Terms, you can contact us at:</Text>
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
