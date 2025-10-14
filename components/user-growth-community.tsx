"use client"

import { useState, useEffect } from "react"
import { UserPlus, MessageSquare, MessageCircle } from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { MetricModal } from "@/components/metric-modal"
import { TrendChart } from "@/components/trend-chart"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { useDateRange } from "@/hooks/use-date-range"
import { fetchUserJoinPath, formatDateForAPI, transformDataForChart, UserJoinPathResponse } from "@/lib/api"

// 사용자 성장 데이터
const mockAcquisitionData = [
  { date: "1일", app: 450, commerce: 320 },
  { date: "2일", app: 520, commerce: 380 },
  { date: "3일", app: 480, commerce: 350 },
  { date: "4일", app: 610, commerce: 420 },
  { date: "5일", app: 580, commerce: 390 },
  { date: "6일", app: 650, commerce: 450 },
  { date: "7일", app: 720, commerce: 480 },
]

// 커뮤니티 데이터
const mockCommunityData = [
  { date: "1일", type1: 45, type2: 32, type3: 28, type4: 15 },
  { date: "2일", type1: 52, type2: 38, type3: 31, type4: 18 },
  { date: "3일", type1: 48, type2: 35, type3: 29, type4: 16 },
  { date: "4일", type1: 61, type2: 42, type3: 35, type4: 22 },
  { date: "5일", type1: 58, type2: 40, type3: 33, type4: 20 },
  { date: "6일", type1: 65, type2: 45, type3: 38, type4: 24 },
  { date: "7일", type1: 72, type2: 48, type3: 41, type4: 26 },
]

// 채팅 데이터
const mockChatData = [
  { date: "1일", rooms: 120, messages: 1850 },
  { date: "2일", rooms: 135, messages: 2100 },
  { date: "3일", rooms: 128, messages: 1950 },
  { date: "4일", rooms: 152, messages: 2350 },
  { date: "5일", rooms: 148, messages: 2200 },
  { date: "6일", rooms: 165, messages: 2580 },
  { date: "7일", rooms: 178, messages: 2820 },
]

// 미니 차트용 데이터
const userGrowthTrendData = [
  { value: 28000 },
  { value: 28500 },
  { value: 28200 },
  { value: 29200 },
  { value: 28800 },
  { value: 29800 },
  { value: 30000 },
]

// 스캔 기기 회원/비회원 추이 데이터
const scanUserTrendData = [
  { date: "1일", members: 6500, nonMembers: 21500 },
  { date: "2일", members: 6800, nonMembers: 21700 },
  { date: "3일", members: 6650, nonMembers: 21550 },
  { date: "4일", members: 7200, nonMembers: 22000 },
  { date: "5일", members: 6950, nonMembers: 21850 },
  { date: "6일", members: 7350, nonMembers: 22450 },
  { date: "7일", members: 7500, nonMembers: 22500 },
]

// 스캔 기기 가입 전환율 추이 데이터
const conversionRateTrendData = [
  { date: "1일", conversionRate: 23.2 },
  { date: "2일", conversionRate: 23.8 },
  { date: "3일", conversionRate: 23.6 },
  { date: "4일", conversionRate: 24.7 },
  { date: "5일", conversionRate: 24.1 },
  { date: "6일", conversionRate: 24.6 },
  { date: "7일", conversionRate: 24.8 },
]

const communityTrendData = [
  { value: 14.2 },
  { value: 15.8 },
  { value: 15.1 },
  { value: 17.5 },
  { value: 16.9 },
  { value: 18.2 },
  { value: 18.7 },
]

const chatTrendData = [
  { value: 28.5 },
  { value: 30.2 },
  { value: 29.8 },
  { value: 31.5 },
  { value: 30.9 },
  { value: 32.1 },
  { value: 32.5 },
]

// 신규 유입수 데이터
const newInflowData = [
  { date: "1일", app: 450, commerce: 320 },
  { date: "2일", app: 520, commerce: 380 },
  { date: "3일", app: 480, commerce: 350 },
  { date: "4일", app: 610, commerce: 420 },
  { date: "5일", app: 580, commerce: 390 },
  { date: "6일", app: 650, commerce: 450 },
  { date: "7일", app: 720, commerce: 480 },
]

// 신규 유입수 텍스트 데이터
const newInflowTextData = [
  { label: "앱 유입", value: "720명", color: "#3b82f6" },
  { label: "커머스 유입", value: "480명", color: "#f59e0b" },
]


export function UserGrowthCommunity() {
  const [userGrowthModalOpen, setUserGrowthModalOpen] = useState(false)
  const [conversionRateModalOpen, setConversionRateModalOpen] = useState(false)
  const [communityModalOpen, setCommunityModalOpen] = useState(false)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [newInflowModalOpen, setNewInflowModalOpen] = useState(false)
  
  // API 데이터 상태
  const [data, setData] = useState<UserJoinPathResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { dateRange } = useDateRange()

  // 데이터 로딩 함수
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const startDate = formatDateForAPI(dateRange.from)
      const endDate = formatDateForAPI(dateRange.to)
      
      // 디버깅을 위한 로그
      console.log('Date Range:', dateRange)
      console.log('Formatted Start Date:', startDate)
      console.log('Formatted End Date:', endDate)
      
      const result = await fetchUserJoinPath('daily', startDate, endDate)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 날짜 범위가 변경될 때마다 데이터 다시 로드
  useEffect(() => {
    loadData()
  }, [dateRange.from, dateRange.to])

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">사용자 성장 & 커뮤니티 활성도</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 auto-rows-fr">
      <MetricCard
        title="스캔 기기"
        value="30,000개"
        icon={<UserPlus className="h-5 w-5" />}
        onClick={() => setUserGrowthModalOpen(true)}
        trendData={userGrowthTrendData}
        trendColor="#3b82f6"
        textData={[
          { label: "미가입기기", value: "22,500개", color: "#ef4444" },
          { label: "가입기기", value: "7,500개", color: "#10b981" },
        ]}
        target="35,000개"
        achievement={85.7}
      />
      <MetricCard
          title="스캔 기기 가입 전환율"
          value="24.8%"
          icon={<UserPlus className="h-5 w-5" />}
          onClick={() => setConversionRateModalOpen(true)}
          target="35%"
          achievement={91.9}
        />
        <MetricCard
          title="신규 유입수"
          value={data ? (data.total.appUserCount + data.total.commerceUserCount).toLocaleString() : "1,200"}
          icon={<UserPlus className="h-5 w-5" />}
          onClick={() => setNewInflowModalOpen(true)}
          textData={data ? [
            { label: "앱 유입", value: `${data.total.appUserCount.toLocaleString()}명`, color: "#3b82f6" },
            { label: "커머스 유입", value: `${data.total.commerceUserCount.toLocaleString()}명`, color: "#f59e0b" },
          ] : newInflowTextData}
          trendData={[
            { value: 600 },
            { value: 400 },
            { value: 199 },
            { value: 50 },
            { value: 20 },
            { value: 300 },
            { value: 10 },
          ]}
          trendColor="#f59e0b"
          target="4,300명"
          achievement={86.1}
        />
        <MetricCard
          title="커뮤니티 신규 게시물"
          value="143개"
          icon={<MessageSquare className="h-5 w-5" />}
          onClick={() => setCommunityModalOpen(true)}
          trendData={communityTrendData}
          trendColor="#10b981"
          textData={[
            { label: "Q&A", value: "45개", color: "#3b82f6" },
            { label: "제품리뷰", value: "38개", color: "#10b981" },
            { label: "판별팁", value: "32개", color: "#f59e0b" },
            { label: "인증거래", value: "28개", color: "#8b5cf6" },
          ]}
          target="200개"
          achievement={71.5}
          inactivePosts="무반응게시물 12개"
        />
        <MetricCard
          title="신규 채팅방"
          value="156개"
          icon={<MessageCircle className="h-5 w-5" />}
          onClick={() => setChatModalOpen(true)}
          trendData={chatTrendData}
          trendColor="#f59e0b"
          textData={[
            { label: "1:1 채팅방", value: "89개", color: "#3b82f6" },
            { label: "인증거래", value: "67개", color: "#10b981" },
          ]}
          target="200개"
          achievement={78.0}
        />
      </div>

      {/* User Growth Modal */}
      <MetricModal open={userGrowthModalOpen} onOpenChange={setUserGrowthModalOpen} title="스캔 기기 가입별 추이">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">가입 기기</p>
              <p className="text-2xl font-bold text-green-600">7,500개</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">미가입 기기</p>
              <p className="text-2xl font-bold text-red-600">22,500개</p>
            </div>
          </div>
          <TrendChart
            data={scanUserTrendData}
            lines={[
              { dataKey: "members", name: "가입", color: "#10b981" },
              { dataKey: "nonMembers", name: "미가입", color: "#ef4444" },
            ]}
            height={350}
          />
        </div>
      </MetricModal>

      {/* Conversion Rate Modal */}
      <MetricModal open={conversionRateModalOpen} onOpenChange={setConversionRateModalOpen} title="스캔 기기 가입 전환율 추이">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">현재 전환율</p>
              <p className="text-2xl font-bold text-blue-600">24.8%</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">목표 전환율</p>
              <p className="text-2xl font-bold text-green-600">85%</p>
            </div>
          </div>
          <TrendChart
            data={conversionRateTrendData}
            lines={[
              { dataKey: "conversionRate", name: "가입 전환율", color: "#3b82f6" },
            ]}
            height={350}
          />
        </div>
      </MetricModal>

      {/* Community Modal */}
      <MetricModal open={communityModalOpen} onOpenChange={setCommunityModalOpen} title="커뮤니티 게시글 종류별 추이">
        <div className="space-y-6">
          <TrendChart
            data={mockCommunityData}
            lines={[
                { dataKey: "type1", name: "정품제품리뷰", color: "#3b82f6" },
                { dataKey: "type2", name: "정품판별팁", color: "#10b981" },
                { dataKey: "type3", name: "정품인증거래", color: "#f59e0b" },
                { dataKey: "type4", name: "정품Q&A", color: "#8b5cf6" },
            ]}
            height={350}
          />

          {/* 커뮤니티별 상세 통계 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">커뮤니티별 상세 통계</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-32">커뮤니티 종류</TableHead>
                    <TableHead className="w-24">게시글</TableHead>
                    <TableHead className="w-24">댓글</TableHead>
                    <TableHead className="w-24">좋아요</TableHead>
                    <TableHead className="w-24">북마크</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { community: "Q&A", posts: 45, comments: 128, likes: 234, bookmarks: 67 },
                    { community: "제품리뷰", posts: 38, comments: 95, likes: 189, bookmarks: 52 },
                    { community: "판별팁", posts: 32, comments: 78, likes: 156, bookmarks: 43 },
                    { community: "인증거래", posts: 28, comments: 65, likes: 142, bookmarks: 38 },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-sm">{item.community}</TableCell>
                      <TableCell className="text-sm">{item.posts}개</TableCell>
                      <TableCell className="text-sm">{item.comments}개</TableCell>
                      <TableCell className="text-sm">{item.likes}개</TableCell>
                      <TableCell className="text-sm">{item.bookmarks}개</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </MetricModal>

      {/* Chat Modal */}
      <MetricModal open={chatModalOpen} onOpenChange={setChatModalOpen} title="채팅 활동 상세 추이">
        <div className="space-y-6">
          <TrendChart
            data={mockChatData}
            lines={[
              { dataKey: "rooms", name: "신규 채팅방", color: "#3b82f6" },
              { dataKey: "messages", name: "총 메시지 수", color: "#10b981" },
            ]}
            height={350}
          />

          {/* 실시간 채팅 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">실시간 채팅</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-32">일시</TableHead>
                    <TableHead className="w-24">유저</TableHead>
                    <TableHead>내용</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { time: "25-01-15 15:45", user: "김철수", content: "안녕하세요! 제품 문의드립니다" },
                    { time: "25-01-15 15:42", user: "이영희", content: "배송 언제 되나요?" },
                    { time: "25-01-15 15:38", user: "박민수", content: "할인 쿠폰 사용 가능한가요?" },
                    { time: "25-01-15 15:35", user: "최지영", content: "교환 신청하고 싶어요" },
                    { time: "25-01-15 15:32", user: "정수현", content: "리뷰 작성했는데 확인 부탁드려요" },
                    { time: "25-01-15 15:28", user: "한동민", content: "품질 확인 부탁드립니다" },
                    { time: "25-01-15 15:25", user: "송미영", content: "추천 제품 있나요?" },
                    { time: "25-01-15 15:22", user: "강태현", content: "사용법 문의드립니다" },
                    { time: "25-01-15 15:18", user: "윤서연", content: "다음 주문할 때 할인 적용되나요?" },
                    { time: "25-01-15 15:15", user: "임재현", content: "포인트 적립 확인 부탁드려요" },
                  ].map((chat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-sm">{chat.time}</TableCell>
                      <TableCell className="text-sm">{chat.user}</TableCell>
                      <TableCell className="text-sm">{chat.content}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </MetricModal>

      {/* New Inflow Modal */}
      <MetricModal open={newInflowModalOpen} onOpenChange={setNewInflowModalOpen} title="신규 유입수 상세 분석">
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">데이터를 불러오는 중...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-red-500">오류: {error}</div>
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">앱 유입</p>
                  <p className="text-2xl font-bold text-chart-1">
                    {data.total.appUserCount.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">커머스 유입</p>
                  <p className="text-2xl font-bold text-chart-2">
                    {data.total.commerceUserCount.toLocaleString()}
                  </p>
                </div>
              </div>
              <TrendChart
                data={transformDataForChart(data.data)}
                lines={[
                  { dataKey: "app", name: "앱 유입", color: "#3b82f6" },
                  { dataKey: "commerce", name: "커머스 유입", color: "#f59e0b" },
                ]}
                height={350}
              />
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">데이터가 없습니다.</div>
            </div>
          )}
        </div>
      </MetricModal>

    </section>
  )
}
