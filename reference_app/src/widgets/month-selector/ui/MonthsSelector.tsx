import {View} from 'react-native'
import {useLocale} from '@shared/i18n'
import type {TDateISO} from '@shared/lib/dates'
import {cn} from '@shared/lib/utils'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import {Text} from '@shared/ui/text'
import {getAllMonths} from '../lib/getAllMonths'
import {getMonthIndex} from '../lib/getMonthIndex'
import type {NotesFilters} from 'src/entities/note'

const now = new Date()

export const MonthsSelector = ({from, onChange}: MonthsSliderProps) => {
  const {language} = useLocale()
  const months = getAllMonths({locale: language})
  const selectedMonth = from ?? new Date().toISOString()
  const monthIndex = new Date(selectedMonth).getMonth()

  return (
    <View className={cn('gap-1 w-[45px] mr-1', language === 'ru' && 'w-[60px]')}>
      <Text className="font-semiBold text-muted-foreground/60 text-xs">{now.getFullYear()}</Text>
      <Select
        value={{value: months[monthIndex], label: months[monthIndex]}}
        onValueChange={(selected) => {
          setTimeout(() => {
            const index = getMonthIndex(selected!.value, language)
            const endOfMonth = new Date(now.getFullYear(), index + 1, 0)
            endOfMonth.setHours(23, 59, 59, 999)
            onChange({
              from: new Date(Date.UTC(now.getFullYear(), index, 1)).toISOString(),
              to: endOfMonth.toISOString(),
            })
          })
        }}
      >
        <SelectTrigger className="!border-0 h-auto native:h-auto p-0">
          <SelectValue
            className="text-foreground text-2xl uppercase"
            placeholder="Choose month"
            adjustsFontSizeToFit
            numberOfLines={1}
          />
        </SelectTrigger>
        <SelectContent className="max-h-[450px]">
          <SelectGroup className="px-1">
            {months.map((month) => (
              <SelectItem
                key={month}
                label={month}
                value={month}
                className="flex-row justify-between uppercase"
              >
                {month}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  )
}

// TYPES

interface MonthsSliderProps {
  from: TDateISO
  onChange({from, to}: TOptions): void
}

type TOptions = {
  from: NotesFilters['fromDateTimeRange']
  to: NotesFilters['toDateTimeRange']
}
