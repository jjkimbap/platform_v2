"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CountryHeatmapECharts from "@/components/country-heatmap-echarts"
import { AbnormalScanTrend } from "@/components/abnormal-scan-trend"
import { ReportTrend } from "@/components/report-trend"
import { AppTrend } from "@/components/app-trend"
import { sampleReports } from "@/lib/report-data"

interface PlatformCountryDistributionAndTrendProps {
  selectedCountry: string
  onCountrySelect: (country: string) => void
}

export function PlatformCountryDistributionAndTrend({
  selectedCountry,
  onCountrySelect
}: PlatformCountryDistributionAndTrendProps) {
  const [selectedMetric, setSelectedMetric] = useState<"실행" | "스캔" | "비정상 스캔" | "제보">("비정상 스캔")

  const handleCountrySelect = (country: string) => {
    onCountrySelect(country)
  }

  // 제보 데이터 기반 국가별 분포 데이터 생성
  const reportCountryData = useMemo(() => {
    const countryCounts: Record<string, number> = {}
    sampleReports.forEach(report => {
      countryCounts[report.country] = (countryCounts[report.country] || 0) + 1
    })
    return Object.entries(countryCounts).map(([name, value]) => ({
      name,
      value
    }))
  }, [])

  return (
    <div className="space-y-4">
      {/* Select Box for 실행/스캔 */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-2xl font-semibold">국가별 분포 및 추이</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">원하는 국가 클릭시 해당 국가의 지표 확인이 가능합니다.</span>
          <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as "실행" | "스캔" | "비정상 스캔" | "제보")}>
            <SelectTrigger className="w-[140px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
              <SelectItem value="비정상 스캔" className="cursor-pointer hover:bg-blue-50">비정상 스캔</SelectItem>
              <SelectItem value="제보" className="cursor-pointer hover:bg-blue-50">제보</SelectItem>
              <SelectItem value="실행" className="cursor-pointer hover:bg-blue-50">실행</SelectItem>
              <SelectItem value="스캔" className="cursor-pointer hover:bg-blue-50">스캔</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* 국가별 히트맵 */}
            <CountryHeatmapECharts 
              height="h-[500px]"
              title={`국가별 ${selectedMetric} 분포도`}
              onCountrySelect={handleCountrySelect}
              selectedCountry={selectedCountry}
              data={selectedMetric === "제보" ? reportCountryData : undefined}
            />

            {/* 비정상 스캔인 경우 추이 그래프, 제보인 경우 제보 추이, 실행/스캔인 경우 앱별 추이 */}
            {selectedMetric === "비정상 스캔" ? (
              <AbnormalScanTrend selectedCountry={selectedCountry} />
            ) : selectedMetric === "제보" ? (
              <ReportTrend selectedCountry={selectedCountry} />
            ) : selectedMetric === "실행" || selectedMetric === "스캔" ? (
              <AppTrend selectedCountry={selectedCountry} metricType={selectedMetric} />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

