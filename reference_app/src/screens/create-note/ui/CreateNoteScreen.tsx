import {ScrollView} from 'react-native'
import {CreateNoteForm} from '@features/create-note'
import {ScreenContent} from '@shared/ui-primitives/ScreenContent'

export default function CreateCategoryScreen() {
  return (
    <ScreenContent excludeEdges={['top', 'bottom']}>
      <ScrollView
        className="bg-background px-6 py-3"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <CreateNoteForm autoFocus />
      </ScrollView>
    </ScreenContent>
  )
}
