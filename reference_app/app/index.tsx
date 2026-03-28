import {Redirect} from 'expo-router'
import 'expo-router/entry'
import {useAuth} from '@app/providers/AuthProvider'

export default function Index() {
  const {userBySession} = useAuth()

  if (userBySession) {
    return <Redirect href="/(app)/(tabs)" />
  }

  return <Redirect href="/(auth)/login" />
}
