"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

// 커스텀 범례 컴포넌트 - "(예측)" 항목 제외
const CustomLegend = ({ payload }: any) => {
  if (!payload) return null
  
  // "(예측)" 또는 "예측"을 포함하지 않는 항목만 필터링
  const filteredPayload = payload.filter((item: any) => {
    const value = item.value || ''
    return !value.includes('(예측)') && !value.includes('예측')
  })
  
  return (
    <div className="flex items-center justify-center gap-4 pt-5">
      {filteredPayload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <div 
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

interface AbnormalScanTrendProps {
  selectedCountry: string
}

export function AbnormalScanTrend({ selectedCountry }: AbnormalScanTrendProps) {
  const [selectedApp, setSelectedApp] = useState<string>("전체")
  const [selectedScanType, setSelectedScanType] = useState<string>("전체")
  
  // 국가별 비정상 스캔 수 및 활성자 수 계산
  const getAbnormalScanMetrics = () => {
    const countryMultipliers: Record<string, { scanCount: number; activeUsers: number; scanCountChange: number; activeUsersChange: number }> = {
      "전체": { scanCount: 45680, activeUsers: 12450, scanCountChange: 12.5, activeUsersChange: 8.3 },
      "한국": { scanCount: 18920, activeUsers: 5230, scanCountChange: 15.2, activeUsersChange: 10.5 },
      "일본": { scanCount: 8650, activeUsers: 2450, scanCountChange: -3.2, activeUsersChange: -1.8 },
      "미국": { scanCount: 7280, activeUsers: 1890, scanCountChange: 8.7, activeUsersChange: 5.2 },
      "중국": { scanCount: 8920, activeUsers: 3100, scanCountChange: 18.9, activeUsersChange: 12.4 },
      "베트남": { scanCount: 1910, activeUsers: 780, scanCountChange: 22.1, activeUsersChange: 15.6 }
    }
    
    const multiplier = countryMultipliers[selectedCountry] || countryMultipliers["전체"]
    
    // App 필터링 적용
    if (selectedApp !== "전체") {
      const appMultipliers: Record<string, number> = {
        "HT": 0.45,
        "COP": 0.32,
        "Global": 0.23
      }
      const appMultiplier = appMultipliers[selectedApp] || 1.0
      return {
        scanCount: Math.round(multiplier.scanCount * appMultiplier),
        activeUsers: Math.round(multiplier.activeUsers * appMultiplier),
        scanCountChange: multiplier.scanCountChange,
        activeUsersChange: multiplier.activeUsersChange
      }
    }
    
    return multiplier
  }
  
  const metrics = getAbnormalScanMetrics()
  
  // 현재 날짜 기준 계산
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentDay = currentDate.getDate()
  
  // 일별 비정상 스캔 데이터 (과거 7일 + 현재 + 미래 5일)
  const dailyData = Array.from({ length: 13 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 6 + i)
    const isFuture = i > 6
    const isCurrent = i === 6
    
    const baseHT = 120 + Math.random() * 40
    const baseCOP = 80 + Math.random() * 30
    const baseGlobal = 50 + Math.random() * 20
    
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      HT: isFuture ? null : Math.round(baseHT),
      COP: isFuture ? null : Math.round(baseCOP),
      Global: isFuture ? null : Math.round(baseGlobal),
      HT_Predicted: Math.round(baseHT * (1 + (i - 6) * 0.05)),
      COP_Predicted: Math.round(baseCOP * (1 + (i - 6) * 0.05)),
      Global_Predicted: Math.round(baseGlobal * (1 + (i - 6) * 0.05))
    }
  })

  // 주별 비정상 스캔 데이터 (과거 7주 + 현재 + 미래 5주)
  const weeklyData = Array.from({ length: 13 }, (_, i) => {
    const isFuture = i > 7
    const weekNum = i < 8 ? i + 1 : i - 6
    
    const baseHT = 800 + Math.random() * 200
    const baseCOP = 550 + Math.random() * 150
    const baseGlobal = 350 + Math.random() * 100
    
    return {
      date: `${weekNum}주`,
      HT: isFuture ? null : Math.round(baseHT),
      COP: isFuture ? null : Math.round(baseCOP),
      Global: isFuture ? null : Math.round(baseGlobal),
      HT_Predicted: Math.round(baseHT * (1 + (i - 7) * 0.03)),
      COP_Predicted: Math.round(baseCOP * (1 + (i - 7) * 0.03)),
      Global_Predicted: Math.round(baseGlobal * (1 + (i - 7) * 0.03))
    }
  })

  // 월별 비정상 스캔 데이터 (과거 6개월 + 현재 + 미래 5개월)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    // 현재월을 6번째 인덱스(0-based이므로 5)로 설정하고, 그 이전 6개월과 이후 5개월을 생성
    const monthOffset = i - 5  // 현재월 기준 오프셋
    let monthNum = currentMonth + monthOffset
    
    // 월 순환 처리 (1~12월)
    if (monthNum <= 0) monthNum += 12
    if (monthNum > 12) monthNum -= 12
    
    const isFuture = monthOffset > 0  // 현재월 이후
    const isPast = monthOffset < 0    // 현재월 이전
    
    const baseHT = 3500 + Math.random() * 1000
    const baseCOP = 2400 + Math.random() * 700
    const baseGlobal = 1500 + Math.random() * 500
    
    // 예측값 계산 (현재월 기준으로 증가/감소)
    const predictedHT = Math.round(baseHT * (1 + monthOffset * 0.05))
    const predictedCOP = Math.round(baseCOP * (1 + monthOffset * 0.05))
    const predictedGlobal = Math.round(baseGlobal * (1 + monthOffset * 0.05))
    
    return {
      date: `${monthNum}월`,
      HT: isFuture ? null : Math.round(baseHT),
      COP: isFuture ? null : Math.round(baseCOP),
      Global: isFuture ? null : Math.round(baseGlobal),
      HT_Predicted: predictedHT,
      COP_Predicted: predictedCOP,
      Global_Predicted: predictedGlobal
    }
  })

  return (
    <div className="p-6 h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {selectedCountry === "전체" 
            ? "전체 비정상 스캔 추이" 
            : `${selectedCountry} 비정상 스캔 추이`}
        </h3>
        <div className="flex items-center gap-2">
          <Select value={selectedApp} onValueChange={setSelectedApp}>
            <SelectTrigger className="w-[120px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
              <SelectItem value="전체" className="cursor-pointer hover:bg-blue-50">전체</SelectItem>
              <SelectItem value="HT" className="cursor-pointer hover:bg-blue-50">HT</SelectItem>
              <SelectItem value="COP" className="cursor-pointer hover:bg-blue-50">COP</SelectItem>
              <SelectItem value="Global" className="cursor-pointer hover:bg-blue-50">Global</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedScanType} onValueChange={setSelectedScanType}>
            <SelectTrigger className="w-[120px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
              <SelectItem value="전체" className="cursor-pointer hover:bg-blue-50">전체</SelectItem>
              <SelectItem value="중간이탈" className="cursor-pointer hover:bg-blue-50">중간이탈</SelectItem>
              <SelectItem value="시간경과" className="cursor-pointer hover:bg-blue-50">시간경과</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="daily" className="flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">비정상 스캔수</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{metrics.scanCount.toLocaleString()}</p>
              <div className={`flex items-center gap-1 text-sm ${metrics.scanCountChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.scanCountChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{metrics.scanCountChange >= 0 ? '+' : ''}{metrics.scanCountChange.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">비정상 스캔 활성자수</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</p>
              <div className={`flex items-center gap-1 text-sm ${metrics.activeUsersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.activeUsersChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{metrics.activeUsersChange >= 0 ? '+' : ''}{metrics.activeUsersChange.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mb-4">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="monthly">월별</TabsTrigger>
            <TabsTrigger value="weekly">주별</TabsTrigger>
            <TabsTrigger value="daily">일별</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="daily" className="flex-1 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend content={<CustomLegend />} />
              {selectedApp === "전체" && (
                <>
                  <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                  <Bar dataKey="HT_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="HT (예측)" />
                  <Bar dataKey="COP_Predicted" stackId="predicted" fill="#10b981" fillOpacity={0.3} name="COP (예측)" />
                  <Bar dataKey="Global_Predicted" stackId="predicted" fill="#8b5cf6" fillOpacity={0.3} name="Global (예측)" />
                </>
              )}
              {selectedApp === "HT" && (
                <>
                  <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  <Bar dataKey="HT_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="HT (예측)" />
                </>
              )}
              {selectedApp === "COP" && (
                <>
                  <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  <Bar dataKey="COP_Predicted" stackId="predicted" fill="#10b981" fillOpacity={0.3} name="COP (예측)" />
                </>
              )}
              {selectedApp === "Global" && (
                <>
                  <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                  <Bar dataKey="Global_Predicted" stackId="predicted" fill="#8b5cf6" fillOpacity={0.3} name="Global (예측)" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="weekly" className="flex-1 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend content={<CustomLegend />} />
              {selectedApp === "전체" && (
                <>
                  <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                  <Bar dataKey="HT_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="HT (예측)" />
                  <Bar dataKey="COP_Predicted" stackId="predicted" fill="#10b981" fillOpacity={0.3} name="COP (예측)" />
                  <Bar dataKey="Global_Predicted" stackId="predicted" fill="#8b5cf6" fillOpacity={0.3} name="Global (예측)" />
                </>
              )}
              {selectedApp === "HT" && (
                <>
                  <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  <Bar dataKey="HT_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="HT (예측)" />
                </>
              )}
              {selectedApp === "COP" && (
                <>
                  <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  <Bar dataKey="COP_Predicted" stackId="predicted" fill="#10b981" fillOpacity={0.3} name="COP (예측)" />
                </>
              )}
              {selectedApp === "Global" && (
                <>
                  <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                  <Bar dataKey="Global_Predicted" stackId="predicted" fill="#8b5cf6" fillOpacity={0.3} name="Global (예측)" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="monthly" className="flex-1 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend content={<CustomLegend />} />
              {selectedApp === "전체" && (
                <>
                  <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                  <Bar dataKey="HT_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="HT (예측)" />
                  <Bar dataKey="COP_Predicted" stackId="predicted" fill="#10b981" fillOpacity={0.3} name="COP (예측)" />
                  <Bar dataKey="Global_Predicted" stackId="predicted" fill="#8b5cf6" fillOpacity={0.3} name="Global (예측)" />
                </>
              )}
              {selectedApp === "HT" && (
                <>
                  <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  <Bar dataKey="HT_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="HT (예측)" />
                </>
              )}
              {selectedApp === "COP" && (
                <>
                  <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  <Bar dataKey="COP_Predicted" stackId="predicted" fill="#10b981" fillOpacity={0.3} name="COP (예측)" />
                </>
              )}
              {selectedApp === "Global" && (
                <>
                  <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                  <Bar dataKey="Global_Predicted" stackId="predicted" fill="#8b5cf6" fillOpacity={0.3} name="Global (예측)" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}