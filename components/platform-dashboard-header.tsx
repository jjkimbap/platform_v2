"use client"
import { DateRangePicker } from "@/components/date-range-picker"
import { RealtimeIndicator } from "@/components/realtime-indicator"
import { useDateRange } from "@/hooks/use-date-range"
import { useState } from "react"
import { MetricModal } from "@/components/metric-modal"
import { TrendChart } from "@/components/trend-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, LineChart, Line } from "recharts"

interface DashboardHeaderProps {
  onRealtimeToggle?: (isOpen: boolean) => void
}

type RegistrationStatus = "등록" | "등록중" | "미등록"

interface MarketRegistration {
  id: number
  name: string
  HT: RegistrationStatus
  COP: RegistrationStatus
  Global: RegistrationStatus
}

export function PlatformDashboardHeader({ onRealtimeToggle }: DashboardHeaderProps) {
  const { dateRange, setDateRange } = useDateRange()
  const [marketRegistrationModalOpen, setMarketRegistrationModalOpen] = useState(false)
  const [freelancingModalOpen, setFreelancingModalOpen] = useState(false)

  // 마켓별 등록 상태 데이터 (샘플 데이터 - 실제로는 API에서 가져와야 함)
  const marketRegistrations: MarketRegistration[] = [
    { id: 1, name: "App Store", HT: "등록", COP: "등록", Global: "등록" },
    { id: 2, name: "Play Store", HT: "등록", COP: "등록", Global: "등록" },
    { id: 3, name: "LENOVO", HT: "등록", COP: "등록중", Global: "등록" },
    { id: 4, name: "VIVO", HT: "등록", COP: "등록", Global: "등록중" },
    { id: 5, name: "바이두", HT: "등록중", COP: "등록", Global: "등록" },
    { id: 6, name: "360", HT: "등록", COP: "등록", Global: "등록" },
    { id: 7, name: "응용보", HT: "등록", COP: "미등록", Global: "등록" },
    { id: 8, name: "HUAWEI", HT: "등록", COP: "등록", Global: "등록" },
    { id: 9, name: "OPPO", HT: "등록", COP: "등록", Global: "등록" },
    { id: 10, name: "XIAOMI", HT: "등록", COP: "등록", Global: "등록" },
    { id: 11, name: "완두레(PP)", HT: "등록", COP: "등록", Global: "등록중" },
    { id: 12, name: "HONOR", HT: "등록", COP: "등록중", Global: "등록" },
    { id: 13, name: "FLYME", HT: "미등록", COP: "등록", Global: "등록" },
  ]

  // 상태별 색상 함수
  const getStatusColor = (status: RegistrationStatus) => {
    switch (status) {
      case "등록":
        return "bg-green-100 text-green-800 border-green-300"
      case "등록중":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "미등록":
        return "bg-red-100 text-red-800 border-red-300"
    }
  }

  // 테이블 데이터 기반으로 통계 계산
  const calculateRegistrationStats = () => {
    let normalCount = 0  // 등록
    let registeringCount = 0  // 등록중
    let unregisteredCount = 0  // 미등록

    marketRegistrations.forEach(market => {
      [market.HT, market.COP, market.Global].forEach(status => {
        if (status === "등록") {
          normalCount++
        } else if (status === "등록중") {
          registeringCount++
        } else if (status === "미등록") {
          unregisteredCount++
        }
      })
    })

    const totalApps = marketRegistrations.length * 3  // 13개 마켓 * 3개 앱
    const totalRate = totalApps > 0 ? parseFloat(((normalCount / totalApps) * 100).toFixed(1)) : 0

    return {
      normal: normalCount,
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

  // 프리랜딩 답변율 (간단 요약 및 분포 - 샘플)
  const freelancingAnswerRate = 63 // %
  const freelancingBreakdown = [
    { label: "10대", value: "남 45명, 여 52명", color: "#ef4444" },
    { label: "20대", value: "남 65명, 여 72명", color: "#3b82f6" },
    { label: "30대", value: "남 78명, 여 85명", color: "#10b981" },
    { label: "40대", value: "남 82명, 여 88명", color: "#f59e0b" },
    { label: "50+", value: "남 35명, 여 42명", color: "#8b5cf6" },
  ]

  // 연령대(10~40, 50+) 남녀 분포 (샘플)
  const genderBarData = [
    { age: "10대", male: 120, female: 135 },
    { age: "20대", male: 180, female: 190 },
    { age: "30대", male: 165, female: 175 },
    { age: "40대", male: 130, female: 140 },
    { age: "50+", male: 95, female: 105 },
  ]

  // 프리랜딩 답변율 추이 (월별, 샘플)
  const freelancingTrend = [
    { month: "8월", rate: 58 },
    { month: "9월", rate: 60 },
    { month: "10월", rate: 61 },
    { month: "11월", rate: 63 },
    { month: "12월", rate: 64 },
  ]

  // 질문별 답변 현황 (샘플)
  const questionOptions = [
    {
      key: "q1",
      title: "Q1. 제품 인증 경로?",
      answers: [
        { label: "정상 경로", count: 532 },
        { label: "외부 링크", count: 178 },
        { label: "직접 입력", count: 92 },
        { label: "기타", count: 47 },
      ],
    },
    {
      key: "q2",
      title: "Q2. 인증 실패 이유?",
      answers: [
        { label: "네트워크", count: 240 },
        { label: "이미지 품질", count: 320 },
        { label: "시간 초과", count: 164 },
        { label: "기타", count: 74 },
      ],
    },
    {
      key: "q3",
      title: "Q3. 재시도 유도",
      answers: [
        { label: "즉시 재시도", count: 410 },
        { label: "가이드 보기", count: 265 },
        { label: "나중에", count: 182 },
      ],
    },
    {
      key: "q4",
      title: "Q4. 가이드 확인 여부",
      answers: [
        { label: "확인", count: 512 },
        { label: "미확인", count: 196 },
        { label: "부분확인", count: 124 },
      ],
    },
  ] as const

  const [selectedQuestionKey, setSelectedQuestionKey] = useState<typeof questionOptions[number]['key']>('q1')
  const selectedQuestion = questionOptions.find(q => q.key === selectedQuestionKey)!

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
              <RealtimeIndicator onToggle={onRealtimeToggle} />
            </div>
          </div>
        </div>
      </header>

      {/* 마켓 등록율 상세 모달 */}
      <MetricModal open={marketRegistrationModalOpen} onOpenChange={setMarketRegistrationModalOpen} title="마켓 등록율 상세">
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
              <div className="text-sm text-yellow-700">등록중</div>
            </div>
          </div>

          {/* 마켓별 등록 상태 테이블 */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">번호</TableHead>
                  <TableHead className="w-[150px]">마켓명</TableHead>
                  <TableHead className="text-center">HT</TableHead>
                  <TableHead className="text-center">COP</TableHead>
                  <TableHead className="text-center">Global</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketRegistrations.map((market) => (
                  <TableRow key={market.id}>
                    <TableCell className="font-medium">{market.id}</TableCell>
                    <TableCell className="font-medium">{market.name}</TableCell>
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
      <MetricModal open={freelancingModalOpen} onOpenChange={setFreelancingModalOpen} title="프리랜딩 답변율 상세">
        <div className="space-y-6">
          {/* 요약 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg col-span-1">
              <div className="text-2xl font-bold text-blue-600">1000</div>
              <div className="text-sm text-blue-700">스캔 수</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg col-span-1">
              <div className="text-2xl font-bold text-blue-600">634</div>
              <div className="text-sm text-blue-700">프리랜딩 답변 수</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg col-span-1">
              <div className="text-2xl font-bold text-blue-600">{freelancingAnswerRate}%</div>
              <div className="text-sm text-blue-700">프리랜딩 답변율</div>
            </div>
          </div>

          {/* 프리랜딩 답변율 추이 (라인 그래프) */}
          <div className="space-y-2">
            <div className="text-sm font-semibold">답변율 추이</div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={freelancingTrend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => [`${v}%`, '답변율']} />
                  <Legend />
                  <Line type="monotone" dataKey="rate" name="답변율" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 남녀 분포 막대그래프 (연령대 10~40, 50+) */}
          <div className="space-y-2">
            <div className="text-sm font-semibold">남녀 분포</div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genderBarData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="male" name="남" fill="#60a5fa" />
                  <Bar dataKey="female" name="여" fill="#f472b6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          

          {/* 질문별 답변 현황 (그리드) */}
          <div className="space-y-2">
            <div className="text-sm font-semibold">질문별 답변 현황</div>
            <div className="space-y-2 overflow-auto">
              {/* 헤더 그리드 */}
              <div className="grid grid-cols-4 gap-2">
                {questionOptions.map((q) => (
                  <div key={q.key} className="px-3 py-2 font-semibold bg-muted/50 rounded-md whitespace-nowrap overflow-hidden text-ellipsis">
                    {q.title}
                  </div>
                ))}
              </div>
              {/* 답변 그리드 (행 반복) */}
              {(() => {
                const maxRows = Math.max(...questionOptions.map(q => q.answers.length))
                return Array.from({ length: maxRows }).map((_, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-4 gap-2">
                    {questionOptions.map((q) => {
                      const ans = q.answers[rowIdx]
                      return (
                        <div key={q.key} className="px-3 py-2 rounded-md border bg-card min-h-[38px] flex items-center">
                          {ans ? (
                            <span className="text-xs text-foreground">
                              {ans.label}, {ans.count.toLocaleString()}건
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      </MetricModal>
    </>
  )
}
