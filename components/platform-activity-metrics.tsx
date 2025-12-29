"use client"

import { useState, useEffect } from "react"
import { Users, Scan, MessageSquare, AlertTriangle, UserPlus, MessageCircle, BarChart3, Mail } from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { ReportCard } from "@/components/report-card"
import { InvalidScan } from "@/components/invalid-scan"
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
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend as RechartsLegend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts"

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

// 무반응 게시글 데이터
const noResponsePosts = [
  { id: 1, title: "이 제품이 정품인지 궁금합니다", author: "김민수", date: "2024-10-25", community: "정품판별팁", views: 145, daysWithoutResponse: 3 },
  { id: 2, title: "구매한 상품 가품 의심됩니다", author: "이영희", date: "2024-10-24", community: "정품Q&A", views: 89, daysWithoutResponse: 4 },
  { id: 3, title: "정품 확인 부탁드립니다", author: "박철수", date: "2024-10-23", community: "정품인증거래", views: 203, daysWithoutResponse: 5 },
  { id: 4, title: "이 브랜드 정품 구별법 알려주세요", author: "최지민", date: "2024-10-22", community: "정품판별팁", views: 67, daysWithoutResponse: 6 },
  { id: 5, title: "급해요! 정품 확인 좀 해주세요", author: "정수진", date: "2024-10-21", community: "정품Q&A", views: 178, daysWithoutResponse: 7 },
]

// 무반응 게시글 TOP3 데이터 (카드에 표시용)
const topNoResponsePostsData = [
  { label: "급해요! 정품 확인...", value: "7일", color: "#ef4444" },
  { label: "이 브랜드 정품 구별...", value: "6일", color: "#f97316" },
  { label: "정품 확인 부탁드립...", value: "5일", color: "#eab308" },
]

// 활동 저조 회원 데이터
const inactiveMembers = [
  { id: 1, name: "김유령", email: "ghost1@example.com", joinDate: "2024-10-20", signupMethod: "카카오", lastLogin: "2024-10-20", scanCount: 0, postCount: 0, commentCount: 0, inactiveDays: 8 },
  { id: 2, name: "이침묵", email: "silent2@example.com", joinDate: "2024-10-19", signupMethod: "네이버", lastLogin: "2024-10-19", scanCount: 0, postCount: 0, commentCount: 0, inactiveDays: 9 },
  { id: 3, name: "박무활동", email: "inactive3@example.com", joinDate: "2024-10-18", signupMethod: "구글", lastLogin: "2024-10-18", scanCount: 0, postCount: 0, commentCount: 0, inactiveDays: 10 },
  { id: 4, name: "최방관", email: "viewer4@example.com", joinDate: "2024-10-17", signupMethod: "애플", lastLogin: "2024-10-17", scanCount: 0, postCount: 0, commentCount: 0, inactiveDays: 11 },
  { id: 5, name: "정미접속", email: "away5@example.com", joinDate: "2024-10-16", signupMethod: "이메일", lastLogin: "2024-10-16", scanCount: 0, postCount: 0, commentCount: 0, inactiveDays: 12 },
  { id: 6, name: "강휴면", email: "dormant6@example.com", joinDate: "2024-10-15", signupMethod: "라인", lastLogin: "2024-10-15", scanCount: 0, postCount: 0, commentCount: 0, inactiveDays: 13 },
]

// 활동 저조 회원 TOP3 데이터 (카드에 표시용)
const topInactiveMembersData = [
  { label: "강휴면", value: "13일", color: "#ef4444" },
  { label: "정미접속", value: "12일", color: "#f97316" },
  { label: "최방관", value: "11일", color: "#eab308" },
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

// 커뮤니티별 게시글 점유율 데이터 (극좌표 차트용)
const communityPostsShareData = [
  { category: "정품인증거래", value: 450, fullMark: 600 },
  { category: "정품판별팁", value: 380, fullMark: 600 },
  { category: "정품제품리뷰", value: 320, fullMark: 600 },
  { category: "정품Q&A", value: 280, fullMark: 600 },
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

export function PlatformActivityMetrics({ selectedCountry }: { selectedCountry: string }) {
  const [executionModalOpen, setExecutionModalOpen] = useState(false)
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [conversionModalOpen, setConversionModalOpen] = useState(false)
  const [marketRegistrationModalOpen, setMarketRegistrationModalOpen] = useState(false)
  const [newInflowModalOpen, setNewInflowModalOpen] = useState(false)
  const [communityPostsModalOpen, setCommunityPostsModalOpen] = useState(false)
  const [communityMetricType, setCommunityMetricType] = useState("posts")
  const [newChatModalOpen, setNewChatModalOpen] = useState(false)
  const [vendorAlertModalOpen, setVendorAlertModalOpen] = useState(false)
  const [noResponseModalOpen, setNoResponseModalOpen] = useState(false)
  const [inactiveMembersModalOpen, setInactiveMembersModalOpen] = useState(false)
  const [freelancingModalOpen, setFreelancingModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState("question1")
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [selectedDetailCountry, setSelectedDetailCountry] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [scanDauData, setScanDauData] = useState(mockDauData)
  const [scanWauData, setScanWauData] = useState(mockWauData)
  const [scanMauData, setScanMauData] = useState(mockMauData)
  const [conversionData, setConversionData] = useState<Array<{ date: string; conversion: number }>>([])
  
  // 코호트 분석 상태
  const [cohortAnalysisModalOpen, setCohortAnalysisModalOpen] = useState(false)
  const [eventDate, setEventDate] = useState(subDays(new Date(), 7))
  const [startDate, setStartDate] = useState(subDays(new Date(), 30))
  const [endDate, setEndDate] = useState(new Date())
  const [analysisPeriod, setAnalysisPeriod] = useState<'7일' | '30일'>('7일')
  const [metricType, setMetricType] = useState<'실행' | '스캔' | '유저' | '커뮤니티' | '채팅'>('실행')
  const [selectedApp, setSelectedApp] = useState<'앱전체' | 'HT' | 'COP' | 'Global'>('앱전체')
  const [selectedEventCountry, setSelectedEventCountry] = useState<'국가전체' | '중국' | '한국' | '베트남' | '태국' | '일본' | '미국' | '인도' | '기타'>('국가전체')
  
  // 커스텀 데이터 추이 분석 상태
  const [customPeriod, setCustomPeriod] = useState<'일별' | '주별' | '월별'>('일별')
  const [customActionType, setCustomActionType] = useState<'실행' | '스캔' | '게시글' | '채팅'>('실행')
  const [customAppType, setCustomAppType] = useState<'전체' |'HT' | 'COP' | 'Global'>('전체')
  const [customCountry, setCustomCountry] = useState<'전체' | '한국' | '일본' | '미국' | '기타'>('전체')
  const [customUserType, setCustomUserType] = useState<'전체' | '상위10명' | '신규회원' | '비활성유저'>('전체')
  const [cohortData, setCohortData] = useState<Array<{ date: string; value: number;[key: string]: string | number | null }>>([])
  
  const { toast } = useToast()
  const { dateRange } = useDateRange()

  // 코호트 분석 데이터 생성 함수
  const generateCohortData = () => {
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const data = []

    // 앱별 기본 값
    const appMultipliers: Record<string, number> = {
      '앱전체': 1,
      'HT': 0.45,
      'COP': 0.35,
      'Global': 0.2
    }

    // 국가별 기본 값
    const countryMultipliers: Record<string, number> = {
      '국가전체': 1,
      '중국': 0.35,
      '한국': 0.25,
      '베트남': 0.15,
      '태국': 0.10,
      '일본': 0.08,
      '미국': 0.05,
      '인도': 0.015,
      '기타': 0.005
    }

    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
        const isEventDay = currentDate.toDateString() === eventDate.toDateString()

      let baseValue = 1000
      const multiplier = appMultipliers[selectedApp] * countryMultipliers[selectedEventCountry]

      // 지표별 기본값 설정
      switch (metricType) {
        case '실행':
          baseValue = 3000
          break
        case '스캔':
          baseValue = 2500
          break
        case '유저':
          baseValue = 150
          break
        case '커뮤니티':
          baseValue = 1200
          break
        case '채팅':
          baseValue = 350
          break
      }

      let value = baseValue * multiplier

      // 이벤트 효과 시뮬레이션
          if (isEventDay) {
        value *= 1.4
      } else if (Math.abs((currentDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)) <= 3) {
        value *= 1.2
      }

      value += (i % 5) * value * 0.05

      const dataPoint: any = {
          date: format(currentDate, 'MM/dd'),
          value: Math.round(value)
      }

      // 앱 전체 선택 시 앱별 데이터 추가
      if (selectedApp === '앱전체') {
        dataPoint.HT = Math.round(value * 0.45 + (i % 3) * 10)
        dataPoint.COP = Math.round(value * 0.35 + (i % 4) * 8)
        dataPoint.Global = Math.round(value * 0.2 + (i % 2) * 5)
      }

      // 국가 전체 선택 시 국가별 데이터 추가
      if (selectedEventCountry === '국가전체') {
        dataPoint['중국'] = Math.round(value * 0.35 + (i % 4) * 15)
        dataPoint['한국'] = Math.round(value * 0.25 + (i % 3) * 12)
        dataPoint['베트남'] = Math.round(value * 0.15 + (i % 5) * 8)
        dataPoint['태국'] = Math.round(value * 0.10 + (i % 2) * 5)
        dataPoint['일본'] = Math.round(value * 0.08 + (i % 3) * 4)
        dataPoint['미국'] = Math.round(value * 0.05 + (i % 4) * 3)
        dataPoint['인도'] = Math.round(value * 0.015 + (i % 2) * 1)
        dataPoint['기타'] = Math.round(value * 0.005)
      }

      data.push(dataPoint)
    }

    return data
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
  }, [startDate, endDate, eventDate, metricType, selectedApp, selectedEventCountry])

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
    return <section className="space-y-4 w-full" />
  }

  return (
    <section className="space-y-4 w-full">
      
      {/* 섹션 제목 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">제보 및 비정상 스캔 정보</h2>
                </div>

      <div className="grid gap-3 w-full" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>



        {/* <MetricCard
          title="신규 채팅방"
          // diffValue={-5.8}
          onClick={() => setNewChatModalOpen(true)}
          textData={[
            { label: "1:1", value: "89개 (57.1%)", color: "#3b82f6" },
            { label: "인증거래", value: "67개 (42.9%)", color: "#10b981" },
          ]}
          showSignupPathLink={true}
          signupPathLinkText="→ 채팅별 상세지표 보기"
          
        /> */}
        {/* 제보 내역 */}
        <div className="space-y-3 flex flex-col min-w-0">
          <ReportCard />
        </div>
        {/* 비정상 스캔 내역 */}
        <div className="space-y-3 flex flex-col min-w-0">
          <InvalidScan />
        </div>
        

      </div>

      {/* Execution Modal */}
      <MetricModal open={executionModalOpen} onOpenChange={setExecutionModalOpen} title="국가별 실행 시각 분포도">
        <div className="space-y-6">
          {/* 전체 국가 파이차트 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">전체 국가별 실행 분포</h3>
            <CountryPieChart 
              data={allCountryData} 
              onCountryClick={(country) => setSelectedDetailCountry(country)}
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
                    { no: 3, name: "One Store", ht: "o", cop: "o", global: "o" },
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
                { date: "1일", email: 30, naver: 45, kakao: 38, google: 35, apple: 25, line: 17, facebook: 12, wechat: 8 },
                { date: "2일", email: 40, naver: 52, kakao: 42, google: 38, apple: 28, line: 19, facebook: 14, wechat: 9 },
                { date: "3일", email: 30, naver: 48, kakao: 40, google: 36, apple: 26, line: 18, facebook: 13, wechat: 8 },
                { date: "4일", email: 40, naver: 58, kakao: 48, google: 42, apple: 32, line: 22, facebook: 16, wechat: 11 },
                { date: "5일", email: 80, naver: 55, kakao: 45, google: 40, apple: 30, line: 20, facebook: 15, wechat: 10 },
                { date: "6일", email: 10, naver: 62, kakao: 52, google: 45, apple: 35, line: 24, facebook: 18, wechat: 12 },
                { date: "7일", email: 70, naver: 68, kakao: 58, google: 50, apple: 40, line: 26, facebook: 20, wechat: 14 },
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
      <MetricModal open={cohortAnalysisModalOpen} onOpenChange={setCohortAnalysisModalOpen} title="커스텀 데이터 추이 분석 상세">
        <div className="space-y-6">
          {/* 컨트롤 패널 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">시작 날짜</label>
              <input
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">종료 날짜</label>
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
              <label className="text-sm font-medium">지표</label>
              <select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="실행">실행</option>
                <option value="스캔">스캔</option>
                <option value="유저">유저</option>
                <option value="커뮤니티">커뮤니티</option>
                <option value="채팅">채팅</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">앱</label>
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="앱전체">앱전체</option>
                <option value="HT">HT</option>
                <option value="COP">COP</option>
                <option value="Global">Global</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">국가</label>
              <select
                value={selectedEventCountry}
                onChange={(e) => setSelectedEventCountry(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="국가전체">국가전체</option>
                <option value="중국">중국</option>
                <option value="한국">한국</option>
                <option value="베트남">베트남</option>
                <option value="태국">태국</option>
                <option value="일본">일본</option>
                <option value="미국">미국</option>
                <option value="인도">인도</option>
                <option value="기타">기타</option>
              </select>
            </div>

          </div>

          {/* 상세 추이 차트 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{metricType} 추이 분석</h3>
            <TrendChart
              data={cohortData}
              lines={
                selectedApp === '앱전체' ? [
                  { dataKey: "HT", name: "HT", color: "#3b82f6" },
                  { dataKey: "COP", name: "COP", color: "#10b981" },
                  { dataKey: "Global", name: "Global", color: "#f59e0b" }
                ] : selectedEventCountry === '국가전체' ? [
                  { dataKey: "중국", name: "중국", color: "#3b82f6" },
                  { dataKey: "한국", name: "한국", color: "#10b981" },
                  { dataKey: "베트남", name: "베트남", color: "#f59e0b" },
                  { dataKey: "태국", name: "태국", color: "#8b5cf6" },
                  { dataKey: "일본", name: "일본", color: "#ef4444" },
                  { dataKey: "미국", name: "미국", color: "#06b6d4" },
                  { dataKey: "인도", name: "인도", color: "#84cc16" },
                  { dataKey: "기타", name: "기타", color: "#f97316" }
                ] : [
                  { dataKey: "value", name: metricType, color: "#3b82f6" }
                ]
              }
              height={400}
              showEventLine={true}
              eventDate={format(eventDate, 'MM/dd')}
            />
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
                  <TableHead className="w-20 text-center">선택</TableHead>
                  <TableHead>업체명</TableHead>
                  <TableHead>답변율</TableHead>
                  <TableHead>스캔수</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>담당자 이메일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowPerformingVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-muted/30">
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedVendors.includes(vendor.id.toString())}
                        onCheckedChange={() => toggleVendor(vendor.id.toString())}
                          className="w-5 h-5 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      </div>
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

      {/* 무반응 게시글 모달 */}
      <MetricModal
        open={noResponseModalOpen}
        onOpenChange={setNoResponseModalOpen}
        title="무반응 게시글 리스트"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">3일 이상 답변 없는 게시글 ({noResponsePosts.length}개)</p>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[45%]">게시물 제목</TableHead>
                  <TableHead className="w-[10%]">작성자</TableHead>
                  <TableHead className="w-[12%]">작성일</TableHead>
                  <TableHead className="w-[13%]">커뮤니티</TableHead>
                  <TableHead className="w-[10%]">무반응 기간</TableHead>
                  <TableHead className="w-[10%]">조회수</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {noResponsePosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell className="text-muted-foreground">{post.date}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs whitespace-nowrap inline-block">
                        {post.community}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600 font-semibold">{post.daysWithoutResponse}일</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{post.views}회</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </MetricModal>

      {/* 활동 저조 회원 모달 */}
      <MetricModal 
        open={inactiveMembersModalOpen} 
        onOpenChange={setInactiveMembersModalOpen} 
        title="활동 저조 회원 리스트"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">가입 후 활동이 전혀 없는 회원 ({inactiveMembers.length}명)</p>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[15%]">회원명</TableHead>
                  <TableHead className="w-[20%]">이메일</TableHead>
                  <TableHead className="w-[12%]">가입일</TableHead>
                  <TableHead className="w-[10%]">가입경로</TableHead>
                  <TableHead className="w-[12%]">마지막 접속</TableHead>
                  <TableHead className="w-[8%]">스캔수</TableHead>
                  <TableHead className="w-[8%]">게시물</TableHead>
                  <TableHead className="w-[8%]">댓글</TableHead>
                  <TableHead className="w-[7%]">비활동 기간</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                    <TableCell className="text-muted-foreground">{member.joinDate}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs whitespace-nowrap inline-block">
                        {member.signupMethod}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.lastLogin}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{member.scanCount}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{member.postCount}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{member.commentCount}</TableCell>
                    <TableCell>
                      <span className="text-red-600 font-semibold">{member.inactiveDays}일</span>
                    </TableCell>
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

