"use client"

import { useState, useEffect } from "react"
import { Users, Scan, MessageSquare, AlertTriangle } from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { MetricModal } from "@/components/metric-modal"
import { TrendChart } from "@/components/trend-chart"
import { BackToBackBarChart } from "@/components/back-to-back-bar-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useDateRange } from "@/hooks/use-date-range"
import { activityMetricsData } from "@/lib/metrics-data"
import { format } from "date-fns"

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

// 스캔 많은 국가 TOP3 데이터
const topScanCountriesData = [
  { label: "🇰🇷 한국", value: "12,450회", color: "#3b82f6" },
  { label: "🇺🇸 미국", value: "8,720회", color: "#10b981" },
  { label: "🇯🇵 일본", value: "6,380회", color: "#f59e0b" },
]
// 실행 많은 마켓 TOP3 데이터
const topExeMarketData = [
  { label: "App Store", value: "22,450회", color: "#3b82f6" },
  { label: "Play Store", value: "8,720회", color: "#10b981" },
  { label: "China Store", value: "5,380회", color: "#f59e0b" },
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
  { name: "50대+", male: 45, female: 52 },
]

// 저조업체 데이터
const lowPerformingVendors = [
  { id: 1, name: "업체 A", responseRate: 35, contact: "vendor-a@example.com" },
  { id: 2, name: "업체 B", responseRate: 42, contact: "vendor-b@example.com" },
  { id: 3, name: "업체 C", responseRate: 28, contact: "vendor-c@example.com" },
  { id: 4, name: "업체 D", responseRate: 48, contact: "vendor-d@example.com" },
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
  const [freelancingModalOpen, setFreelancingModalOpen] = useState(false)
  const [vendorAlertModalOpen, setVendorAlertModalOpen] = useState(false)
  const [marketRegistrationModalOpen, setMarketRegistrationModalOpen] = useState(false)
  const [selectedVendors, setSelectedVendors] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)
  const [scanDauData, setScanDauData] = useState(mockDauData)
  const [scanWauData, setScanWauData] = useState(mockWauData)
  const [scanMauData, setScanMauData] = useState(mockMauData)
  const [conversionData, setConversionData] = useState<Array<{ date: string; conversion: number }>>([])
  const { toast } = useToast()
  const { dateRange } = useDateRange()

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
  }, [])

  const handleSendEmail = () => {
    if (selectedVendors.length === 0) {
      toast({
        title: "업체를 선택해주세요",
        description: "이메일을 전송할 업체를 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    // Mock email sending
    toast({
      title: "이메일 전송 완료",
      description: `${selectedVendors.length}개 업체에 답변율 저조 알림을 전송했습니다.`,
    })
    setSelectedVendors([])
  }

  const toggleVendor = (id: number) => {
    setSelectedVendors((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          핵심 활성도 지표
          <Tooltip>
            <TooltipTrigger asChild>
              {/* <span className="ml-1 cursor-help text-muted-foreground hover:text-foreground">?</span> */}
            </TooltipTrigger>
            <TooltipContent>
              <p>핵심 활성도 지표는 실행 DAU, 스캔 DAU, 스캔 전환율을 측정하여 활성도를 분석하는 지표입니다.</p>
            </TooltipContent>
          </Tooltip>
        </h2>
        <div 
          className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMarketRegistrationModalOpen(true)}
        >
          <span>마켓 등록율</span>
          <span className="font-semibold text-success">94.8%</span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 auto-rows-fr">
        <MetricCard
          title="실행 DAU"
          value="2,827"
          icon={<Users className="h-5 w-5" />}
          onClick={() => setExecutionModalOpen(true)}
          trendData={executionTrendData}
          trendColor="#3b82f6"
          textData={topExeMarketData}
          target="20,000"
          achievement={79.0}
        />
        <MetricCard
          title="스캔 DAU"
          value="1,172"
          icon={<Scan className="h-5 w-5" />}
          onClick={() => setScanModalOpen(true)}
          trendData={scanTrendData}
          trendColor="#10b981"
          textData={topScanCountriesData}
          target="15,000"
          achievement={82.3}
        />
        <MetricCard
          title="실행 대비 스캔 전환율"
          value="62%"
          onClick={() => setConversionModalOpen(true)}
          // textData={topScanCountriesData}
          target="전환율 75%"
          achievement={91.9}
          comparisonText="전월 평균 실행 대비 스캔율 45%"
        />
        <MetricCard
          title="스캔 대비 프리랜딩 답변율"
          value="63% (747명)"
          icon={<MessageSquare className="h-5 w-5" />}
          onClick={() => setFreelancingModalOpen(true)}
          barData={freelancingMiniData}
          maleColor="#3b82f6"
          femaleColor="#ec4899"
          target="80%"
          achievement={94.1}
        />
        <MetricCard
          title="답변율 저조업체 알림"
          value={`${lowPerformingVendors.length}개`}
          icon={<AlertTriangle className="h-5 w-5 text-warning" />}
          onClick={() => setVendorAlertModalOpen(true)}
          className="border-warning/30"
          textData={lowestVendorsData}
          target="2개 이하"
          achievement={50.0}
        />
      </div>

      {/* Execution Modal */}
      <MetricModal open={executionModalOpen} onOpenChange={setExecutionModalOpen} title="실행 활성 사용자 추이">
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <span className="text-sm text-muted-foreground">선택 기간: </span>
          <span className="text-sm font-medium">
            {format(dateRange.from, 'yyyy-MM-dd')} ~ {format(dateRange.to, 'yyyy-MM-dd')}
          </span>
        </div>
        <div className="space-y-6">
          {/* 선택 기간 평균 DAU 값 노출 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">평균 DAU</p>
              <p className="text-2xl font-bold text-blue-600">13,900</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">최고 DAU</p>
              <p className="text-2xl font-bold text-green-600">15,800</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">최저 DAU</p>
              <p className="text-2xl font-bold text-red-600">12,500</p>
            </div>
          </div>
          <Tabs defaultValue="dau" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="dau">DAU</TabsTrigger>
              <TabsTrigger value="wau">WAU</TabsTrigger>
              <TabsTrigger value="mau">MAU</TabsTrigger>
            </TabsList>
            <TabsContent value="dau" className="mt-6">
              <TrendChart 
                data={mockDauData} 
                lines={[
                  { dataKey: "current", name: "DAU", color: "#3b82f6" },
                  { dataKey: "previous", name: "비교 DAU", color: "#10b981" }
                ]} 
              />
            </TabsContent>
            <TabsContent value="wau" className="mt-6">
              <TrendChart data={mockWauData} lines={[{ dataKey: "value", name: "WAU", color: "#3b82f6" }]} />
            </TabsContent>
            <TabsContent value="mau" className="mt-6">
              <TrendChart data={mockMauData} lines={[{ dataKey: "value", name: "MAU", color: "#3b82f6" }]} />
            </TabsContent>
            </Tabs>
          
          {/* 마켓별 실행수 그리드 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">마켓별 실행수</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-32">마켓</TableHead>
                    <TableHead className="w-24">실행수</TableHead>
                    <TableHead className="w-24">비율</TableHead>
                    <TableHead className="w-24">증감</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { market: "App Store", executions: 12500, ratio: "45.2%", change: "+5.2%" },
                    { market: "Play Store", executions: 9800, ratio: "35.4%", change: "+2.1%" },
                    { market: "One Store", executions: 3200, ratio: "11.6%", change: "-1.3%" },
                    { market: "China Store", executions: 2100, ratio: "7.6%", change: "+0.8%" },
                    { market: "기타", executions: 200, ratio: "0.7%", change: "+0.1%" },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-sm">{item.market}</TableCell>
                      <TableCell className="text-sm">{item.executions.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{item.ratio}</TableCell>
                      <TableCell className={`text-sm ${
                        item.change.startsWith('+') ? 'text-green-600' : 
                        item.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {item.change}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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

      {/* Freelancing Modal */}
      <MetricModal open={freelancingModalOpen} onOpenChange={setFreelancingModalOpen} title="프리랜딩 답변율 분석">
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            질문별 답변 분포 현황
          </div>
          
          {/* 질문 1 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">질문 1: 제품 구매 시 가장 중요하게 생각하는 요소는?</h3>
            <div className="space-y-2">
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
            </div>
          </div>

          {/* 질문 2 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">질문 2: 온라인 쇼핑 시 선호하는 결제 방법은?</h3>
            <div className="space-y-2">
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
            </div>
          </div>
        </div>
      </MetricModal>

      {/* Vendor Alert Modal */}
      <MetricModal open={vendorAlertModalOpen} onOpenChange={setVendorAlertModalOpen} title="답변율 저조 업체 리스트">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">답변율 50% 미만 업체 ({lowPerformingVendors.length}개)</p>
            <Button onClick={handleSendEmail} disabled={selectedVendors.length === 0} size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
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
                  <TableHead>담당자 이메일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowPerformingVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedVendors.includes(vendor.id)}
                        onCheckedChange={() => toggleVendor(vendor.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>
                      <span className="text-danger font-semibold">{vendor.responseRate}%</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{vendor.contact}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
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
    </section>
  )
}
