"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, TrendingUp, Smartphone, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { TrendChart } from "@/components/trend-chart"

export default function NewMembersPage() {
  const router = useRouter()

  const memberInflowData = [
    { date: "1일", current: 850, previous: 780 },
    { date: "2일", current: 920, previous: 850 },
    { date: "3일", current: 880, previous: 820 },
    { date: "4일", current: 1050, previous: 950 },
    { date: "5일", current: 980, previous: 890 },
    { date: "6일", current: 1120, previous: 1020 },
    { date: "7일", current: 1200, previous: 1100 },
  ]

  const sourceData = [
    { label: "앱 유입", value: "850명 (70.8%)", color: "#3b82f6" },
    { label: "커머스 유입", value: "350명 (29.2%)", color: "#10b981" },
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
            <h1 className="text-2xl font-bold">신규 회원 수</h1>
            <p className="text-muted-foreground">일별 신규 회원 유입 현황</p>
          </div>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 신규 회원</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,200명</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.5%</span> 전주 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">앱 유입</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">850명</div>
              <p className="text-xs text-muted-foreground">70.8%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">커머스 유입</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">350명</div>
              <p className="text-xs text-muted-foreground">29.2%</p>
            </CardContent>
          </Card>
        </div>

        {/* 추이 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>신규 회원 수 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart 
              data={memberInflowData}
              lines={[
                { dataKey: "current", name: "현재", color: "#3b82f6" },
                { dataKey: "previous", name: "이전", color: "#10b981" }
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        {/* 유입 경로별 상세 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>유입 경로별 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sourceData.map((item, index) => (
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
              <CardTitle>주요 개선사항</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">앱 유입률 증가</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">커머스 연동 효과</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">사용자 경험 개선</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
