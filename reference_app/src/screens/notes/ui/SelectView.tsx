import {IconFilter} from '@tabler/icons-react-native'
import {useTranslation} from '@shared/i18n'
import {cn} from '@shared/lib/utils'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import {NotesView} from '../model/types'
import type {TimeRange} from '../model/types'

export function SelectView({value = NotesView.All, onSelect, onTimeRangeChange}: SelectViewProps) {
  const {t} = useTranslation('SelectFilter')

  const options = [
    {
      value: NotesView.All,
      label: t('allEntries'),
    },
    {
      value: NotesView.ByMonth,
      label: t('byMonth'),
    },
    {
      value: NotesView.ByYear,
      label: t('byYear'),
    },
  ]

  const handleSetFilter = (view: NotesView) => {
    const now = new Date()

    if (view === NotesView.ByMonth) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      endOfMonth.setHours(23, 59, 59, 999)

      onTimeRangeChange({
        from: startOfMonth.toISOString(),
        to: endOfMonth.toISOString(),
      })
    } else if (view === NotesView.ByYear) {
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      const endOfYear = new Date(now.getFullYear(), 11, 31)
      endOfYear.setHours(23, 59, 59, 999)

      onTimeRangeChange({
        from: startOfYear.toISOString(),
        to: endOfYear.toISOString(),
      })
    } else if (view === NotesView.All) {
      onTimeRangeChange({
        from: undefined,
        to: undefined,
      })
    }
    onSelect?.(view)
  }

  return (
    <Select
      value={options.find((option) => option.value === value) ?? options[0]}
      onValueChange={(selected) => {
        handleSetFilter(selected?.value as NotesView)
      }}
    >
      <SelectTrigger
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        className={cn(
          '!h-10 !px-2.5 flex-row items-center gap-2',
          value !== NotesView.All && 'border-primary !bg-primary'
        )}
      >
        <IconFilter
          className={cn(
            'h-5 w-5 text-foreground',
            value !== NotesView.All && 'text-primary-foreground'
          )}
        />

        <SelectValue
          className={cn(
            'font-semiBold text-primary-foreground',
            value === NotesView.All && 'text-primary'
          )}
          placeholder={t('placeholder')}
        >
          {value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent sideOffset={6} align="end">
        <SelectGroup className="max-w-[260px] px-1">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              label={option.label}
              className="flex-row items-center justify-between"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

// TYPES

type SelectViewProps = {
  value?: NotesView
  onSelect?: (type: NotesView) => void
  onTimeRangeChange: (timeRange: TimeRange) => void
}
