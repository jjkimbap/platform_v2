"use client"
import { DateRangePicker } from "@/components/date-range-picker"
import { useDateRange } from "@/hooks/use-date-range"
import { useState, useEffect } from "react"
import { MetricModal } from "@/components/metric-modal"
import { TrendChart } from "@/components/trend-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, LineChart, Line, PieChart, Pie, Cell, ComposedChart } from "recharts"
import { fetchChinaMarketRegistration, type ChinaMarketRegistrationResponse, fetchPreLandingAnswerUserGenderRatio, type PreLandingAnswerUserGenderRatioResponse, fetchPreLandingAnswerStatus, type PreLandingAnswerStatusResponse, fetchPreLandingAnswerCnt, type PreLandingAnswerCntResponse, fetchPreLandingAnswerTrend, type PreLandingAnswerTrendResponse, formatDateForAPI, getTodayDateString } from "@/lib/api"
import { getAllAges } from "@/lib/gender-age-mapping"

interface DashboardHeaderProps {
  onRealtimeToggle?: (isOpen: boolean) => void
}

type RegistrationStatus = "등록" | "등록중" | "미등록" | "심사실패" | "심사중"

interface MarketRegistration {
  id: number
  name: string
  HT: RegistrationStatus | string
  COP: RegistrationStatus | string
  Global: RegistrationStatus | string
}

// 여러 상태 중 우선순위에 따라 최종 상태 결정
const determineStatus = (statuses: string[]): string => {
  if (statuses.length === 0) return "미등록"
  
  // 각 상태를 확인하여 우선순위에 따라 결정
  for (const status of statuses) {
    // 1. 등록 단독
    if (status === "등록") {
      return "등록"
    }
    
    // 2. 심사중(등록 상태) - 심사중과 등록이 함께 있으면 등록
    if (status.includes("심사중") && status.includes("등록")) {
      return "등록"
    }
    
    // 3. 심사 실패(등록 상태) - 심사실패와 등록이 함께 있으면 등록
    if (status.includes("심사실패") && status.includes("등록")) {
      return "등록"
    }
  }
  
  // 4. 심사중(심사 실패 상태) - 심사중과 심사실패가 함께 있으면 심사실패
  for (const status of statuses) {
    if (status.includes("심사중") && status.includes("심사실패")) {
      return "심사실패"
    }
  }
  
  // 5. 심사 실패(심사 실패 상태) - 심사실패만 있고 등록이 없으면 심사실패
  for (const status of statuses) {
    if (status.includes("심사실패") && !status.includes("등록")) {
      return "심사실패"
    }
  }
  
  // 6. 심사중만 있는 경우
  for (const status of statuses) {
    if (status.includes("심사중")) {
      return "심사중"
    }
  }
  
  // 기본값
  return statuses[0] || "미등록"
}

export function PlatformDashboardHeader({ onRealtimeToggle }: DashboardHeaderProps) {
  const { dateRange, setDateRange } = useDateRange()
  const [marketRegistrationModalOpen, setMarketRegistrationModalOpen] = useState(false)
  const [freelancingModalOpen, setFreelancingModalOpen] = useState(false)
  const [chinaMarketData, setChinaMarketData] = useState<ChinaMarketRegistrationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [genderRatioData, setGenderRatioData] = useState<PreLandingAnswerUserGenderRatioResponse | null>(null)
  const [loadingGenderRatio, setLoadingGenderRatio] = useState(true)
  const [answerStatusData, setAnswerStatusData] = useState<PreLandingAnswerStatusResponse | null>(null)
  const [loadingAnswerStatus, setLoadingAnswerStatus] = useState(true)
  const [selectedConditionCheck, setSelectedConditionCheck] = useState<string>("가품")
  const [answerCntData, setAnswerCntData] = useState<PreLandingAnswerCntResponse | null>(null)
  const [loadingAnswerCnt, setLoadingAnswerCnt] = useState(true)
  const [answerTrendData, setAnswerTrendData] = useState<PreLandingAnswerTrendResponse | null>(null)
  const [loadingAnswerTrend, setLoadingAnswerTrend] = useState(true)
  const [answerTrendForecast, setAnswerTrendForecast] = useState<{ date: string; predicted: number }[]>([])

  // 날짜 범위를 문자열로 변환
  const [todayDate, setTodayDate] = useState<string>('')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTodayDate(getTodayDateString())
    }
  }, [])
  const startDate = dateRange?.from ? formatDateForAPI(dateRange.from) : '2025-01-01'
  const endDate = dateRange?.to ? formatDateForAPI(dateRange.to) : (todayDate || (typeof window !== 'undefined' ? getTodayDateString() : '2025-01-01'))

  // API에서 중국 마켓 등록 상태 데이터 가져오기
  useEffect(() => {
    const loadChinaMarketData = async () => {
      try {
        setLoading(true)
        const data = await fetchChinaMarketRegistration()
        setChinaMarketData(data)
      } catch (error) {
        console.error('❌ 중국 마켓 등록 상태 데이터 로딩 실패:', error)
        setChinaMarketData(null)
      } finally {
        setLoading(false)
      }
    }

    loadChinaMarketData()
  }, [])

  // API에서 프리랜딩 답변율 성별/연령대 비율 데이터 가져오기
  useEffect(() => {
    const loadGenderRatioData = async () => {
      try {
        setLoadingGenderRatio(true)
        const data = await fetchPreLandingAnswerUserGenderRatio(startDate, endDate)
        setGenderRatioData(data)
      } catch (error) {
        console.error('❌ 프리랜딩 답변율 성별/연령대 비율 데이터 로딩 실패:', error)
        setGenderRatioData(null)
      } finally {
        setLoadingGenderRatio(false)
      }
    }

    loadGenderRatioData()
  }, [startDate, endDate])

  // API에서 프리랜딩 답변 상태 데이터 가져오기
  useEffect(() => {
    const loadAnswerStatusData = async () => {
      try {
        setLoadingAnswerStatus(true)
        const data = await fetchPreLandingAnswerStatus(startDate, endDate)
        setAnswerStatusData(data)
      } catch (error) {
        console.error('❌ 프리랜딩 답변 상태 데이터 로딩 실패:', error)
        setAnswerStatusData(null)
      } finally {
        setLoadingAnswerStatus(false)
      }
    }

    loadAnswerStatusData()
  }, [startDate, endDate])

  // API에서 프리랜딩 답변 수 데이터 가져오기
  useEffect(() => {
    const loadAnswerCntData = async () => {
      try {
        setLoadingAnswerCnt(true)
        const data = await fetchPreLandingAnswerCnt(startDate, endDate)
        setAnswerCntData(data)
      } catch (error) {
        console.error('❌ 프리랜딩 답변 수 데이터 로딩 실패:', error)
        setAnswerCntData(null)
      } finally {
        setLoadingAnswerCnt(false)
      }
    }

    loadAnswerCntData()
  }, [startDate, endDate])

  // API에서 프리랜딩 답변 추이 데이터 가져오기
  useEffect(() => {
    const loadAnswerTrendData = async () => {
      try {
        setLoadingAnswerTrend(true)
        const data = await fetchPreLandingAnswerTrend(startDate, endDate)
        setAnswerTrendData(data)
        
        // forecast 데이터 설정
        if (data.forecast && data.forecast.length > 0) {
          setAnswerTrendForecast(data.forecast)
        } else {
          setAnswerTrendForecast([])
        }
      } catch (error) {
        console.error('❌ 프리랜딩 답변 추이 데이터 로딩 실패:', error)
        setAnswerTrendData(null)
        setAnswerTrendForecast([])
      } finally {
        setLoadingAnswerTrend(false)
      }
    }

    loadAnswerTrendData()
  }, [startDate, endDate])

  // API 데이터를 기반으로 마켓별 등록 상태 데이터 변환
  const marketRegistrations: MarketRegistration[] = (() => {
    // App Store와 Play Store는 항상 맨 앞에 추가
    const appStoreMarket: MarketRegistration = {
      id: 1,
      name: "App Store",
      HT: "등록",
      COP: "등록",
      Global: "등록",
    }
    const playStoreMarket: MarketRegistration = {
      id: 2,
      name: "Play Store",
      HT: "등록",
      COP: "등록",
      Global: "등록",
    }

    const oneStoreMarket: MarketRegistration = {
      id: 3,
      name: "One Store",
      HT: "등록",
      COP: "등록",
      Global: "등록",
    }

    if (!chinaMarketData?.dto) {
      return [appStoreMarket, playStoreMarket, oneStoreMarket]
    }

    // chinaMarket별로 그룹화 (여러 상태를 배열로 수집)
    const marketMap = new Map<string, { HT: string[], COP: string[], Global: string[] }>()

    chinaMarketData.dto.forEach(item => {
      const marketName = item.chinaMarket
      if (!marketMap.has(marketName)) {
        marketMap.set(marketName, { HT: [], COP: [], Global: [] })
      }

      const market = marketMap.get(marketName)!
      
      // hidden, cop, global이 null이 아닌 경우 해당 status를 배열에 추가
      if (item.hidden !== null && item.status) {
        market.HT.push(item.status)
      }
      if (item.cop !== null && item.status) {
        market.COP.push(item.status)
      }
      if (item.global !== null && item.status) {
        market.Global.push(item.status)
      }
    })

    // Map을 배열로 변환하고 id 추가 (App Store(1), Play Store(2), One Store(3) 이후부터 4부터 시작)
    const apiMarkets = Array.from(marketMap.entries()).map(([name, statusArrays], index) => ({
      id: index + 4, // App Store(1), Play Store(2), One Store(3) 이후 4부터 시작
      name,
      HT: determineStatus(statusArrays.HT),
      COP: determineStatus(statusArrays.COP),
      Global: determineStatus(statusArrays.Global),
    }))

    return [appStoreMarket, playStoreMarket, oneStoreMarket, ...apiMarkets]
  })()

  // 상태별 색상 함수
  const getStatusColor = (status: RegistrationStatus | string) => {
    if (status === "등록") {
      return "bg-green-100 text-green-800 border-green-300"
    }
    if (status?.includes("심사실패")) {
      return "bg-red-100 text-red-800 border-red-300"
    }
    if (status?.includes("심사중") || status === "등록중") {
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    }
    // 기본값 (미등록)
    return "bg-red-100 text-red-800 border-red-300"
  }

  // API 데이터 기반으로 통계 계산
  const calculateRegistrationStats = () => {
    if (!chinaMarketData?.rateDto) {
      return {
        normal: 0,
        registering: 0,
        unregistered: 0,
        totalRate: 0
      }
    }

    // rateDto에서 status별 count 추출
    const registeredRow = chinaMarketData.rateDto.find(row => row.status === "등록")
    const failedRow = chinaMarketData.rateDto.find(row => row.status?.includes("심사실패"))
    const reviewingRow = chinaMarketData.rateDto.find(row => row.status?.includes("심사중"))

    const normalCount = registeredRow?.count || 0
    const unregisteredCount = failedRow?.count || 0
    const registeringCount = reviewingRow?.count || 0
    const totalRate = registeredRow?.registrationRate || 0

    return {
      normal: normalCount + 9, // play, app, one store 고정 등록 수
      registering: registeringCount,
      unregistered: unregisteredCount,
      totalRate: totalRate
    }
  }

  const registrationStats = calculateRegistrationStats()

  // 마켓 등록율 추이 데이터
  const marketRegistrationTrendData = [
    { date: "1월", rate: 92.5 },
    { date: "2월", rate: 93.2 },
    { date: "3월", rate: 94.1 },
    { date: "4월", rate: 94.8 },
    { date: "5월", rate: 95.2 },
    { date: "6월", rate: 94.8 }
  ]

  // 프리랜딩 답변율 계산
  const freelancingAnswerRate = (() => {
    if (!answerCntData?.dto) {
      return 0
    }
    const { answerCnt, scanCnt } = answerCntData.dto
    if (scanCnt === 0) {
      return 0
    }
    return parseFloat(((answerCnt / scanCnt) * 100).toFixed(1))
  })()
  const freelancingBreakdown = [
    { label: "10대", value: "남 45명, 여 52명", color: "#ef4444" },
    { label: "20대", value: "남 65명, 여 72명", color: "#3b82f6" },
    { label: "30대", value: "남 78명, 여 85명", color: "#10b981" },
    { label: "40대", value: "남 82명, 여 88명", color: "#f59e0b" },
    { label: "50+", value: "남 35명, 여 42명", color: "#8b5cf6" },
  ]

  // API 데이터를 기반으로 연령대별 남녀 분포 데이터 변환
  const genderBarData = (() => {
    if (!genderRatioData?.dto || genderRatioData.dto.length === 0) {
      // 데이터가 없을 때 기본값 반환
      return getAllAges().map(age => ({
        age: age.name,
        male: 0,
        female: 0,
      }))
    }

    // 연령대별로 그룹화 (ageCode 순서대로)
    const ageGroups = new Map<number, { male: number; female: number }>()
    
    // 모든 연령대 초기화
    getAllAges().forEach(age => {
      ageGroups.set(age.code, { male: 0, female: 0 })
    })

    // API 데이터를 순회하며 각 연령대별 남녀 카운트 집계
    genderRatioData.dto.forEach(item => {
      const ageCode = item.ageCode
      const genderCode = item.genderCode
      const answerCnt = item.answerCnt || 0

      if (!ageGroups.has(ageCode)) {
        ageGroups.set(ageCode, { male: 0, female: 0 })
      }

      const group = ageGroups.get(ageCode)!
      
      // genderCode: 1 = 여성, 2 = 남성
      if (genderCode === 1) {
        group.female += answerCnt
      } else if (genderCode === 2) {
        group.male += answerCnt
      }
    })

    // ageCode 순서대로 정렬하여 배열로 변환
    return getAllAges().map(age => {
      const group = ageGroups.get(age.code) || { male: 0, female: 0 }
      return {
        age: age.name,
        male: group.male,
        female: group.female,
      }
    })
  })()

  // API 데이터를 기반으로 프리랜딩 답변 추이 데이터 변환 (누적 막대그래프)
  const freelancingTrend = (() => {
    if (!answerTrendData?.dto || answerTrendData.dto.length === 0) {
      return []
    }

    // period별로 그룹화
    const periodMap = new Map<string, { 가품: number; 정품: number }>()

    answerTrendData.dto.forEach((item: { period: string; conditionCheck: string; answerCount: number }) => {
      const period = item.period
      if (!periodMap.has(period)) {
        periodMap.set(period, { 가품: 0, 정품: 0 })
      }

      const periodData = periodMap.get(period)!
      if (item.conditionCheck === "가품") {
        periodData.가품 += item.answerCount || 0
      } else if (item.conditionCheck === "정품") {
        periodData.정품 += item.answerCount || 0
      }
    })

    // forecast 데이터를 Map으로 변환 (period별 predicted 매핑)
    const forecastMap = new Map<string, number>()
    answerTrendForecast.forEach((item) => {
      if (item.date && item.predicted != null) {
        // date를 period 형식(YYYY-MM)으로 정규화
        let normalizedDate = item.date.trim()
        if (normalizedDate.length >= 7) {
          normalizedDate = normalizedDate.substring(0, 7) // YYYY-MM
        }
        forecastMap.set(normalizedDate, item.predicted)
      }
    })

    // period 순서대로 정렬하고 월 형식으로 변환
    const result: Array<{
      month: string
      period: string
      가품: number
      정품: number
      total: number
      predictedTotal: number | null
    }> = Array.from(periodMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0])) // YYYY-MM 형식으로 정렬
      .map(([period, data]) => {
        // YYYY-MM을 X월 형식으로 변환
        const [year, month] = period.split('-')
        const monthNum = parseInt(month, 10)
        
        // forecast에서 예측값 가져오기
        const predictedTotal = forecastMap.get(period) || null
        
        return {
          month: `${monthNum}월`,
          period: period, // 원본 period 유지 (forecast 매칭용)
          가품: data.가품,
          정품: data.정품,
          total: data.가품 + data.정품,
          predictedTotal: predictedTotal
        }
      })

    // forecast에만 있고 기존 데이터에 없는 기간 추가
    forecastMap.forEach((predicted, date) => {
      const exists = result.some(item => {
        const itemPeriod = item.period || ''
        return itemPeriod === date
      })
      if (!exists) {
        // YYYY-MM을 X월 형식으로 변환
        const [year, month] = date.split('-')
        const monthNum = parseInt(month, 10)
        result.push({
          month: `${monthNum}월`,
          period: date,
          가품: 0,
          정품: 0,
          total: 0,
          predictedTotal: predicted
        })
      }
    })

    // 다시 정렬
    result.sort((a, b) => {
      const aPeriod = a.period || ''
      const bPeriod = b.period || ''
      return aPeriod.localeCompare(bPeriod)
    })

    return result
  })()

  // API 데이터를 기반으로 질문별 답변 현황 데이터 변환
  const questionOptions = (() => {
    if (!answerStatusData?.dto || answerStatusData.dto.length === 0) {
      return []
    }

    // questionNo별로 그룹화
    const questionMap = new Map<number, {
      questionNo: number
      question: string
      conditionCheck: string
      pageNo: number
      answers: Array<{ answerNo: number; answer: string; answerCnt: number }>
    }>()

    // API 데이터를 순회하며 질문별로 그룹화
    answerStatusData.dto.forEach(item => {
      if (!questionMap.has(item.questionNo)) {
        questionMap.set(item.questionNo, {
          questionNo: item.questionNo,
          question: item.question,
          conditionCheck: item.conditionCheck,
          pageNo: item.pageNo,
          answers: [],
        })
      }

      const question = questionMap.get(item.questionNo)!
      question.answers.push({
        answerNo: item.answerNo,
        answer: item.answer,
        answerCnt: item.answerCnt,
      })
    })

    // answerNo 순서대로 정렬하고 pageNo, questionNo 순서대로 정렬
    const questions = Array.from(questionMap.values())
      .map(q => ({
        ...q,
        answers: q.answers.sort((a, b) => a.answerNo - b.answerNo),
      }))
      .sort((a, b) => {
        // pageNo 우선 정렬, 그 다음 questionNo
        if (a.pageNo !== b.pageNo) {
          return a.pageNo - b.pageNo
        }
        return a.questionNo - b.questionNo
      })

    return questions.map((q, index) => ({
      key: `q${q.questionNo}`,
      title: `[${q.conditionCheck}] Q${q.questionNo}. ${q.question}`,
      pageNo: q.pageNo,
      answers: q.answers.map(ans => ({
        label: ans.answer,
        count: ans.answerCnt,
        name: ans.answer,
        value: ans.answerCnt,
      })),
    }))
  })()

  // 필터링된 질문 목록 (가품, 정품1, 정품2로 구분)
  const displayQuestions = questionOptions.filter(q => {
    const conditionCheck = q.title.match(/\[([^\]]+)\]/)?.[1]
    
    if (selectedConditionCheck === "가품") {
      return conditionCheck === "가품"
    } else if (selectedConditionCheck === "정품1") {
      return conditionCheck === "정품" && (q.pageNo === 1 || q.pageNo === 2)
    } else if (selectedConditionCheck === "정품2") {
      return conditionCheck === "정품" && (q.pageNo === 3 || q.pageNo === 4)
    }
    return false
  }).sort((a, b) => {
    // pageNo 우선 정렬, 그 다음 questionNo
    if (a.pageNo !== b.pageNo) {
      return a.pageNo - b.pageNo
    }
    return parseInt(a.key.replace('q', '')) - parseInt(b.key.replace('q', ''))
  })

  // 파이차트 색상 팔레트
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

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
                  <span className="ml-2 text-lg font-bold text-green-600">{registrationStats.totalRate}%</span>
                </div>
              </div>

              {/* 프리랜딩 답변율 표시 */}
              <div
                className="flex items-center gap-0 px-3 py-1 bg-card border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setFreelancingModalOpen(true)}
              >
                <div className="text-sm">
                  <span className="font-semibold">프리랜딩 답변율</span>
                  <span className="ml-2 text-lg font-bold text-blue-600">{freelancingAnswerRate}%</span>
                </div>
              </div>
              
              <DateRangePicker 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 마켓 등록율 상세 모달 */}
      <MetricModal 
        open={marketRegistrationModalOpen} 
        onOpenChange={setMarketRegistrationModalOpen} 
        title="마켓 등록율 상세"
        className="!max-w-[50vw]"
      >
        <div className="space-y-6">
          {/* 전체 등록율 요약 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{registrationStats.normal}</div>
              <div className="text-sm text-green-700">등록</div>
            </div>
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{registrationStats.unregistered}</div>
              <div className="text-sm text-red-700">미등록</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{registrationStats.registering}</div>
              <div className="text-sm text-yellow-700">심사중</div>
            </div>
          </div>

          {/* 마켓별 등록 상태 테이블 */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[60px]">번호</TableHead>
                  <TableHead className="text-center w-[120px]">마켓명</TableHead>
                  <TableHead className="text-center w-[120px]">HT</TableHead>
                  <TableHead className="text-center w-[120px]">COP</TableHead>
                  <TableHead className="text-center w-[120px]">Global</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketRegistrations.map((market) => (
                  <TableRow key={market.id}>
                    <TableCell className="text-center font-medium">{market.id}</TableCell>
                    <TableCell className="text-center font-medium">{market.name}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(market.HT)}`}>
                        {market.HT}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(market.COP)}`}>
                        {market.COP}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(market.Global)}`}>
                        {market.Global}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </MetricModal>

      {/* 프리랜딩 답변율 상세 모달 */}
      <MetricModal 
        open={freelancingModalOpen} 
        onOpenChange={setFreelancingModalOpen} 
        title="프리랜딩 답변율 상세"
        className="!max-w-[95vw] md:!max-w-[85vw] lg:!max-w-[75vw]"
      >
        <div className="space-y-4 md:space-y-6">
          {/* 요약 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="text-center p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {loadingAnswerCnt ? '로딩 중...' : answerCntData?.dto?.scanCnt?.toLocaleString() || 0}
              </div>
              <div className="text-xs md:text-sm text-blue-700">스캔 수</div>
            </div>
            <div className="text-center p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {loadingAnswerCnt ? '로딩 중...' : answerCntData?.dto?.answerCnt?.toLocaleString() || 0}
              </div>
              <div className="text-xs md:text-sm text-blue-700">프리랜딩 답변 수</div>
            </div>
            <div className="text-center p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {loadingAnswerCnt ? '로딩 중...' : `${freelancingAnswerRate}%`}
              </div>
              <div className="text-xs md:text-sm text-blue-700">프리랜딩 답변율</div>
            </div>
          </div>

          {/* 프리랜딩 답변 추이 (누적 막대그래프) */}
          <div className="space-y-2">
            <div className="text-lg md:text-xl font-semibold">월별 답변 추이</div>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {loadingAnswerTrend ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    데이터 로딩 중...
                  </div>
                ) : freelancingTrend.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    표시할 데이터가 없습니다.
                  </div>
                ) : (() => {
                  // Y축 최대값 계산 (total과 predictedTotal 모두 고려)
                  const maxValue = Math.max(
                    ...freelancingTrend.map(d => Math.max(d.total || 0, d.predictedTotal || 0)),
                    0
                  )
                  const maxWithPadding = maxValue * 1.1
                  
                  // 적절한 간격 계산 (4-6개의 ticks가 나오도록)
                  const calculateInterval = (max: number): number => {
                    if (max === 0) return 500
                    
                    // 대략 5개의 ticks를 목표로 함
                    const roughInterval = max / 5
                    
                    // 적절한 간격 단위 찾기 (500, 1000, 2000, 3500, 5000, 10000 등)
                    const intervals = [500, 1000, 2000, 3500, 5000, 10000, 20000, 50000]
                    
                    // roughInterval보다 크거나 같은 첫 번째 간격 선택
                    for (const interval of intervals) {
                      if (interval >= roughInterval) {
                        return interval
                      }
                    }
                    
                    // 모든 간격보다 크면 가장 큰 간격의 배수로 계산
                    const largestInterval = intervals[intervals.length - 1]
                    return Math.ceil(roughInterval / largestInterval) * largestInterval
                  }
                  
                  const interval = calculateInterval(maxWithPadding)
                  const yAxisMax = Math.ceil(maxWithPadding / interval) * interval
                  
                  // 0부터 최대값까지 계산된 간격으로 ticks 생성
                  const yAxisTicks = []
                  for (let i = 0; i <= yAxisMax; i += interval) {
                    yAxisTicks.push(i)
                  }
                  
                  return (
                    <ComposedChart data={freelancingTrend} margin={{ top: 8, right: 8, left: 50, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis 
                        allowDecimals={false}
                        domain={[0, yAxisMax]}
                        ticks={yAxisTicks}
                        tickFormatter={(value: number) => value.toLocaleString()}
                        width={50}
                      />
                      <Tooltip formatter={(value: number) => value !== null && value !== undefined ? value.toLocaleString() : '-'} />
                      <Legend />
                      <Bar dataKey="가품" stackId="a" fill="#ef4444" name="가품" />
                      <Bar dataKey="정품" stackId="a" fill="#10b981" name="정품" />
                      <Line 
                        type="monotone" 
                        dataKey="predictedTotal" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        strokeDasharray="5 5" 
                        name="예측" 
                        connectNulls 
                        dot={false}
                      />
                    </ComposedChart>
                  )
                })()}
              </ResponsiveContainer>
            </div>
          </div>

          {/* 남녀 분포 막대그래프 (연령대 10~40, 50+) */}
          <div className="space-y-2">
            <div className="text-lg md:text-xl font-semibold">남녀 분포</div>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {(() => {
                  // Y축 최대값 계산 (male과 female의 합계 중 최대값)
                  const maxValue = Math.max(
                    ...genderBarData.map(d => (d.male || 0) + (d.female || 0)),
                    0
                  )
                  const maxWithPadding = maxValue * 1.1
                  
                  // 적절한 간격 계산 (4-6개의 ticks가 나오도록)
                  const calculateInterval = (max: number): number => {
                    if (max === 0) return 500
                    
                    // 대략 5개의 ticks를 목표로 함
                    const roughInterval = max / 5
                    
                    // 적절한 간격 단위 찾기 (500, 1000, 2000, 3500, 5000, 10000 등)
                    const intervals = [500, 1000, 2000, 3500, 5000, 10000, 20000, 50000]
                    
                    // roughInterval보다 크거나 같은 첫 번째 간격 선택
                    for (const interval of intervals) {
                      if (interval >= roughInterval) {
                        return interval
                      }
                    }
                    
                    // 모든 간격보다 크면 가장 큰 간격의 배수로 계산
                    const largestInterval = intervals[intervals.length - 1]
                    return Math.ceil(roughInterval / largestInterval) * largestInterval
                  }
                  
                  const interval = calculateInterval(maxWithPadding)
                  const yAxisMax = Math.ceil(maxWithPadding / interval) * interval
                  
                  // 0부터 최대값까지 계산된 간격으로 ticks 생성
                  const yAxisTicks = []
                  for (let i = 0; i <= yAxisMax; i += interval) {
                    yAxisTicks.push(i)
                  }
                  
                  return (
                    <BarChart data={genderBarData} margin={{ top: 8, right: 8, left: 50, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis 
                        allowDecimals={false}
                        domain={[0, yAxisMax]}
                        ticks={yAxisTicks}
                        tickFormatter={(value: number) => value.toLocaleString()}
                        width={50}
                      />
                      <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      <Legend />
                      <Bar dataKey="male" name="남" fill="#60a5fa" />
                      <Bar dataKey="female" name="여" fill="#f472b6" />
                    </BarChart>
                  )
                })()}
              </ResponsiveContainer>
            </div>
          </div>

          

          {/* 질문별 답변 현황 (pageNo별 그룹화, 파이차트) */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-lg md:text-xl font-semibold">질문별 답변 현황</div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={selectedConditionCheck} onValueChange={setSelectedConditionCheck}>
                  <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
                    <SelectValue placeholder="조건 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="가품">가품</SelectItem>
                    <SelectItem value="정품1">정품1 (페이지 1-2)</SelectItem>
                    <SelectItem value="정품2">정품2 (페이지 3-4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {loadingAnswerStatus ? (
              <div className="p-4 text-center text-muted-foreground text-sm md:text-base">
                질문별 답변 현황 데이터를 불러오는 중...
              </div>
            ) : displayQuestions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm md:text-base">
                선택한 조건에 해당하는 질문이 없습니다.
              </div>
            ) : (
              <div className="space-y-4 overflow-x-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 min-w-0">
                  {displayQuestions.map((q) => (
                        <div key={q.key} className="border rounded-lg p-3 md:p-4 bg-card space-y-2 md:space-y-3 min-w-0">
                          {/* 질문 제목 */}
                          <div className="text-xs md:text-sm font-semibold break-words">
                            {q.title}
                          </div>
                          {/* 파이차트 */}
                          <div className="h-40 md:h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={q.answers}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={60}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {q.answers.map((entry: { name: string; value: number }, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value: number, name: string, props: any) => {
                                    const total = q.answers.reduce((sum, ans) => sum + ans.value, 0)
                                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                                    return [`${value.toLocaleString()}건 (${percent}%)`, name]
                                  }}
                                />
                                {/* <Legend /> */}
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          {/* 답변 리스트 */}
                          <div className="space-y-1 text-xs">
                            {q.answers.map((ans: { label: string; count: number }, idx: number) => {
                              const total = q.answers.reduce((sum, a) => sum + a.count, 0)
                              const percent = total > 0 ? ((ans.count / total) * 100).toFixed(1) : '0'
                              return (
                                <div key={idx} className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <div 
                                      className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0" 
                                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                    />
                                    <span className="text-muted-foreground truncate text-xs">{ans.label}</span>
                                  </div>
                                  <span className="font-medium text-xs flex-shrink-0">{ans.count.toLocaleString()}건 ({percent}%)</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </MetricModal>
    </>
  )
}
