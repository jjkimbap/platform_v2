"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DateRange } from "@/hooks/use-date-range"
import type { DateRange as CalendarDateRange } from "react-day-picker"

interface DateRangePickerProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  selectedApp?: string
  onAppChange?: (app: string) => void
  className?: string
}

export function DateRangePicker({ dateRange, onDateRangeChange, selectedApp = "전체", onAppChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>("custom")
  const [tempDateRange, setTempDateRange] = useState<CalendarDateRange | undefined>({
    from: dateRange.from,
    to: dateRange.to
  })

  // dateRange prop이 변경되면 tempDateRange도 동기화
  useEffect(() => {
    setTempDateRange({
      from: dateRange.from,
      to: dateRange.to
    })
  }, [dateRange])

  const apps = [
    { value: "전체", label: "전체" },
    { value: "HT", label: "HT" },
    { value: "COP", label: "COP" },
    { value: "Global", label: "Global" },
  ]

  const presets = [
    { value: "today", label: "오늘" },
    { value: "yesterday", label: "어제" },
    { value: "last7days", label: "최근 7일" },
    { value: "last30days", label: "최근 30일" },
    { value: "last90days", label: "최근 90일" },
    { value: "last6months", label: "최근 6개월" },
    { value: "last1year", label: "최근 1년" },
    { value: "custom", label: "사용자 정의" },
    { value: "total", label: "전체 기간" },
  ]

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    
    if (preset === "total") {
      // 전체 기간 선택 시 날짜 범위 전체 설정
      onDateRangeChange({ 
        from: new Date(2020, 0, 1), 
        to: new Date() 
      })
      setIsOpen(false)
      return
    }
    
    if (preset === "custom") {
      // 사용자 정의 선택 시 달력 열기
      setIsOpen(true)
      return
    }
    
    // 다른 프리셋 선택 시 날짜 범위 설정하고 달력 닫기
    const today = new Date()
    let from: Date
    let to: Date = today

    switch (preset) {
      case "today":
        from = today
        break
      case "yesterday":
        from = new Date(today.getTime() - 24 * 60 * 60 * 1000)
        to = from
        break
      case "last7days":
        from = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)
        break
      case "last30days":
        from = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)
        break
      case "last90days":
        from = new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000)
        break
      case "last6months":
        from = new Date(today)
        from.setMonth(today.getMonth() - 6)
        break
      case "last1year":
        from = new Date(today)
        from.setFullYear(today.getFullYear() - 1)
        break
      default:
        from = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)
    }

    onDateRangeChange({ from, to })
    setIsOpen(false)
  }

  const formatDateRange = (range: DateRange) => {
    const fromStr = format(range.from, "yyyy-MM-dd", { locale: ko })
    const toStr = format(range.to, "yyyy-MM-dd", { locale: ko })
    
    if (fromStr === toStr) {
      return fromStr
    }
    
    return `${fromStr} ~ ${toStr}`
  }

  const handleSearch = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      onDateRangeChange({ 
        from: tempDateRange.from, 
        to: tempDateRange.to 
      })
      setIsOpen(false)
    }
  }

  const isSearchDisabled = !tempDateRange?.from || !tempDateRange?.to

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {onAppChange && (
        <Select value={selectedApp} onValueChange={onAppChange}>
          <SelectTrigger className="w-[100px] bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {apps.map((app) => (
              <SelectItem key={app.value} value={app.value}>
                {app.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[120px] bg-card border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={isOpen && selectedPreset !== "total"} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={selectedPreset === "total"}
            className={cn(
              "w-[280px] justify-start text-left font-normal bg-card border-border",
              !dateRange && "text-muted-foreground",
              selectedPreset === "total" && "opacity-50 cursor-not-allowed"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange ? formatDateRange(dateRange) : "날짜 범위 선택"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col">
            <div className="p-3">
              <Calendar
                mode="range"
                defaultMonth={tempDateRange?.from || dateRange?.from}
                selected={tempDateRange}
                onSelect={(range) => {
                  setTempDateRange(range)
                  if (range?.from && range?.to) {
                    setSelectedPreset("custom")
                  }
                }}
                numberOfMonths={2}
                locale={ko}
                className="rounded-md border"
              />
            </div>
            <div className="flex items-center justify-end gap-2 p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTempDateRange({
                    from: dateRange.from,
                    to: dateRange.to
                  })
                  setIsOpen(false)
                }}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleSearch}
                disabled={isSearchDisabled}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                검색
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
