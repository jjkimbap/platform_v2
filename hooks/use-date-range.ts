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
      return { from: subDays(today, 29), to: today } // 기본값
    default:
      return { from: today, to: today }
  }
}

export const useDateRange = create<DateRangeStore>((set) => ({
  dateRange: getPresetDateRange("last30days"),
  preset: "last30days",
  setDateRange: (range) => set({ dateRange: range, preset: "custom" }),
  setPreset: (preset) => set({ preset }),
  applyPreset: (preset) => set({ 
    preset, 
    dateRange: getPresetDateRange(preset) 
  }),
}))
