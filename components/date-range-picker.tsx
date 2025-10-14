"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DateRange } from "@/hooks/use-date-range"

interface DateRangePickerProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  className?: string
}

export function DateRangePicker({ dateRange, onDateRangeChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>("custom")

  const presets = [
    { value: "today", label: "오늘" },
    { value: "yesterday", label: "어제" },
    { value: "last7days", label: "최근 7일" },
    { value: "last30days", label: "최근 30일" },
    { value: "last90days", label: "최근 90일" },
    { value: "custom", label: "사용자 정의" },
  ]

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    
    if (preset !== "custom") {
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
        default:
          from = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)
      }

      onDateRangeChange({ from, to })
    }
  }

  const formatDateRange = (range: DateRange) => {
    const fromStr = format(range.from, "yyyy-MM-dd", { locale: ko })
    const toStr = format(range.to, "yyyy-MM-dd", { locale: ko })
    
    if (fromStr === toStr) {
      return fromStr
    }
    
    return `${fromStr} ~ ${toStr}`
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
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

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal bg-card border-border",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange ? formatDateRange(dateRange) : "날짜 범위 선택"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="p-3">
              <Calendar
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    onDateRangeChange(range)
                    setSelectedPreset("custom")
                  }
                }}
                numberOfMonths={2}
                locale={ko}
                className="rounded-md border"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
