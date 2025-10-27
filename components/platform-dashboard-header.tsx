"use client"
import { DateRangePicker } from "@/components/date-range-picker"
import { RealtimeIndicator } from "@/components/realtime-indicator"
import { useDateRange } from "@/hooks/use-date-range"
import { useState } from "react"
import { MetricModal } from "@/components/metric-modal"
import { TrendChart } from "@/components/trend-chart"

interface DashboardHeaderProps {
  onRealtimeToggle?: (isOpen: boolean) => void
}

export function PlatformDashboardHeader({ onRealtimeToggle }: DashboardHeaderProps) {
  const { dateRange, setDateRange } = useDateRange()
  const [marketRegistrationModalOpen, setMarketRegistrationModalOpen] = useState(false)

  // 마켓 등록율 데이터
  const marketRegistrationData = {
    totalRate: 94.8,
    normal: 37,
    unregistered: 2,
    registering: 1
  }

  // 마켓 등록율 추이 데이터
  const marketRegistrationTrendData = [
    { date: "1월", rate: 92.5 },
    { date: "2월", rate: 93.2 },
    { date: "3월", rate: 94.1 },
    { date: "4월", rate: 94.8 },
    { date: "5월", rate: 95.2 },
    { date: "6월", rate: 94.8 }
  ]

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
        <div className="w-full px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-foreground lg:text-2xl">플랫폼 관제 시스템</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* 마켓 등록율 표시 */}
              <div 
                className="flex items-center gap-0 px-3 py-1 bg-card border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setMarketRegistrationModalOpen(true)}
              >
                <div className="text-sm">
                  <span className="font-semibold">마켓 등록율</span>
                  <span className="ml-2 text-lg font-bold text-green-600">{marketRegistrationData.totalRate}%</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({marketRegistrationData.normal}개/총 {marketRegistrationData.unregistered + marketRegistrationData.normal}개)
                  </span>
                </div>
              </div>
              
              <DateRangePicker 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange}
              />
              <RealtimeIndicator onToggle={onRealtimeToggle} />
            </div>
          </div>
        </div>
      </header>

      {/* 마켓 등록율 상세 모달 */}
      <MetricModal open={marketRegistrationModalOpen} onOpenChange={setMarketRegistrationModalOpen} title="마켓 등록율 상세">
        <div className="space-y-6">
          {/* 전체 등록율 요약 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{marketRegistrationData.normal}</div>
              <div className="text-sm text-green-700">정상 등록</div>
            </div>
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{marketRegistrationData.unregistered}</div>
              <div className="text-sm text-red-700">미등록</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{marketRegistrationData.registering}</div>
              <div className="text-sm text-yellow-700">등록중</div>
            </div>
          </div>

          {/* 마켓별 등록 현황 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">마켓별 등록 현황</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium">Google Play Store</span>
                <span className="text-green-600 font-semibold">정상</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium">Apple App Store</span>
                <span className="text-green-600 font-semibold">정상</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="font-medium">Samsung Galaxy Store</span>
                <span className="text-yellow-600 font-semibold">등록중</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="font-medium">Huawei AppGallery</span>
                <span className="text-red-600 font-semibold">미등록</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="font-medium">Xiaomi GetApps</span>
                <span className="text-red-600 font-semibold">미등록</span>
              </div>
            </div>
          </div>

          {/* 등록율 추이 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">등록율 추이</h3>
            <div className="h-64">
              <TrendChart 
                data={marketRegistrationTrendData} 
                lines={[
                  { key: "rate", label: "등록율", color: "#10b981" }
                ]}
              />
            </div>
          </div>
        </div>
      </MetricModal>
    </>
  )
}
