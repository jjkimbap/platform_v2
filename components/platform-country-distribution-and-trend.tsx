"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CountryHeatmapECharts from "@/components/country-heatmap-echarts"
import { AbnormalScanTrend } from "@/components/abnormal-scan-trend"
import { ReportTrend } from "@/components/report-trend"
import { AppTrend } from "@/components/app-trend"
import { fetchCountryDistribution, fetchInvalidScanCountryDistribution, formatDateForAPI, getTodayDateString, CountryDistributionData } from "@/lib/api"
import { useDateRange } from "@/hooks/use-date-range"

interface PlatformCountryDistributionAndTrendProps {
  selectedCountry: string
  onCountrySelect: (country: string) => void
}

export function PlatformCountryDistributionAndTrend({
  selectedCountry,
  onCountrySelect
}: PlatformCountryDistributionAndTrendProps) {
  const [selectedMetric, setSelectedMetric] = useState<"실행" | "스캔" | "비정상 스캔" | "제보">("제보")
  const [countryDistributionData, setCountryDistributionData] = useState<CountryDistributionData[]>([])
  const [invalidScanCountryData, setInvalidScanCountryData] = useState<CountryDistributionData[]>([])
  const [loading, setLoading] = useState(false)

  // 전역 날짜 범위 사용
  const { dateRange } = useDateRange()
  
  // 날짜 범위를 문자열로 변환
  const startDate = dateRange?.from ? formatDateForAPI(dateRange.from) : '2025-01-01'
  const endDate = dateRange?.to ? formatDateForAPI(dateRange.to) : getTodayDateString()

  // API에서 국가별 제보 분포도 데이터 가져오기
  useEffect(() => {
    const loadCountryDistribution = async () => {
      if (selectedMetric === "제보") {
        setLoading(true)
        try {
          const data = await fetchCountryDistribution(startDate, endDate)
          setCountryDistributionData(data)
        } catch (error) {
          console.error('Failed to load country distribution data:', error)
          setCountryDistributionData([])
        } finally {
          setLoading(false)
        }
      } else {
        setCountryDistributionData([])
      }
    }
    loadCountryDistribution()
  }, [selectedMetric, startDate, endDate])

  // API에서 비정상 스캔 국가별 분포도 데이터 가져오기
  useEffect(() => {
    const loadInvalidScanCountryDistribution = async () => {
      if (selectedMetric === "비정상 스캔") {
        setLoading(true)
        try {
          console.log(`📡 [비정상스캔-분포도] 요청: ${startDate} ~ ${endDate}`)
          const data = await fetchInvalidScanCountryDistribution(startDate, endDate)
          console.log(`✅ [비정상스캔-분포도] 응답: ${data.length}개 국가`)
          setInvalidScanCountryData(data)
        } catch (error) {
          console.error('❌ [비정상스캔-분포도] 실패:', error instanceof Error ? error.message : String(error))
          setInvalidScanCountryData([])
        } finally {
          setLoading(false)
        }
      } else {
        setInvalidScanCountryData([])
      }
    }
    loadInvalidScanCountryDistribution()
  }, [selectedMetric, startDate, endDate])

  const handleCountrySelect = (country: string) => {
    onCountrySelect(country)
  }

  // 국가별 분포 데이터 생성 (API 데이터 사용)
  const reportCountryData = useMemo(() => {
    if (selectedMetric === "제보" && countryDistributionData.length > 0) {
      // 제보 API 데이터 사용
      return countryDistributionData.map(item => ({
        name: item.regCountry,
        value: item.count
      }))
    }
    
    if (selectedMetric === "비정상 스캔" && invalidScanCountryData.length > 0) {
      // 비정상 스캔 API 데이터 사용
      return invalidScanCountryData.map(item => ({
        name: item.regCountry,
        value: item.count
      }))
    }
    
    // API 데이터가 없으면 빈 배열 반환
    return []
  }, [selectedMetric, countryDistributionData, invalidScanCountryData])

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
            <SelectItem value="제보" className="cursor-pointer hover:bg-blue-50">제보</SelectItem>
            <SelectItem value="비정상 스캔" className="cursor-pointer hover:bg-blue-50">비정상 스캔</SelectItem>
              {/* <SelectItem value="실행" className="cursor-pointer hover:bg-blue-50">실행</SelectItem>
              <SelectItem value="스캔" className="cursor-pointer hover:bg-blue-50">스캔</SelectItem> */}
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
              data={selectedMetric === "제보" || selectedMetric === "비정상 스캔" ? reportCountryData : undefined}
            />

            {/* 비정상 스캔인 경우 추이 그래프, 제보인 경우 제보 추이, 실행/스캔인 경우 앱별 추이 */}
            {selectedMetric === "비정상 스캔" ? (
              <AbnormalScanTrend 
                selectedCountry={selectedCountry} 
                filterCountry={selectedCountry === "전체" ? null : selectedCountry}
              />
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

