import {type BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet'
import {Picker} from '@react-native-picker/picker'
import {IconChevronDown} from '@tabler/icons-react-native'
import {useRef, useState} from 'react'
import {Keyboard, Pressable, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
// eslint-disable-next-line import/no-restricted-paths,no-restricted-imports
import {formatDateRange} from '@widgets/time-range-control/libs/formatDateRange'
import {useLocale} from '@shared/i18n'
import type {TDateISO} from '@shared/lib/dates'
import {useColorPalette} from '@shared/lib/palette'
import {Button} from '@shared/ui/button'
import {Text} from '@shared/ui/text'
import {BottomSheet} from '@shared/ui-primitives/Sheet'

export function MonthYearPicker({timeRange, onChange}: MonthYearPickerProps) {
  const {bottom} = useSafeAreaInsets()
  const sheetRef = useRef<BottomSheetModal>(null)
  const {language} = useLocale()

  return (
    <>
      <Pressable
        className="flex flex-row items-center gap-1 max-w-[120px] mx-auto"
        onPress={() => {
          Keyboard.dismiss()
          sheetRef.current?.present()
        }}
      >
        <Text className="text-muted-foreground">
          {formatDateRange(timeRange.from, timeRange.to, {locale: language, month: 'short'})}
        </Text>
        <IconChevronDown className="h-5 w-5 text-muted-foreground" />
      </Pressable>
      <BottomSheet ref={sheetRef} index={0} enableDynamicSizing>
        <BottomSheetView
          style={{
            paddingBottom: bottom,
          }}
        >
          <SheetDatePicker
            timeRange={timeRange}
            onChange={async (date) => {
              sheetRef.current?.close()
              onChange?.(date)
            }}
            locale={language}
          />
        </BottomSheetView>
      </BottomSheet>
    </>
  )
}

// PARTS

function SheetDatePicker({timeRange, onChange, locale}: TSheetDatePicker) {
  const {getColor} = useColorPalette()
  const {from} = timeRange ?? {}
  const [selectedMonth, setSelectedMonth] = useState(() =>
    from ? new Date(from).getMonth() + 1 : new Date().getMonth() + 1
  )
  const [selectedYear, setSelectedYear] = useState(() =>
    from ? new Date(from).getFullYear() : new Date().getFullYear()
  )

  const months = getAllMonths({locale: locale})
  const years = Array.from({length: 21}, (_, i) => new Date().getFullYear() - 10 + i) // 20 лет назад и 10 вперед

  return (
    <View className="gap-4 px-6">
      <View className="flex flex-row justify-between">
        <Picker
          selectedValue={selectedMonth}
          onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          style={{height: 220, width: '50%'}}
        >
          {months.map((month, index) => (
            <Picker.Item
              key={index}
              label={month}
              value={index + 1}
              color={getColor('--primary')}
            />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedYear}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
          style={{height: 220, width: '50%'}}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={`${year}`} value={year} color={getColor('--primary')} />
          ))}
        </Picker>
      </View>
      <Button
        onPress={() => {
          const date = new Date(selectedYear, selectedMonth, 0)
          const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
          const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          endOfMonth.setHours(23, 59, 59, 999)

          onChange?.({
            from: startOfMonth.toISOString(),
            to: endOfMonth.toISOString(),
          })
        }}
      >
        <Text>{`Save`}</Text>
      </Button>
    </View>
  )
}

export function getAllMonths({locale = 'en'} = {}) {
  const applyFormat = new Intl.DateTimeFormat(locale, {month: 'long'}).format
  return [...Array(12).keys()].map((m) => applyFormat(new Date(new Date().getFullYear(), m)))
}

// TYPES

type MonthYearPickerProps = {
  timeRange: TimeRange
  onChange?: (date: TimeRange) => void
}

type TSheetDatePicker = {
  timeRange: TimeRange
  onChange?: (date: TimeRange) => void
  locale: string
}

type TimeRange = {
  from: TDateISO
  to: TDateISO
}
