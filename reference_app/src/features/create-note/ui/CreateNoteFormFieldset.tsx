import {IconCirclePlus} from '@tabler/icons-react-native'
import {useState} from 'react'
import {useFormContext} from 'react-hook-form'
import {View} from 'react-native'
import {NoteImageDisplay} from '@entities/note'
import {useTranslation} from '@shared/i18n'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'
import {InputField, TextareaField} from '@shared/ui-primitives/FinalFormKit'
import {pickImage} from '../libs/pickImage'
import type {CreateNoteFormData} from './CreateNoteForm.schema'

export const CreateNoteFormFieldset = ({
  noteId,
  autoFocus,
  onUploadImage,
}: CreateNoteFormFieldsetProps) => {
  const {t} = useTranslation('CreateNoteFormFieldset')
  const {formState, watch, setValue} = useFormContext<CreateNoteFormData>()
  const {isLoading} = formState
  const image_path = watch('image_path')
  const [localUri, setLocalUri] = useState<string | null>(null)

  const handleUploadImage = async () => {
    const picked = await pickImage()
    if (!picked) return

    const {localUri, filePath} = picked

    if (filePath) {
      onUploadImage?.(localUri)
      setLocalUri(localUri)
      setValue('image_path', filePath, {shouldDirty: true})
    }
  }

  return (
    <>
      <InputField
        name="title"
        label={t('title.label')}
        placeholder={t('title.placeholder')}
        autoCapitalize="none"
        disabled={isLoading}
      />
      <TextareaField
        name="content"
        label={t('content.label')}
        placeholder={t('content.placeholder')}
        autoCapitalize="none"
        disabled={isLoading}
        autoFocus={autoFocus}
      />
      {image_path || localUri ? (
        <View className="h-60">
          <NoteImageDisplay
            image_path={image_path}
            localUri={localUri}
            noteId={noteId}
            onDelete={() => setValue('image_path', undefined)}
          />
        </View>
      ) : (
        <Button
          variant="outline"
          onPress={handleUploadImage}
          className="!h-11 !py-2 my-1.5 items-center gap-4 border-dashed"
        >
          <IconCirclePlus className="h-5 w-5 text-muted-foreground" />
          <Text>{t('addImage')}</Text>
        </Button>
      )}
    </>
  )
}

// TYPES

interface CreateNoteFormFieldsetProps {
  noteId?: string
  onUploadImage?: (localUri: string) => void
  autoFocus?: boolean
  className?: string
}
