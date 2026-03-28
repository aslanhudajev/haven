import {useState} from 'react'
import {TouchableOpacity, View} from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import {convertDateToLocal} from '@shared/lib/dates'
import {Text} from '@shared/ui/text'

export const DateTimePicker = ({label, value, onChange}: DateTimePickerProps) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const handleConfirm = (date: Date) => {
    onChange(new Date(date).toISOString())
    setDatePickerVisibility(false)
  }

  return (
    <>
      <TouchableOpacity
        className="flex-row items-center justify-between gap-3 rounded-lg p-3"
        onPress={showDatePicker}
      >
        <Text>{label}</Text>
        <View>
          <Text>{(value && convertDateToLocal(new Date(value))) ?? 'No date specified'}</Text>
        </View>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </>
  )
}

// TYPES

interface DateTimePickerProps {
  label: string
  onChange: (date: string) => void
  value: string | number
}
