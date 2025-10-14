"use client"

import { TrendChart } from "@/components/trend-chart"
import { Card } from "@/components/ui/card"

// 추이 데이터
const dailyTrendData = [
  { date: "1일", execution: 12500, scan: 8500, executionPredicted: null, scanPredicted: null },
  { date: "2일", execution: 13200, scan: 9200, executionPredicted: null, scanPredicted: null },
  { date: "3일", execution: 12800, scan: 8800, executionPredicted: null, scanPredicted: null },
  { date: "4일", execution: 14100, scan: 10100, executionPredicted: null, scanPredicted: null },
  { date: "5일", execution: 13900, scan: 9900, executionPredicted: 13900, scanPredicted: 9900 },
  { date: "6일", execution: null, scan: null, executionPredicted: 15200, scanPredicted: 11200 },
  { date: "7일", execution: null, scan: null, executionPredicted: 15800, scanPredicted: 11800 },
]

const weeklyTrendData = [
  { date: "1주", userInflow: 85000, communityPosts: 1250, newChatRooms: 320, userInflowPredicted: null, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "2주", userInflow: 92000, communityPosts: 1380, newChatRooms: 350, userInflowPredicted: null, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "3주", userInflow: 88000, communityPosts: 1320, newChatRooms: 340, userInflowPredicted: null, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "4주", userInflow: 95000, communityPosts: 1450, newChatRooms: 380, userInflowPredicted: null, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "5주", userInflow: 91000, communityPosts: 1390, newChatRooms: 360, userInflowPredicted: 91000, communityPostsPredicted: 1390, newChatRoomsPredicted: 360 },
  { date: "6주", userInflow: null, communityPosts: null, newChatRooms: null, userInflowPredicted: 98000, communityPostsPredicted: 1520, newChatRoomsPredicted: 400 },
  { date: "7주", userInflow: null, communityPosts: null, newChatRooms: null, userInflowPredicted: 102000, communityPostsPredicted: 1580, newChatRoomsPredicted: 420 },
]

export function TrendChartsSection() {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 일별 추이 그래프 */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">실행 & 스캔 DAU 추이</h3>
              <span className="text-sm text-muted-foreground"></span>
            </div>
            <TrendChart
              data={dailyTrendData}
              lines={[
                { dataKey: "execution", name: "실행 사용자 (실제)", color: "#3b82f6" },
                { dataKey: "executionPredicted", name: "실행 사용자 (예측)", color: "#3b82f6", strokeDasharray: "5 5" },
                { dataKey: "scan", name: "스캔 사용자 (실제)", color: "#10b981" },
                { dataKey: "scanPredicted", name: "스캔 사용자 (예측)", color: "#10b981", strokeDasharray: "5 5" }
              ]}
              height={300}
            />
          </div>
        </Card>

        {/* 주별 추이 그래프 */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">사용자 유입 & 커뮤니티 활동 추이</h3>
              <span className="text-sm text-muted-foreground"></span>
            </div>
            <TrendChart
              data={weeklyTrendData}
              lines={[
                { dataKey: "userInflow", name: "사용자 유입 수 (실제)", color: "#3b82f6" },
                { dataKey: "userInflowPredicted", name: "사용자 유입 수 (예측)", color: "#3b82f6", strokeDasharray: "5 5" },
                { dataKey: "communityPosts", name: "커뮤니티 일일 총 게시글수 (실제)", color: "#10b981" },
                { dataKey: "communityPostsPredicted", name: "커뮤니티 일일 총 게시글수 (예측)", color: "#10b981", strokeDasharray: "5 5" },
                { dataKey: "newChatRooms", name: "신규 채팅방 수 (실제)", color: "#f59e0b" },
                { dataKey: "newChatRoomsPredicted", name: "신규 채팅방 수 (예측)", color: "#f59e0b", strokeDasharray: "5 5" }
              ]}
              height={300}
            />
          </div>
        </Card>
      </div>
    </section>
  )
}
