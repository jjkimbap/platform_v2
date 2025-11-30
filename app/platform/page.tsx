"use client"

import { PlatformDashboardHeader } from "@/components/platform-dashboard-header"
import { PlatformActivityMetrics } from "@/components/platform-activity-metrics"
import { PlatformTrendChartsSection } from "@/components/platform-trend-charts-section"
import { PlatformRankingAccordions } from "@/components/platform-ranking-accordions"
import { PlatformComprehensiveMetrics } from "@/components/platform-comprehensive-metrics"
import { PlatformCountryDistributionAndTrend } from "@/components/platform-country-distribution-and-trend"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"
import { findActiveSection, rafThrottle } from "@/lib/platform-utils"

export default function PlatformPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("전체")
  const [activeSection, setActiveSection] = useState<string>("")
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

  const scrollToSection = useCallback((sectionId: string) => {
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
  }, [])

  // 섹션 ID 배열을 useMemo로 메모이제이션
  const sectionIds = useMemo(() => [
    "comprehensive-metrics",
    "trend-analysis",
    "country-distribution",
    "activity-metrics",
    "ranking-analysis"
  ], [])

  useEffect(() => {
    // Intersection Observer를 사용한 빠르고 정확한 섹션 감지
    const observerOptions = {
      root: null,
      rootMargin: `-120px 0px -60% 0px`,
      threshold: [0, 0.25, 0.5, 0.75, 1] // 성능 최적화를 위해 threshold 간소화
    }

    const sectionElements = sectionIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    
    if (sectionElements.length === 0) {
      // Fallback: requestAnimationFrame 기반 쓰로틀 사용
      const handleScroll = rafThrottle(() => {
        const currentSection = findActiveSection(sectionIds, 140)
        setActiveSection(currentSection)
      })

      window.addEventListener("scroll", handleScroll, { passive: true })
      handleScroll()
      
      const timeoutId = setTimeout(() => {
        handleScroll()
      }, 300)

      return () => {
        window.removeEventListener("scroll", handleScroll)
        clearTimeout(timeoutId)
      }
    }

    // 각 섹션의 상태를 추적
    const sectionStates = new Map<string, { isIntersecting: boolean; ratio: number; top: number; bottom: number }>()

    const updateActiveSection = () => {
      // 현재 뷰포트 중앙 지점 계산
      const viewportCenter = window.innerHeight / 2 + window.scrollY
      
      let activeId = sectionIds[0]
      let bestScore = -Infinity

      // 각 섹션의 점수 계산 (중앙에 가까울수록 높은 점수)
      sectionStates.forEach((state, id) => {
        if (!state.isIntersecting) return
        
        const section = document.getElementById(id)
        if (!section) return
        
        const rect = section.getBoundingClientRect()
        const sectionTop = window.scrollY + rect.top
        const sectionBottom = window.scrollY + rect.bottom
        const sectionCenter = (sectionTop + sectionBottom) / 2
        
        // 뷰포트 중앙과 섹션 중앙의 거리 계산
        const distanceFromCenter = Math.abs(viewportCenter - sectionCenter)
        
        // 섹션이 헤더 오프셋 이하에 있고, 교차 중일 때만 고려
        if (rect.top <= 140 && rect.bottom > 140) {
          // 점수: intersectionRatio가 높고, 중앙에 가까울수록 높음
          const score = state.ratio * 100 - (distanceFromCenter / 100)
          
          if (score > bestScore) {
            bestScore = score
            activeId = id
          }
        }
      })

      // 적합한 섹션을 찾지 못한 경우, 가장 위에 있는 섹션 선택
      if (bestScore === -Infinity) {
        let minTop = Infinity
        sectionStates.forEach((state, id) => {
          const section = document.getElementById(id)
          if (section) {
            const rect = section.getBoundingClientRect()
            if (rect.top <= 140 && rect.top < minTop) {
              minTop = rect.top
              activeId = id
            }
          }
        })
      }

      setActiveSection(activeId)
    }

    const observer = new IntersectionObserver((entries) => {
      // 각 엔트리의 상태 업데이트
      entries.forEach(entry => {
        sectionStates.set(entry.target.id, {
          isIntersecting: entry.isIntersecting,
          ratio: entry.intersectionRatio,
          top: entry.boundingClientRect.top,
          bottom: entry.boundingClientRect.bottom
        })
      })

      // 즉시 업데이트 (debounce 제거)
      updateActiveSection()
    }, observerOptions)

    // 모든 섹션 관찰 시작
    sectionElements.forEach(element => {
      observer.observe(element)
      // 초기 상태 설정
      const rect = element.getBoundingClientRect()
      sectionStates.set(element.id, {
        isIntersecting: rect.top <= 140 && rect.bottom > 140,
        ratio: 0,
        top: rect.top,
        bottom: rect.bottom
      })
    })

    // 초기 활성 섹션 설정
    const initialSection = findActiveSection(sectionIds, 140)
    setActiveSection(initialSection)

    // 스크롤 이벤트도 함께 사용하여 즉각적인 감지
    const handleScroll = rafThrottle(() => {
      updateActiveSection()
    })

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      sectionStates.clear()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [sectionIds])

  const navItems = useMemo(() => [
    { id: "comprehensive-metrics", label: "앱 종합 지표" },
    { id: "trend-analysis", label: "앱 관련 추이 분석" },
    { id: "country-distribution", label: "국가별 분포 및 추이" },
    { id: "activity-metrics", label: "제보 및 비정상 스캔 정보" },
    { id: "ranking-analysis", label: "랭킹 분석" }
  ], [])

  return (
    <div className="min-h-screen bg-background">
      {/* 고정 헤더 및 네비게이션 */}
      <div className="sticky top-0 z-50 bg-background">
      <PlatformDashboardHeader />
        
        {/* 고정 네비게이션 바 */}
        <div className="border-b border-border shadow-sm bg-background">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-6 overflow-x-auto py-3 justify-start">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "px-4 py-2 text-base font-semibold whitespace-nowrap rounded-md transition-all",
                    activeSection === item.id
                      ? "text-xl text-foreground"
                      : "text-muted-foreground hover:text-xl hover:text-foreground"
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
