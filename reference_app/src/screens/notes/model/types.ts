import type {TDateISO} from '@shared/lib/dates'

export enum NotesView {
  All = 'ALL',
  ByMonth = 'BY_MONTH',
  ByYear = 'BY_YEAR',
}

export type TimeRange = {
  from?: TDateISO
  to?: TDateISO
}
