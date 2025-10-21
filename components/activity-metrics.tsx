"use client"

import { useState, useEffect } from "react"
import { Users, Scan, MessageSquare, AlertTriangle, UserPlus, MessageCircle, BarChart3, Mail } from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { MetricModal } from "@/components/metric-modal"
import { TrendChart } from "@/components/trend-chart"
import { BackToBackBarChart } from "@/components/back-to-back-bar-chart"
import PositiveNegativeBarChart from "@/components/positive-negative-bar-chart"
import CountryPieChart from "@/components/country-pie-chart"
import CountryHeatmap from "@/components/country-heatmap"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useDateRange } from "@/hooks/use-date-range"
import { activityMetricsData } from "@/lib/metrics-data"
import { format, subDays } from "date-fns"
import { Card } from "@/components/ui/card"

// Mock data - replace with actual API calls
const mockDauData = [
  { date: "1일", current: 12500, previous: 11800 },
  { date: "2일", current: 13200, previous: 12400 },
  { date: "3일", current: 12800, previous: 12100 },
  { date: "4일", current: 14100, previous: 13300 },
  { date: "5일", current: 13900, previous: 13100 },
  { date: "6일", current: 15200, previous: 14400 },
  { date: "7일", current: 15800, previous: 15000 },
]

// 미니 차트용 추이 데이터
const executionTrendData = [
  { value: 12000 },
  { value: 4000 },
  { value: 12200 },
  { value: 1000 },
  { value: 13200 },
  { value: 4000 },
  { value: 15800 },
]

const scanTrendData = [
  { value: 9500 },
  { value: 10200 },
  { value: 9800 },
  { value: 10800 },
  { value: 10500 },
  { value: 11800 },
  { value: 12340 },
]


// 메인 페이지용 실행 많은 국가 데이터 (상위 4개 + 그 외)
const topExeCountryData = [
  { label: "중국", value: "12,450회", color: "#3b82f6" },
  { label: "한국", value: "10,720회", color: "#10b981" },
  { label: "베트남", value: "8,890회", color: "#f59e0b" },
  { label: "미국", value: "6,720회", color: "#8b5cf6" },
  { label: "그 외", value: "2,380회", color: "#ef4444" },
]

// 모달용 전체 국가 데이터 (8개)
const allCountryData = [
  { label: "중국", value: "12,450회", color: "#3b82f6" },
  { label: "한국", value: "10,720회", color: "#10b981" },
  { label: "베트남", value: "8,890회", color: "#f59e0b" },
  { label: "미국", value: "6,720회", color: "#8b5cf6" },
  { label: "일본", value: "4,580회", color: "#ef4444" },
  { label: "태국", value: "3,240회", color: "#06b6d4" },
  { label: "인도네시아", value: "2,890회", color: "#84cc16" },
  { label: "기타", value: "2,380회", color: "#f97316" },
]

// 프리랜딩 답변율 성별/나잇대 데이터 (이미지 기준)
const freelancingBarData = [
  { category: "10대", male: 154, female: 405 },
  { category: "20대", male: 387, female: 2060 },
  { category: "30대", male: 384, female: 1725 },
  { category: "40대", male: 177, female: 720 },
  { category: "50대 이상", male: 73, female: 136 },
]

// 미니 차트용 데이터 (기존 카드용)
const freelancingMiniData = [
  { name: "20대", male: 65, female: 72 },
  { name: "30대", male: 78, female: 85 },
  { name: "40대", male: 82, female: 88 },
]

// 저조업체 데이터
const lowPerformingVendors = [
  { id: 1, name: "업체 A", responseRate: 35, scanCount: "1,245회", managerName: "김철수", contact: "vendor-a@example.com" },
  { id: 2, name: "업체 B", responseRate: 42, scanCount: "892회", managerName: "이영희", contact: "vendor-b@example.com" },
  { id: 3, name: "업체 C", responseRate: 28, scanCount: "2,156회", managerName: "박민수", contact: "vendor-c@example.com" },
  { id: 4, name: "업체 D", responseRate: 48, scanCount: "743회", managerName: "정수진", contact: "vendor-d@example.com" },
]
// 가장 낮은 업체 TOP3 데이터
const lowestVendorsData = [
  { label: "업체 C", value: "28%", color: "#ef4444" },
  { label: "업체 A", value: "35%", color: "#f97316" },
  { label: "업체 B", value: "42%", color: "#eab308" },
]
// 마켓 등록율 데이터
const marketRegistrationData = [
  { date: "1월", value: 85.2 },
  { date: "2월", value: 87.5 },
  { date: "3월", value: 89.1 },
  { date: "4월", value: 91.3 },
  { date: "5월", value: 88.7 },
  { date: "6월", value: 92.4 },
  { date: "7월", value: 94.8 },
]

const mockWauData = [
  { date: "1주", value: 45000 },
  { date: "2주", value: 48000 },
  { date: "3주", value: 52000 },
  { date: "4주", value: 55000 },
]

const mockMauData = [
  { date: "1월", value: 180000 },
  { date: "2월", value: 195000 },
  { date: "3월", value: 210000 },
  { date: "4월", value: 225000 },
]

export function ActivityMetrics() {
  const [executionModalOpen, setExecutionModalOpen] = useState(false)
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [conversionModalOpen, setConversionModalOpen] = useState(false)
  const [marketRegistrationModalOpen, setMarketRegistrationModalOpen] = useState(false)
  const [newInflowModalOpen, setNewInflowModalOpen] = useState(false)
  const [communityPostsModalOpen, setCommunityPostsModalOpen] = useState(false)
  const [communityMetricType, setCommunityMetricType] = useState("posts")
  const [newChatModalOpen, setNewChatModalOpen] = useState(false)
  const [vendorAlertModalOpen, setVendorAlertModalOpen] = useState(false)
  const [freelancingModalOpen, setFreelancingModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState("question1")
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [scanDauData, setScanDauData] = useState(mockDauData)
  const [scanWauData, setScanWauData] = useState(mockWauData)
  const [scanMauData, setScanMauData] = useState(mockMauData)
  const [conversionData, setConversionData] = useState<Array<{ date: string; conversion: number }>>([])
  
  // 코호트 분석 상태
  const [cohortAnalysisModalOpen, setCohortAnalysisModalOpen] = useState(false)
  const [eventDate, setEventDate] = useState(subDays(new Date(), 7))
  const [analysisPeriod, setAnalysisPeriod] = useState<'7일' | '30일'>('7일')
  const [metricType, setMetricType] = useState<'실행' | '신규회원'>('신규회원')
  const [cohortData, setCohortData] = useState<Array<{ date: string; value: number }>>([])
  
  const { toast } = useToast()
  const { dateRange } = useDateRange()

  // 코호트 분석 데이터 생성 함수
  const generateCohortData = () => {
    const days = analysisPeriod === '7일' ? 7 : 30
    const startDate = subDays(eventDate, days)
    const endDate = subDays(new Date(), 0)
    
    const data = []
    for (let i = 0; i < days * 2 + 1; i++) {
      const currentDate = subDays(eventDate, days - i)
      if (currentDate <= endDate) {
        const isEventDay = currentDate.toDateString() === eventDate.toDateString()
        let value
        
        if (metricType === '신규회원') {
          // 신규회원 데이터 (이벤트 전후 패턴)
          if (isEventDay) {
            value = 200
          } else if (i < days) {
            // 이벤트 전
            value = 120 + Math.random() * 20
          } else {
            // 이벤트 후
            value = 150 + Math.random() * 20
          }
        } else {
          // 실행 데이터 (이벤트 전후 패턴)
          if (isEventDay) {
            value = 3400
          } else if (i < days) {
            // 이벤트 전
            value = 2800 + Math.random() * 200
          } else {
            // 이벤트 후
            value = 3100 + Math.random() * 200
          }
        }
        
        data.push({
          date: format(currentDate, 'MM/dd'),
          value: Math.round(value)
        })
      }
    }
    
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  useEffect(() => {
    setMounted(true)
    // 클라이언트 사이드에서만 계산 실행
    setScanDauData(mockDauData.map((d) => ({
      ...d,
      value: Math.floor(d.current * 0.78),
    })))
    setScanWauData(mockWauData.map((d) => ({
      ...d,
      value: Math.floor(d.value * 0.78),
    })))
    setScanMauData(mockMauData.map((d) => ({
      ...d,
      value: Math.floor(d.value * 0.78),
    })))
    setConversionData(mockDauData.map((d, i) => ({
      date: d.date,
      conversion: 75 + i * 0.5,
    })))
    
    // 코호트 분석 데이터 초기화
    setCohortData(generateCohortData())
  }, [])

  // 코호트 분석 관련 상태 변경 시 데이터 업데이트
  useEffect(() => {
    setCohortData(generateCohortData())
  }, [eventDate, analysisPeriod, metricType])

  // 업체 선택/해제 함수
  const toggleVendor = (vendorId: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    )
  }

  // 이메일 발송 함수
  const handleSendEmail = () => {
    if (selectedVendors.length === 0) {
      toast({
        title: "업체를 선택해주세요",
        description: "알림을 전송할 업체를 선택해주세요.",
        variant: "destructive"
      })
      return
    }

    const selectedVendorNames = lowPerformingVendors
      .filter(vendor => selectedVendors.includes(vendor.id.toString()))
      .map(vendor => vendor.name)
      .join(", ")

    toast({
      title: "알림 전송 완료",
      description: `${selectedVendorNames} 담당자에게 답변율 개선 알림이 전송되었습니다.`,
    })

    // 선택 초기화
    setSelectedVendors([])
  }

  return (
    <section className="space-y-4 w-full">
      
      <div className="grid gap-3" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
        <div>
          <div className="p-4 bg-card border border-border rounded-lg h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm text-muted-foreground font-medium">실행 활성 국가</h3>
                <button
          onClick={() => setExecutionModalOpen(true)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  → 더 많은 국가 보기
                </button>
              </div>
              
              {/* 파이차트와 히트맵을 좌우로 배치 */}
              <div className="grid grid-cols-2 gap-4 h-64">
                {/* 좌측: 파이차트 */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">국가별 실행 분포</h4>
                  <div className="h-full flex items-center justify-center">
                    <CountryPieChart 
                      data={topExeCountryData} 
                      onCountryClick={(country) => setSelectedCountry(country)}
                      size="small"
                      showLegend={true}
                    />
                  </div>
                </div>

                {/* 우측: 히트맵 */}
                <div className="space-y-2">
                  {selectedCountry ? (
                    <>
                      <h4 className="text-sm font-medium text-foreground">{selectedCountry} 실행 시각 분포</h4>
                      <div className="h-full flex items-center justify-center">
                        {selectedCountry === "중국" && (
                          <CountryHeatmap 
                            country="중국" 
                            data={[
                              { day: '월', hour: 0, value: 45 }, { day: '월', hour: 3, value: 32 }, { day: '월', hour: 6, value: 28 }, { day: '월', hour: 9, value: 65 }, { day: '월', hour: 12, value: 89 }, { day: '월', hour: 15, value: 95 }, { day: '월', hour: 18, value: 78 }, { day: '월', hour: 21, value: 52 },
                              { day: '화', hour: 0, value: 38 }, { day: '화', hour: 3, value: 25 }, { day: '화', hour: 6, value: 35 }, { day: '화', hour: 9, value: 72 }, { day: '화', hour: 12, value: 95 }, { day: '화', hour: 15, value: 88 }, { day: '화', hour: 18, value: 82 }, { day: '화', hour: 21, value: 48 },
                              { day: '수', hour: 0, value: 42 }, { day: '수', hour: 3, value: 28 }, { day: '수', hour: 6, value: 38 }, { day: '수', hour: 9, value: 68 }, { day: '수', hour: 12, value: 92 }, { day: '수', hour: 15, value: 85 }, { day: '수', hour: 18, value: 75 }, { day: '수', hour: 21, value: 45 },
                              { day: '목', hour: 0, value: 35 }, { day: '목', hour: 3, value: 22 }, { day: '목', hour: 6, value: 32 }, { day: '목', hour: 9, value: 58 }, { day: '목', hour: 12, value: 85 }, { day: '목', hour: 15, value: 78 }, { day: '목', hour: 18, value: 68 }, { day: '목', hour: 21, value: 42 },
                              { day: '금', hour: 0, value: 48 }, { day: '금', hour: 3, value: 35 }, { day: '금', hour: 6, value: 42 }, { day: '금', hour: 9, value: 75 }, { day: '금', hour: 12, value: 98 }, { day: '금', hour: 15, value: 92 }, { day: '금', hour: 18, value: 88 }, { day: '금', hour: 21, value: 55 },
                              { day: '토', hour: 0, value: 25 }, { day: '토', hour: 3, value: 18 }, { day: '토', hour: 6, value: 22 }, { day: '토', hour: 9, value: 45 }, { day: '토', hour: 12, value: 65 }, { day: '토', hour: 15, value: 58 }, { day: '토', hour: 18, value: 48 }, { day: '토', hour: 21, value: 32 },
                              { day: '일', hour: 0, value: 22 }, { day: '일', hour: 3, value: 15 }, { day: '일', hour: 6, value: 18 }, { day: '일', hour: 9, value: 38 }, { day: '일', hour: 12, value: 55 }, { day: '일', hour: 15, value: 48 }, { day: '일', hour: 18, value: 38 }, { day: '일', hour: 21, value: 28 },
                            ]} 
                            size="small"
                          />
                        )}
                        
                        {selectedCountry === "한국" && (
                          <CountryHeatmap 
                            country="한국" 
                            data={[
                              { day: '월', hour: 0, value: 25 }, { day: '월', hour: 3, value: 15 }, { day: '월', hour: 6, value: 35 }, { day: '월', hour: 9, value: 85 }, { day: '월', hour: 12, value: 95 }, { day: '월', hour: 15, value: 88 }, { day: '월', hour: 18, value: 75 }, { day: '월', hour: 21, value: 45 },
                              { day: '화', hour: 0, value: 22 }, { day: '화', hour: 3, value: 12 }, { day: '화', hour: 6, value: 38 }, { day: '화', hour: 9, value: 88 }, { day: '화', hour: 12, value: 98 }, { day: '화', hour: 15, value: 92 }, { day: '화', hour: 18, value: 82 }, { day: '화', hour: 21, value: 48 },
                              { day: '수', hour: 0, value: 28 }, { day: '수', hour: 3, value: 18 }, { day: '수', hour: 6, value: 42 }, { day: '수', hour: 9, value: 92 }, { day: '수', hour: 12, value: 95 }, { day: '수', hour: 15, value: 88 }, { day: '수', hour: 18, value: 78 }, { day: '수', hour: 21, value: 52 },
                              { day: '목', hour: 0, value: 32 }, { day: '목', hour: 3, value: 22 }, { day: '목', hour: 6, value: 45 }, { day: '목', hour: 9, value: 95 }, { day: '목', hour: 12, value: 98 }, { day: '목', hour: 15, value: 92 }, { day: '목', hour: 18, value: 85 }, { day: '목', hour: 21, value: 58 },
                              { day: '금', hour: 0, value: 35 }, { day: '금', hour: 3, value: 25 }, { day: '금', hour: 6, value: 48 }, { day: '금', hour: 9, value: 98 }, { day: '금', hour: 12, value: 95 }, { day: '금', hour: 15, value: 88 }, { day: '금', hour: 18, value: 82 }, { day: '금', hour: 21, value: 62 },
                              { day: '토', hour: 0, value: 18 }, { day: '토', hour: 3, value: 12 }, { day: '토', hour: 6, value: 25 }, { day: '토', hour: 9, value: 55 }, { day: '토', hour: 12, value: 75 }, { day: '토', hour: 15, value: 68 }, { day: '토', hour: 18, value: 58 }, { day: '토', hour: 21, value: 38 },
                              { day: '일', hour: 0, value: 15 }, { day: '일', hour: 3, value: 8 }, { day: '일', hour: 6, value: 22 }, { day: '일', hour: 9, value: 48 }, { day: '일', hour: 12, value: 68 }, { day: '일', hour: 15, value: 58 }, { day: '일', hour: 18, value: 45 }, { day: '일', hour: 21, value: 32 },
                            ]} 
                            size="small"
                          />
                        )}
                        
                        {selectedCountry === "베트남" && (
                          <CountryHeatmap 
                            country="베트남" 
                            data={[
                              { day: '월', hour: 0, value: 35 }, { day: '월', hour: 3, value: 25 }, { day: '월', hour: 6, value: 45 }, { day: '월', hour: 9, value: 75 }, { day: '월', hour: 12, value: 85 }, { day: '월', hour: 15, value: 78 }, { day: '월', hour: 18, value: 65 }, { day: '월', hour: 21, value: 48 },
                              { day: '화', hour: 0, value: 32 }, { day: '화', hour: 3, value: 22 }, { day: '화', hour: 6, value: 42 }, { day: '화', hour: 9, value: 78 }, { day: '화', hour: 12, value: 88 }, { day: '화', hour: 15, value: 82 }, { day: '화', hour: 18, value: 72 }, { day: '화', hour: 21, value: 52 },
                              { day: '수', hour: 0, value: 38 }, { day: '수', hour: 3, value: 28 }, { day: '수', hour: 6, value: 48 }, { day: '수', hour: 9, value: 82 }, { day: '수', hour: 12, value: 92 }, { day: '수', hour: 15, value: 85 }, { day: '수', hour: 18, value: 75 }, { day: '수', hour: 21, value: 58 },
                              { day: '목', hour: 0, value: 42 }, { day: '목', hour: 3, value: 32 }, { day: '목', hour: 6, value: 52 }, { day: '목', hour: 9, value: 85 }, { day: '목', hour: 12, value: 95 }, { day: '목', hour: 15, value: 88 }, { day: '목', hour: 18, value: 78 }, { day: '목', hour: 21, value: 62 },
                              { day: '금', hour: 0, value: 45 }, { day: '금', hour: 3, value: 35 }, { day: '금', hour: 6, value: 55 }, { day: '금', hour: 9, value: 88 }, { day: '금', hour: 12, value: 98 }, { day: '금', hour: 15, value: 92 }, { day: '금', hour: 18, value: 82 }, { day: '금', hour: 21, value: 68 },
                              { day: '토', hour: 0, value: 28 }, { day: '토', hour: 3, value: 18 }, { day: '토', hour: 6, value: 35 }, { day: '토', hour: 9, value: 65 }, { day: '토', hour: 12, value: 78 }, { day: '토', hour: 15, value: 72 }, { day: '토', hour: 18, value: 62 }, { day: '토', hour: 21, value: 45 },
                              { day: '일', hour: 0, value: 25 }, { day: '일', hour: 3, value: 15 }, { day: '일', hour: 6, value: 32 }, { day: '일', hour: 9, value: 58 }, { day: '일', hour: 12, value: 72 }, { day: '일', hour: 15, value: 65 }, { day: '일', hour: 18, value: 55 }, { day: '일', hour: 21, value: 38 },
                            ]} 
                            size="small"
                          />
                        )}
                        
                        {selectedCountry === "미국" && (
                          <CountryHeatmap 
                            country="미국" 
                            data={[
                              { day: '월', hour: 0, value: 15 }, { day: '월', hour: 3, value: 8 }, { day: '월', hour: 6, value: 22 }, { day: '월', hour: 9, value: 45 }, { day: '월', hour: 12, value: 68 }, { day: '월', hour: 15, value: 75 }, { day: '월', hour: 18, value: 82 }, { day: '월', hour: 21, value: 58 },
                              { day: '화', hour: 0, value: 12 }, { day: '화', hour: 3, value: 5 }, { day: '화', hour: 6, value: 18 }, { day: '화', hour: 9, value: 48 }, { day: '화', hour: 12, value: 72 }, { day: '화', hour: 15, value: 78 }, { day: '화', hour: 18, value: 85 }, { day: '화', hour: 21, value: 62 },
                              { day: '수', hour: 0, value: 18 }, { day: '수', hour: 3, value: 8 }, { day: '수', hour: 6, value: 25 }, { day: '수', hour: 9, value: 52 }, { day: '수', hour: 12, value: 75 }, { day: '수', hour: 15, value: 82 }, { day: '수', hour: 18, value: 88 }, { day: '수', hour: 21, value: 65 },
                              { day: '목', hour: 0, value: 22 }, { day: '목', hour: 3, value: 12 }, { day: '목', hour: 6, value: 28 }, { day: '목', hour: 9, value: 55 }, { day: '목', hour: 12, value: 78 }, { day: '목', hour: 15, value: 85 }, { day: '목', hour: 18, value: 92 }, { day: '목', hour: 21, value: 68 },
                              { day: '금', hour: 0, value: 25 }, { day: '금', hour: 3, value: 15 }, { day: '금', hour: 6, value: 32 }, { day: '금', hour: 9, value: 58 }, { day: '금', hour: 12, value: 82 }, { day: '금', hour: 15, value: 88 }, { day: '금', hour: 18, value: 95 }, { day: '금', hour: 21, value: 72 },
                              { day: '토', hour: 0, value: 8 }, { day: '토', hour: 3, value: 5 }, { day: '토', hour: 6, value: 12 }, { day: '토', hour: 9, value: 28 }, { day: '토', hour: 12, value: 45 }, { day: '토', hour: 15, value: 52 }, { day: '토', hour: 18, value: 48 }, { day: '토', hour: 21, value: 35 },
                              { day: '일', hour: 0, value: 5 }, { day: '일', hour: 3, value: 3 }, { day: '일', hour: 6, value: 8 }, { day: '일', hour: 9, value: 22 }, { day: '일', hour: 12, value: 38 }, { day: '일', hour: 15, value: 42 }, { day: '일', hour: 18, value: 35 }, { day: '일', hour: 21, value: 25 },
                            ]} 
                            size="small"
                          />
                        )}
                        
                        {selectedCountry === "일본" && (
                          <CountryHeatmap 
                            country="일본" 
                            data={[
                              { day: '월', hour: 0, value: 12 }, { day: '월', hour: 3, value: 8 }, { day: '월', hour: 6, value: 18 }, { day: '월', hour: 9, value: 35 }, { day: '월', hour: 12, value: 48 }, { day: '월', hour: 15, value: 55 }, { day: '월', hour: 18, value: 52 }, { day: '월', hour: 21, value: 38 },
                              { day: '화', hour: 0, value: 10 }, { day: '화', hour: 3, value: 6 }, { day: '화', hour: 6, value: 15 }, { day: '화', hour: 9, value: 38 }, { day: '화', hour: 12, value: 52 }, { day: '화', hour: 15, value: 58 }, { day: '화', hour: 18, value: 55 }, { day: '화', hour: 21, value: 42 },
                              { day: '수', hour: 0, value: 15 }, { day: '수', hour: 3, value: 10 }, { day: '수', hour: 6, value: 22 }, { day: '수', hour: 9, value: 42 }, { day: '수', hour: 12, value: 55 }, { day: '수', hour: 15, value: 62 }, { day: '수', hour: 18, value: 58 }, { day: '수', hour: 21, value: 45 },
                              { day: '목', hour: 0, value: 18 }, { day: '목', hour: 3, value: 12 }, { day: '목', hour: 6, value: 25 }, { day: '목', hour: 9, value: 45 }, { day: '목', hour: 12, value: 58 }, { day: '목', hour: 15, value: 65 }, { day: '목', hour: 18, value: 62 }, { day: '목', hour: 21, value: 48 },
                              { day: '금', hour: 0, value: 22 }, { day: '금', hour: 3, value: 15 }, { day: '금', hour: 6, value: 28 }, { day: '금', hour: 9, value: 48 }, { day: '금', hour: 12, value: 62 }, { day: '금', hour: 15, value: 68 }, { day: '금', hour: 18, value: 65 }, { day: '금', hour: 21, value: 52 },
                              { day: '토', hour: 0, value: 8 }, { day: '토', hour: 3, value: 5 }, { day: '토', hour: 6, value: 12 }, { day: '토', hour: 9, value: 25 }, { day: '토', hour: 12, value: 35 }, { day: '토', hour: 15, value: 42 }, { day: '토', hour: 18, value: 38 }, { day: '토', hour: 21, value: 28 },
                              { day: '일', hour: 0, value: 6 }, { day: '일', hour: 3, value: 3 }, { day: '일', hour: 6, value: 8 }, { day: '일', hour: 9, value: 18 }, { day: '일', hour: 12, value: 28 }, { day: '일', hour: 15, value: 32 }, { day: '일', hour: 18, value: 25 }, { day: '일', hour: 21, value: 18 },
                            ]} 
                            size="small"
                          />
                        )}
                        
                        {selectedCountry === "태국" && (
                          <CountryHeatmap 
                            country="태국" 
                            data={[
                              { day: '월', hour: 0, value: 8 }, { day: '월', hour: 3, value: 5 }, { day: '월', hour: 6, value: 12 }, { day: '월', hour: 9, value: 25 }, { day: '월', hour: 12, value: 35 }, { day: '월', hour: 15, value: 42 }, { day: '월', hour: 18, value: 38 }, { day: '월', hour: 21, value: 28 },
                              { day: '화', hour: 0, value: 6 }, { day: '화', hour: 3, value: 3 }, { day: '화', hour: 6, value: 10 }, { day: '화', hour: 9, value: 28 }, { day: '화', hour: 12, value: 38 }, { day: '화', hour: 15, value: 45 }, { day: '화', hour: 18, value: 42 }, { day: '화', hour: 21, value: 32 },
                              { day: '수', hour: 0, value: 10 }, { day: '수', hour: 3, value: 6 }, { day: '수', hour: 6, value: 15 }, { day: '수', hour: 9, value: 32 }, { day: '수', hour: 12, value: 42 }, { day: '수', hour: 15, value: 48 }, { day: '수', hour: 18, value: 45 }, { day: '수', hour: 21, value: 35 },
                              { day: '목', hour: 0, value: 12 }, { day: '목', hour: 3, value: 8 }, { day: '목', hour: 6, value: 18 }, { day: '목', hour: 9, value: 35 }, { day: '목', hour: 12, value: 45 }, { day: '목', hour: 15, value: 52 }, { day: '목', hour: 18, value: 48 }, { day: '목', hour: 21, value: 38 },
                              { day: '금', hour: 0, value: 15 }, { day: '금', hour: 3, value: 10 }, { day: '금', hour: 6, value: 22 }, { day: '금', hour: 9, value: 38 }, { day: '금', hour: 12, value: 48 }, { day: '금', hour: 15, value: 55 }, { day: '금', hour: 18, value: 52 }, { day: '금', hour: 21, value: 42 },
                              { day: '토', hour: 0, value: 5 }, { day: '토', hour: 3, value: 3 }, { day: '토', hour: 6, value: 8 }, { day: '토', hour: 9, value: 18 }, { day: '토', hour: 12, value: 25 }, { day: '토', hour: 15, value: 28 }, { day: '토', hour: 18, value: 22 }, { day: '토', hour: 21, value: 15 },
                              { day: '일', hour: 0, value: 3 }, { day: '일', hour: 3, value: 2 }, { day: '일', hour: 6, value: 6 }, { day: '일', hour: 9, value: 15 }, { day: '일', hour: 12, value: 22 }, { day: '일', hour: 15, value: 25 }, { day: '일', hour: 18, value: 18 }, { day: '일', hour: 21, value: 12 },
                            ]} 
                            size="small"
                          />
                        )}
                        
                        {selectedCountry === "인도네시아" && (
                          <CountryHeatmap 
                            country="인도네시아" 
                            data={[
                              { day: '월', hour: 0, value: 6 }, { day: '월', hour: 3, value: 3 }, { day: '월', hour: 6, value: 8 }, { day: '월', hour: 9, value: 18 }, { day: '월', hour: 12, value: 28 }, { day: '월', hour: 15, value: 35 }, { day: '월', hour: 18, value: 32 }, { day: '월', hour: 21, value: 22 },
                              { day: '화', hour: 0, value: 5 }, { day: '화', hour: 3, value: 2 }, { day: '화', hour: 6, value: 6 }, { day: '화', hour: 9, value: 22 }, { day: '화', hour: 12, value: 32 }, { day: '화', hour: 15, value: 38 }, { day: '화', hour: 18, value: 35 }, { day: '화', hour: 21, value: 25 },
                              { day: '수', hour: 0, value: 8 }, { day: '수', hour: 3, value: 4 }, { day: '수', hour: 6, value: 10 }, { day: '수', hour: 9, value: 25 }, { day: '수', hour: 12, value: 35 }, { day: '수', hour: 15, value: 42 }, { day: '수', hour: 18, value: 38 }, { day: '수', hour: 21, value: 28 },
                              { day: '목', hour: 0, value: 10 }, { day: '목', hour: 3, value: 6 }, { day: '목', hour: 6, value: 12 }, { day: '목', hour: 9, value: 28 }, { day: '목', hour: 12, value: 38 }, { day: '목', hour: 15, value: 45 }, { day: '목', hour: 18, value: 42 }, { day: '목', hour: 21, value: 32 },
                              { day: '금', hour: 0, value: 12 }, { day: '금', hour: 3, value: 8 }, { day: '금', hour: 6, value: 15 }, { day: '금', hour: 9, value: 32 }, { day: '금', hour: 12, value: 42 }, { day: '금', hour: 15, value: 48 }, { day: '금', hour: 18, value: 45 }, { day: '금', hour: 21, value: 35 },
                              { day: '토', hour: 0, value: 4 }, { day: '토', hour: 3, value: 2 }, { day: '토', hour: 6, value: 6 }, { day: '토', hour: 9, value: 15 }, { day: '토', hour: 12, value: 22 }, { day: '토', hour: 15, value: 25 }, { day: '토', hour: 18, value: 18 }, { day: '토', hour: 21, value: 12 },
                              { day: '일', hour: 0, value: 3 }, { day: '일', hour: 3, value: 1 }, { day: '일', hour: 6, value: 4 }, { day: '일', hour: 9, value: 12 }, { day: '일', hour: 12, value: 18 }, { day: '일', hour: 15, value: 22 }, { day: '일', hour: 18, value: 15 }, { day: '일', hour: 21, value: 8 },
                            ]} 
                            size="small"
                          />
                        )}
                        
                        {selectedCountry === "기타" && (
                          <CountryHeatmap 
                            country="그 외" 
                            data={[
                              { day: '월', hour: 0, value: 8 }, { day: '월', hour: 3, value: 5 }, { day: '월', hour: 6, value: 12 }, { day: '월', hour: 9, value: 25 }, { day: '월', hour: 12, value: 35 }, { day: '월', hour: 15, value: 42 }, { day: '월', hour: 18, value: 38 }, { day: '월', hour: 21, value: 28 },
                              { day: '화', hour: 0, value: 6 }, { day: '화', hour: 3, value: 3 }, { day: '화', hour: 6, value: 10 }, { day: '화', hour: 9, value: 28 }, { day: '화', hour: 12, value: 38 }, { day: '화', hour: 15, value: 45 }, { day: '화', hour: 18, value: 42 }, { day: '화', hour: 21, value: 32 },
                              { day: '수', hour: 0, value: 10 }, { day: '수', hour: 3, value: 6 }, { day: '수', hour: 6, value: 15 }, { day: '수', hour: 9, value: 32 }, { day: '수', hour: 12, value: 42 }, { day: '수', hour: 15, value: 48 }, { day: '수', hour: 18, value: 45 }, { day: '수', hour: 21, value: 35 },
                              { day: '목', hour: 0, value: 12 }, { day: '목', hour: 3, value: 8 }, { day: '목', hour: 6, value: 18 }, { day: '목', hour: 9, value: 35 }, { day: '목', hour: 12, value: 45 }, { day: '목', hour: 15, value: 52 }, { day: '목', hour: 18, value: 48 }, { day: '목', hour: 21, value: 38 },
                              { day: '금', hour: 0, value: 15 }, { day: '금', hour: 3, value: 10 }, { day: '금', hour: 6, value: 22 }, { day: '금', hour: 9, value: 38 }, { day: '금', hour: 12, value: 48 }, { day: '금', hour: 15, value: 55 }, { day: '금', hour: 18, value: 52 }, { day: '금', hour: 21, value: 42 },
                              { day: '토', hour: 0, value: 5 }, { day: '토', hour: 3, value: 3 }, { day: '토', hour: 6, value: 8 }, { day: '토', hour: 9, value: 18 }, { day: '토', hour: 12, value: 25 }, { day: '토', hour: 15, value: 28 }, { day: '토', hour: 18, value: 22 }, { day: '토', hour: 21, value: 15 },
                              { day: '일', hour: 0, value: 3 }, { day: '일', hour: 3, value: 2 }, { day: '일', hour: 6, value: 6 }, { day: '일', hour: 9, value: 15 }, { day: '일', hour: 12, value: 22 }, { day: '일', hour: 15, value: 25 }, { day: '일', hour: 18, value: 18 }, { day: '일', hour: 21, value: 12 },
                            ]} 
                            size="small"
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground text-sm">
                        국가를 클릭하여<br />해당 국가의 실행 시각<br />분포도를 확인하세요.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <MetricCard
          title="신규 회원 수"
          // diffValue={8.5}
          onClick={() => setNewInflowModalOpen(true)}
          textData={[
            { label: "앱 유입", value: "850명 (70.8%)", color: "#3b82f6" },
            { label: "커머스 유입", value: "350명 (29.2%)", color: "#10b981" },
          ]}
          showSignupPathLink={true}
        />
        <MetricCard
          title="커뮤니티 신규 게시물"
          // diffValue={12.3}
          onClick={() => setCommunityPostsModalOpen(true)}
          textData={[
            { label: "Q&A", value: "45개 (31.5%)", color: "#3b82f6" },
            { label: "제품리뷰", value: "38개 (26.6%)", color: "#10b981" },
            { label: "판별팁", value: "32개 (22.4%)", color: "#f59e0b" },
            { label: "인증거래", value: "28개 (19.6%)", color: "#8b5cf6" },
          ]}
          showSignupPathLink={true}
          signupPathLinkText="→ 커뮤니티 상세지표 보기"
        />
        <MetricCard
          title="신규 채팅방"
          // diffValue={-5.8}
          onClick={() => setNewChatModalOpen(true)}
          textData={[
            { label: "1:1 채팅방", value: "89개 (57.1%)", color: "#3b82f6" },
            { label: "인증거래", value: "67개 (42.9%)", color: "#10b981" },
          ]}
          showSignupPathLink={true}
          signupPathLinkText="→ 채팅별 상세지표 보기"
          
        />
        
         <Card className="p-4 bg-card border-border transition-all flex flex-col h-full">
           <div className="space-y-3 flex-1">
             <div className="flex items-start justify-between">
               <div className="space-y-2 flex-1">
                 <p className="text-sm text-muted-foreground font-medium">코호트 분석</p>
                 <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-bold text-foreground">{format(eventDate, 'MM/dd')} 이벤트</span>
                   <span className="text-sm text-muted-foreground">({metricType})</span>
                 </div>
                 <BarChart3 className="h-5 w-5 text-primary" />
               </div>
             </div>

             {/* 컨트롤 패널 */}
             <div className="space-y-3">
               <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                   <label className="text-xs text-muted-foreground">이벤트 날짜</label>
                   <input
                     type="date"
                     value={format(eventDate, 'yyyy-MM-dd')}
                     onChange={(e) => setEventDate(new Date(e.target.value))}
                     className="w-full text-xs px-2 py-1 border border-border rounded bg-background"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs text-muted-foreground">분석 기간</label>
                   <select
                     value={analysisPeriod}
                     onChange={(e) => setAnalysisPeriod(e.target.value as '7일' | '30일')}
                     className="w-full text-xs px-2 py-1 border border-border rounded bg-background"
                   >
                     <option value="7일">7일 전후</option>
                     <option value="30일">30일 전후</option>
                   </select>
                 </div>
               </div>
               <div className="space-y-1">
                 <label className="text-xs text-muted-foreground">분석 지표</label>
                 <select
                   value={metricType}
                   onChange={(e) => setMetricType(e.target.value as '실행' | '신규회원')}
                   className="w-full text-xs px-2 py-1 border border-border rounded bg-background"
                 >
                   <option value="신규회원">신규회원</option>
                   <option value="실행">실행</option>
                 </select>
               </div>
             </div>

             {/* 미니 추이 차트 */}
             <div className="h-24">
               <TrendChart
                 data={cohortData}
                 lines={[
                   { 
                     dataKey: "value", 
                     name: metricType, 
                     color: metricType === '신규회원' ? "#10b981" : "#3b82f6" 
                   }
                 ]}
                 height={96}
                 showEventLine={true}
                 eventDate={format(eventDate, 'MM/dd')}
                 hideLegend={true}
                 hideTooltip={true}
                 hideAxes={true}
               />
             </div>

             {/* 요약 정보 */}
             <div className="grid grid-cols-3 gap-2 text-xs">
               <div className="text-center p-2 bg-muted rounded">
                 <div className="text-muted-foreground">전 평균</div>
                 <div className="font-semibold text-blue-600">
                   {metricType === '신규회원' ? '130명' : '2,900회'}
                 </div>
               </div>
               <div className="text-center p-2 bg-muted rounded">
                 <div className="text-muted-foreground">이벤트 당일</div>
                 <div className="font-semibold text-green-600">
                   {metricType === '신규회원' ? '200명' : '3,400회'}
                 </div>
               </div>
               <div className="text-center p-2 bg-muted rounded">
                 <div className="text-muted-foreground">후 평균</div>
                 <div className="font-semibold text-orange-600">
                   {metricType === '신규회원' ? '155명' : '3,150회'}
                 </div>
               </div>
             </div>

             {/* 상세 보기 링크 */}
             <div className="pt-2 border-t border-border">
               <button
                 onClick={() => setCohortAnalysisModalOpen(true)}
                 className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
               >
                 → 이벤트 분석 상세 보기
               </button>
             </div>
           </div>
         </Card>
        <MetricCard
          title="스캔 대비 프리랜딩 답변율"
          value="63%"
          icon={<MessageSquare className="h-5 w-5" />}
          onClick={() => setFreelancingModalOpen(true)}
          textData={[
            { label: "10대", value: "남 45명, 여 52명", color: "#ef4444" }, // 97명
            { label: "20대", value: "남 65명, 여 72명", color: "#3b82f6" }, // 137명
            { label: "30대", value: "남 78명, 여 85명", color: "#10b981" }, // 163명
            { label: "40대", value: "남 82명, 여 88명", color: "#f59e0b" }, // 170명
            { label: "50+", value: "남 35명, 여 42명", color: "#8b5cf6" }, // 77명
             ]}
          showSignupPathLink={true}
          signupPathLinkText="→ 프리랜딩 질문별 답변율 보기"
        />
        <MetricCard
          title="답변율 저조업체 알림"
          value={`${lowPerformingVendors.length}개`}
          icon={<AlertTriangle className="h-5 w-5 text-warning" />}
          onClick={() => setVendorAlertModalOpen(true)}
          className="border-warning/30"
          textData={lowestVendorsData}
          showSignupPathLink={true}
          signupPathLinkText="→ 업체 담당자에게 알림 전송"
        />
      {/* <MetricCard
      title="스캔 활성 마켓"
      // diffValue={-8.7}
      onClick={() => setScanModalOpen(true)}
      textData={[
        { label: "App", value: "8,450회", color: "#3b82f6" },
        { label: "Play", value: "6,720회", color: "#10b981" },
        { label: "WeChat", value: "4,890회", color: "#f59e0b" },
        { label: "그 외", value: "2,380회", color: "#8b5cf6" },
      ]}
      className="col-span-1"
      // showSignupPathLink={true}
      // signupPathLinkText="→ 스캔 상세보기"
    /> */}
      <MetricCard
        title="스캔 기기 회원 비율"
        value="24.8%"
        // diffValue={4.2}
        onClick={() => setConversionModalOpen(true)}
        textData={[
          { label: "비회원", value: "22,500개", color: "#ef4444" },
          { label: "회원", value: "7,500개", color: "#10b981" },
          ]}
        />
      </div>

      {/* Execution Modal */}
      <MetricModal open={executionModalOpen} onOpenChange={setExecutionModalOpen} title="국가별 실행 시각 분포도">
        <div className="space-y-6">
          {/* 전체 국가 파이차트 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">전체 국가별 실행 분포</h3>
            <CountryPieChart 
              data={allCountryData} 
              onCountryClick={(country) => setSelectedCountry(country)}
              size="large"
              showLegend={true}
            />
          </div>
          
          {/* 국가별 히트맵 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">국가별 실행 시각 분포도</h3>
            {selectedCountry && (
              <div className="space-y-6">
                {selectedCountry === "중국" && (
                  <CountryHeatmap 
                    country="중국" 
                    data={[
                      { day: '월', hour: 0, value: 45 }, { day: '월', hour: 3, value: 32 }, { day: '월', hour: 6, value: 28 }, { day: '월', hour: 9, value: 65 }, { day: '월', hour: 12, value: 89 }, { day: '월', hour: 15, value: 95 }, { day: '월', hour: 18, value: 78 }, { day: '월', hour: 21, value: 52 },
                      { day: '화', hour: 0, value: 38 }, { day: '화', hour: 3, value: 25 }, { day: '화', hour: 6, value: 35 }, { day: '화', hour: 9, value: 72 }, { day: '화', hour: 12, value: 95 }, { day: '화', hour: 15, value: 88 }, { day: '화', hour: 18, value: 82 }, { day: '화', hour: 21, value: 48 },
                      { day: '수', hour: 0, value: 42 }, { day: '수', hour: 3, value: 28 }, { day: '수', hour: 6, value: 38 }, { day: '수', hour: 9, value: 68 }, { day: '수', hour: 12, value: 92 }, { day: '수', hour: 15, value: 85 }, { day: '수', hour: 18, value: 75 }, { day: '수', hour: 21, value: 45 },
                      { day: '목', hour: 0, value: 35 }, { day: '목', hour: 3, value: 22 }, { day: '목', hour: 6, value: 32 }, { day: '목', hour: 9, value: 58 }, { day: '목', hour: 12, value: 85 }, { day: '목', hour: 15, value: 78 }, { day: '목', hour: 18, value: 68 }, { day: '목', hour: 21, value: 42 },
                      { day: '금', hour: 0, value: 48 }, { day: '금', hour: 3, value: 35 }, { day: '금', hour: 6, value: 42 }, { day: '금', hour: 9, value: 75 }, { day: '금', hour: 12, value: 98 }, { day: '금', hour: 15, value: 92 }, { day: '금', hour: 18, value: 88 }, { day: '금', hour: 21, value: 55 },
                      { day: '토', hour: 0, value: 25 }, { day: '토', hour: 3, value: 18 }, { day: '토', hour: 6, value: 22 }, { day: '토', hour: 9, value: 45 }, { day: '토', hour: 12, value: 65 }, { day: '토', hour: 15, value: 58 }, { day: '토', hour: 18, value: 48 }, { day: '토', hour: 21, value: 32 },
                      { day: '일', hour: 0, value: 22 }, { day: '일', hour: 3, value: 15 }, { day: '일', hour: 6, value: 18 }, { day: '일', hour: 9, value: 38 }, { day: '일', hour: 12, value: 55 }, { day: '일', hour: 15, value: 48 }, { day: '일', hour: 18, value: 38 }, { day: '일', hour: 21, value: 28 },
                    ]} 
                  />
                )}
                
                {selectedCountry === "한국" && (
                  <CountryHeatmap 
                    country="한국" 
                    data={[
                      { day: '월', hour: 0, value: 25 }, { day: '월', hour: 3, value: 15 }, { day: '월', hour: 6, value: 35 }, { day: '월', hour: 9, value: 85 }, { day: '월', hour: 12, value: 95 }, { day: '월', hour: 15, value: 88 }, { day: '월', hour: 18, value: 75 }, { day: '월', hour: 21, value: 45 },
                      { day: '화', hour: 0, value: 22 }, { day: '화', hour: 3, value: 12 }, { day: '화', hour: 6, value: 38 }, { day: '화', hour: 9, value: 88 }, { day: '화', hour: 12, value: 98 }, { day: '화', hour: 15, value: 92 }, { day: '화', hour: 18, value: 82 }, { day: '화', hour: 21, value: 48 },
                      { day: '수', hour: 0, value: 28 }, { day: '수', hour: 3, value: 18 }, { day: '수', hour: 6, value: 42 }, { day: '수', hour: 9, value: 92 }, { day: '수', hour: 12, value: 95 }, { day: '수', hour: 15, value: 88 }, { day: '수', hour: 18, value: 78 }, { day: '수', hour: 21, value: 52 },
                      { day: '목', hour: 0, value: 32 }, { day: '목', hour: 3, value: 22 }, { day: '목', hour: 6, value: 45 }, { day: '목', hour: 9, value: 95 }, { day: '목', hour: 12, value: 98 }, { day: '목', hour: 15, value: 92 }, { day: '목', hour: 18, value: 85 }, { day: '목', hour: 21, value: 58 },
                      { day: '금', hour: 0, value: 35 }, { day: '금', hour: 3, value: 25 }, { day: '금', hour: 6, value: 48 }, { day: '금', hour: 9, value: 98 }, { day: '금', hour: 12, value: 95 }, { day: '금', hour: 15, value: 88 }, { day: '금', hour: 18, value: 82 }, { day: '금', hour: 21, value: 62 },
                      { day: '토', hour: 0, value: 18 }, { day: '토', hour: 3, value: 12 }, { day: '토', hour: 6, value: 25 }, { day: '토', hour: 9, value: 55 }, { day: '토', hour: 12, value: 75 }, { day: '토', hour: 15, value: 68 }, { day: '토', hour: 18, value: 58 }, { day: '토', hour: 21, value: 38 },
                      { day: '일', hour: 0, value: 15 }, { day: '일', hour: 3, value: 8 }, { day: '일', hour: 6, value: 22 }, { day: '일', hour: 9, value: 48 }, { day: '일', hour: 12, value: 68 }, { day: '일', hour: 15, value: 58 }, { day: '일', hour: 18, value: 45 }, { day: '일', hour: 21, value: 32 },
                    ]} 
                  />
                )}
                
                {selectedCountry === "베트남" && (
                  <CountryHeatmap 
                    country="베트남" 
                    data={[
                      { day: '월', hour: 0, value: 35 }, { day: '월', hour: 3, value: 25 }, { day: '월', hour: 6, value: 45 }, { day: '월', hour: 9, value: 75 }, { day: '월', hour: 12, value: 85 }, { day: '월', hour: 15, value: 78 }, { day: '월', hour: 18, value: 65 }, { day: '월', hour: 21, value: 48 },
                      { day: '화', hour: 0, value: 32 }, { day: '화', hour: 3, value: 22 }, { day: '화', hour: 6, value: 42 }, { day: '화', hour: 9, value: 78 }, { day: '화', hour: 12, value: 88 }, { day: '화', hour: 15, value: 82 }, { day: '화', hour: 18, value: 72 }, { day: '화', hour: 21, value: 52 },
                      { day: '수', hour: 0, value: 38 }, { day: '수', hour: 3, value: 28 }, { day: '수', hour: 6, value: 48 }, { day: '수', hour: 9, value: 82 }, { day: '수', hour: 12, value: 92 }, { day: '수', hour: 15, value: 85 }, { day: '수', hour: 18, value: 75 }, { day: '수', hour: 21, value: 58 },
                      { day: '목', hour: 0, value: 42 }, { day: '목', hour: 3, value: 32 }, { day: '목', hour: 6, value: 52 }, { day: '목', hour: 9, value: 85 }, { day: '목', hour: 12, value: 95 }, { day: '목', hour: 15, value: 88 }, { day: '목', hour: 18, value: 78 }, { day: '목', hour: 21, value: 62 },
                      { day: '금', hour: 0, value: 45 }, { day: '금', hour: 3, value: 35 }, { day: '금', hour: 6, value: 55 }, { day: '금', hour: 9, value: 88 }, { day: '금', hour: 12, value: 98 }, { day: '금', hour: 15, value: 92 }, { day: '금', hour: 18, value: 82 }, { day: '금', hour: 21, value: 68 },
                      { day: '토', hour: 0, value: 28 }, { day: '토', hour: 3, value: 18 }, { day: '토', hour: 6, value: 35 }, { day: '토', hour: 9, value: 65 }, { day: '토', hour: 12, value: 78 }, { day: '토', hour: 15, value: 72 }, { day: '토', hour: 18, value: 62 }, { day: '토', hour: 21, value: 45 },
                      { day: '일', hour: 0, value: 25 }, { day: '일', hour: 3, value: 15 }, { day: '일', hour: 6, value: 32 }, { day: '일', hour: 9, value: 58 }, { day: '일', hour: 12, value: 72 }, { day: '일', hour: 15, value: 65 }, { day: '일', hour: 18, value: 55 }, { day: '일', hour: 21, value: 38 },
                    ]} 
                  />
                )}
                
                {selectedCountry === "미국" && (
                  <CountryHeatmap 
                    country="미국" 
                    data={[
                      { day: '월', hour: 0, value: 15 }, { day: '월', hour: 3, value: 8 }, { day: '월', hour: 6, value: 22 }, { day: '월', hour: 9, value: 45 }, { day: '월', hour: 12, value: 68 }, { day: '월', hour: 15, value: 75 }, { day: '월', hour: 18, value: 82 }, { day: '월', hour: 21, value: 58 },
                      { day: '화', hour: 0, value: 12 }, { day: '화', hour: 3, value: 5 }, { day: '화', hour: 6, value: 18 }, { day: '화', hour: 9, value: 48 }, { day: '화', hour: 12, value: 72 }, { day: '화', hour: 15, value: 78 }, { day: '화', hour: 18, value: 85 }, { day: '화', hour: 21, value: 62 },
                      { day: '수', hour: 0, value: 18 }, { day: '수', hour: 3, value: 8 }, { day: '수', hour: 6, value: 25 }, { day: '수', hour: 9, value: 52 }, { day: '수', hour: 12, value: 75 }, { day: '수', hour: 15, value: 82 }, { day: '수', hour: 18, value: 88 }, { day: '수', hour: 21, value: 65 },
                      { day: '목', hour: 0, value: 22 }, { day: '목', hour: 3, value: 12 }, { day: '목', hour: 6, value: 28 }, { day: '목', hour: 9, value: 55 }, { day: '목', hour: 12, value: 78 }, { day: '목', hour: 15, value: 85 }, { day: '목', hour: 18, value: 92 }, { day: '목', hour: 21, value: 68 },
                      { day: '금', hour: 0, value: 25 }, { day: '금', hour: 3, value: 15 }, { day: '금', hour: 6, value: 32 }, { day: '금', hour: 9, value: 58 }, { day: '금', hour: 12, value: 82 }, { day: '금', hour: 15, value: 88 }, { day: '금', hour: 18, value: 95 }, { day: '금', hour: 21, value: 72 },
                      { day: '토', hour: 0, value: 8 }, { day: '토', hour: 3, value: 5 }, { day: '토', hour: 6, value: 12 }, { day: '토', hour: 9, value: 28 }, { day: '토', hour: 12, value: 45 }, { day: '토', hour: 15, value: 52 }, { day: '토', hour: 18, value: 48 }, { day: '토', hour: 21, value: 35 },
                      { day: '일', hour: 0, value: 5 }, { day: '일', hour: 3, value: 3 }, { day: '일', hour: 6, value: 8 }, { day: '일', hour: 9, value: 22 }, { day: '일', hour: 12, value: 38 }, { day: '일', hour: 15, value: 42 }, { day: '일', hour: 18, value: 35 }, { day: '일', hour: 21, value: 25 },
                    ]} 
                  />
                )}
                
                {selectedCountry === "일본" && (
                  <CountryHeatmap 
                    country="일본" 
                    data={[
                      { day: '월', hour: 0, value: 12 }, { day: '월', hour: 3, value: 8 }, { day: '월', hour: 6, value: 18 }, { day: '월', hour: 9, value: 35 }, { day: '월', hour: 12, value: 48 }, { day: '월', hour: 15, value: 55 }, { day: '월', hour: 18, value: 52 }, { day: '월', hour: 21, value: 38 },
                      { day: '화', hour: 0, value: 10 }, { day: '화', hour: 3, value: 6 }, { day: '화', hour: 6, value: 15 }, { day: '화', hour: 9, value: 38 }, { day: '화', hour: 12, value: 52 }, { day: '화', hour: 15, value: 58 }, { day: '화', hour: 18, value: 55 }, { day: '화', hour: 21, value: 42 },
                      { day: '수', hour: 0, value: 15 }, { day: '수', hour: 3, value: 10 }, { day: '수', hour: 6, value: 22 }, { day: '수', hour: 9, value: 42 }, { day: '수', hour: 12, value: 55 }, { day: '수', hour: 15, value: 62 }, { day: '수', hour: 18, value: 58 }, { day: '수', hour: 21, value: 45 },
                      { day: '목', hour: 0, value: 18 }, { day: '목', hour: 3, value: 12 }, { day: '목', hour: 6, value: 25 }, { day: '목', hour: 9, value: 45 }, { day: '목', hour: 12, value: 58 }, { day: '목', hour: 15, value: 65 }, { day: '목', hour: 18, value: 62 }, { day: '목', hour: 21, value: 48 },
                      { day: '금', hour: 0, value: 22 }, { day: '금', hour: 3, value: 15 }, { day: '금', hour: 6, value: 28 }, { day: '금', hour: 9, value: 48 }, { day: '금', hour: 12, value: 62 }, { day: '금', hour: 15, value: 68 }, { day: '금', hour: 18, value: 65 }, { day: '금', hour: 21, value: 52 },
                      { day: '토', hour: 0, value: 8 }, { day: '토', hour: 3, value: 5 }, { day: '토', hour: 6, value: 12 }, { day: '토', hour: 9, value: 25 }, { day: '토', hour: 12, value: 35 }, { day: '토', hour: 15, value: 42 }, { day: '토', hour: 18, value: 38 }, { day: '토', hour: 21, value: 28 },
                      { day: '일', hour: 0, value: 6 }, { day: '일', hour: 3, value: 3 }, { day: '일', hour: 6, value: 8 }, { day: '일', hour: 9, value: 18 }, { day: '일', hour: 12, value: 28 }, { day: '일', hour: 15, value: 32 }, { day: '일', hour: 18, value: 25 }, { day: '일', hour: 21, value: 18 },
                    ]} 
                  />
                )}
                
                {selectedCountry === "태국" && (
                  <CountryHeatmap 
                    country="태국" 
                    data={[
                      { day: '월', hour: 0, value: 8 }, { day: '월', hour: 3, value: 5 }, { day: '월', hour: 6, value: 12 }, { day: '월', hour: 9, value: 25 }, { day: '월', hour: 12, value: 35 }, { day: '월', hour: 15, value: 42 }, { day: '월', hour: 18, value: 38 }, { day: '월', hour: 21, value: 28 },
                      { day: '화', hour: 0, value: 6 }, { day: '화', hour: 3, value: 3 }, { day: '화', hour: 6, value: 10 }, { day: '화', hour: 9, value: 28 }, { day: '화', hour: 12, value: 38 }, { day: '화', hour: 15, value: 45 }, { day: '화', hour: 18, value: 42 }, { day: '화', hour: 21, value: 32 },
                      { day: '수', hour: 0, value: 10 }, { day: '수', hour: 3, value: 6 }, { day: '수', hour: 6, value: 15 }, { day: '수', hour: 9, value: 32 }, { day: '수', hour: 12, value: 42 }, { day: '수', hour: 15, value: 48 }, { day: '수', hour: 18, value: 45 }, { day: '수', hour: 21, value: 35 },
                      { day: '목', hour: 0, value: 12 }, { day: '목', hour: 3, value: 8 }, { day: '목', hour: 6, value: 18 }, { day: '목', hour: 9, value: 35 }, { day: '목', hour: 12, value: 45 }, { day: '목', hour: 15, value: 52 }, { day: '목', hour: 18, value: 48 }, { day: '목', hour: 21, value: 38 },
                      { day: '금', hour: 0, value: 15 }, { day: '금', hour: 3, value: 10 }, { day: '금', hour: 6, value: 22 }, { day: '금', hour: 9, value: 38 }, { day: '금', hour: 12, value: 48 }, { day: '금', hour: 15, value: 55 }, { day: '금', hour: 18, value: 52 }, { day: '금', hour: 21, value: 42 },
                      { day: '토', hour: 0, value: 5 }, { day: '토', hour: 3, value: 3 }, { day: '토', hour: 6, value: 8 }, { day: '토', hour: 9, value: 18 }, { day: '토', hour: 12, value: 25 }, { day: '토', hour: 15, value: 28 }, { day: '토', hour: 18, value: 22 }, { day: '토', hour: 21, value: 15 },
                      { day: '일', hour: 0, value: 3 }, { day: '일', hour: 3, value: 2 }, { day: '일', hour: 6, value: 6 }, { day: '일', hour: 9, value: 15 }, { day: '일', hour: 12, value: 22 }, { day: '일', hour: 15, value: 25 }, { day: '일', hour: 18, value: 18 }, { day: '일', hour: 21, value: 12 },
                    ]} 
                  />
                )}
                
                {selectedCountry === "인도네시아" && (
                  <CountryHeatmap 
                    country="인도네시아" 
                    data={[
                      { day: '월', hour: 0, value: 6 }, { day: '월', hour: 3, value: 3 }, { day: '월', hour: 6, value: 8 }, { day: '월', hour: 9, value: 18 }, { day: '월', hour: 12, value: 28 }, { day: '월', hour: 15, value: 35 }, { day: '월', hour: 18, value: 32 }, { day: '월', hour: 21, value: 22 },
                      { day: '화', hour: 0, value: 5 }, { day: '화', hour: 3, value: 2 }, { day: '화', hour: 6, value: 6 }, { day: '화', hour: 9, value: 22 }, { day: '화', hour: 12, value: 32 }, { day: '화', hour: 15, value: 38 }, { day: '화', hour: 18, value: 35 }, { day: '화', hour: 21, value: 25 },
                      { day: '수', hour: 0, value: 8 }, { day: '수', hour: 3, value: 4 }, { day: '수', hour: 6, value: 10 }, { day: '수', hour: 9, value: 25 }, { day: '수', hour: 12, value: 35 }, { day: '수', hour: 15, value: 42 }, { day: '수', hour: 18, value: 38 }, { day: '수', hour: 21, value: 28 },
                      { day: '목', hour: 0, value: 10 }, { day: '목', hour: 3, value: 6 }, { day: '목', hour: 6, value: 12 }, { day: '목', hour: 9, value: 28 }, { day: '목', hour: 12, value: 38 }, { day: '목', hour: 15, value: 45 }, { day: '목', hour: 18, value: 42 }, { day: '목', hour: 21, value: 32 },
                      { day: '금', hour: 0, value: 12 }, { day: '금', hour: 3, value: 8 }, { day: '금', hour: 6, value: 15 }, { day: '금', hour: 9, value: 32 }, { day: '금', hour: 12, value: 42 }, { day: '금', hour: 15, value: 48 }, { day: '금', hour: 18, value: 45 }, { day: '금', hour: 21, value: 35 },
                      { day: '토', hour: 0, value: 4 }, { day: '토', hour: 3, value: 2 }, { day: '토', hour: 6, value: 6 }, { day: '토', hour: 9, value: 15 }, { day: '토', hour: 12, value: 22 }, { day: '토', hour: 15, value: 25 }, { day: '토', hour: 18, value: 18 }, { day: '토', hour: 21, value: 12 },
                      { day: '일', hour: 0, value: 3 }, { day: '일', hour: 3, value: 1 }, { day: '일', hour: 6, value: 4 }, { day: '일', hour: 9, value: 12 }, { day: '일', hour: 12, value: 18 }, { day: '일', hour: 15, value: 22 }, { day: '일', hour: 18, value: 15 }, { day: '일', hour: 21, value: 8 },
                    ]} 
                  />
                )}
                
                {selectedCountry === "기타" && (
                  <CountryHeatmap 
                    country="그 외" 
                    data={[
                      { day: '월', hour: 0, value: 8 }, { day: '월', hour: 3, value: 5 }, { day: '월', hour: 6, value: 12 }, { day: '월', hour: 9, value: 25 }, { day: '월', hour: 12, value: 35 }, { day: '월', hour: 15, value: 42 }, { day: '월', hour: 18, value: 38 }, { day: '월', hour: 21, value: 28 },
                      { day: '화', hour: 0, value: 6 }, { day: '화', hour: 3, value: 3 }, { day: '화', hour: 6, value: 10 }, { day: '화', hour: 9, value: 28 }, { day: '화', hour: 12, value: 38 }, { day: '화', hour: 15, value: 45 }, { day: '화', hour: 18, value: 42 }, { day: '화', hour: 21, value: 32 },
                      { day: '수', hour: 0, value: 10 }, { day: '수', hour: 3, value: 6 }, { day: '수', hour: 6, value: 15 }, { day: '수', hour: 9, value: 32 }, { day: '수', hour: 12, value: 42 }, { day: '수', hour: 15, value: 48 }, { day: '수', hour: 18, value: 45 }, { day: '수', hour: 21, value: 35 },
                      { day: '목', hour: 0, value: 12 }, { day: '목', hour: 3, value: 8 }, { day: '목', hour: 6, value: 18 }, { day: '목', hour: 9, value: 35 }, { day: '목', hour: 12, value: 45 }, { day: '목', hour: 15, value: 52 }, { day: '목', hour: 18, value: 48 }, { day: '목', hour: 21, value: 38 },
                      { day: '금', hour: 0, value: 15 }, { day: '금', hour: 3, value: 10 }, { day: '금', hour: 6, value: 22 }, { day: '금', hour: 9, value: 38 }, { day: '금', hour: 12, value: 48 }, { day: '금', hour: 15, value: 55 }, { day: '금', hour: 18, value: 52 }, { day: '금', hour: 21, value: 42 },
                      { day: '토', hour: 0, value: 5 }, { day: '토', hour: 3, value: 3 }, { day: '토', hour: 6, value: 8 }, { day: '토', hour: 9, value: 18 }, { day: '토', hour: 12, value: 25 }, { day: '토', hour: 15, value: 28 }, { day: '토', hour: 18, value: 22 }, { day: '토', hour: 21, value: 15 },
                      { day: '일', hour: 0, value: 3 }, { day: '일', hour: 3, value: 2 }, { day: '일', hour: 6, value: 6 }, { day: '일', hour: 9, value: 15 }, { day: '일', hour: 12, value: 22 }, { day: '일', hour: 15, value: 25 }, { day: '일', hour: 18, value: 18 }, { day: '일', hour: 21, value: 12 },
                    ]} 
                  />
                )}
              </div>
            )}
            {!selectedCountry && (
              <div className="text-center py-8 text-muted-foreground">
                국가를 클릭하여 해당 국가의 실행 시각 분포도를 확인하세요.
              </div>
            )}
          </div>
        </div>
      </MetricModal>

      {/* Scan Modal */}
      <MetricModal open={scanModalOpen} onOpenChange={setScanModalOpen} title="스캔 활성 사용자 추이">
        <div className="space-y-6">
        <Tabs defaultValue="dau" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="dau">DAU</TabsTrigger>
            <TabsTrigger value="wau">WAU</TabsTrigger>
            <TabsTrigger value="mau">MAU</TabsTrigger>
          </TabsList>
          <TabsContent value="dau" className="mt-6">
            <TrendChart
              data={scanDauData}
              lines={[{ dataKey: "value", name: "DAU", color: "#10b981" }]}
            />
          </TabsContent>
          <TabsContent value="wau" className="mt-6">
            <TrendChart
              data={scanWauData}
              lines={[{ dataKey: "value", name: "WAU", color: "#10b981" }]}
            />
          </TabsContent>
          <TabsContent value="mau" className="mt-6">
            <TrendChart
              data={scanMauData}
              lines={[{ dataKey: "value", name: "MAU", color: "#10b981" }]}
            />
          </TabsContent>
        </Tabs>

         
        </div>
      </MetricModal>

      {/* Conversion Modal */}
      <MetricModal open={conversionModalOpen} onOpenChange={setConversionModalOpen} title="스캔 전환율 추이">
        <TrendChart
          data={conversionData}
          lines={[{ dataKey: "conversion", name: "전환율 (%)", color: "#f59e0b" }]}
        />
      </MetricModal>


      {/* Market Registration Modal */}
      <MetricModal open={marketRegistrationModalOpen} onOpenChange={setMarketRegistrationModalOpen} title="마켓 등록 현황">
        <div className="space-y-6">
          {/* 마켓 등록 상태별 개수 */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">등록 상태별 현황</h3>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">정상:</span>
                <span className="font-semibold text-green-600">37개</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">미등록:</span>
                <span className="font-semibold text-red-600">2개</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">심사중:</span>
                <span className="font-semibold text-yellow-600">0개</span>
          </div>
        </div>
          </div>

          {/* 마켓 종류별 그리드 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">마켓 종류별 등록 현황</h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                    <TableHead className="w-16">번호</TableHead>
                    <TableHead className="w-48">마켓 종류</TableHead>
                    <TableHead className="w-24">HT</TableHead>
                    <TableHead className="w-24">COP</TableHead>
                    <TableHead className="w-24">Global</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {[
                    { no: 1, name: "App Store", ht: "o", cop: "o", global: "o" },
                    { no: 2, name: "Play Store", ht: "o", cop: "o", global: "o" },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm text-center">{item.no}</TableCell>
                      <TableCell className="font-medium text-sm">{item.name}</TableCell>
                      <TableCell className="text-sm text-center">{item.ht}</TableCell>
                      <TableCell className="text-sm text-center">{item.cop}</TableCell>
                      <TableCell className="text-sm text-center">{item.global}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        </div>
      </MetricModal>

      {/* New Inflow Modal */}
      <MetricModal open={newInflowModalOpen} onOpenChange={setNewInflowModalOpen} title="가입 경로별 유입수 추이">
        <div className="space-y-6">
          
          {/* 가입 경로별 유입수 추이 */}
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">이메일</p>
                <p className="text-lg font-bold text-purple-600">390명</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">네이버</p>
                <p className="text-lg font-bold text-green-600">320명</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">카카오</p>
                <p className="text-lg font-bold text-yellow-500">280명</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">구글</p>
                <p className="text-lg font-bold text-blue-600">250명</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">애플</p>
                <p className="text-lg font-bold text-gray-700">180명</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">라인</p>
                <p className="text-lg font-bold text-green-500">120명</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">페이스북</p>
                <p className="text-lg font-bold text-blue-500">90명</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">위챗</p>
                <p className="text-lg font-bold text-olive-400">60명</p>
              </div>
            </div>
            
            <TrendChart
              data={[
                { date: "1일", email: 30,naver: 45, kakao: 38, google: 35, apple: 25, line: 17, facebook: 12, wechat: 8 },
                { date: "2일", email: 40,naver: 52, kakao: 42, google: 38, apple: 28, line: 19, facebook: 14, wechat: 9 },
                { date: "3일", email: 30,naver: 48, kakao: 40, google: 36, apple: 26, line: 18, facebook: 13, wechat: 8 },
                { date: "4일", email: 40,naver: 58, kakao: 48, google: 42, apple: 32, line: 22, facebook: 16, wechat: 11 },
                { date: "5일", email: 80,naver: 55, kakao: 45, google: 40, apple: 30, line: 20, facebook: 15, wechat: 10 },
                { date: "6일", email: 10,naver: 62, kakao: 52, google: 45, apple: 35, line: 24, facebook: 18, wechat: 12 },
                { date: "7일", email: 70,naver: 68, kakao: 58, google: 50, apple: 40, line: 26, facebook: 20, wechat: 14 },
              ]}
              lines={[
                { dataKey: "email", name: "이메일", color: "#00c73c" },
                { dataKey: "naver", name: "네이버", color: "#00c73c" },
                { dataKey: "kakao", name: "카카오", color: "#fee500" },
                { dataKey: "google", name: "구글", color: "#4285f4" },
                { dataKey: "apple", name: "애플", color: "#000000" },
                { dataKey: "line", name: "라인", color: "#00c300" },
                { dataKey: "facebook", name: "페이스북", color: "#1877f2" },
                { dataKey: "wechat", name: "위챗", color: "#07c160" },
              ]}
              height={300}
            />
          </div>
        </div>
      </MetricModal>

      {/* Community Posts Modal */}
      <MetricModal open={communityPostsModalOpen} onOpenChange={setCommunityPostsModalOpen} title="커뮤니티 상세 지표">
        <div className="space-y-6">

          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                총 {communityMetricType === "posts" ? "게시물" : 
                     communityMetricType === "comments" ? "댓글" :
                     communityMetricType === "likes" ? "좋아요" : "북마크"}
              </p>
              <p className="text-2xl font-bold text-primary">
                {communityMetricType === "posts" ? "143개" :
                 communityMetricType === "comments" ? "892개" :
                 communityMetricType === "likes" ? "2,156개" : "234개"}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">게시물 작성자</p>
              <p className="text-2xl font-bold text-orange-600">80명</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">무반응 게시물</p>
              <p className="text-2xl font-bold text-orange-600">12개</p>
            </div>
          </div>
          {/* 지표 선택 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">지표 선택:</label>
            <Select value={communityMetricType} onValueChange={setCommunityMetricType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="posts">게시물</SelectItem>
                <SelectItem value="comments">댓글</SelectItem>
                <SelectItem value="likes">좋아요</SelectItem>
                <SelectItem value="bookmarks">북마크</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 추이 차트 */}
          <TrendChart
            data={communityMetricType === "posts" ? [
              { date: "1일", qa: 45, review: 38, tip: 32, trade: 28 },
              { date: "2일", qa: 52, review: 42, tip: 35, trade: 31 },
              { date: "3일", qa: 48, review: 39, tip: 33, trade: 29 },
              { date: "4일", qa: 61, review: 45, tip: 38, trade: 35 },
              { date: "5일", qa: 58, review: 43, tip: 36, trade: 33 },
              { date: "6일", qa: 65, review: 48, tip: 41, trade: 38 },
              { date: "7일", qa: 72, review: 51, tip: 44, trade: 41 },
            ] : communityMetricType === "comments" ? [
              { date: "1일", qa: 156, review: 134, tip: 98, trade: 87 },
              { date: "2일", qa: 178, review: 142, tip: 105, trade: 92 },
              { date: "3일", qa: 165, review: 138, tip: 101, trade: 89 },
              { date: "4일", qa: 192, review: 156, tip: 118, trade: 108 },
              { date: "5일", qa: 185, review: 148, tip: 112, trade: 103 },
              { date: "6일", qa: 208, review: 162, tip: 125, trade: 115 },
              { date: "7일", qa: 225, review: 171, tip: 132, trade: 122 },
            ] : communityMetricType === "likes" ? [
              { date: "1일", qa: 312, review: 268, tip: 196, trade: 174 },
              { date: "2일", qa: 356, review: 284, tip: 210, trade: 184 },
              { date: "3일", qa: 330, review: 276, tip: 202, trade: 178 },
              { date: "4일", qa: 384, review: 312, tip: 236, trade: 216 },
              { date: "5일", qa: 370, review: 296, tip: 224, trade: 206 },
              { date: "6일", qa: 416, review: 324, tip: 250, trade: 230 },
              { date: "7일", qa: 450, review: 342, tip: 264, trade: 244 },
            ] : [
              { date: "1일", qa: 34, review: 28, tip: 21, trade: 18 },
              { date: "2일", qa: 38, review: 30, tip: 23, trade: 20 },
              { date: "3일", qa: 35, review: 29, tip: 22, trade: 19 },
              { date: "4일", qa: 42, review: 33, tip: 25, trade: 23 },
              { date: "5일", qa: 40, review: 31, tip: 24, trade: 22 },
              { date: "6일", qa: 45, review: 35, tip: 27, trade: 25 },
              { date: "7일", qa: 48, review: 37, tip: 28, trade: 26 },
            ]}
            lines={[
              { dataKey: "qa", name: "Q&A", color: "#3b82f6" },
              { dataKey: "review", name: "제품리뷰", color: "#10b981" },
              { dataKey: "tip", name: "판별팁", color: "#f59e0b" },
              { dataKey: "trade", name: "인증거래", color: "#8b5cf6" },
            ]}
            height={350}
          />
        </div>
      </MetricModal>

      {/* New Chat Modal */}
      <MetricModal open={newChatModalOpen} onOpenChange={setNewChatModalOpen} title="신규 채팅방 추이">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">1:1 채팅방</p>
              <p className="text-2xl font-bold text-blue-600">89개</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">인증거래</p>
              <p className="text-2xl font-bold text-green-600">67개</p>
            </div>
          </div>
          <TrendChart
            data={[
              { date: "1일", personal: 120, trade: 85 },
              { date: "2일", personal: 135, trade: 95 },
              { date: "3일", personal: 128, trade: 92 },
              { date: "4일", personal: 152, trade: 108 },
              { date: "5일", personal: 148, trade: 105 },
              { date: "6일", personal: 165, trade: 118 },
              { date: "7일", personal: 178, trade: 125 },
            ]}
            lines={[
              { dataKey: "personal", name: "1:1 채팅방", color: "#3b82f6" },
              { dataKey: "trade", name: "인증거래", color: "#10b981" },
            ]}
            height={350}
          />
        </div>
      </MetricModal>

      {/* 코호트 분석 모달 */}
      <MetricModal open={cohortAnalysisModalOpen} onOpenChange={setCohortAnalysisModalOpen} title="코호트 분석 상세">
        <div className="space-y-6">
          {/* 컨트롤 패널 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">이벤트 날짜</label>
              <input
                type="date"
                value={format(eventDate, 'yyyy-MM-dd')}
                onChange={(e) => setEventDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">분석 기간</label>
              <select
                value={analysisPeriod}
                onChange={(e) => setAnalysisPeriod(e.target.value as '7일' | '30일')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="7일">7일 전후</option>
                <option value="30일">30일 전후</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">분석 지표</label>
              <select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value as '실행' | '신규회원')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="신규회원">신규회원</option>
                <option value="실행">실행</option>
              </select>
            </div>
          </div>

          {/* 상세 추이 차트 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{metricType} 추이 분석</h3>
            <TrendChart
              data={cohortData}
              lines={[
                { 
                  dataKey: "value", 
                  name: metricType, 
                  color: metricType === '신규회원' ? "#10b981" : "#3b82f6" 
                }
              ]}
              height={400}
              showEventLine={true}
              eventDate={format(eventDate, 'MM/dd')}
            />
          </div>

          {/* 통계 요약 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">이벤트 전 평균</div>
              <div className="text-2xl font-bold text-blue-600">
                {metricType === '신규회원' ? '130명' : '2,900회'}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">이벤트 당일</div>
              <div className="text-2xl font-bold text-green-600">
                {metricType === '신규회원' ? '200명' : '3,400회'}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">이벤트 후 평균</div>
              <div className="text-2xl font-bold text-orange-600">
                {metricType === '신규회원' ? '155명' : '3,150회'}
              </div>
            </div>
          </div>
        </div>
      </MetricModal>

      {/* 프리랜딩 답변율 모달 */}
      <MetricModal open={freelancingModalOpen} onOpenChange={setFreelancingModalOpen} title="프리랜딩 답변율 분석">
        <div className="space-y-6">
          {/* 프리랜딩 답변 추이 그래프 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">프리랜딩 답변수 추이</h3>
            <TrendChart
              data={[
                { date: "1일", answerRate: 70.2 },
                { date: "2일", answerRate: 72.1 },
                { date: "3일", answerRate: 73.8 },
                { date: "4일", answerRate: 74.5 },
                { date: "5일", answerRate: 75.0 },
                { date: "6일", answerRate: 75.2 },
                { date: "7일", answerRate: 75.3 },
              ]}
              lines={[
                { dataKey: "answerRate", name: "답변수", color: "#ec4899" },
              ]}
              height={300}
            />
          </div>

          {/* 질문 선택 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">질문 선택:</label>
            <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
              <SelectTrigger className="w-80">
                <SelectValue /> 
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="question1">제품 구매 시 가장 중요하게 생각하는 요소는?</SelectItem>
                <SelectItem value="question2">온라인 쇼핑 시 선호하는 결제 방법은?</SelectItem>
                <SelectItem value="question3">브랜드 신뢰도를 결정하는 가장 중요한 요소는?</SelectItem>
                <SelectItem value="question4">제품 리뷰를 볼 때 가장 신뢰하는 정보는?</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 답변 분포 현황 */}
          <div className="space-y-4">
            
            
            <div className="space-y-2">
              {selectedQuestion === "question1" ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">품질</span>
                    <span className="font-semibold text-blue-600">45%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">가격</span>
                    <span className="font-semibold text-green-600">30%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">브랜드</span>
                    <span className="font-semibold text-orange-600">15%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">서비스</span>
                    <span className="font-semibold text-purple-600">10%</span>
                  </div>
                </>
              ) : selectedQuestion === "question2" ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">카드결제</span>
                    <span className="font-semibold text-blue-600">50%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">계좌이체</span>
                    <span className="font-semibold text-green-600">25%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">간편결제</span>
                    <span className="font-semibold text-orange-600">20%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">현금결제</span>
                    <span className="font-semibold text-purple-600">5%</span>
                  </div>
                </>
              ) : selectedQuestion === "question3" ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">품질 보증</span>
                    <span className="font-semibold text-blue-600">40%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">고객 서비스</span>
                    <span className="font-semibold text-green-600">35%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">브랜드 역사</span>
                    <span className="font-semibold text-orange-600">15%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">가격 정책</span>
                    <span className="font-semibold text-purple-600">10%</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">실제 사용자 리뷰</span>
                    <span className="font-semibold text-blue-600">55%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">전문가 평가</span>
                    <span className="font-semibold text-green-600">25%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">친구/지인 추천</span>
                    <span className="font-semibold text-orange-600">15%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">광고/홍보</span>
                    <span className="font-semibold text-purple-600">5%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </MetricModal>

      {/* 답변율 저조업체 알림 모달 */}
      <MetricModal open={vendorAlertModalOpen} onOpenChange={setVendorAlertModalOpen} title="답변율 저조 업체 리스트">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">답변율 50% 미만 업체 ({lowPerformingVendors.length}개)</p>
            <Button onClick={handleSendEmail} disabled={selectedVendors.length === 0} size="sm">
              <Mail className="mr-2 h-4 w-4" />
              선택 업체 담당자에게 알림 전송
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">선택</TableHead>
                  <TableHead>업체명</TableHead>
                  <TableHead>답변율</TableHead>
                  <TableHead>스캔수</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>담당자 이메일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowPerformingVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedVendors.includes(vendor.id.toString())}
                        onCheckedChange={() => toggleVendor(vendor.id.toString())}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>
                      <span className="text-red-600 font-semibold">{vendor.responseRate}%</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{vendor.scanCount || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{vendor.managerName || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{vendor.contact}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </MetricModal>
    </section>
  )
}
