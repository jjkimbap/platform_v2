"use client"

import { useState, useEffect, useMemo } from "react"
import { TrendChart } from "@/components/trend-chart"
import { MiniTrendChart } from "@/components/mini-trend-chart"
import { MetricCard } from "@/components/metric-card"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTargetsConfig, TargetsConfig } from "@/lib/targets-config"
import { Users, Scan, Target } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { fetchNewUserTrend, NewMemberTrendData, NewMemberForecast, formatDateForAPI, getTodayDateString } from "@/lib/api"

// 월별 추이 데이터
const monthlyTrendData = [
  { date: "1월", execution: 12500, scan: 8500, conversionRate: 68.0, app: 850, commerce: 350, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "2월", execution: 13200, scan: 9200, conversionRate: 69.7, app: 920, commerce: 380, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "3월", execution: 12800, scan: 8800, conversionRate: 68.8, app: 880, commerce: 360, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "4월", execution: 14100, scan: 10100, conversionRate: 71.6, app: 1010, commerce: 420, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "5월", execution: 13900, scan: 9900, conversionRate: 71.2, app: 990, commerce: 410, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "6월", execution: 13200, scan: 9200, conversionRate: 69.7, app: 920, commerce: 380, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "7월", execution: 12800, scan: 8800, conversionRate: 68.8, app: 880, commerce: 360, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "8월", execution: 14100, scan: 10100, conversionRate: 71.6, app: 1010, commerce: 420, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "9월", execution: 13900, scan: 9900, conversionRate: 71.2, app: 990, commerce: 410, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "10월", execution: 13200, scan: 9200, conversionRate: 69.7, app: 920, commerce: 380, executionPredicted: 13200, scanPredicted: 9200, conversionRatePredicted: null, appPredicted: 920, commercePredicted: 380 },
  { date: "11월", execution: null, scan: null, conversionRate: null, app: null, commerce: null, executionPredicted: 14200, scanPredicted: 11200, conversionRatePredicted: 73.7, appPredicted: 1020, commercePredicted: 420 },
  { date: "12월", execution: null, scan: null, conversionRate: null, app: null, commerce: null, executionPredicted: 14800, scanPredicted: 11800, conversionRatePredicted: 74.7, appPredicted: 1080, commercePredicted: 450 },
]

// 일별 추이 데이터
const dailyTrendData = [
  { date: "1일", execution: 1250, scan: 850, conversionRate: 68.0, app: 85, commerce: 35, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "2일", execution: 1320, scan: 920, conversionRate: 69.7, app: 92, commerce: 38, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "3일", execution: 1280, scan: 880, conversionRate: 68.8, app: 88, commerce: 36, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "4일", execution: 1410, scan: 1010, conversionRate: 71.6, app: 101, commerce: 42, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "5일", execution: 1390, scan: 990, conversionRate: 71.2, app: 99, commerce: 41, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "6일", execution: 1320, scan: 920, conversionRate: 69.7, app: 92, commerce: 38, executionPredicted: 1320, scanPredicted: 920, conversionRatePredicted: null, appPredicted: 92, commercePredicted: 38 },
  { date: "7일", execution: null, scan: null, conversionRate: null, app: null, commerce: null, executionPredicted: 1420, scanPredicted: 1120, conversionRatePredicted: 73.7, appPredicted: 102, commercePredicted: 42 },
]

// 주별 추이 데이터
const weeklyTrendData = [
  { date: "1주", execution: 8750, scan: 5950, conversionRate: 68.0, app: 595, commerce: 245, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "2주", execution: 9240, scan: 6440, conversionRate: 69.7, app: 644, commerce: 266, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "3주", execution: 8960, scan: 6160, conversionRate: 68.8, app: 616, commerce: 252, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "4주", execution: 9870, scan: 7070, conversionRate: 71.6, app: 707, commerce: 294, executionPredicted: null, scanPredicted: null, conversionRatePredicted: null, appPredicted: null, commercePredicted: null },
  { date: "5주", execution: 9730, scan: 6930, conversionRate: 71.2, app: 693, commerce: 287, executionPredicted: 9730, scanPredicted: 6930, conversionRatePredicted: null, appPredicted: 693, commercePredicted: 287 },
  { date: "6주", execution: null, scan: null, conversionRate: null, app: null, commerce: null, executionPredicted: 9940, scanPredicted: 7840, conversionRatePredicted: 73.7, appPredicted: 714, commercePredicted: 294 },
  { date: "7주", execution: null, scan: null, conversionRate: null, app: null, commerce: null, executionPredicted: 10360, scanPredicted: 7840, conversionRatePredicted: 74.7, appPredicted: 756, commercePredicted: 315 },
]

// 월별 커뮤니티 추이 데이터
const monthlyCommunityTrendData = [
  { date: "1월", userInflow: 5000, communityPosts: 1250, newChatRooms: 320, app: 850, commerce: 350, userInflowPredicted: 5200, communityPostsPredicted: 1250, newChatRoomsPredicted: 320, appPredicted: 870, commercePredicted: 360 },
  { date: "2월", userInflow: 2000, communityPosts: 1380, newChatRooms: 350, app: 920, commerce: 380, userInflowPredicted: 2100, communityPostsPredicted: 1380, newChatRoomsPredicted: 350, appPredicted: 940, commercePredicted: 390 },
  { date: "3월", userInflow: 8000, communityPosts: 1320, newChatRooms: 340, app: 880, commerce: 360, userInflowPredicted: 7800, communityPostsPredicted: 1320, newChatRoomsPredicted: 340, appPredicted: 900, commercePredicted: 370 },
  { date: "4월", userInflow: 5000, communityPosts: 1450, newChatRooms: 380, app: 950, commerce: 390, userInflowPredicted: 5100, communityPostsPredicted: 1450, newChatRoomsPredicted: 380, appPredicted: 970, commercePredicted: 400 },
  { date: "5월", userInflow: 1000, communityPosts: 1390, newChatRooms: 360, app: 910, commerce: 370, userInflowPredicted: 1050, communityPostsPredicted: 1390, newChatRoomsPredicted: 360, appPredicted: 930, commercePredicted: 380 },
  { date: "6월", userInflow: 2000, communityPosts: 1380, newChatRooms: 350, app: 920, commerce: 380, userInflowPredicted: 2200, communityPostsPredicted: 1380, newChatRoomsPredicted: 350, appPredicted: 940, commercePredicted: 390 },
  { date: "7월", userInflow: 8000, communityPosts: 1320, newChatRooms: 340, app: 880, commerce: 360, userInflowPredicted: 7700, communityPostsPredicted: 1320, newChatRoomsPredicted: 340, appPredicted: 900, commercePredicted: 370 },
  { date: "8월", userInflow: 5000, communityPosts: 1450, newChatRooms: 380, app: 950, commerce: 390, userInflowPredicted: 5200, communityPostsPredicted: 1450, newChatRoomsPredicted: 380, appPredicted: 970, commercePredicted: 400 },
  { date: "9월", userInflow: 1000, communityPosts: 1390, newChatRooms: 360, app: 910, commerce: 370, userInflowPredicted: 1100, communityPostsPredicted: 1390, newChatRoomsPredicted: 360, appPredicted: 930, commercePredicted: 380 },
  { date: "10월", userInflow: null, communityPosts: null, newChatRooms: null, app: null, commerce: null, userInflowPredicted: 8000, communityPostsPredicted: 1520, newChatRoomsPredicted: 400, appPredicted: 980, commercePredicted: 400 },
  { date: "11월", userInflow: null, communityPosts: null, newChatRooms: null, app: null, commerce: null, userInflowPredicted: 9200, communityPostsPredicted: 1580, newChatRoomsPredicted: 420, appPredicted: 1020, commercePredicted: 420 },
]

// 일별 커뮤니티 추이 데이터
const dailyCommunityTrendData = [
  { date: "1일", userInflow: 8500, communityPosts: 125, newChatRooms: 32, app: 85, commerce: 35, userInflowPredicted: 8600, communityPostsPredicted: 125, newChatRoomsPredicted: 32, appPredicted: 87, commercePredicted: 36 },
  { date: "2일", userInflow: 9200, communityPosts: 138, newChatRooms: 35, app: 92, commerce: 38, userInflowPredicted: 9300, communityPostsPredicted: 138, newChatRoomsPredicted: 35, appPredicted: 94, commercePredicted: 39 },
  { date: "3일", userInflow: 8800, communityPosts: 132, newChatRooms: 34, app: 88, commerce: 36, userInflowPredicted: 8900, communityPostsPredicted: 132, newChatRoomsPredicted: 34, appPredicted: 90, commercePredicted: 37 },
  { date: "4일", userInflow: 9500, communityPosts: 145, newChatRooms: 38, app: 95, commerce: 39, userInflowPredicted: 9600, communityPostsPredicted: 145, newChatRoomsPredicted: 38, appPredicted: 97, commercePredicted: 40 },
  { date: "5일", userInflow: 9100, communityPosts: 139, newChatRooms: 36, app: 91, commerce: 37, userInflowPredicted: 9200, communityPostsPredicted: 139, newChatRoomsPredicted: 36, appPredicted: 93, commercePredicted: 38 },
  { date: "6일", userInflow: 9200, communityPosts: 138, newChatRooms: 35, app: 92, commerce: 38, userInflowPredicted: 9300, communityPostsPredicted: 138, newChatRoomsPredicted: 35, appPredicted: 94, commercePredicted: 39 },
  { date: "7일", userInflow: null, communityPosts: null, newChatRooms: null, app: null, commerce: null, userInflowPredicted: 9800, communityPostsPredicted: 152, newChatRoomsPredicted: 40, appPredicted: 98, commercePredicted: 40 },
]

// 주별 커뮤니티 추이 데이터
const weeklyCommunityTrendData = [
  { date: "1주", userInflow: 85000, communityPosts: 1250, newChatRooms: 320, app: 595, commerce: 245, userInflowPredicted: 86000, communityPostsPredicted: 1250, newChatRoomsPredicted: 320, appPredicted: 610, commercePredicted: 250 },
  { date: "2주", userInflow: 92000, communityPosts: 1380, newChatRooms: 350, app: 644, commerce: 266, userInflowPredicted: 93000, communityPostsPredicted: 1380, newChatRoomsPredicted: 350, appPredicted: 660, commercePredicted: 270 },
  { date: "3주", userInflow: 88000, communityPosts: 1320, newChatRooms: 340, app: 616, commerce: 252, userInflowPredicted: 89000, communityPostsPredicted: 1320, newChatRoomsPredicted: 340, appPredicted: 630, commercePredicted: 260 },
  { date: "4주", userInflow: 95000, communityPosts: 1450, newChatRooms: 380, app: 665, commerce: 273, userInflowPredicted: 96000, communityPostsPredicted: 1450, newChatRoomsPredicted: 380, appPredicted: 680, commercePredicted: 280 },
  { date: "5주", userInflow: 91000, communityPosts: 1390, newChatRooms: 360, app: 637, commerce: 259, userInflowPredicted: 92000, communityPostsPredicted: 1390, newChatRoomsPredicted: 360, appPredicted: 650, commercePredicted: 265 },
  { date: "6주", userInflow: null, communityPosts: null, newChatRooms: null, app: null, commerce: null, userInflowPredicted: 98000, communityPostsPredicted: 1520, newChatRoomsPredicted: 400, appPredicted: 686, commercePredicted: 280 },
  { date: "7주", userInflow: null, communityPosts: null, newChatRooms: null, app: null, commerce: null, userInflowPredicted: 102000, communityPostsPredicted: 1580, newChatRoomsPredicted: 420, appPredicted: 714, commercePredicted: 294 },
]

// 전환율 예측 데이터를 metrics-data.ts 형태로 변환
const conversionRatePredictedData = [
  { value: 73.7 },
  { value: 74.7 },
]

export function TrendChartsSection() {
  const [activeTab, setActiveTab] = useState("monthly")
  const [targetsConfig, setTargetsConfig] = useState<TargetsConfig | null>(null)
  const [newMemberTrendData, setNewMemberTrendData] = useState<NewMemberTrendData[]>([])
  const [newMemberForecast, setNewMemberForecast] = useState<NewMemberForecast[]>([])

  useEffect(() => {
    const loadTargets = async () => {
      console.log('Loading targets config...') // 디버깅용 로그
      const config = await getTargetsConfig()
      console.log('Targets config loaded in component:', config) // 디버깅용 로그
      setTargetsConfig(config)
    }
    loadTargets()
  }, []) // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

  // API에서 신규 회원 추이 데이터 가져오기
  useEffect(() => {
    const loadNewMemberTrend = async () => {
      const type = activeTab === 'daily' ? 'daily' : activeTab === 'weekly' ? 'weekly' : 'monthly'
      const today = getTodayDateString()
      const startDate = formatDateForAPI(new Date(new Date(today).setMonth(new Date(today).getMonth() - 12)))
      const endDate = formatDateForAPI(new Date(today))

      try {
        const data = await fetchNewUserTrend(type, startDate, endDate)
        setNewMemberTrendData(data)

        // forecast 데이터 가져오기
        try {
          const timestamp = Date.now()
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analytics/new-user/trend?type=${type}&start_date=${startDate}&end_date=${endDate}&_t=${timestamp}`,
            {
              method: 'GET',
              headers: {
                'accept': 'application/json',
                'Cache-Control': 'no-cache',
              },
            }
          )
          if (response.ok) {
            const apiResponse = await response.json()
            if (apiResponse.forecast) {
              setNewMemberForecast(apiResponse.forecast)
            } else {
              setNewMemberForecast([])
            }
          } else {
            setNewMemberForecast([])
          }
        } catch (forecastError) {
          console.error('Failed to load forecast data:', forecastError)
          setNewMemberForecast([])
        }
      } catch (error) {
        console.error('Failed to load new member trend data:', error)
        setNewMemberTrendData([])
        setNewMemberForecast([])
      }
    }
    loadNewMemberTrend()
  }, [activeTab])

  const getCurrentData = () => {
    switch (activeTab) {
      case "daily":
        return dailyTrendData
      case "weekly":
        return weeklyTrendData
      default:
        return monthlyTrendData
    }
  }

  const getCurrentCommunityData = useMemo(() => {
    // forecast 데이터를 Map으로 변환
    const forecastMap = new Map<string, number>()
    newMemberForecast.forEach((item) => {
      if (item.date && item.predicted != null) {
        let normalizedDate = item.date
        if (activeTab === 'monthly' && item.date.length > 7) {
          normalizedDate = item.date.substring(0, 7)
        } else if (activeTab === 'daily' && item.date.length > 10) {
          normalizedDate = item.date.substring(0, 10)
        }
        forecastMap.set(normalizedDate, item.predicted)
      }
    })

    // API 데이터가 있으면 사용
    if (newMemberTrendData.length > 0) {
      const result = newMemberTrendData.map(item => {
        const app = (item.ht || 0) + (item.cop || 0) + (item.global || 0) + (item.etc || 0)
        const commerce = item.commerce || 0
        const total = app + commerce // 월별 합계 (앱 + 커머스)

        // 날짜 정규화
        let normalizedDate = item.period || item.date
        if (typeof normalizedDate === 'string') {
          if (activeTab === 'monthly' && normalizedDate.length > 7) {
            normalizedDate = normalizedDate.substring(0, 7)
          } else if (activeTab === 'daily' && normalizedDate.length > 10) {
            normalizedDate = normalizedDate.substring(0, 10)
          }
        }

        // forecast에서 예측값 가져오기
        const cumulativePredicted = forecastMap.get(normalizedDate) || null

        return {
          date: item.date,
          app: app,
          commerce: commerce,
          userInflow: total, // 누적값 (앱 + 커머스 합계)
          userInflowPredicted: cumulativePredicted, // 예측 누적값
          appPredicted: null as number | null,
          commercePredicted: null as number | null,
          communityPosts: null as number | null,
          newChatRooms: null as number | null,
          communityPostsPredicted: null as number | null,
          newChatRoomsPredicted: null as number | null
        } as { [key: string]: string | number | null; date: string }
      })

      // forecast에만 있고 기존 데이터에 없는 기간 추가
      forecastMap.forEach((predicted, date) => {
        const exists = result.some(item => {
          const itemDate = item.date
          const normalizedItemDate = activeTab === 'monthly' && itemDate.length > 7
            ? itemDate.substring(0, 7)
            : (activeTab === 'daily' && itemDate.length > 10
              ? itemDate.substring(0, 10)
              : itemDate)
          return normalizedItemDate === date
        })
        if (!exists) {
          result.push({
            date: date,
            app: 0,
            commerce: 0,
            userInflow: null as number | null,
            userInflowPredicted: predicted,
            appPredicted: null as number | null,
            commercePredicted: null as number | null,
            communityPosts: null as number | null,
            newChatRooms: null as number | null,
            communityPostsPredicted: null as number | null,
            newChatRoomsPredicted: null as number | null
          } as { [key: string]: string | number | null; date: string })
        }
      })

      return result.sort((a, b) => a.date.localeCompare(b.date))
    }

    // 기본 데이터 (fallback)
    switch (activeTab) {
      case "daily":
        return dailyCommunityTrendData
      case "weekly":
        return weeklyCommunityTrendData
      default:
        return monthlyCommunityTrendData
    }
  }, [activeTab, newMemberTrendData, newMemberForecast])

  return (
    <section className="space-y-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 2fr 2fr' }}>
        {/* 실행,스캔 추이 그래프 */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            {/* 지표 카드들 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">실행 활성 사용자 수</p>
                    <p className="text-lg font-bold">2,827</p>
                    <p className="text-xs text-muted-foreground">전월 대비<span className="text-xs text-green-600 font-medium">+15.2%</span></p>

                  </div>
                  <div className="relative w-12 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "달성", value: 18.8, fill: "#3b82f6" },
                            { name: "미달성", value: 81.2, fill: "#e5e7eb" }
                          ]}
                          cx="50%"
                          cy="50%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={15}
                          outerRadius={25}
                          dataKey="value"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <p className="text-[8px] text-muted-foreground text-center">달성률</p>
                      <p className="text-xs font-bold text-blue-600">18.8%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">스캔 활성 사용자 수</p>
                    <p className="text-lg font-bold">1,172</p>
                    <p className="text-xs text-muted-foreground">전월 대비<span className="text-xs text-red-600 font-medium">-8.7%</span></p>

                  </div>
                  <div className="relative w-12 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "달성", value: 9.8, fill: "#10b981" },
                            { name: "미달성", value: 90.2, fill: "#e5e7eb" }
                          ]}
                          cx="50%"
                          cy="50%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={15}
                          outerRadius={25}
                          dataKey="value"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <p className="text-[8px] text-muted-foreground text-center">달성률</p>
                      <p className="text-xs font-bold text-green-600">9.8%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">실행→스캔 비율</p>
                    <p className="text-lg font-bold">41.4%</p>
                    <p className="text-xs text-muted-foreground">전월 대비<span className="text-xs text-green-600 font-medium">+3.1%</span></p>

                  </div>
                  <div className="relative w-12 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "달성", value: 55.2, fill: "#f59e0b" },
                            { name: "미달성", value: 44.8, fill: "#e5e7eb" }
                          ]}
                          cx="50%"
                          cy="50%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={15}
                          outerRadius={25}
                          dataKey="value"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <p className="text-[8px] text-muted-foreground text-center">달성률</p>
                      <p className="text-xs font-bold text-orange-600">55.2%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">실행•스캔 활성자 수 추이</h3>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                  <TabsTrigger value="monthly">월별</TabsTrigger>
                  <TabsTrigger value="weekly">주별</TabsTrigger>
                  <TabsTrigger value="daily">일별</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <TrendChart
              data={getCurrentData()}
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
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">신규 회원 수</p>
                  <p className="text-lg font-bold">1,200</p>
                  <p className="text-xs text-muted-foreground">전월 대비<span className="text-xs text-green-600 font-medium">+8.5%</span></p>

                </div>
                <div className="relative w-12 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "달성", value: 1.2, fill: "#3b82f6" },
                          { name: "미달성", value: 98.8, fill: "#e5e7eb" }
                        ]}
                        cx="50%"
                        cy="50%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={15}
                        outerRadius={25}
                        dataKey="value"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    <p className="text-[8px] text-muted-foreground text-center">달성률</p>
                    <p className="text-xs font-bold text-blue-600">1.2%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">신규 회원 추이</h3>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                  <TabsTrigger value="monthly">월별</TabsTrigger>
                  <TabsTrigger value="weekly">주별</TabsTrigger>
                  <TabsTrigger value="daily">일별</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <TrendChart
              data={getCurrentCommunityData}
              lines={[
                { dataKey: "app", name: "앱", color: "#8b5cf6", yAxisId: "left" },
                { dataKey: "appPredicted", name: "앱 (예측)", color: "#8b5cf6", strokeDasharray: "5 5", yAxisId: "left" },
                { dataKey: "commerce", name: "커머스", color: "#f59e0b", yAxisId: "left" },
                { dataKey: "commercePredicted", name: "커머스 (예측)", color: "#f59e0b", strokeDasharray: "5 5", yAxisId: "left" },
                { dataKey: "userInflow", name: "누적", color: "#10b981", yAxisId: "left" },
                { dataKey: "userInflowPredicted", name: "누적(예측)", color: "#10b981", strokeDasharray: "5 5", yAxisId: "left" },
              ]}
              targets={[]}
              height={300}
            />
          </div>
        </Card>

        {/* 커뮤니티 활동 추이 */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            {/* 커뮤니티 메트릭 카드들 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">커뮤니티 신규 게시물</p>
                    <p className="text-lg font-bold">89</p>
                    <p className="text-xs text-muted-foreground">전월 대비<span className="text-xs text-green-600 font-medium">+12.3%</span></p>
                  </div>
                  <div className="relative w-12 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "달성", value: 5.9, fill: "#10b981" },
                            { name: "미달성", value: 94.1, fill: "#e5e7eb" }
                          ]}
                          cx="50%"
                          cy="50%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={15}
                          outerRadius={25}
                          dataKey="value"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <p className="text-[8px] text-muted-foreground text-center">달성률</p>
                      <p className="text-xs font-bold text-green-600">5.9%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">신규 채팅방</p>
                    <p className="text-lg font-bold">45</p>
                    <p className="text-xs text-muted-foreground">전월 대비<span className="text-xs text-red-600 font-medium">-5.2%</span></p>
                  </div>
                  <div className="relative w-12 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "달성", value: 11.3, fill: "#f59e0b" },
                            { name: "미달성", value: 88.7, fill: "#e5e7eb" }
                          ]}
                          cx="50%"
                          cy="50%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={15}
                          outerRadius={25}
                          dataKey="value"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <p className="text-[8px] text-muted-foreground text-center">달성률</p>
                      <p className="text-xs font-bold text-orange-600">11.3%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">커뮤니티 활동 추이</h3>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                  <TabsTrigger value="monthly">월별</TabsTrigger>
                  <TabsTrigger value="weekly">주별</TabsTrigger>
                  <TabsTrigger value="daily">일별</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <TrendChart
              data={getCurrentCommunityData}
              lines={[
                { dataKey: "communityPosts", name: "신규 게시글", color: "#10b981", yAxisId: "left" },
                { dataKey: "communityPostsPredicted", name: "게시글 (예측)", color: "#10b981", strokeDasharray: "5 5", yAxisId: "left" },
                { dataKey: "newChatRooms", name: "신규 채팅방", color: "#f59e0b", yAxisId: "left" },
                { dataKey: "newChatRoomsPredicted", name: "채팅방 (예측)", color: "#f59e0b", strokeDasharray: "5 5", yAxisId: "left" }
              ]}
              targets={[]}
              height={300}
            />
          </div>
        </Card>
      </div>
    </section>
  )
}
