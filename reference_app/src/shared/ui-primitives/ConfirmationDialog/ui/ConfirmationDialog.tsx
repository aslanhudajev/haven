import {useEffect} from 'react'
import {Alert} from 'react-native'

export function ConfirmationDialog(props: ConfirmationDialogProps) {
  const {title, description, onCancel, onContinue, open} = props

  useEffect(() => {
    if (open) {
      Alert.alert(title, description, [
        {text: 'Cancel', onPress: onCancel},
        {text: 'Ok', onPress: onContinue},
      ])
    }
  }, [open])

  return null
}

// TYPES

interface ConfirmationDialogProps {
  title: string
  description?: string
  open: boolean
  onCancel: () => void
  onContinue: () => void
}
