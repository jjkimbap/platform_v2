"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, TrendingUp, Users, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { TrendChart } from "@/components/trend-chart"

export default function CommunityPostsPage() {
  const router = useRouter()

  const postsTrendData = [
    { date: "1일", current: 45, previous: 38 },
    { date: "2일", current: 52, previous: 45 },
    { date: "3일", current: 48, previous: 42 },
    { date: "4일", current: 58, previous: 50 },
    { date: "5일", current: 55, previous: 48 },
    { date: "6일", current: 62, previous: 55 },
    { date: "7일", current: 68, previous: 60 },
  ]

  const categoryData = [
    { label: "Q&A", value: "45개 (31.5%)", color: "#3b82f6" },
    { label: "제품리뷰", value: "38개 (26.6%)", color: "#10b981" },
    { label: "판별팁", value: "32개 (22.4%)", color: "#f59e0b" },
    { label: "인증거래", value: "28개 (19.6%)", color: "#8b5cf6" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="w-full px-4 py-6 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold">커뮤니티 신규 게시물</h1>
            <p className="text-muted-foreground">일별 커뮤니티 게시물 작성 현황</p>
          </div>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 게시물</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">143개</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.3%</span> 전주 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Q&A</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45개</div>
              <p className="text-xs text-muted-foreground">31.5%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">제품리뷰</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38개</div>
              <p className="text-xs text-muted-foreground">26.6%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">판별팁</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32개</div>
              <p className="text-xs text-muted-foreground">22.4%</p>
            </CardContent>
          </Card>
        </div>

        {/* 추이 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>게시물 작성 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart 
              data={postsTrendData}
              height={300}
              showLegend={true}
            />
          </CardContent>
        </Card>

        {/* 카테고리별 상세 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>활성도 지표</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">평균 댓글 수</span>
                  <span className="text-sm font-medium">8.2개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">평균 조회 수</span>
                  <span className="text-sm font-medium">156회</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">평균 좋아요</span>
                  <span className="text-sm font-medium">12.4개</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
