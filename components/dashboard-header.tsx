"use client"
import { DateRangePicker } from "@/components/date-range-picker"
import { RealtimeIndicator } from "@/components/realtime-indicator"
import { useDateRange } from "@/hooks/use-date-range"

interface DashboardHeaderProps {
  onRealtimeToggle?: (isOpen: boolean) => void
}

export function DashboardHeader({ onRealtimeToggle }: DashboardHeaderProps) {
  const { dateRange, setDateRange } = useDateRange()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="w-full px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground lg:text-2xl">플랫폼 관제 시스템</h1>
          </div>

          <div className="flex items-center gap-3">
            <DateRangePicker 
              dateRange={dateRange} 
              onDateRangeChange={setDateRange}
            />
            <RealtimeIndicator onToggle={onRealtimeToggle} />
          </div>
        </div>
      </div>
    </header>
  )
}
