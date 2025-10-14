"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, MessageSquare, Target, UserCheck, X } from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { MetricModal } from "@/components/metric-modal"
import { TrendChart } from "@/components/trend-chart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCoreMetrics } from "@/hooks/use-core-metrics"

// 핵심 액션 지표 데이터
const coreMetricsData = [
  {
    id: "FR-101",
    title: "실행-스캔 전환율",
    value: "20.0%",
    target: "22.0%",
    predicted: "21.5%",
    achievement: 90.9,
    change: -0.5,
    changeLabel: "전월 대비",
    team: "UX/UI팀",
    status: "warning",
    icon: <Target className="h-5 w-5" />,
    description: "실행 DAU / 스캔 DAU × 100% (첫 관문 효율 진단)",
    trendData: [
      { value: 22.1 },
      { value: 21.8 },
      { value: 21.5 },
      { value: 21.2 },
      { value: 20.8 },
      { value: 20.3 },
      { value: 20.0 },
    ],
    trendColor: "#3b82f6",
    actionRequired: "A/B 테스트 제안 연동"
  },
  {
    id: "FR-102",
    title: "신규회원 스캔 달성률",
    value: "65.0%",
    target: "70.0%",
    predicted: "68.2%",
    achievement: 92.8,
    change: -1.0,
    changeLabel: "전월 대비",
    team: "운영/CS팀",
    status: "alert",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "업체 스캔(문의) 수 / 업체 답변 수 × 100% (업체-사용자 연결 성공률 진단)",
    trendData: [
      { value: 68.5 },
      { value: 67.8 },
      { value: 67.2 },
      { value: 66.8 },
      { value: 66.1 },
      { value: 65.5 },
      { value: 65.0 },
    ],
    trendColor: "#f59e0b",
    actionRequired: "첫 스캔을 하지 않은 신규 회원에게 푸시 메세지 발송"
  },
  {
    id: "FR-103",
    title: "신규회원 커뮤니티 참여율",
    value: "5.0%",
    target: "6.0%",
    predicted: "5.8%",
    achievement: 83.3,
    change: 0.1,
    changeLabel: "전월 대비",
    team: "마케팅팀",
    status: "warning",
    icon: <UserCheck className="h-5 w-5" />,
    description: "스캔 수행 비회원 유저 수 / 스캔 후 가입 유저 수 × 100% (잠재 고객 확보 효율 진단)",
    trendData: [
      { value: 4.8 },
      { value: 4.9 },
      { value: 4.7 },
      { value: 4.9 },
      { value: 5.0 },
      { value: 4.9 },
      { value: 5.0 },
    ],
    trendColor: "#10b981",
    actionRequired: "커뮤니티 인기글 푸시 메세지 발송"
  },
  {
    id: "FR-104",
    title: "유령 고객 비중",
    value: "30.0%",
    target: "25.0%",
    predicted: "28.5%",
    achievement: -120.0,
    change: 5.0,
    changeLabel: "전월 대비",
    team: "마케팅팀",
    status: "critical",
    icon: <Users className="h-5 w-5" />,
    description: "총 가입 유저 수 / 가입 유저 중 스캔을 수행하지 않은 유저 수 × 100% (가입 퍼널 비효율성 진단)",
    trendData: [
      { value: 25.2 },
      { value: 26.1 },
      { value: 27.3 },
      { value: 28.1 },
      { value: 28.8 },
      { value: 29.4 },
      { value: 30.0 },
    ],
    trendColor: "#ef4444",
    actionRequired: "푸시 캠페인 즉시 실행"
  }
]

// 유령 고객 세그먼트 데이터
const ghostCustomerSegments = [
  { segment: "가입 후 1일 미만", count: 450, percentage: 15.0 },
  { segment: "가입 후 1-3일", count: 320, percentage: 10.7 },
  { segment: "가입 후 3-7일", count: 280, percentage: 9.3 },
  { segment: "가입 후 7-14일", count: 240, percentage: 8.0 },
  { segment: "가입 후 14일 이상", count: 710, percentage: 23.7 },
]

// 저조 업체 데이터
const lowPerformingVendors = [
  { name: "ABC 스포츠", responseRate: 35, contact: "abc@sports.com" },
  { name: "XYZ 패션", responseRate: 42, contact: "xyz@fashion.com" },
  { name: "DEF 전자", responseRate: 28, contact: "def@electronics.com" },
  { name: "GHI 뷰티", responseRate: 45, contact: "ghi@beauty.com" },
  { name: "JKL 라이프", responseRate: 38, contact: "jkl@life.com" },
]

export function CoreActionMetrics() {
  const [modalOpen, setModalOpen] = useState<string | null>(null)
  const { metrics, removeMetric } = useCoreMetrics()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="outline" className="text-green-600 border-green-600">✅ 목표 달성</Badge>
      case "warning":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">⚠️ 목표 미달성</Badge>
      case "alert":
        return <Badge variant="outline" className="text-orange-600 border-orange-600">🚨 개선 필요</Badge>
      case "critical":
        return <Badge variant="outline" className="text-red-600 border-red-600">🚨 심각</Badge>
      default:
        return null
    }
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <section className="space-y-4 bg-[#EEEEEE] rounded-lg p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">핵심 액션 지표</h2>
        {/* <div className="text-sm text-muted-foreground">
          목표 달성률 80% 미만 또는 전월 대비 하락 지표에 집중
        </div> */}
      </div>

      {/* 경고 섹션 */}
      {/* <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <h3 className="font-semibold text-orange-800">주의 필요 지표</h3>
        </div>
        <div className="text-sm text-orange-700">
          <p>• 스캔 전환율: 목표 미달성 (90.9%)</p>
          <p>• 프리랜딩 답변율: 50% 미만 업체 5곳 발견</p>
          <p>• 스캔-투-회원 전환율: 목표 미달성 (83.3%)</p>
          <p>• 유령 고객 비중: 목표 초과 (120.0%)</p>
        </div>
      </div> */}

      {/* 핵심 지표 카드들 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {metrics.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <p>핵심 액션 지표가 없습니다.</p>
            <p className="text-sm">다른 섹션의 + 버튼을 클릭하여 지표를 추가하세요.</p>
          </div>
        ) : (
          metrics.map((metric) => (
            <div key={metric.id} className="space-y-2">
              <div className="relative">
                <MetricCard
                  title={metric.title}
                  value={metric.value}
                  icon={getStatusIcon(metric.status || "warning")}
                  onClick={() => setModalOpen(metric.id)}
                  trendData={metric.trendData}
                  trendColor={metric.trendColor}
                  textData={metric.textData}
                />
                {/* 제거 버튼 */}
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 h-6 w-6 p-0 bg-white hover:bg-red-50 hover:border-red-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeMetric(metric.id)
                  }}
                >
                  <X className="h-3 w-3 text-red-500" />
                </Button>
              </div>
              
              {/* 달성률 표시 - 카드 하단에 별도 영역으로 */}
              {(metric.achievement !== undefined || metric.target) && (
                <div className="text-xs bg-white rounded-lg p-2 border">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">달성률:</span>
                      <span className={`font-semibold ${
                        (metric.achievement || 0) >= 100 ? 'text-green-600' : 
                        (metric.achievement || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(metric.achievement || 0).toFixed(1)}%
                      </span>
                      {/* 불릿 지표 */}
                      <div className={`w-2 h-2 rounded-full ${
                        (metric.achievement || 0) >= 100 ? 'bg-green-500' : 
                        (metric.achievement || 0) >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      목표: {metric.target || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      예측치: {metric.predicted || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      차이: {(metric.achievement || 0) >= 100 ? '+' : ''}{((metric.achievement || 0) - 100).toFixed(1)}%p
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 상세 모달들 */}
      {metrics.map((metric) => (
        <MetricModal
          key={metric.id}
          open={modalOpen === metric.id}
          onOpenChange={(open) => !open && setModalOpen(null)}
          title={`${metric.title} 상세 분석`}
        >
          <div className="space-y-6">
            {/* 진단 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">현재 상태 진단</h3>
                {getStatusBadge(metric.status || "warning")}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">현재 수치</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">목표치</p>
                  <p className="text-2xl font-bold">{metric.target || 'N/A'}</p>
                </div>
              </div>

              {/* 달성률 표시 */}
              {metric.achievement !== undefined && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">달성률</p>
                    <p className={`text-2xl font-bold ${
                      metric.achievement >= 100 ? 'text-green-600' : 
                      metric.achievement >= 80 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metric.achievement.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">예측치</p>
                    <p className="text-2xl font-bold">{metric.predicted || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">목표 대비 차이</p>
                    <p className={`text-2xl font-bold ${
                      metric.achievement >= 100 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.achievement >= 100 ? '+' : ''}{(metric.achievement - 100).toFixed(1)}%p
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                {metric.change !== undefined && (
                  <div className="flex items-center gap-2">
                    {getChangeIcon(metric.change)}
                    <span className="text-sm">
                      {metric.changeLabel}: {metric.change > 0 ? '+' : ''}{metric.change}%p
                    </span>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  담당팀: {metric.team || 'N/A'}
                </div>
              </div>
            </div>

            {/* 커뮤니티 참여 상세 분석 */}
            {metric.id === "FR-103" ? (
              <div className="space-y-4">
                <h4 className="font-semibold">커뮤니티 참여 상세 분석</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 mb-1">신규 게시물 작성 신규 유저 수</p>
                    <p className="text-2xl font-bold text-green-600">129명</p>
                    <p className="text-xs text-green-600 mt-1">전체 신규회원 대비 5.0%</p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 mb-1">커뮤니티 미참여 신규 유저 수</p>
                    <p className="text-2xl font-bold text-red-600">2,446명</p>
                    <p className="text-xs text-red-600 mt-1">전체 신규회원 대비 95.0%</p>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    총 신규회원 2,575명 중 129명만이 커뮤니티에 게시물을 작성했습니다. 
                    커뮤니티 참여율 향상을 위한 전략이 필요합니다.
                  </p>
                </div>
              </div>
            ) : (
              metric.trendData && (
                <div className="space-y-2">
                  <h4 className="font-semibold">추이 분석</h4>
                  <TrendChart
                    data={metric.trendData.map((d, i) => ({
                      date: `${i + 1}일`,
                      value: d.value
                    }))}
                    lines={[
                      { dataKey: "value", name: metric.title, color: metric.trendColor || "#3b82f6" }
                    ]}
                    height={200}
                  />
                </div>
              )
            )}

            {/* 액션 유도 섹션 */}
            <div className="space-y-4">
              <h4 className="font-semibold">액션 유도</h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">{metric.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.actionRequired}</span>
                  <Button size="sm" variant="outline">
                    액션 실행
                  </Button>
                </div>
              </div>
            </div>

            {/* 특별 모달 내용 */}
            {metric.id === "FR-104" && (
              <div className="space-y-4">
                <h4 className="font-semibold">유령 고객 세그먼트 분석</h4>
                <div className="space-y-2">
                  {ghostCustomerSegments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{segment.segment}</span>
                      <div className="text-right">
                        <span className="font-semibold">{segment.count}명</span>
                        <span className="text-sm text-muted-foreground ml-2">({segment.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full" variant="outline">
                  푸시 캠페인 즉시 실행 (FR-A4)
                </Button>
              </div>
            )}

            {metric.id === "FR-102" && (
              <div className="space-y-4">
                <h4 className="font-semibold">저조 업체 리스트 (50% 미만)</h4>
                <div className="space-y-2">
                  {lowPerformingVendors.map((vendor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{vendor.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">{vendor.contact}</span>
                      </div>
                      <span className="text-red-600 font-semibold">{vendor.responseRate}%</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full" variant="outline">
                  담당자에게 경고 메일 전송 (FR-A2)
                </Button>
              </div>
            )}
          </div>
        </MetricModal>
      ))}
    </section>
  )
}
