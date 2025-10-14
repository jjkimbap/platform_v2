"use client"

import { useState } from "react"
import { TrendingUp, BarChart3, MessageSquare } from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { MetricModal } from "@/components/metric-modal"
import { TrendChart } from "@/components/trend-chart"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

const mockTrendData = [
  { date: "1일", trend: 85, ranking: 95 },
  { date: "2일", trend: 92, ranking: 96 },
  { date: "3일", trend: 88, ranking: 94 },
  { date: "4일", trend: 95, ranking: 97 },
  { date: "5일", trend: 98, ranking: 95 },
  { date: "6일", trend: 102, ranking: 98 },
  { date: "7일", trend: 108, ranking: 97 },
]

const mockRankingData = [
  { rank: 1, name: "사용자A", score: 98.5 },
  { rank: 2, name: "사용자B", score: 95.2 },
  { rank: 3, name: "사용자C", score: 92.8 },
  { rank: 4, name: "사용자D", score: 89.1 },
  { rank: 5, name: "사용자E", score: 86.7 },
]

export function TrendMetrics() {
  const [trendModalOpen, setTrendModalOpen] = useState(false)
  const [rankingModalOpen, setRankingModalOpen] = useState(false)
  const [realtimeModalOpen, setRealtimeModalOpen] = useState(false)
  const [realtimePostsModalOpen, setRealtimePostsModalOpen] = useState(false)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">트렌드 분석 & 랭킹</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-4 auto-rows-fr">
        <MetricCard
          title="실시간 게시글"
          value="18개"
          icon={<MessageSquare className="h-5 w-5" />}
          onClick={() => setRealtimePostsModalOpen(true)}
          target="25개"
          achievement={72.0}
        />
        <MetricCard
          title="인기 게시물 트렌드"
          value="상승"
          icon={<TrendingUp className="h-5 w-5" />}
          onClick={() => setTrendModalOpen(true)}
          trendData={[
            { value: 85 },
            { value: 92 },
            { value: 88 },
            { value: 95 },
            { value: 98 },
            { value: 102 },
            { value: 108 },
          ]}
          trendColor="#f59e0b"
          target="지속 상승"
          achievement={85.0}
        />
        <MetricCard
          title="사용자 랭킹 변화"
          value="안정"
          icon={<BarChart3 className="h-5 w-5" />}
          onClick={() => setRankingModalOpen(true)}
          trendData={[
            { value: 95 },
            { value: 96 },
            { value: 94 },
            { value: 97 },
            { value: 95 },
            { value: 98 },
            { value: 97 },
          ]}
          trendColor="#8b5cf6"
          target="상위 유지"
          achievement={92.0}
        />
        <MetricCard
          title="실시간 커뮤니티 게시글"
          value="23개"
          icon={<MessageSquare className="h-5 w-5" />}
          onClick={() => setRealtimeModalOpen(true)}
          target="30개"
          achievement={76.7}
        />
      </div>

      <MetricModal open={trendModalOpen} onOpenChange={setTrendModalOpen} title="인기 게시물 Top 5">
        <div className="space-y-4">
          <div className="space-y-2">
            {[
              { title: "이 제품 정말 좋네요! 추천합니다", author: "김철수", time: "25-01-15 14:32", country: "🇰🇷 한국" },
              { title: "품질이 기대 이상입니다", author: "John Smith", time: "25-01-15 13:45", country: "🇺🇸 미국" },
              { title: "가격 대비 만족도 높아요", author: "田中太郎", time: "25-01-15 12:18", country: "🇯🇵 일본" },
              { title: "배송도 빠르고 포장도 깔끔해요", author: "이영희", time: "25-01-15 11:22", country: "🇰🇷 한국" },
              { title: "다음에도 주문할 예정입니다", author: "Maria Garcia", time: "25-01-15 10:15", country: "🇪🇸 스페인" },
            ].map((post, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{post.title}</h4>
                  <span className="text-xs text-muted-foreground">{post.country}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>작성자: {post.author}</span>
                  <span>작성시간: {post.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MetricModal>

      <MetricModal open={rankingModalOpen} onOpenChange={setRankingModalOpen} title="사용자 랭킹 상세 분석">
        <div className="space-y-4">
          <TrendChart
            data={mockTrendData}
            lines={[
              { dataKey: "ranking", name: "사용자 랭킹 변화", color: "#8b5cf6" },
            ]}
            height={250}
          />
          <div className="space-y-2">
            <h4 className="font-semibold">상위 사용자 랭킹</h4>
            <div className="space-y-2">
              {mockRankingData.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">#{user.rank}</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <span className="font-semibold text-chart-1">{user.score}점</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MetricModal>

      <MetricModal open={realtimePostsModalOpen} onOpenChange={setRealtimePostsModalOpen} title="실시간 게시글">
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-32">제목</TableHead>
                  <TableHead className="w-24">작성자</TableHead>
                  <TableHead className="w-32">커뮤니티 이름</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { title: "이 제품 어때요?", author: "김철수", community: "Q&A" },
                  { title: "리뷰 작성했습니다", author: "이영희", community: "제품리뷰" },
                  { title: "가품 구별법 알려드려요", author: "박민수", community: "판별팁" },
                  { title: "거래 신청합니다", author: "최지영", community: "인증거래" },
                  { title: "사용법 문의드립니다", author: "정수현", community: "Q&A" },
                  { title: "품질 확인 부탁드려요", author: "한동민", community: "제품리뷰" },
                  { title: "추천 제품 있나요?", author: "송미영", community: "판별팁" },
                  { title: "교환 문의드립니다", author: "강태현", community: "인증거래" },
                ].map((post, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-sm">{post.title}</TableCell>
                    <TableCell className="text-sm">{post.author}</TableCell>
                    <TableCell className="text-sm">{post.community}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </MetricModal>

      <MetricModal open={realtimeModalOpen} onOpenChange={setRealtimeModalOpen} title="실시간 게시물">
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-32">일시</TableHead>
                  <TableHead className="w-24">작성자</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead className="w-24">국가</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { time: "25-01-15 15:45", author: "박민수", title: "지금 막 구매했는데 어떤가요?", country: "🇰🇷" },
                  { time: "25-01-15 15:42", author: "Sarah Johnson", title: "사용법 문의드립니다", country: "🇺🇸" },
                  { time: "25-01-15 15:38", author: "佐藤花子", title: "리뷰 작성했어요", country: "🇯🇵" },
                  { time: "25-01-15 15:35", author: "최지영", title: "배송 언제 오나요?", country: "🇰🇷" },
                  { time: "25-01-15 15:32", author: "Carlos Rodriguez", title: "할인 정보 공유합니다", country: "🇲🇽" },
                  { time: "25-01-15 15:28", author: "이준호", title: "품질 확인 부탁드려요", country: "🇰🇷" },
                  { time: "25-01-15 15:25", author: "Anna Schmidt", title: "추천 제품 있나요?", country: "🇩🇪" },
                  { time: "25-01-15 15:22", author: "김수진", title: "교환 문의드립니다", country: "🇰🇷" },
                ].map((post, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-sm">{post.time}</TableCell>
                    <TableCell className="text-sm">{post.author}</TableCell>
                    <TableCell className="text-sm">{post.title}</TableCell>
                    <TableCell className="text-sm">{post.country}</TableCell>
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
