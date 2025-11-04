"use client"

import { PlatformDashboardHeader } from "@/components/platform-dashboard-header"
import { PlatformActivityMetrics } from "@/components/platform-activity-metrics"
import { PlatformTrendChartsSection } from "@/components/platform-trend-charts-section"
import { PlatformRankingAccordions } from "@/components/platform-ranking-accordions"
import { PlatformComprehensiveMetrics } from "@/components/platform-comprehensive-metrics"
import { PlatformCountryDistributionAndTrend } from "@/components/platform-country-distribution-and-trend"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function PlatformPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("전체")
  const [activeSection, setActiveSection] = useState<string>("")

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 140 // 헤더 + 네비게이션 바 높이 고려
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "comprehensive-metrics",
        "trend-analysis",
        "country-distribution",
        "activity-metrics",
        "ranking-analysis"
      ]

      const headerOffset = 140 // 헤더 + 네비게이션 바 높이
      
      // 각 섹션의 시작 위치를 기준으로 가장 가까운 섹션 찾기
      let currentSection = sections[0] // 기본값은 첫 번째 섹션

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section) {
          const rect = section.getBoundingClientRect()
          // 섹션의 시작 위치가 헤더 아래에 있는지 확인
          if (rect.top <= headerOffset) {
            currentSection = sections[i]
            break
          }
        }
      }

      setActiveSection(currentSection)
    }

    // 스크롤 이벤트 리스너 추가
    window.addEventListener("scroll", handleScroll, { passive: true })
    
    // 초기 실행 및 약간의 지연 후 다시 실행 (DOM 렌더링 완료 대기)
    handleScroll()
    const timeoutId = setTimeout(handleScroll, 100)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timeoutId)
    }
  }, [])

  const navItems = [
    { id: "comprehensive-metrics", label: "앱 종합 지표" },
    { id: "trend-analysis", label: "앱 관련 추이 분석" },
    { id: "country-distribution", label: "국가별 분포 및 추이" },
    { id: "activity-metrics", label: "제보 및 비정상 스캔 정보" },
    { id: "ranking-analysis", label: "랭킹 분석" }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* 고정 헤더 및 네비게이션 */}
      <div className="sticky top-0 z-50 bg-background">
        <PlatformDashboardHeader />
        
        {/* 고정 네비게이션 바 */}
        <div className="border-b border-border shadow-sm bg-background">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-6 overflow-x-auto py-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
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
