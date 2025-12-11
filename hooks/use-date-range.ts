"use client"

import { create } from "zustand"
import { addDays, subDays, subMonths, format } from "date-fns"

export interface DateRange {
  from: Date
  to: Date
}

type DateRangePreset = "today" | "yesterday" | "last7days" | "last30days" | "last90days" | "custom"

interface DateRangeStore {
  dateRange: DateRange
  preset: DateRangePreset
  setDateRange: (range: DateRange) => void
  setPreset: (preset: DateRangePreset) => void
  applyPreset: (preset: DateRangePreset) => void
}

// 기본 날짜 범위 계산: 현재 날짜 기준 6개월 전 1일부터 어제까지
const getDefaultDateRange = (): DateRange => {
  const today = new Date()
  const yesterday = subDays(today, 1)
  
  // 6개월 전 날짜 계산
  const sixMonthsAgo = subMonths(today, 6)
  // 6개월 전 달의 1일로 설정
  const sixMonthsAgoFirstDay = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1)
  
  return { from: sixMonthsAgoFirstDay, to: yesterday }
}

const getPresetDateRange = (preset: DateRangePreset): DateRange => {
  const today = new Date()
  
  switch (preset) {
    case "today":
      return { from: today, to: today }
    case "yesterday":
      const yesterday = subDays(today, 1)
      return { from: yesterday, to: yesterday }
    case "last7days":
      return { from: subDays(today, 6), to: today }
    case "last30days":
      return { from: subDays(today, 29), to: today }
    case "last90days":
      return { from: subDays(today, 89), to: today }
    case "custom":
      return getDefaultDateRange() // 기본값: 6개월 전 1일부터 어제까지
    default:
      return getDefaultDateRange() // 기본값: 6개월 전 1일부터 어제까지
  }
}

export const useDateRange = create<DateRangeStore>((set) => ({
  dateRange: getDefaultDateRange(), // 기본값: 6개월 전 1일부터 어제까지
  preset: "custom",
  setDateRange: (range) => set({ dateRange: range, preset: "custom" }),
  setPreset: (preset) => set({ preset }),
  applyPreset: (preset) => set({ 
    preset, 
    dateRange: getPresetDateRange(preset) 
  }),
}))
