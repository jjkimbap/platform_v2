"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DateRange } from "@/hooks/use-date-range"
import ReactCalendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

interface DateRangePickerProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  selectedApp?: string
  onAppChange?: (app: string) => void
  className?: string
}

export function DateRangePicker({ dateRange, onDateRangeChange, selectedApp = "전체", onAppChange, className }: DateRangePickerProps) {
  const [isStartOpen, setIsStartOpen] = useState(false)
  const [isEndOpen, setIsEndOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>("custom")
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(dateRange.from)
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(dateRange.to)
  const startCalendarRef = useRef<HTMLDivElement>(null)
  const endCalendarRef = useRef<HTMLDivElement>(null)

  // dateRange prop이 변경되면 temp dates도 동기화
  useEffect(() => {
    setTempStartDate(dateRange.from)
    setTempEndDate(dateRange.to)
  }, [dateRange])

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // calendar-container 외부를 클릭했을 때만 닫기
      if (!target.closest('.calendar-container')) {
        setIsStartOpen(false)
        setIsEndOpen(false)
      }
    }

    if (isStartOpen || isEndOpen) {
      // 약간의 지연을 두고 이벤트 리스너 추가 (버튼 클릭 이벤트와 충돌 방지)
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isStartOpen, isEndOpen])

  // 달력 위치 조정 (화면 밖으로 나가지 않도록)
  useEffect(() => {
    if (isStartOpen && startCalendarRef.current) {
      adjustCalendarPosition(startCalendarRef.current)
    }
  }, [isStartOpen])

  useEffect(() => {
    if (isEndOpen && endCalendarRef.current) {
      adjustCalendarPosition(endCalendarRef.current)
    }
  }, [isEndOpen])

  const adjustCalendarPosition = (calendarEl: HTMLDivElement) => {
    const rect = calendarEl.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // 오른쪽으로 넘어가면 왼쪽으로 이동
    if (rect.right > viewportWidth) {
      calendarEl.style.left = 'auto'
      calendarEl.style.right = '0'
    }

    // 아래로 넘어가면 위로 표시
    if (rect.bottom > viewportHeight) {
      calendarEl.style.top = 'auto'
      calendarEl.style.bottom = 'calc(100% + 0.5rem)'
    }
  }

  const apps = [
    { value: "전체", label: "전체" },
    { value: "HT", label: "HT" },
    { value: "COP", label: "COP" },
    { value: "Global", label: "Global" },
  ]

  const presets = [
    { value: "last30days", label: "최근 30일" },
    { value: "last90days", label: "최근 90일" },
    { value: "last6months", label: "최근 6개월" },
    { value: "last1year", label: "최근 1년" },
    { value: "custom", label: "사용자 정의" },
  ]

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    
    if (preset === "custom") {
      // 사용자 정의 선택 시 시작일 달력 열기
      setIsStartOpen(true)
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
    setIsStartOpen(false)
    setIsEndOpen(false)
    
    // 프리셋 선택 후 페이지 리로드 (localStorage에 저장 후)
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

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

      {/* 시작일 선택 */}
      <div className="relative calendar-container">
        <Button
          variant="outline"
          disabled={selectedPreset !== "custom"}
          onClick={() => {
            if (selectedPreset === "custom") {
              setIsStartOpen(!isStartOpen)
              setIsEndOpen(false)
            }
          }}
          className={cn(
            "w-[140px] justify-start text-left font-normal bg-card border-border",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? format(dateRange.from, "yyyy-MM-dd", { locale: ko }) : "시작일"}
        </Button>
        {isStartOpen && selectedPreset === "custom" && (
          <div 
            ref={startCalendarRef}
            className="absolute top-full left-0 z-50 mt-2 rounded-md border bg-popover shadow-lg"
            style={{ minWidth: '320px' }}
          >
            <div className="p-3">
              <ReactCalendar
                value={tempStartDate || new Date()}
                onChange={(value) => {
                  if (value instanceof Date) {
                    setTempStartDate(value)
                  }
                }}
                locale="ko-KR"
                className="border-0"
                maxDate={new Date()}
                formatDay={(locale, date) => date.getDate().toString()}
              />
            </div>
            <div className="flex items-center justify-end gap-2 p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTempStartDate(dateRange.from)
                  setIsStartOpen(false)
                }}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (tempStartDate && tempEndDate) {
                    onDateRangeChange({ 
                      from: tempStartDate, 
                      to: tempEndDate 
                    })
                    // 날짜 변경 후 페이지 리로드 (localStorage에 저장 후)
                    setTimeout(() => {
                      window.location.reload()
                    }, 100)
                  }
                  setIsStartOpen(false)
                }}
              >
                확인
              </Button>
            </div>
          </div>
        )}
      </div>

      <span className="text-muted-foreground">~</span>

      {/* 종료일 선택 */}
      <div className="relative calendar-container">
        <Button
          variant="outline"
          disabled={selectedPreset !== "custom"}
          onClick={() => {
            if (selectedPreset === "custom") {
              setIsEndOpen(!isEndOpen)
              setIsStartOpen(false)
            }
          }}
          className={cn(
            "w-[140px] justify-start text-left font-normal bg-card border-border",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.to ? format(dateRange.to, "yyyy-MM-dd", { locale: ko }) : "종료일"}
        </Button>
        {isEndOpen && selectedPreset === "custom" && (
          <div 
            ref={endCalendarRef}
            className="absolute top-full left-0 z-50 mt-2 rounded-md border bg-popover shadow-lg"
            style={{ minWidth: '320px' }}
          >
            <div className="p-3">
              <ReactCalendar
                value={tempEndDate || new Date()}
                onChange={(value) => {
                  if (value instanceof Date) {
                    setTempEndDate(value)
                  }
                }}
                locale="ko-KR"
                className="border-0"
                maxDate={new Date()}
                formatDay={(locale, date) => date.getDate().toString()}
              />
            </div>
            <div className="flex items-center justify-end gap-2 p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTempEndDate(dateRange.to)
                  setIsEndOpen(false)
                }}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (tempStartDate && tempEndDate) {
                    onDateRangeChange({ 
                      from: tempStartDate, 
                      to: tempEndDate 
                    })
                    // 날짜 변경 후 페이지 리로드 (localStorage에 저장 후)
                    setTimeout(() => {
                      window.location.reload()
                    }, 100)
                  }
                  setIsEndOpen(false)
                }}
              >
                확인
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
