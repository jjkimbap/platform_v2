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
  
  console.log('🗓️ [DateRange] 기본 날짜 범위:', {
    from: sixMonthsAgoFirstDay.toISOString(),
    to: yesterday.toISOString()
  })
  
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

// localStorage에서 날짜 범위 불러오기
const getStoredDateRange = (): DateRange | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('date-range-storage')
    if (!stored) return null
    
    const parsed = JSON.parse(stored)
    return {
      from: new Date(parsed.from),
      to: new Date(parsed.to)
    }
  } catch (error) {
    console.error('Failed to parse stored date range:', error)
    return null
  }
}

// localStorage에 날짜 범위 저장하기
const storeDateRange = (range: DateRange) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('date-range-storage', JSON.stringify({
      from: range.from.toISOString(),
      to: range.to.toISOString()
    }))
  } catch (error) {
    console.error('Failed to store date range:', error)
  }
}

export const useDateRange = create<DateRangeStore>()((set, get) => ({
  dateRange: getDefaultDateRange(), // 항상 기본값으로 초기화 (서버/클라이언트 동일)
  preset: "custom",
  setDateRange: (range) => {
    storeDateRange(range)
    set({ dateRange: range, preset: "custom" })
  },
  setPreset: (preset) => set({ preset }),
  applyPreset: (preset) => {
    const range = getPresetDateRange(preset)
    storeDateRange(range)
    set({ 
      preset, 
      dateRange: range 
    })
  },
}))

// 클라이언트에서만 localStorage 복원 (hydration 후)
if (typeof window !== 'undefined') {
  const storedRange = getStoredDateRange()
  if (storedRange) {
    useDateRange.setState({ dateRange: storedRange })
  }
}
