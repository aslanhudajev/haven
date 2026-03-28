export const TimeRangeControlConst = {
  ByMonth: 'BY_MONTH',
  ByYear: 'BY_YEAR',
} as const

export type TTimeRangeControl = (typeof TimeRangeControlConst)[keyof typeof TimeRangeControlConst]
