import {useLocalSearchParams, useRouter} from 'expo-router'
import {useCallback, useEffect, useState} from 'react'
import {ScrollView, View} from 'react-native'
import type {CreateNoteFormData} from '@features/create-note'
import {CreateNoteFormFieldset, createNoteFormSchema} from '@features/create-note'
import {DeleteNoteButton} from '@features/delete-note'
import {useNotesStore} from '@entities/note'
import {useTranslation} from '@shared/i18n'
import {Text} from '@shared/ui/text'
import {
  FinalForm,
  FinalFormButtons,
  FinalFormFields,
  FinalFormProvider,
  useFinalForm,
} from '@shared/ui-primitives/FinalFormKit'
import {ScreenContent} from '@shared/ui-primitives/ScreenContent'

export default function NoteOverviewScreen() {
  const {t} = useTranslation('NoteOverviewScreen')
  const router = useRouter()
  const {id: noteId} = useLocalSearchParams()
  const id = String(noteId)
  const [localUri, setLocalUri] = useState<string | undefined>(undefined)

  if (typeof id === 'undefined') {
    throw new Error('Impossible expense category id')
  }
  const getNote = useNotesStore((state) => state.getNote)
  const updateNote = useNotesStore((state) => state.updateNote)

  const note = getNote(id)

  const form = useFinalForm({
    schema: createNoteFormSchema,
    defaultValues: {
      ...note,
    },
    async onSubmit(note: CreateNoteFormData) {
      await updateNote(id, {...note}, localUri)
      router.back()
    },
  })
  const {reset, formState} = form

  useEffect(() => {
    reset(note)
  }, [id, note, reset])

  const beforeDelete = () => {
    reset({title: ''})
  }

  const renderHeaderRight = useCallback(() => {
    return <DeleteNoteButton id={id} beforeDelete={beforeDelete} />
  }, [formState, formState.isValid])

  if (!note) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">{t('notFound')}</Text>
      </View>
    )
  }

  return (
    <FinalFormProvider {...form}>
      <ScreenContent
        excludeEdges={['top', 'bottom']}
        navigationOptions={{
          headerRight: renderHeaderRight,
        }}
      >
        <ScrollView className="bg-background px-6 py-3" keyboardShouldPersistTaps="handled">
          <FinalForm>
            <FinalFormFields>
              <CreateNoteFormFieldset noteId={id} onUploadImage={setLocalUri} />
            </FinalFormFields>
            <FinalFormButtons submitText={t('btnSave')} />
          </FinalForm>
        </ScrollView>
      </ScreenContent>
    </FinalFormProvider>
  )
}
