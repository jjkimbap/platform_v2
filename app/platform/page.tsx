"use client"

import { PlatformDashboardHeader } from "@/components/platform-dashboard-header"
import { PlatformActivityMetrics } from "@/components/platform-activity-metrics"
import { PlatformTrendChartsSection } from "@/components/platform-trend-charts-section"
import { PlatformRankingAccordions } from "@/components/platform-ranking-accordions"
import { PlatformComprehensiveMetrics } from "@/components/platform-comprehensive-metrics"
import { PlatformCountryDistributionAndTrend } from "@/components/platform-country-distribution-and-trend"
import { useState, useCallback, useRef } from "react"

export default function PlatformPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("전체")
  const prevSelectedCountryRef = useRef<string | null>(null)

  const handleCountrySelect = useCallback((country: string) => {
    // 같은 국가를 다시 클릭하면 "전체"로 변경
    if (selectedCountry === country && country !== "전체") {
      setSelectedCountry("전체")
      prevSelectedCountryRef.current = null
    } else {
    setSelectedCountry(country)
      prevSelectedCountryRef.current = country
    }
  }, [selectedCountry])

  return (
    <div className="min-h-screen bg-background">
      {/* 고정 헤더 */}
      <div className="sticky top-0 z-50 bg-background">
        <PlatformDashboardHeader />
      </div>

      <main className="w-full px-4 py-6 space-y-8">
        {/* 종합 지표 */}
        <div id="comprehensive-metrics">
        <PlatformComprehensiveMetrics />
        </div>

        {/* 추이 차트 섹션 */}
        <div id="trend-analysis" className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground">앱 관련 추이 분석</h2>

            {/* 달성률 색상 범례 */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">달성률:</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span className="text-xs text-muted-foreground">≤50%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span className="text-xs text-muted-foreground">51-79%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-xs text-muted-foreground">≥80%</span>
              </div>
            </div>
          </div>

          <PlatformTrendChartsSection selectedCountry={selectedCountry} />
        </div>

        {/* 국가별 분포 및 추이 */}
        <div id="country-distribution">
          <PlatformCountryDistributionAndTrend 
            selectedCountry={selectedCountry}
              onCountrySelect={handleCountrySelect}
          />
        </div>

        {/* 제보 및 비정상 스캔 정보 */}
        <div id="activity-metrics" className="space-y-4">
          <PlatformActivityMetrics selectedCountry={selectedCountry} />
          </div>
        {/* 랭킹 분석 */}
        <div id="ranking-analysis" className="space-y-4">
          <PlatformRankingAccordions 
            selectedCountry={selectedCountry}
          />
        </div>

        
      </main>
    </div>
  )
}
