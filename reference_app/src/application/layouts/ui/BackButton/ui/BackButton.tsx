import {IconArrowLeft} from '@tabler/icons-react-native'
import {useRouter} from 'expo-router'
import {Button} from '@shared/ui/button'

export function BackButton() {
  const router = useRouter()

  if (!router.canGoBack) {
    return null
  }
  return (
    <Button size="icon" variant="ghost" onPress={router.back}>
      <IconArrowLeft className="h-6 w-6 text-foreground" />
    </Button>
  )
}
