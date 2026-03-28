import {useRouter} from 'expo-router'
import {useState} from 'react'
import {useNotesStore} from '@entities/note'
import {useTranslation} from '@shared/i18n'
import {
  FinalForm,
  FinalFormButtons,
  FinalFormFields,
  FinalFormProvider,
  useFinalForm,
} from '@shared/ui-primitives/FinalFormKit'
import {createNoteFormSchema} from './CreateNoteForm.schema'
import {CreateNoteFormFieldset} from './CreateNoteFormFieldset'

export const CreateNoteForm = ({autoFocus}: CreateNoteFormProps) => {
  const {t} = useTranslation('CreateNoteForm')
  const navigate = useRouter()
  const [localUri, setLocalUri] = useState<string | undefined>(undefined)

  const createNote = useNotesStore((state) => state.createNote)

  const form = useFinalForm({
    schema: createNoteFormSchema,
    defaultValues: {
      title: '',
      content: '',
      image_path: undefined,
    },
    async onSubmit(note) {
      await createNote(note, localUri)
      navigate.back()
    },
  })

  return (
    <FinalFormProvider {...form}>
      <FinalForm>
        <FinalFormFields>
          <CreateNoteFormFieldset autoFocus={autoFocus} onUploadImage={setLocalUri} />
        </FinalFormFields>
        <FinalFormButtons submitText={t('btnCreate')} />
      </FinalForm>
    </FinalFormProvider>
  )
}

// TYPES

interface CreateNoteFormProps {
  autoFocus?: boolean
  className?: string
}
