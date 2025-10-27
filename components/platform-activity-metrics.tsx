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
import CountryHeatmapECharts from "@/components/country-heatmap-echarts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useDateRange } from "@/hooks/use-date-range"
import { activityMetricsData } from "@/lib/metrics-data"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { format, subDays, addDays } from "date-fns"
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
  { label: "HT", value: "12,450회", color: "#3b82f6" },
  { label: "COP", value: "10,720회", color: "#10b981" },
  { label: "Global", value: "8,890회", color: "#f59e0b" },
  { label: "etc", value: "2,380회", color: "#ef4444" },
]

// 모달용 전체 국가 데이터 (8개)
const allCountryData = [
  { label: "HT", value: "12,450회", color: "#3b82f6" },
  { label: "COP", value: "10,720회", color: "#10b981" },
  { label: "Global", value: "8,890회", color: "#f59e0b" },
  { label: "etc", value: "6,720회", color: "#8b5cf6" },
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

interface PlatformActivityMetricsProps {
  selectedCountry?: string
}

export function PlatformActivityMetrics({ selectedCountry = "전체" }: PlatformActivityMetricsProps) {
  const [executionModalOpen, setExecutionModalOpen] = useState(false)
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [conversionModalOpen, setConversionModalOpen] = useState(false)
  const [newInflowModalOpen, setNewInflowModalOpen] = useState(false)
  const [communityPostsModalOpen, setCommunityPostsModalOpen] = useState(false)
  const [communityMetricType, setCommunityMetricType] = useState("posts")
  const [newChatModalOpen, setNewChatModalOpen] = useState(false)
  const [vendorAlertModalOpen, setVendorAlertModalOpen] = useState(false)
  const [freelancingModalOpen, setFreelancingModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState("question1")
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [scanDauData, setScanDauData] = useState(mockDauData)
  const [scanWauData, setScanWauData] = useState(mockWauData)
  const [scanMauData, setScanMauData] = useState(mockMauData)
  const [conversionData, setConversionData] = useState<Array<{ date: string; conversion: number }>>([])
  
  // 이벤트 전후 영향 분석 상태
  const [cohortAnalysisModalOpen, setCohortAnalysisModalOpen] = useState(false)
  const [startDate, setStartDate] = useState(subDays(new Date(), 30))
  const [endDate, setEndDate] = useState(new Date())
  const [trendTab, setTrendTab] = useState<'monthly' | 'weekly' | 'daily'>('monthly')
  const [primaryMetric, setPrimaryMetric] = useState<'실행' | '스캔' | '신규회원' | '커뮤니티' | '채팅'>('실행')
  const [appFilter, setAppFilter] = useState<'전체' | 'HT' | 'COP' | 'Global'>('전체')
  const [secondaryFilter, setSecondaryFilter] = useState<'국가전체' | '언어전체'>('국가전체')
  const [analysisSelectedCountry, setAnalysisSelectedCountry] = useState<string>('전체')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('전체')
  const [cohortData, setCohortData] = useState<Array<{ date: string; value: number }>>([])
  const [selectedApp, setSelectedApp] = useState<string | null>(null)

  // 앱별 국가 데이터 생성 함수
  const generateAppCountryData = () => {
    const baseData = [
      { name: "없음", value: 61608 },
      { name: "중국", value: 46758 },
      { name: "대한민국", value: 18923 },
      { name: "베트남", value: 16948 },
      { name: "태국", value: 11781 },
      { name: "일본", value: 4335 },
      { name: "러시아", value: 4306 },
      { name: "방글라데시", value: 4203 },
      { name: "中国", value: 4074 },
      { name: "인도네시아", value: 3860 },
      { name: "카자흐스탄", value: 3478 },
      { name: "말레이시아", value: 2400 },
      { name: "미국", value: 1993 },
      { name: "대만", value: 1818 },
      { name: "이란", value: 1779 },
      { name: "홍콩", value: 1622 },
      { name: "필리핀", value: 1560 },
      { name: "싱가포르", value: 1314 },
      { name: "사우디아라비아", value: 1240 },
      { name: "이라크", value: 984 },
      { name: "우즈베키스탄", value: 883 },
      { name: "캐나다", value: 755 },
      { name: "캄보디아", value: 674 },
      { name: "영국", value: 673 },
      { name: "우크라이나", value: 589 },
      { name: "이집트", value: 581 },
      { name: "오스트레일리아", value: 580 },
      { name: "아프가니스탄", value: 560 },
      { name: "파키스탄", value: 504 },
      { name: "키르기스스탄", value: 455 },
      { name: "인도", value: 376 },
      { name: "독일", value: 352 },
      { name: "요르단", value: 286 },
      { name: "알제리", value: 268 },
      { name: "모로코", value: 236 },
      { name: "프랑스", value: 221 },
      { name: "스리랑카", value: 220 },
      { name: "오만", value: 217 },
      { name: "라오스", value: 179 },
      { name: "멕시코", value: 175 },
      { name: "폴란드", value: 173 },
      { name: "미얀마(버마)", value: 159 },
      { name: "이탈리아", value: 154 },
      { name: "쿠웨이트", value: 137 },
      { name: "나이지리아", value: 123 },
      { name: "마카오", value: 117 },
      { name: "레바논", value: 116 },
      { name: "타지키스탄", value: 114 },
      { name: "네덜란드", value: 113 },
      { name: "스페인", value: 105 },
      { name: "韩国", value: 105 }
    ]

    if (!selectedApp) {
      return baseData
    }

    // 앱별 배율 설정
    const appMultipliers: { [key: string]: number } = {
      'HT': 1.2,
      'COP': 0.8,
      'Global': 0.6,
      'etc': 0.4
    }

    const multiplier = appMultipliers[selectedApp] || 1.0

    return baseData.map(item => ({
      ...item,
      value: Math.round(item.value * multiplier)
    }))
  }
  
  const { toast } = useToast()
  const { dateRange } = useDateRange()

  // 이벤트 전후 영향 분석 데이터 생성 함수
  const generateCohortData = () => {
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const data = []
    
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = addDays(startDate, i)
        let value
        
      // 기본값 설정
      const baseValue = primaryMetric === '실행' ? 3000 : 
                      primaryMetric === '스캔' ? 1500 :
                      primaryMetric === '신규회원' ? 200 :
                      primaryMetric === '커뮤니티' ? 150 :
                      primaryMetric === '채팅' ? 100 : 100
      
      // 앱별 조정
      const appMultiplier = appFilter === 'HT' ? 1.2 : 
                           appFilter === 'COP' ? 0.8 : 
                           appFilter === 'Global' ? 0.6 : 1.0
      
      // 국가/언어별 조정
      const secondaryMultiplier = secondaryFilter === '국가전체' ? 
        (analysisSelectedCountry === '중국' ? 1.5 : analysisSelectedCountry === '대한민국' ? 1.2 : 1.0) :
        (selectedLanguage === '한국어' ? 1.3 : selectedLanguage === '중국어' ? 1.4 : 1.0)
      
      value = Math.round(baseValue * appMultiplier * secondaryMultiplier + (i % 7) * 50)
        
        data.push({
          date: format(currentDate, 'MM/dd'),
        value: value
        })
    }
    
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // 월별 데이터 생성 함수
  const generateMonthlyData = () => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월']
    const baseValue = primaryMetric === '실행' ? 90000 : 
                    primaryMetric === '스캔' ? 45000 :
                    primaryMetric === '신규회원' ? 6000 :
                    primaryMetric === '커뮤니티' ? 4500 :
                    primaryMetric === '채팅' ? 3000 : 3000
    
    const appMultiplier = appFilter === 'HT' ? 1.2 : 
                         appFilter === 'COP' ? 0.8 : 
                         appFilter === 'Global' ? 0.6 : 1.0
    
    const secondaryMultiplier = secondaryFilter === '국가전체' ? 
      (analysisSelectedCountry === '중국' ? 1.5 : analysisSelectedCountry === '대한민국' ? 1.2 : 1.0) :
      (selectedLanguage === '한국어' ? 1.3 : selectedLanguage === '중국어' ? 1.4 : 1.0)
    
    return months.map((month, index) => ({
      date: month,
      value: Math.round(baseValue * appMultiplier * secondaryMultiplier * (0.8 + (index % 3) * 0.2))
    }))
  }

  // 주별 데이터 생성 함수
  const generateWeeklyData = () => {
    const weeks = ['1주', '2주', '3주', '4주']
    const baseValue = primaryMetric === '실행' ? 21000 : 
                    primaryMetric === '스캔' ? 10500 :
                    primaryMetric === '신규회원' ? 1400 :
                    primaryMetric === '커뮤니티' ? 1050 :
                    primaryMetric === '채팅' ? 700 : 700
    
    const appMultiplier = appFilter === 'HT' ? 1.2 : 
                         appFilter === 'COP' ? 0.8 : 
                         appFilter === 'Global' ? 0.6 : 1.0
    
    const secondaryMultiplier = secondaryFilter === '국가전체' ? 
      (analysisSelectedCountry === '중국' ? 1.5 : analysisSelectedCountry === '대한민국' ? 1.2 : 1.0) :
      (selectedLanguage === '한국어' ? 1.3 : selectedLanguage === '중국어' ? 1.4 : 1.0)
    
    return weeks.map((week, index) => ({
      date: week,
      value: Math.round(baseValue * appMultiplier * secondaryMultiplier * (0.9 + (index % 2) * 0.2))
    }))
  }

  // 일별 데이터 생성 함수
  const generateDailyData = () => {
    const days = ['월', '화', '수', '목', '금', '토', '일']
    const baseValue = primaryMetric === '실행' ? 3000 : 
                    primaryMetric === '스캔' ? 1500 :
                    primaryMetric === '신규회원' ? 200 :
                    primaryMetric === '커뮤니티' ? 150 :
                    primaryMetric === '채팅' ? 100 : 100
    
    const appMultiplier = appFilter === 'HT' ? 1.2 : 
                         appFilter === 'COP' ? 0.8 : 
                         appFilter === 'Global' ? 0.6 : 1.0
    
    const secondaryMultiplier = secondaryFilter === '국가전체' ? 
      (analysisSelectedCountry === '중국' ? 1.5 : analysisSelectedCountry === '대한민국' ? 1.2 : 1.0) :
      (selectedLanguage === '한국어' ? 1.3 : selectedLanguage === '중국어' ? 1.4 : 1.0)
    
    return days.map((day, index) => {
      // 주말은 값이 낮게 설정
      const weekendMultiplier = (day === '토' || day === '일') ? 0.6 : 1.0
      return {
        date: day,
        value: Math.round(baseValue * appMultiplier * secondaryMultiplier * weekendMultiplier * (0.8 + (index % 3) * 0.1))
      }
    })
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
    setCohortData(generateCohortData())
  }, [startDate, endDate, primaryMetric, appFilter, secondaryFilter, analysisSelectedCountry, selectedLanguage])

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

  if (!mounted) {
    return <div className="space-y-4 w-full" />
  }

  return (
    <section className="space-y-4 w-full">
      
      <div className="grid gap-3" style={{ gridTemplateColumns: '2fr 3fr' }}>
        {/* col-2: 실행 점유율과 시각 분포도 */}
        <div>
          <div className="p-4 bg-card border border-border rounded-lg h-full">
            <div className="space-y-4">
              
              {/* 파이차트와 히트맵을 좌우로 배치 */}
              <div className="grid grid-cols-2 gap-4 h-64">
                {/* 좌측: 파이차트 */}
                <div className="space-y-2">
                  <h4 className="text-sm text-muted-foreground font-medium">앱별 실행 분포</h4>
                  <div className="h-full flex items-center justify-center">
                     <div className="w-full h-full">
                    <CountryPieChart 
                      data={topExeCountryData} 
                         onCountryClick={(country) => {
                           if (selectedApp === country) {
                             setSelectedApp(null) // 같은 앱을 다시 클릭하면 전체로 돌아감
                           } else {
                             setSelectedApp(country) // 다른 앱을 클릭하면 해당 앱으로 변경
                           }
                         }}
                      showLegend={true}
                    />
                     </div>
                  </div>
                </div>

                {/* 우측: 히트맵 */}
                <div className="space-y-2">
                  <h4 className="text-sm text-muted-foreground font-medium">
                    {selectedApp ? `${selectedApp} 실행 시각 분포` : "전체 앱 실행 시각 분포"}
                  </h4>
                      <div className="h-full flex items-center justify-center">
                        {!selectedApp ? (
                          <CountryHeatmap 
                            country="전체" 
                            data={[
                              { day: '월', hour: 0, value: 105 }, { day: '월', hour: 4, value: 70 }, { day: '월', hour: 8, value: 90 }, { day: '월', hour: 12, value: 225 }, { day: '월', hour: 16, value: 279 }, { day: '월', hour: 20, value: 145 },
                              { day: '화', hour: 0, value: 95 }, { day: '화', hour: 4, value: 60 }, { day: '화', hour: 8, value: 100 }, { day: '화', hour: 12, value: 248 }, { day: '화', hour: 16, value: 288 }, { day: '화', hour: 20, value: 138 },
                              { day: '수', hour: 0, value: 108 }, { day: '수', hour: 4, value: 72 }, { day: '수', hour: 8, value: 108 }, { day: '수', hour: 12, value: 252 }, { day: '수', hour: 16, value: 282 }, { day: '수', hour: 20, value: 150 },
                              { day: '목', hour: 0, value: 109 }, { day: '목', hour: 4, value: 76 }, { day: '목', hour: 8, value: 129 }, { day: '목', hour: 12, value: 248 }, { day: '목', hour: 16, value: 278 }, { day: '목', hour: 20, value: 162 },
                              { day: '금', hour: 0, value: 128 }, { day: '금', hour: 4, value: 95 }, { day: '금', hour: 8, value: 137 }, { day: '금', hour: 12, value: 261 }, { day: '금', hour: 16, value: 291 }, { day: '금', hour: 20, value: 185 },
                              { day: '토', hour: 0, value: 76 }, { day: '토', hour: 4, value: 53 }, { day: '토', hour: 8, value: 82 }, { day: '토', hour: 12, value: 193 }, { day: '토', hour: 16, value: 263 }, { day: '토', hour: 20, value: 143 },
                              { day: '일', hour: 0, value: 62 }, { day: '일', hour: 4, value: 41 }, { day: '일', hour: 8, value: 72 }, { day: '일', hour: 12, value: 156 }, { day: '일', hour: 16, value: 233 }, { day: '일', hour: 20, value: 117 },
                            ]} 
                            size="small"
                          />
                        ) : selectedApp === "HT" ? (
                          <CountryHeatmap 
                            country="HT" 
                            data={[
                              { day: '월', hour: 0, value: 45 }, { day: '월', hour: 4, value: 32 }, { day: '월', hour: 8, value: 28 }, { day: '월', hour: 12, value: 65 }, { day: '월', hour: 16, value: 89 }, { day: '월', hour: 20, value: 52 },
                              { day: '화', hour: 0, value: 38 }, { day: '화', hour: 4, value: 25 }, { day: '화', hour: 8, value: 35 }, { day: '화', hour: 12, value: 72 }, { day: '화', hour: 16, value: 95 }, { day: '화', hour: 20, value: 48 },
                              { day: '수', hour: 0, value: 42 }, { day: '수', hour: 4, value: 28 }, { day: '수', hour: 8, value: 38 }, { day: '수', hour: 12, value: 68 }, { day: '수', hour: 16, value: 92 }, { day: '수', hour: 20, value: 45 },
                              { day: '목', hour: 0, value: 35 }, { day: '목', hour: 4, value: 22 }, { day: '목', hour: 8, value: 32 }, { day: '목', hour: 12, value: 58 }, { day: '목', hour: 16, value: 85 }, { day: '목', hour: 20, value: 42 },
                              { day: '금', hour: 0, value: 48 }, { day: '금', hour: 4, value: 35 }, { day: '금', hour: 8, value: 42 }, { day: '금', hour: 12, value: 75 }, { day: '금', hour: 16, value: 98 }, { day: '금', hour: 20, value: 55 },
                              { day: '토', hour: 0, value: 25 }, { day: '토', hour: 4, value: 18 }, { day: '토', hour: 8, value: 22 }, { day: '토', hour: 12, value: 45 }, { day: '토', hour: 16, value: 65 }, { day: '토', hour: 20, value: 32 },
                              { day: '일', hour: 0, value: 22 }, { day: '일', hour: 4, value: 15 }, { day: '일', hour: 8, value: 18 }, { day: '일', hour: 12, value: 38 }, { day: '일', hour: 16, value: 55 }, { day: '일', hour: 20, value: 28 },
                            ]} 
                            size="small"
                          />
                        ) : selectedApp === "COP" ? (
                          <CountryHeatmap 
                            country="COP" 
                            data={[
                              { day: '월', hour: 0, value: 25 }, { day: '월', hour: 4, value: 15 }, { day: '월', hour: 8, value: 35 }, { day: '월', hour: 12, value: 85 }, { day: '월', hour: 16, value: 95 }, { day: '월', hour: 20, value: 45 },
                              { day: '화', hour: 0, value: 22 }, { day: '화', hour: 4, value: 12 }, { day: '화', hour: 8, value: 38 }, { day: '화', hour: 12, value: 88 }, { day: '화', hour: 16, value: 98 }, { day: '화', hour: 20, value: 48 },
                              { day: '수', hour: 0, value: 28 }, { day: '수', hour: 4, value: 18 }, { day: '수', hour: 8, value: 42 }, { day: '수', hour: 12, value: 92 }, { day: '수', hour: 16, value: 95 }, { day: '수', hour: 20, value: 52 },
                              { day: '목', hour: 0, value: 32 }, { day: '목', hour: 4, value: 22 }, { day: '목', hour: 8, value: 45 }, { day: '목', hour: 12, value: 95 }, { day: '목', hour: 16, value: 98 }, { day: '목', hour: 20, value: 58 },
                              { day: '금', hour: 0, value: 35 }, { day: '금', hour: 4, value: 25 }, { day: '금', hour: 8, value: 48 }, { day: '금', hour: 12, value: 98 }, { day: '금', hour: 16, value: 95 }, { day: '금', hour: 20, value: 62 },
                              { day: '토', hour: 0, value: 18 }, { day: '토', hour: 4, value: 12 }, { day: '토', hour: 8, value: 25 }, { day: '토', hour: 12, value: 55 }, { day: '토', hour: 16, value: 75 }, { day: '토', hour: 20, value: 38 },
                              { day: '일', hour: 0, value: 15 }, { day: '일', hour: 4, value: 8 }, { day: '일', hour: 8, value: 22 }, { day: '일', hour: 12, value: 48 }, { day: '일', hour: 16, value: 68 }, { day: '일', hour: 20, value: 32 },
                            ]} 
                            size="small"
                          />
                        ) : selectedApp === "Global" ? (
                          <CountryHeatmap 
                            country="Global" 
                            data={[
                              { day: '월', hour: 0, value: 35 }, { day: '월', hour: 4, value: 25 }, { day: '월', hour: 8, value: 45 }, { day: '월', hour: 12, value: 75 }, { day: '월', hour: 16, value: 85 }, { day: '월', hour: 20, value: 48 },
                              { day: '화', hour: 0, value: 32 }, { day: '화', hour: 4, value: 22 }, { day: '화', hour: 8, value: 42 }, { day: '화', hour: 12, value: 78 }, { day: '화', hour: 16, value: 88 }, { day: '화', hour: 20, value: 52 },
                              { day: '수', hour: 0, value: 38 }, { day: '수', hour: 4, value: 28 }, { day: '수', hour: 8, value: 48 }, { day: '수', hour: 12, value: 82 }, { day: '수', hour: 16, value: 92 }, { day: '수', hour: 20, value: 58 },
                              { day: '목', hour: 0, value: 42 }, { day: '목', hour: 4, value: 32 }, { day: '목', hour: 8, value: 52 }, { day: '목', hour: 12, value: 85 }, { day: '목', hour: 16, value: 95 }, { day: '목', hour: 20, value: 62 },
                              { day: '금', hour: 0, value: 45 }, { day: '금', hour: 4, value: 35 }, { day: '금', hour: 8, value: 55 }, { day: '금', hour: 12, value: 88 }, { day: '금', hour: 16, value: 98 }, { day: '금', hour: 20, value: 68 },
                              { day: '토', hour: 0, value: 28 }, { day: '토', hour: 4, value: 18 }, { day: '토', hour: 8, value: 35 }, { day: '토', hour: 12, value: 65 }, { day: '토', hour: 16, value: 78 }, { day: '토', hour: 20, value: 45 },
                              { day: '일', hour: 0, value: 25 }, { day: '일', hour: 4, value: 15 }, { day: '일', hour: 8, value: 32 }, { day: '일', hour: 12, value: 58 }, { day: '일', hour: 16, value: 72 }, { day: '일', hour: 20, value: 38 },
                            ]} 
                            size="small"
                          />
                        ) : selectedApp === "etc" ? (
                          <CountryHeatmap 
                            country="etc" 
                            data={[
                              { day: '월', hour: 0, value: 15 }, { day: '월', hour: 4, value: 8 }, { day: '월', hour: 8, value: 22 }, { day: '월', hour: 12, value: 45 }, { day: '월', hour: 16, value: 68 }, { day: '월', hour: 20, value: 58 },
                              { day: '화', hour: 0, value: 12 }, { day: '화', hour: 4, value: 5 }, { day: '화', hour: 8, value: 18 }, { day: '화', hour: 12, value: 48 }, { day: '화', hour: 16, value: 72 }, { day: '화', hour: 20, value: 62 },
                              { day: '수', hour: 0, value: 18 }, { day: '수', hour: 4, value: 8 }, { day: '수', hour: 8, value: 25 }, { day: '수', hour: 12, value: 52 }, { day: '수', hour: 16, value: 75 }, { day: '수', hour: 20, value: 65 },
                              { day: '목', hour: 0, value: 22 }, { day: '목', hour: 4, value: 12 }, { day: '목', hour: 8, value: 28 }, { day: '목', hour: 12, value: 55 }, { day: '목', hour: 16, value: 78 }, { day: '목', hour: 20, value: 68 },
                              { day: '금', hour: 0, value: 25 }, { day: '금', hour: 4, value: 15 }, { day: '금', hour: 8, value: 32 }, { day: '금', hour: 12, value: 58 }, { day: '금', hour: 16, value: 82 }, { day: '금', hour: 20, value: 72 },
                              { day: '토', hour: 0, value: 8 }, { day: '토', hour: 4, value: 5 }, { day: '토', hour: 8, value: 12 }, { day: '토', hour: 12, value: 28 }, { day: '토', hour: 16, value: 45 }, { day: '토', hour: 20, value: 35 },
                              { day: '일', hour: 0, value: 5 }, { day: '일', hour: 4, value: 3 }, { day: '일', hour: 8, value: 8 }, { day: '일', hour: 12, value: 22 }, { day: '일', hour: 16, value: 38 }, { day: '일', hour: 20, value: 25 },
                            ]} 
                            size="small"
                          />
                        ) : null}
                      </div>
                      </div>
                    </div>
                </div>
            {/* <div className="pt-2 border-t border-border">
            <button
          onClick={() => setExecutionModalOpen(true)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  → 더 많은 국가 보기
                </button>
          </div> */}
          </div>
        </div>
        
        {/* col-3: 국가별 실행 수 히트맵 */}
        <div>
          <div className="p-4 bg-card border border-border rounded-lg h-full">
            <div className="space-y-4">
              <h4 className="text-sm text-muted-foreground font-medium">
                {selectedApp ? `${selectedApp} 국가별 실행 수 히트맵` : "국가별 실행 수 히트맵"}
              </h4>
              <div className="h-64">
                <CountryHeatmapECharts 
                  height="h-full"
                  data={generateAppCountryData()}
                  onCountrySelect={(country) => console.log('Country clicked:', country)}
                  selectedCountry={selectedCountry}
                />
              </div>
            </div>
          </div>
          </div>
        </div>
        
      {/* 지표 카드들 - 각각 col-1씩 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <MetricCard
          title="신규 회원 수"
          // diffValue={8.5}
          onClick={() => setNewInflowModalOpen(true)}
          textData={[
            { label: "앱 유입", value: "850명 (70.8%)", color: "#3b82f6" },
            { label: "커머스 유입", value: "350명 (29.2%)", color: "#10b981" },
          ]}
          showSignupPathLink={true}
          // showInflowTrend={true} // 가입 경로별 추이 그래프 
        />
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
            { label: "1:1", value: "89개 (57.1%)", color: "#3b82f6" },
            { label: "인증거래", value: "67개 (42.9%)", color: "#10b981" },
          ]}
          showSignupPathLink={true}
          signupPathLinkText="→ 채팅별 상세지표 보기"
          
        />
        
         <Card className="p-4 bg-card border-border transition-all flex flex-col h-full col-span-2">
           <div className="space-y-3 flex-1">
             <div className="flex items-start justify-between">
               <div className="space-y-2 flex-1">
                 <p className="text-sm text-muted-foreground font-medium">커스텀 지표 데이터 검색</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{format(startDate, 'MM/dd')} - {format(endDate, 'MM/dd')}</span>
                    <span className="text-sm text-muted-foreground">({primaryMetric})</span>
                 </div>
                 <BarChart3 className="h-5 w-5 text-primary" />
               </div>
             </div>

             {/* 컨트롤 패널 */}
             <div className="space-y-2">
               <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                   <label className="text-xs text-muted-foreground">시작 기간</label>
                   <input
                     type="date"
                     value={format(startDate, 'yyyy-MM-dd')}
                     onChange={(e) => setStartDate(new Date(e.target.value))}
                     className="w-full text-xs px-2 py-1 border border-border rounded bg-background"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs text-muted-foreground">끝 기간</label>
                   <input
                     type="date"
                     value={format(endDate, 'yyyy-MM-dd')}
                     onChange={(e) => setEndDate(new Date(e.target.value))}
                     className="w-full text-xs px-2 py-1 border border-border rounded bg-background"
                   />
                 </div>
               </div>
               {/* 필터링 선택 박스들 - 한 줄에 배치 */}
               <div className="grid grid-cols-4 gap-2">
                 <div className="space-y-1">
                   <label className="text-xs text-muted-foreground">기준 지표</label>
                   <select
                     value={primaryMetric}
                     onChange={(e) => setPrimaryMetric(e.target.value as '실행' | '스캔' | '신규회원' | '커뮤니티' | '채팅')}
                     className="w-full text-xs px-2 py-1 border border-border rounded bg-background"
                   >
                     <option value="실행">실행</option>
                     <option value="스캔">스캔</option>
                     <option value="신규회원">신규회원</option>
                     <option value="커뮤니티">커뮤니티</option>
                   </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs text-muted-foreground">앱 필터</label>
                   <select
                     value={appFilter}
                     onChange={(e) => setAppFilter(e.target.value as '전체' | 'HT' | 'COP' | 'Global')}
                     className="w-full text-xs px-2 py-1 border border-border rounded bg-background"
                   >
                     <option value="전체">앱 전체</option>
                     <option value="HT">HT</option>
                     <option value="COP">COP</option>
                     <option value="Global">Global</option>
                   </select>
               </div>
               <div className="space-y-1">
                   <label className="text-xs text-muted-foreground">세부 필터</label>
                 <select
                     value={secondaryFilter}
                     onChange={(e) => setSecondaryFilter(e.target.value as '국가전체' | '언어전체')}
                   className="w-full text-xs px-2 py-1 border border-border rounded bg-background"
                 >
                     <option value="국가전체">국가전체</option>
                     <option value="언어전체">언어전체</option>
                 </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs text-muted-foreground">
                     {secondaryFilter === '국가전체' ? '국가 선택' : '언어 선택'}
                   </label>
                   {secondaryFilter === '국가전체' ? (
                     <select
                       value={analysisSelectedCountry}
                       onChange={(e) => setAnalysisSelectedCountry(e.target.value)}
                       className="w-full text-xs px-2 py-1 border border-border rounded bg-background"
                     >
                       <option value="전체">전체</option>
                       <option value="중국">중국</option>
                       <option value="대한민국">대한민국</option>
                       <option value="베트남">베트남</option>
                       <option value="태국">태국</option>
                       <option value="일본">일본</option>
                     </select>
                   ) : (
                     <select
                       value={selectedLanguage}
                       onChange={(e) => setSelectedLanguage(e.target.value)}
                       className="w-full text-xs px-2 py-1 border border-border rounded bg-background"
                     >
                       <option value="전체">전체</option>
                       <option value="한국어">한국어</option>
                       <option value="중국어">중국어</option>
                       <option value="영어">영어</option>
                       <option value="일본어">일본어</option>
                     </select>
                   )}
                 </div>
               </div>
             </div>

             {/* 미니 추이 차트 */}
             <div className="h-24">
               <TrendChart
                 data={cohortData}
                 lines={[
                   { 
                     dataKey: "value", 
                     name: primaryMetric, 
                     color: primaryMetric === '신규회원' ? "#10b981" : 
                            primaryMetric === '실행' ? "#3b82f6" :
                            primaryMetric === '스캔' ? "#f59e0b" :
                            primaryMetric === '커뮤니티' ? "#8b5cf6" :
                            primaryMetric === '채팅' ? "#ef4444" : "#3b82f6"
                   }
                 ]}
                 height={96}
                 hideLegend={true}
                 hideTooltip={true}
                 hideAxes={true}
               />
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
     
      </div>

      {/* Execution Modal */}
      <MetricModal open={executionModalOpen} onOpenChange={setExecutionModalOpen} title="국가별 실행 시각 분포도">
        <div className="space-y-6">
          {/* 전체 국가 파이차트 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">전체 앱별 실행 분포</h3>
            <CountryPieChart 
              data={allCountryData} 
              onCountryClick={(country) => console.log('Country clicked:', country)}
              showLegend={true}
            />
          </div>
          
          {/* 국가별 히트맵 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">앱별 실행 시각 분포도</h3>
            {selectedCountry && (
              <div className="space-y-6">
                {selectedCountry === "HT" && (
                  <CountryHeatmap 
                    country="HT" 
                    data={[
                      { day: '월', hour: 0, value: 45 }, { day: '월', hour: 4, value: 32 }, { day: '월', hour: 8, value: 28 }, { day: '월', hour: 12, value: 65 }, { day: '월', hour: 16, value: 89 }, { day: '월', hour: 20, value: 52 },
                      { day: '화', hour: 0, value: 38 }, { day: '화', hour: 4, value: 25 }, { day: '화', hour: 8, value: 35 }, { day: '화', hour: 12, value: 72 }, { day: '화', hour: 16, value: 95 }, { day: '화', hour: 20, value: 48 },
                      { day: '수', hour: 0, value: 42 }, { day: '수', hour: 4, value: 28 }, { day: '수', hour: 8, value: 38 }, { day: '수', hour: 12, value: 68 }, { day: '수', hour: 16, value: 92 }, { day: '수', hour: 20, value: 45 },
                      { day: '목', hour: 0, value: 35 }, { day: '목', hour: 4, value: 22 }, { day: '목', hour: 8, value: 32 }, { day: '목', hour: 12, value: 58 }, { day: '목', hour: 16, value: 85 }, { day: '목', hour: 20, value: 42 },
                      { day: '금', hour: 0, value: 48 }, { day: '금', hour: 4, value: 35 }, { day: '금', hour: 8, value: 42 }, { day: '금', hour: 12, value: 75 }, { day: '금', hour: 16, value: 98 }, { day: '금', hour: 20, value: 55 },
                      { day: '토', hour: 0, value: 25 }, { day: '토', hour: 4, value: 18 }, { day: '토', hour: 8, value: 22 }, { day: '토', hour: 12, value: 45 }, { day: '토', hour: 16, value: 65 }, { day: '토', hour: 20, value: 32 },
                      { day: '일', hour: 0, value: 22 }, { day: '일', hour: 4, value: 15 }, { day: '일', hour: 8, value: 18 }, { day: '일', hour: 12, value: 38 }, { day: '일', hour: 16, value: 55 }, { day: '일', hour: 20, value: 28 },
                    ]} 
                  />
                )}
                
                {selectedCountry === "COP" && (
                  <CountryHeatmap 
                    country="COP" 
                    data={[
                      { day: '월', hour: 0, value: 25 }, { day: '월', hour: 4, value: 15 }, { day: '월', hour: 8, value: 35 }, { day: '월', hour: 12, value: 85 }, { day: '월', hour: 16, value: 95 }, { day: '월', hour: 20, value: 45 },
                      { day: '화', hour: 0, value: 22 }, { day: '화', hour: 4, value: 12 }, { day: '화', hour: 8, value: 38 }, { day: '화', hour: 12, value: 88 }, { day: '화', hour: 16, value: 98 }, { day: '화', hour: 20, value: 48 },
                      { day: '수', hour: 0, value: 28 }, { day: '수', hour: 4, value: 18 }, { day: '수', hour: 8, value: 42 }, { day: '수', hour: 12, value: 92 }, { day: '수', hour: 16, value: 95 }, { day: '수', hour: 20, value: 52 },
                      { day: '목', hour: 0, value: 32 }, { day: '목', hour: 4, value: 22 }, { day: '목', hour: 8, value: 45 }, { day: '목', hour: 12, value: 95 }, { day: '목', hour: 16, value: 98 }, { day: '목', hour: 20, value: 58 },
                      { day: '금', hour: 0, value: 35 }, { day: '금', hour: 4, value: 25 }, { day: '금', hour: 8, value: 48 }, { day: '금', hour: 12, value: 98 }, { day: '금', hour: 16, value: 95 }, { day: '금', hour: 20, value: 62 },
                      { day: '토', hour: 0, value: 18 }, { day: '토', hour: 4, value: 12 }, { day: '토', hour: 8, value: 25 }, { day: '토', hour: 12, value: 55 }, { day: '토', hour: 16, value: 75 }, { day: '토', hour: 20, value: 38 },
                      { day: '일', hour: 0, value: 15 }, { day: '일', hour: 4, value: 8 }, { day: '일', hour: 8, value: 22 }, { day: '일', hour: 12, value: 48 }, { day: '일', hour: 16, value: 68 }, { day: '일', hour: 20, value: 32 },
                    ]} 
                  />
                )}
                
                {selectedCountry === "Global" && (
                  <CountryHeatmap 
                    country="Global" 
                    data={[
                      { day: '월', hour: 0, value: 35 }, { day: '월', hour: 4, value: 25 }, { day: '월', hour: 8, value: 45 }, { day: '월', hour: 12, value: 75 }, { day: '월', hour: 16, value: 85 }, { day: '월', hour: 20, value: 48 },
                      { day: '화', hour: 0, value: 32 }, { day: '화', hour: 4, value: 22 }, { day: '화', hour: 8, value: 42 }, { day: '화', hour: 12, value: 78 }, { day: '화', hour: 16, value: 88 }, { day: '화', hour: 20, value: 52 },
                      { day: '수', hour: 0, value: 38 }, { day: '수', hour: 4, value: 28 }, { day: '수', hour: 8, value: 48 }, { day: '수', hour: 12, value: 82 }, { day: '수', hour: 16, value: 92 }, { day: '수', hour: 20, value: 58 },
                      { day: '목', hour: 0, value: 42 }, { day: '목', hour: 4, value: 32 }, { day: '목', hour: 8, value: 52 }, { day: '목', hour: 12, value: 85 }, { day: '목', hour: 16, value: 95 }, { day: '목', hour: 20, value: 62 },
                      { day: '금', hour: 0, value: 45 }, { day: '금', hour: 4, value: 35 }, { day: '금', hour: 8, value: 55 }, { day: '금', hour: 12, value: 88 }, { day: '금', hour: 16, value: 98 }, { day: '금', hour: 20, value: 68 },
                      { day: '토', hour: 0, value: 28 }, { day: '토', hour: 4, value: 18 }, { day: '토', hour: 8, value: 35 }, { day: '토', hour: 12, value: 65 }, { day: '토', hour: 16, value: 78 }, { day: '토', hour: 20, value: 45 },
                      { day: '일', hour: 0, value: 25 }, { day: '일', hour: 4, value: 15 }, { day: '일', hour: 8, value: 32 }, { day: '일', hour: 12, value: 58 }, { day: '일', hour: 16, value: 72 }, { day: '일', hour: 20, value: 38 },
                    ]} 
                  />
                )}
                
                {selectedCountry === "미국" && (
                  <CountryHeatmap 
                    country="미국" 
                    data={[
                      { day: '월', hour: 0, value: 15 }, { day: '월', hour: 4, value: 8 }, { day: '월', hour: 8, value: 22 }, { day: '월', hour: 12, value: 45 }, { day: '월', hour: 16, value: 68 }, { day: '월', hour: 20, value: 58 },
                      { day: '화', hour: 0, value: 12 }, { day: '화', hour: 4, value: 5 }, { day: '화', hour: 8, value: 18 }, { day: '화', hour: 12, value: 48 }, { day: '화', hour: 16, value: 72 }, { day: '화', hour: 20, value: 62 },
                      { day: '수', hour: 0, value: 18 }, { day: '수', hour: 4, value: 8 }, { day: '수', hour: 8, value: 25 }, { day: '수', hour: 12, value: 52 }, { day: '수', hour: 16, value: 75 }, { day: '수', hour: 20, value: 65 },
                      { day: '목', hour: 0, value: 22 }, { day: '목', hour: 4, value: 12 }, { day: '목', hour: 8, value: 28 }, { day: '목', hour: 12, value: 55 }, { day: '목', hour: 16, value: 78 }, { day: '목', hour: 20, value: 68 },
                      { day: '금', hour: 0, value: 25 }, { day: '금', hour: 4, value: 15 }, { day: '금', hour: 8, value: 32 }, { day: '금', hour: 12, value: 58 }, { day: '금', hour: 16, value: 82 }, { day: '금', hour: 20, value: 72 },
                      { day: '토', hour: 0, value: 8 }, { day: '토', hour: 4, value: 5 }, { day: '토', hour: 8, value: 12 }, { day: '토', hour: 12, value: 28 }, { day: '토', hour: 16, value: 45 }, { day: '토', hour: 20, value: 35 },
                      { day: '일', hour: 0, value: 5 }, { day: '일', hour: 4, value: 3 }, { day: '일', hour: 8, value: 8 }, { day: '일', hour: 12, value: 22 }, { day: '일', hour: 16, value: 38 }, { day: '일', hour: 20, value: 25 },
                    ]} 
                  />
                )}
                
                {selectedCountry === "etc" && (
                  <CountryHeatmap 
                    country="etc" 
                    data={[
                      { day: '월', hour: 0, value: 12 }, { day: '월', hour: 4, value: 8 }, { day: '월', hour: 8, value: 18 }, { day: '월', hour: 12, value: 35 }, { day: '월', hour: 16, value: 48 }, { day: '월', hour: 20, value: 38 },
                      { day: '화', hour: 0, value: 10 }, { day: '화', hour: 4, value: 6 }, { day: '화', hour: 8, value: 15 }, { day: '화', hour: 12, value: 38 }, { day: '화', hour: 16, value: 52 }, { day: '화', hour: 20, value: 42 },
                      { day: '수', hour: 0, value: 15 }, { day: '수', hour: 4, value: 10 }, { day: '수', hour: 8, value: 22 }, { day: '수', hour: 12, value: 42 }, { day: '수', hour: 16, value: 55 }, { day: '수', hour: 20, value: 45 },
                      { day: '목', hour: 0, value: 18 }, { day: '목', hour: 4, value: 12 }, { day: '목', hour: 8, value: 25 }, { day: '목', hour: 12, value: 45 }, { day: '목', hour: 16, value: 58 }, { day: '목', hour: 20, value: 48 },
                      { day: '금', hour: 0, value: 22 }, { day: '금', hour: 4, value: 15 }, { day: '금', hour: 8, value: 28 }, { day: '금', hour: 12, value: 48 }, { day: '금', hour: 16, value: 62 }, { day: '금', hour: 20, value: 52 },
                      { day: '토', hour: 0, value: 8 }, { day: '토', hour: 4, value: 5 }, { day: '토', hour: 8, value: 12 }, { day: '토', hour: 12, value: 25 }, { day: '토', hour: 16, value: 35 }, { day: '토', hour: 20, value: 28 },
                      { day: '일', hour: 0, value: 6 }, { day: '일', hour: 4, value: 3 }, { day: '일', hour: 8, value: 8 }, { day: '일', hour: 12, value: 18 }, { day: '일', hour: 16, value: 28 }, { day: '일', hour: 20, value: 18 },
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
      <MetricModal open={cohortAnalysisModalOpen} onOpenChange={setCohortAnalysisModalOpen} title="검색 상세">
        <div className="space-y-6">
          {/* 컨트롤 패널 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">시작 기간</label>
              <input
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">끝 기간</label>
              <input
                type="date"
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">기준 지표</label>
              <select
                value={primaryMetric}
                onChange={(e) => setPrimaryMetric(e.target.value as '실행' | '스캔' | '신규회원' | '커뮤니티' | '채팅')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="실행">실행</option>
                <option value="스캔">스캔</option>
                <option value="신규회원">신규회원</option>
                <option value="커뮤니티">커뮤니티</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">앱 필터</label>
              <select
                value={appFilter}
                onChange={(e) => setAppFilter(e.target.value as '전체' | 'HT' | 'COP' | 'Global')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="전체">앱 전체</option>
                <option value="HT">HT</option>
                <option value="COP">COP</option>
                <option value="Global">Global</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">세부 필터</label>
              <select
                value={secondaryFilter}
                onChange={(e) => setSecondaryFilter(e.target.value as '국가전체' | '언어전체')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="국가전체">국가전체</option>
                <option value="언어전체">언어전체</option>
              </select>
            </div>
          </div>
          
          {secondaryFilter === '국가전체' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">국가 선택</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="전체">전체</option>
                <option value="중국">중국</option>
                <option value="대한민국">대한민국</option>
                <option value="베트남">베트남</option>
                <option value="태국">태국</option>
                <option value="일본">일본</option>
              </select>
            </div>
          )}
          
          {secondaryFilter === '언어전체' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">언어 선택</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="전체">전체</option>
                <option value="한국어">한국어</option>
                <option value="중국어">중국어</option>
                <option value="영어">영어</option>
                <option value="일본어">일본어</option>
              </select>
            </div>
          )}

          {/* 상세 추이 차트 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{primaryMetric} 추이 분석</h3>
            <Tabs value={trendTab} onValueChange={(value) => setTrendTab(value as 'monthly' | 'weekly' | 'daily')}>
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger value="monthly">월별</TabsTrigger>
                <TabsTrigger value="weekly">주별</TabsTrigger>
                <TabsTrigger value="daily">일별</TabsTrigger>
              </TabsList>
              <TabsContent value="monthly">
            <TrendChart
                  data={generateMonthlyData()}
              lines={[
                { 
                  dataKey: "value", 
                      name: primaryMetric, 
                      color: primaryMetric === '신규회원' ? "#10b981" : 
                             primaryMetric === '실행' ? "#3b82f6" :
                             primaryMetric === '스캔' ? "#f59e0b" :
                             primaryMetric === '커뮤니티' ? "#8b5cf6" :
                             primaryMetric === '채팅' ? "#ef4444" : "#3b82f6"
                }
              ]}
              height={400}
                />
              </TabsContent>
              <TabsContent value="weekly">
                <TrendChart
                  data={generateWeeklyData()}
                  lines={[
                    { 
                      dataKey: "value", 
                      name: primaryMetric, 
                      color: primaryMetric === '신규회원' ? "#10b981" : 
                             primaryMetric === '실행' ? "#3b82f6" :
                             primaryMetric === '스캔' ? "#f59e0b" :
                             primaryMetric === '커뮤니티' ? "#8b5cf6" :
                             primaryMetric === '채팅' ? "#ef4444" : "#3b82f6"
                    }
                  ]}
                  height={400}
                />
              </TabsContent>
              <TabsContent value="daily">
                <TrendChart
                  data={generateDailyData()}
                  lines={[
                    { 
                      dataKey: "value", 
                      name: primaryMetric, 
                      color: primaryMetric === '신규회원' ? "#10b981" : 
                             primaryMetric === '실행' ? "#3b82f6" :
                             primaryMetric === '스캔' ? "#f59e0b" :
                             primaryMetric === '커뮤니티' ? "#8b5cf6" :
                             primaryMetric === '채팅' ? "#ef4444" : "#3b82f6"
                    }
                  ]}
                  height={400}
                />
              </TabsContent>
            </Tabs>
          </div>
          {/* 앱 파이차트와 국가 파이차트 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">분포 분석</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">앱별 분포</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "HT", value: 45, color: "#3b82f6" },
                          { name: "COP", value: 35, color: "#10b981" },
                          { name: "Global", value: 20, color: "#8b5cf6" }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {[
                          { name: "HT", value: 45, color: "#3b82f6" },
                          { name: "COP", value: 35, color: "#10b981" },
                          { name: "Global", value: 20, color: "#8b5cf6" }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
              </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">HT 45%</span>
                  <span className="text-green-600">COP 35%</span>
                  <span className="text-purple-600">Global 20%</span>
            </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">국가별 분포</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "중국", value: 40, color: "#ef4444" },
                          { name: "대한민국", value: 25, color: "#3b82f6" },
                          { name: "베트남", value: 15, color: "#10b981" },
                          { name: "기타", value: 20, color: "#6b7280" }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {[
                          { name: "중국", value: 40, color: "#ef4444" },
                          { name: "대한민국", value: 25, color: "#3b82f6" },
                          { name: "베트남", value: 15, color: "#10b981" },
                          { name: "기타", value: 20, color: "#6b7280" }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
            </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-600">중국 40%</span>
                  <span className="text-blue-600">한국 25%</span>
                  <span className="text-green-600">베트남 15%</span>
                  <span className="text-gray-600">기타 20%</span>
                </div>
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

