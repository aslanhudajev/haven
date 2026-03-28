import {type BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet'
import DateTimePicker from '@react-native-community/datetimepicker'
import {IconCalendar} from '@tabler/icons-react-native'
import {useRef, useState} from 'react'
import {Keyboard, Platform, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {convertDateToShortFormat} from '@shared/lib/dates'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'
import {BottomSheet} from '@shared/ui-primitives/Sheet'

export function DatePicker({
  value = new Date().toDateString(),
  onChange,
  maximumDate,
  minimumDate,
}: DatePickerProps) {
  const {bottom} = useSafeAreaInsets()
  const sheetRef = useRef<BottomSheetModal>(null)

  return (
    <>
      <Button
        variant="outline"
        className="!px-3"
        onPress={() => {
          Keyboard.dismiss()
          sheetRef.current?.present()
        }}
      >
        <IconCalendar className="h-5 w-5 text-primary" />
        <Text>{convertDateToShortFormat(new Date(value))}</Text>
      </Button>
      <BottomSheet ref={sheetRef} index={0} enableDynamicSizing>
        <BottomSheetView
          style={{
            paddingBottom: bottom,
          }}
        >
          <SpinnerDatePicker
            value={value}
            onChange={async (date) => {
              sheetRef.current?.close()
              //await sleep(500)
              onChange?.(date)
            }}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
          />
        </BottomSheetView>
      </BottomSheet>
    </>
  )
}

function SpinnerDatePicker({value, onChange, maximumDate, minimumDate}: DatePickerProps) {
  const [date, setDate] = useState<string | undefined>(value)

  return (
    <View className="gap-4">
      <DateTimePicker
        value={new Date(value!)}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(_, selectedDate) => {
          setDate(String(selectedDate))
          if (Platform.OS === 'android') {
            onChange?.(new Date(String(selectedDate)).toISOString())
          }
        }}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
      />
      {Platform.OS === 'ios' && (
        <Button
          className="mx-6"
          onPress={() => {
            onChange?.(new Date(String(date)).toISOString())
          }}
        >
          <Text>{`Save`}</Text>
        </Button>
      )}
    </View>
  )
}

// TYPES

type DatePickerProps = {
  value?: string
  onChange?: (date?: string) => void
  maximumDate?: Date
  minimumDate?: Date
}
