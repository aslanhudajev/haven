import React, {useState} from 'react'
import {ScrollView, View} from 'react-native'
import {Trans, useTranslation} from '@shared/i18n'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'
import {ConfirmationDialog} from '@shared/ui-primitives/ConfirmationDialog'

export default function ConfirmationDialogScreen() {
  const {t} = useTranslation('ConfirmationDialogScreen')
  const [confirmationIsOpen, setConfirmationIsOpen] = useState(false)

  const closeConfirmation = () => setConfirmationIsOpen(false)
  const openConfirmation = () => setConfirmationIsOpen(true)

  const onDelete = async () => {}

  return (
    <ScrollView className="bg-background" contentContainerClassName="px-6 py-3 gap-4">
      <View className="gap-4 rounded-xl border border-border p-4 bg-background">
        <Trans
          // {t('desc.1')}
          i18nKey="ConfirmationDialogScreen.desc.1"
          components={{bold1: <Text className="font-medium text-foreground" />}}
          parent={Text}
          className="text-muted-foreground"
        />
        <View className="h-px bg-border" />
        <View className="flex flex-col gap-1">
          <Text className="text-muted-foreground">{t('features.1')}</Text>
          <Text className="text-muted-foreground">{t('features.2')}</Text>
          <Text className="text-muted-foreground">{t('features.3')}</Text>
          <Text className="text-muted-foreground">{t('features.4')}</Text>
        </View>
      </View>
      <Button onPress={openConfirmation}>
        <Text>Open</Text>
      </Button>
      <ConfirmationDialog
        title="Are you sure?"
        description="You will not be able to undo this action."
        open={confirmationIsOpen}
        onCancel={closeConfirmation}
        onContinue={onDelete}
      />
    </ScrollView>
  )
}
