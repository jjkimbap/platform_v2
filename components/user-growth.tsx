"use client"

import { useState, useEffect } from "react"
import { UserPlus } from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { MetricModal } from "@/components/metric-modal"
import { TrendChart } from "@/components/trend-chart"
import { useDateRange } from "@/hooks/use-date-range"
import { fetchUserJoinPath, formatDateForAPI, transformDataForChart, UserJoinPathResponse } from "@/lib/api"

export function UserGrowth() {
  const [modalOpen, setModalOpen] = useState(false)
  const [data, setData] = useState<UserJoinPathResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { dateRange } = useDateRange()

  // 데이터 로딩 함수
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const startDate = formatDateForAPI(dateRange.from)
      const endDate = formatDateForAPI(dateRange.to)
      
      // 디버깅을 위한 로그
      console.log('Date Range:', dateRange)
      console.log('Formatted Start Date:', startDate)
      console.log('Formatted End Date:', endDate)
      
      const result = await fetchUserJoinPath('daily', startDate, endDate)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 날짜 범위가 변경될 때마다 데이터 다시 로드
  useEffect(() => {
    loadData()
  }, [dateRange.from, dateRange.to])

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">사용자 성장</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="스캔 기기 가입입 전환율"
          value="24.8%"
          icon={<UserPlus className="h-5 w-5" />}
          onClick={() => setModalOpen(true)}
        />
      </div>

      <MetricModal open={modalOpen} onOpenChange={setModalOpen} title="신규 회원 유입 경로 분석">
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">데이터를 불러오는 중...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-red-500">오류: {error}</div>
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">앱 유입</p>
                  <p className="text-2xl font-bold text-chart-1">
                    {data.total.appUserCount.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">커머스 유입</p>
                  <p className="text-2xl font-bold text-chart-2">
                    {data.total.commerceUserCount.toLocaleString()}
                  </p>
                </div>
              </div>
              <TrendChart
                data={transformDataForChart(data.data)}
                lines={[
                  { dataKey: "app", name: "앱 유입", color: "#3b82f6" },
                  { dataKey: "commerce", name: "커머스 유입", color: "#f59e0b" },
                ]}
                height={350}
              />
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">데이터가 없습니다.</div>
            </div>
          )}
        </div>
      </MetricModal>
    </section>
  )
}
