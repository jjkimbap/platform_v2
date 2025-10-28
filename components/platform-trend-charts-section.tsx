"use client"

import { useState, useEffect } from "react"
import { TrendChart } from "@/components/trend-chart"
import { MiniTrendChart } from "@/components/mini-trend-chart"
import { MetricCard } from "@/components/metric-card"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTargetsConfig, TargetsConfig } from "@/lib/targets-config"
import { Users, Scan, Target } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts"

// === 실행/스캔 추이 데이터 ===
const monthlyExecutionScanData = [
  { date: "1월", execution: 12500, scan: 8500, conversionRate: 68.0, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "2월", execution: 13200, scan: 9200, conversionRate: 69.7, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "3월", execution: 12800, scan: 8800, conversionRate: 68.8, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "4월", execution: 14100, scan: 10100, conversionRate: 71.6, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "5월", execution: 13900, scan: 9900, conversionRate: 71.2, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "6월", execution: 13200, scan: 9200, conversionRate: 69.7, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "7월", execution: 12800, scan: 8800, conversionRate: 68.8, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "8월", execution: 14100, scan: 10100, conversionRate: 71.6, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "9월", execution: 13900, scan: 9900, conversionRate: 71.2, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "10월", execution: 13200, scan: 9200, conversionRate: 69.7, executionPredicted: 13200, scanPredicted: 9200, conversionRatePredicted: null },
  { date: "11월", execution: null, scan: null, conversionRate: null, executionPredicted: 14200, scanPredicted: 11200, conversionRatePredicted: 73.7 },
  { date: "12월", execution: null, scan: null, conversionRate: null, executionPredicted: 14800, scanPredicted: 11800, conversionRatePredicted: 74.7 },
]

const dailyExecutionScanData = [
  { date: "1일", execution: 1250, scan: 850, conversionRate: 68.0, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "2일", execution: 1320, scan: 920, conversionRate: 69.7, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "3일", execution: 1280, scan: 880, conversionRate: 68.8, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "4일", execution: 1410, scan: 1010, conversionRate: 71.6, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "5일", execution: 1390, scan: 990, conversionRate: 71.2, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "6일", execution: 1320, scan: 920, conversionRate: 69.7, executionPredicted: 1320, scanPredicted: 920, conversionRatePredicted: null },
  { date: "7일", execution: null, scan: null, conversionRate: null, executionPredicted: 1420, scanPredicted: 1120, conversionRatePredicted: 73.7 },
]

const weeklyExecutionScanData = [
  { date: "1주", execution: 8750, scan: 5950, conversionRate: 68.0, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "2주", execution: 9240, scan: 6440, conversionRate: 69.7, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "3주", execution: 8960, scan: 6160, conversionRate: 68.8, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "4주", execution: 9870, scan: 7070, conversionRate: 71.6, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null },
  { date: "5주", execution: 9730, scan: 6930, conversionRate: 71.2, executionPredicted: 9730, scanPredicted: 6930, conversionRatePredicted: null },
  { date: "6주", execution: null, scan: null, conversionRate: null, executionPredicted: 9940, scanPredicted: 7840, conversionRatePredicted: 73.7 },
  { date: "7주", execution: null, scan: null, conversionRate: null, executionPredicted: 10360, scanPredicted: 7840, conversionRatePredicted: 74.7 },
]

// === 신규 회원 추이 데이터 ===
const monthlyNewMemberData = [
  { date: "1월", app: 850, commerce: 350, appPredicted: null, commercePredicted: null },
  { date: "2월", app: 920, commerce: 380, appPredicted: null, commercePredicted: null },
  { date: "3월", app: 880, commerce: 360, appPredicted: null, commercePredicted: null },
  { date: "4월", app: 950, commerce: 390, appPredicted: null, commercePredicted: null },
  { date: "5월", app: 910, commerce: 370, appPredicted: null, commercePredicted: null },
  { date: "6월", app: 920, commerce: 380, appPredicted: null, commercePredicted: null },
  { date: "7월", app: 880, commerce: 360, appPredicted: null, commercePredicted: null },
  { date: "8월", app: 950, commerce: 390, appPredicted: null, commercePredicted: null },
  { date: "9월", app: 910, commerce: 370, appPredicted: null, commercePredicted: null },
  { date: "10월", app: null, commerce: null, appPredicted: 980, commercePredicted: 400 },
  { date: "11월", app: null, commerce: null, appPredicted: 1020, commercePredicted: 420 },
]

const dailyNewMemberData = [
  { date: "1일", app: 85, commerce: 35, appPredicted: null, commercePredicted: null },
  { date: "2일", app: 92, commerce: 38, appPredicted: null, commercePredicted: null },
  { date: "3일", app: 88, commerce: 36, appPredicted: null, commercePredicted: null },
  { date: "4일", app: 95, commerce: 39, appPredicted: null, commercePredicted: null },
  { date: "5일", app: 91, commerce: 37, appPredicted: null, commercePredicted: null },
  { date: "6일", app: 94, commerce: 39, appPredicted: 98, commercePredicted: 40 },
  { date: "7일", app: null, commerce: null, appPredicted: 102, commercePredicted: 42 },
]

const weeklyNewMemberData = [
  { date: "1주", app: 595, commerce: 245, appPredicted: null, commercePredicted: null },
  { date: "2주", app: 644, commerce: 266, appPredicted: null, commercePredicted: null },
  { date: "3주", app: 616, commerce: 252, appPredicted: null, commercePredicted: null },
  { date: "4주", app: 665, commerce: 273, appPredicted: null, commercePredicted: null },
  { date: "5주", app: 658, commerce: 270, appPredicted: 686, commercePredicted: 280 },
  { date: "6주", app: null, commerce: null, appPredicted: 714, commercePredicted: 294 },
  { date: "7주", app: null, commerce: null, appPredicted: 740, commercePredicted: 305 },
]

// === 가입 경로별 신규 회원 추이 데이터 ===
const monthlySignupMethodData = [
  { date: "1월", email: 180, apple: 140, google: 220, kakao: 185, naver: 160, line: 95, facebook: 85, wechat: 135 },
  { date: "2월", email: 195, apple: 155, google: 235, kakao: 195, naver: 170, line: 100, facebook: 90, wechat: 145 },
  { date: "3월", email: 185, apple: 145, google: 225, kakao: 188, naver: 165, line: 98, facebook: 88, wechat: 140 },
  { date: "4월", email: 200, apple: 160, google: 245, kakao: 205, naver: 175, line: 105, facebook: 95, wechat: 150 },
  { date: "5월", email: 195, apple: 155, google: 240, kakao: 200, naver: 170, line: 102, facebook: 92, wechat: 146 },
  { date: "6월", email: 198, apple: 158, google: 242, kakao: 202, naver: 172, line: 103, facebook: 93, wechat: 148 },
  { date: "7월", email: 188, apple: 148, google: 232, kakao: 192, naver: 162, line: 98, facebook: 88, wechat: 138 },
  { date: "8월", email: 202, apple: 162, google: 248, kakao: 208, naver: 178, line: 107, facebook: 97, wechat: 152 },
  { date: "9월", email: 195, apple: 155, google: 240, kakao: 200, naver: 170, line: 102, facebook: 92, wechat: 146 },
  { date: "10월", email: 203, apple: 163, google: 250, kakao: 210, naver: 180, line: 108, facebook: 98, wechat: 155, emailPredicted: 208, applePredicted: 168, googlePredicted: 255, kakaoPredicted: 215, naverPredicted: 185, linePredicted: 112, facebookPredicted: 102, wechatPredicted: 160 },
  { date: "11월", email: null, apple: null, google: null, kakao: null, naver: null, line: null, facebook: null, wechat: null, emailPredicted: 220, applePredicted: 178, googlePredicted: 268, kakaoPredicted: 225, naverPredicted: 195, linePredicted: 118, facebookPredicted: 108, wechatPredicted: 168 },
]

const dailySignupMethodData = [
  { date: "1일", email: 18, apple: 14, google: 22, kakao: 19, naver: 16, line: 10, facebook: 9, wechat: 14 },
  { date: "2일", email: 19, apple: 16, google: 24, kakao: 20, naver: 17, line: 10, facebook: 9, wechat: 15 },
  { date: "3일", email: 18, apple: 15, google: 23, kakao: 19, naver: 17, line: 10, facebook: 9, wechat: 14 },
  { date: "4일", email: 20, apple: 16, google: 25, kakao: 21, naver: 18, line: 11, facebook: 10, wechat: 15 },
  { date: "5일", email: 19, apple: 15, google: 24, kakao: 20, naver: 17, line: 10, facebook: 9, wechat: 15 },
  { date: "6일", email: 20, apple: 16, google: 25, kakao: 21, naver: 18, line: 10, facebook: 10, wechat: 15, emailPredicted: 21, applePredicted: 17, googlePredicted: 26, kakaoPredicted: 22, naverPredicted: 19, linePredicted: 11, facebookPredicted: 10, wechatPredicted: 16 },
  { date: "7일", email: null, apple: null, google: null, kakao: null, naver: null, line: null, facebook: null, wechat: null, emailPredicted: 22, applePredicted: 18, googlePredicted: 27, kakaoPredicted: 23, naverPredicted: 20, linePredicted: 12, facebookPredicted: 11, wechatPredicted: 17 },
]

const weeklySignupMethodData = [
  { date: "1주", email: 126, apple: 98, google: 154, kakao: 130, naver: 112, line: 67, facebook: 60, wechat: 95 },
  { date: "2주", email: 137, apple: 108, google: 168, kakao: 140, naver: 122, line: 72, facebook: 65, wechat: 102 },
  { date: "3주", email: 131, apple: 103, google: 161, kakao: 134, naver: 117, line: 69, facebook: 62, wechat: 98 },
  { date: "4주", email: 142, apple: 112, google: 175, kakao: 146, naver: 126, line: 75, facebook: 68, wechat: 106 },
  { date: "5주", email: 137, apple: 107, google: 168, kakao: 140, naver: 119, line: 71, facebook: 64, wechat: 101, emailPredicted: 140, applePredicted: 110, googlePredicted: 172, kakaoPredicted: 143, naverPredicted: 122, linePredicted: 73, facebookPredicted: 66, wechatPredicted: 104 },
  { date: "6주", email: null, apple: null, google: null, kakao: null, naver: null, line: null, facebook: null, wechat: null, emailPredicted: 152, applePredicted: 120, googlePredicted: 187, kakaoPredicted: 156, naverPredicted: 133, linePredicted: 80, facebookPredicted: 72, wechatPredicted: 114 },
  { date: "7주", email: null, apple: null, google: null, kakao: null, naver: null, line: null, facebook: null, wechat: null, emailPredicted: 158, applePredicted: 125, googlePredicted: 195, kakaoPredicted: 162, naverPredicted: 139, linePredicted: 83, facebookPredicted: 75, wechatPredicted: 118 },
]

// === 커뮤니티 활동 추이 데이터 ===
const monthlyCommunityActivityData = [
  { date: "1월", communityPosts: 1250, newChatRooms: 320, qa: 450, review: 380, tips: 220, trade: 200, oneOnOne: 180, tradingChat: 140, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "2월", communityPosts: 1380, newChatRooms: 350, qa: 490, review: 420, tips: 250, trade: 220, oneOnOne: 200, tradingChat: 150, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "3월", communityPosts: 1320, newChatRooms: 340, qa: 470, review: 400, tips: 240, trade: 210, oneOnOne: 190, tradingChat: 150, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "4월", communityPosts: 1450, newChatRooms: 380, qa: 520, review: 440, tips: 270, trade: 220, oneOnOne: 220, tradingChat: 160, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "5월", communityPosts: 1390, newChatRooms: 360, qa: 500, review: 420, tips: 260, trade: 210, oneOnOne: 210, tradingChat: 150, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "6월", communityPosts: 1380, newChatRooms: 350, qa: 490, review: 420, tips: 250, trade: 220, oneOnOne: 200, tradingChat: 150, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "7월", communityPosts: 1320, newChatRooms: 340, qa: 470, review: 400, tips: 240, trade: 210, oneOnOne: 190, tradingChat: 150, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "8월", communityPosts: 1450, newChatRooms: 380, qa: 520, review: 440, tips: 270, trade: 220, oneOnOne: 220, tradingChat: 160, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "9월", communityPosts: 1390, newChatRooms: 360, qa: 500, review: 420, tips: 260, trade: 210, oneOnOne: 210, tradingChat: 150, communityPostsPredicted: 1390, newChatRoomsPredicted: 360 },
  { date: "10월", communityPosts: null, newChatRooms: null, qa: null, review: null, tips: null, trade: null, oneOnOne: null, tradingChat: null, communityPostsPredicted: 1520, newChatRoomsPredicted: 400 },
  { date: "11월", communityPosts: null, newChatRooms: null, qa: null, review: null, tips: null, trade: null, oneOnOne: null, tradingChat: null, communityPostsPredicted: 1580, newChatRoomsPredicted: 420 },
]

const dailyCommunityActivityData = [
  { date: "1일", communityPosts: 125, newChatRooms: 32, qa: 45, review: 38, tips: 22, trade: 20, oneOnOne: 18, tradingChat: 14, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "2일", communityPosts: 138, newChatRooms: 35, qa: 49, review: 42, tips: 25, trade: 22, oneOnOne: 20, tradingChat: 15, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "3일", communityPosts: 132, newChatRooms: 34, qa: 47, review: 40, tips: 24, trade: 21, oneOnOne: 19, tradingChat: 15, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "4일", communityPosts: 145, newChatRooms: 38, qa: 52, review: 44, tips: 27, trade: 22, oneOnOne: 22, tradingChat: 16, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "5일", communityPosts: 139, newChatRooms: 36, qa: 50, review: 42, tips: 26, trade: 21, oneOnOne: 21, tradingChat: 15, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "6일", communityPosts: 138, newChatRooms: 35, qa: 49, review: 42, tips: 25, trade: 22, oneOnOne: 20, tradingChat: 15, communityPostsPredicted: 138, newChatRoomsPredicted: 35 },
  { date: "7일", communityPosts: null, newChatRooms: null, qa: null, review: null, tips: null, trade: null, oneOnOne: null, tradingChat: null, communityPostsPredicted: 152, newChatRoomsPredicted: 40 },
]

const weeklyCommunityActivityData = [
  { date: "1주", communityPosts: 1250, newChatRooms: 320, qa: 450, review: 380, tips: 220, trade: 200, oneOnOne: 180, tradingChat: 140, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "2주", communityPosts: 1380, newChatRooms: 350, qa: 490, review: 420, tips: 250, trade: 220, oneOnOne: 200, tradingChat: 150, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "3주", communityPosts: 1320, newChatRooms: 340, qa: 470, review: 400, tips: 240, trade: 210, oneOnOne: 190, tradingChat: 150, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "4주", communityPosts: 1450, newChatRooms: 380, qa: 520, review: 440, tips: 270, trade: 220, oneOnOne: 220, tradingChat: 160, communityPostsPredicted: null, newChatRoomsPredicted: null },
  { date: "5주", communityPosts: 1390, newChatRooms: 360, qa: 500, review: 420, tips: 260, trade: 210, oneOnOne: 210, tradingChat: 150, communityPostsPredicted: 1390, newChatRoomsPredicted: 360 },
  { date: "6주", communityPosts: null, newChatRooms: null, qa: null, review: null, tips: null, trade: null, oneOnOne: null, tradingChat: null, communityPostsPredicted: 1520, newChatRoomsPredicted: 400 },
  { date: "7주", communityPosts: null, newChatRooms: null, qa: null, review: null, tips: null, trade: null, oneOnOne: null, tradingChat: null, communityPostsPredicted: 1580, newChatRoomsPredicted: 420 },
]

// 전환율 예측 데이터를 metrics-data.ts 형태로 변환
const conversionRatePredictedData = [
  { value: 73.7 },
  { value: 74.7 },
]

interface PlatformTrendChartsSectionProps {
  selectedCountry?: string
}

export function PlatformTrendChartsSection({ selectedCountry = "전체" }: PlatformTrendChartsSectionProps) {
  const [activeTab, setActiveTab] = useState("monthly")
  const [targetsConfig, setTargetsConfig] = useState<TargetsConfig | null>(null)
  const [communityViewType, setCommunityViewType] = useState<"all" | "community" | "chat">("all")
  const [memberViewType, setMemberViewType] = useState<"total" | "signupMethod">("total")

  useEffect(() => {
    const loadTargets = async () => {
      console.log('Loading targets config...') // 디버깅용 로그
      const config = await getTargetsConfig()
      console.log('Targets config loaded in component:', config) // 디버깅용 로그
      setTargetsConfig(config)
    }
    loadTargets()
  }, []) // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

  // 달성률에 따른 색상 결정 함수
  const getColorByRate = (rate: number) => {
    if (rate <= 50) {
      return {
        text: 'text-foreground',
        bg: 'bg-red-600'
      }
    } else if (rate <= 79) {
      return {
        text: 'text-foreground',
        bg: 'bg-yellow-400'
      }
    } else {
      return {
        text: 'text-foreground',
        bg: 'bg-green-600'
      }
    }
  }

  const getCurrentExecutionScanData = () => {
    switch (activeTab) {
      case "daily":
        return dailyExecutionScanData
      case "weekly":
        return weeklyExecutionScanData
      default:
        return monthlyExecutionScanData
    }
  }

  const getCurrentNewMemberData = () => {
    switch (activeTab) {
      case "daily":
        return dailyNewMemberData
      case "weekly":
        return weeklyNewMemberData
      default:
        return monthlyNewMemberData
    }
  }

  const getCurrentCommunityActivityData = () => {
    switch (activeTab) {
      case "daily":
        return dailyCommunityActivityData
      case "weekly":
        return weeklyCommunityActivityData
      default:
        return monthlyCommunityActivityData
    }
  }

  const getCurrentSignupMethodData = () => {
    switch (activeTab) {
      case "daily":
        return dailySignupMethodData
      case "weekly":
        return weeklySignupMethodData
      default:
        return monthlySignupMethodData
    }
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 2fr 2fr' }}>
        {/* 실행,스캔 추이 그래프 */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            {/* 지표 카드들 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex flex-col space-y-2">
                  <div className={`text-3xl font-bold ${getColorByRate(18.8).text}`}>18.8%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getColorByRate(18.8).bg} h-2 rounded-full transition-all duration-300`}
                      style={{ width: '18.8%' }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">실행 목표</p>
                    <p className="text-xs text-muted-foreground">100%</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex flex-col space-y-2">
                  <div className={`text-3xl font-bold ${getColorByRate(9.8).text}`}>9.8%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getColorByRate(9.8).bg} h-2 rounded-full transition-all duration-300`}
                      style={{ width: '9.8%' }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">스캔 목표</p>
                    <p className="text-xs text-muted-foreground">100%</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex flex-col space-y-2">
                  <div className={`text-3xl font-bold ${getColorByRate(55.2).text}`}>55.2%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getColorByRate(55.2).bg} h-2 rounded-full transition-all duration-300`}
                      style={{ width: '55.2%' }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">전환율 목표</p>
                    <p className="text-xs text-muted-foreground">100%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-foreground">실행/스캔 활성자 추이</h3>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                  <TabsTrigger value="monthly">월별</TabsTrigger>
                  <TabsTrigger value="weekly">주별</TabsTrigger>
                  <TabsTrigger value="daily">일별</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <TrendChart
              data={getCurrentExecutionScanData()}
              lines={[
                { dataKey: "execution", name: "실행", color: "#3b82f6", yAxisId: "left" },
                { dataKey: "executionPredicted", name: "실행 (예측)", color: "#3b82f6", strokeDasharray: "5 5", yAxisId: "left" },
                { dataKey: "scan", name: "스캔", color: "#10b981", yAxisId: "left" },
                { dataKey: "scanPredicted", name: "스캔 (예측)", color: "#10b981", strokeDasharray: "5 5", yAxisId: "left" }
              ]}
              bars={[
                { dataKey: "conversionRate", name: "전환율", color: "#f59e0b", yAxisId: "right" },
                { dataKey: "conversionRatePredicted", name: "전환율(예측)", color: "#f59e0b", yAxisId: "right" }
              ]}
              targets={[]}
              height={300}
            />
          </div>
        </Card>

        {/* 신규 회원 추이 */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            {/* 신규 회원 수 메트릭 카드 */}
            <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-muted rounded-lg">
                <div className="flex flex-col space-y-2">
                  <div className={`text-3xl font-bold ${getColorByRate(85.9).text}`}>85.9%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getColorByRate(85.9).bg} h-2 rounded-full transition-all duration-300`}
                      style={{ width: '85.9%' }}
                    ></div>
                  </div>
              <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">앱 유입 목표</p>
                    <p className="text-xs text-muted-foreground">100%</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex flex-col space-y-2">
                  <div className={`text-3xl font-bold ${getColorByRate(11.3).text}`}>11.3%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getColorByRate(11.3).bg} h-2 rounded-full transition-all duration-300`}
                      style={{ width: '11.3%' }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">커머스 유입 목표</p>
                    <p className="text-xs text-muted-foreground">100%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              <h3 className="text-2xl font-semibold text-foreground">신규 회원 추이</h3>
                <Select value={memberViewType} onValueChange={(value) => setMemberViewType(value as "total" | "signupMethod")}>
                  <SelectTrigger className="w-[160px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                    <SelectItem value="total" className="cursor-pointer hover:bg-blue-50">전체</SelectItem>
                    <SelectItem value="signupMethod" className="cursor-pointer hover:bg-blue-50">가입 경로별</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                  <TabsTrigger value="monthly">월별</TabsTrigger>
                  <TabsTrigger value="weekly">주별</TabsTrigger>
                  <TabsTrigger value="daily">일별</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {memberViewType === "total" ? (
                <BarChart 
                  data={getCurrentNewMemberData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 'dataMax + 200']} />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="commerce" 
                    stackId="a"
                    fill="#f59e0b" 
                    name="커머스"
                  />
                  <Bar 
                    dataKey="commercePredicted" 
                    stackId="a"
                    fill="#f59e0b" 
                    fillOpacity={0.5}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    name="커머스 (예측)"
                  />
                  <Bar 
                    dataKey="app" 
                    stackId="a"
                    fill="#8b5cf6" 
                    name="앱"
                  />
                  <Bar 
                    dataKey="appPredicted" 
                    stackId="a"
                    fill="#8b5cf6" 
                    fillOpacity={0.5}
                    stroke="#8b5cf6"
                    strokeDasharray="5 5"
                    name="앱 (예측)"
                  />
                </BarChart>
              ) : (
                <BarChart 
                  data={getCurrentSignupMethodData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 'dataMax + 50']} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="email" stackId="a" fill="#ef4444" name="이메일" />
                  <Bar dataKey="emailPredicted" stackId="a" fill="#ef4444" fillOpacity={0.5} stroke="#ef4444" strokeDasharray="5 5" name="이메일 (예측)" />
                  <Bar dataKey="apple" stackId="a" fill="#6b7280" name="애플" />
                  <Bar dataKey="applePredicted" stackId="a" fill="#6b7280" fillOpacity={0.5} stroke="#6b7280" strokeDasharray="5 5" name="애플 (예측)" />
                  <Bar dataKey="google" stackId="a" fill="#3b82f6" name="구글" />
                  <Bar dataKey="googlePredicted" stackId="a" fill="#3b82f6" fillOpacity={0.5} stroke="#3b82f6" strokeDasharray="5 5" name="구글 (예측)" />
                  <Bar dataKey="kakao" stackId="a" fill="#fbbf24" name="카카오" />
                  <Bar dataKey="kakaoPredicted" stackId="a" fill="#fbbf24" fillOpacity={0.5} stroke="#fbbf24" strokeDasharray="5 5" name="카카오 (예측)" />
                  <Bar dataKey="naver" stackId="a" fill="#10b981" name="네이버" />
                  <Bar dataKey="naverPredicted" stackId="a" fill="#10b981" fillOpacity={0.5} stroke="#10b981" strokeDasharray="5 5" name="네이버 (예측)" />
                  <Bar dataKey="line" stackId="a" fill="#22c55e" name="라인" />
                  <Bar dataKey="linePredicted" stackId="a" fill="#22c55e" fillOpacity={0.5} stroke="#22c55e" strokeDasharray="5 5" name="라인 (예측)" />
                  <Bar dataKey="facebook" stackId="a" fill="#3b5998" name="페이스북" />
                  <Bar dataKey="facebookPredicted" stackId="a" fill="#3b5998" fillOpacity={0.5} stroke="#3b5998" strokeDasharray="5 5" name="페이스북 (예측)" />
                  <Bar dataKey="wechat" stackId="a" fill="#8b5cf6" name="위챗" />
                  <Bar dataKey="wechatPredicted" stackId="a" fill="#8b5cf6" fillOpacity={0.5} stroke="#8b5cf6" strokeDasharray="5 5" name="위챗 (예측)" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 커뮤니티 활동 추이 */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            {/* 커뮤니티 메트릭 카드들 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex flex-col space-y-2">
                  <div className={`text-3xl font-bold ${getColorByRate(68.9).text}`}>68.9%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getColorByRate(68.9).bg} h-2 rounded-full transition-all duration-300`}
                      style={{ width: '68.9%' }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">게시물 목표</p>
                    <p className="text-xs text-muted-foreground">100%</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex flex-col space-y-2">
                  <div className={`text-3xl font-bold ${getColorByRate(11.3).text}`}>11.3%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getColorByRate(11.3).bg} h-2 rounded-full transition-all duration-300`}
                      style={{ width: '11.3%' }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">채팅방 목표</p>
                    <p className="text-xs text-muted-foreground">100%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-semibold text-foreground">커뮤니티 활동 추이</h3>
                <Select value={communityViewType} onValueChange={(value) => setCommunityViewType(value as "all" | "community" | "chat")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="community">커뮤니티</SelectItem>
                    <SelectItem value="chat">채팅</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                  <TabsTrigger value="monthly">월별</TabsTrigger>
                  <TabsTrigger value="weekly">주별</TabsTrigger>
                  <TabsTrigger value="daily">일별</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <TrendChart
              data={getCurrentCommunityActivityData()}
              lines={
                communityViewType === "community" ? [
                  { dataKey: "qa", name: "정품Q&A", color: "#3b82f6", yAxisId: "left" },
                  { dataKey: "review", name: "정품제품리뷰", color: "#10b981", yAxisId: "left" },
                  { dataKey: "tips", name: "정품판별팁", color: "#f59e0b", yAxisId: "left" },
                  { dataKey: "trade", name: "정품인증거래", color: "#8b5cf6", yAxisId: "left" }
                ] : communityViewType === "chat" ? [
                  { dataKey: "oneOnOne", name: "1:1채팅", color: "#3b82f6", yAxisId: "left" },
                  { dataKey: "tradingChat", name: "인증거래채팅", color: "#10b981", yAxisId: "left" }
                ] : [
                { dataKey: "communityPosts", name: "신규 게시글", color: "#10b981", yAxisId: "left" },
                { dataKey: "communityPostsPredicted", name: "게시글 (예측)", color: "#10b981", strokeDasharray: "5 5", yAxisId: "left" },
                { dataKey: "newChatRooms", name: "신규 채팅방", color: "#f59e0b", yAxisId: "left" },
                  { dataKey: "newChatRoomsPredicted", name: "채팅방 (예측)", color: "#f59e0b", strokeDasharray: "5 5", yAxisId: "left" }
                ]
              }
              targets={[]}
              height={300}
            />
          </div>
        </Card>
      </div>
    </section>
  )
}
