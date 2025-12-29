"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from "recharts"
import { CustomLegend } from "@/components/platform/common/custom-legend"
import { fetchReportTrend, formatDateForAPI, getTodayDateString, ReportTrendData } from "@/lib/api"
import { useDateRange } from "@/hooks/use-date-range"

// 커스텀 툴팁 컴포넌트 (TrendChart와 동일한 스타일)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // fullDate가 있으면 사용, 없으면 label 사용
    const displayLabel = payload[0]?.payload?.fullDate || label
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground mb-2">{displayLabel}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ 
                backgroundColor: entry.color,
                opacity: entry.dataKey.includes('Predicted') || entry.dataKey.includes('_Predicted') ? 0.7 : 1
              }}
            />
            <span className="text-sm text-muted-foreground">{entry.name}:</span>
            <span className="text-sm font-medium text-foreground">
              {entry.value !== null && entry.value !== undefined ? entry.value.toLocaleString() : 0 }
              {entry.dataKey.includes('Rate') ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

interface ReportTrendProps {
  selectedCountry: string
}

export function ReportTrend({ selectedCountry }: ReportTrendProps) {
  const [selectedApp, setSelectedApp] = useState<string>("전체")
  const [activeTab, setActiveTab] = useState<string>("monthly")
  const [reportTrendData, setReportTrendData] = useState<ReportTrendData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentCountry, setCurrentCountry] = useState<string>("전체")
  const prevSelectedCountryRef = useRef<string | null>(null)
  
  // 전역 날짜 범위 사용
  const { dateRange } = useDateRange()
  
  // 클라이언트에서만 오늘 날짜 가져오기 (Hydration 오류 방지)
  const [todayDate, setTodayDate] = useState<string>('2025-01-01')
  useEffect(() => {
    setTodayDate(getTodayDateString())
  }, [])
  
  // 날짜 범위를 문자열로 변환
  const startDate = dateRange?.from ? formatDateForAPI(dateRange.from) : '2025-01-01'
  const endDate = dateRange?.to ? formatDateForAPI(dateRange.to) : todayDate
  
  // 국가 선택 처리 (같은 국가를 다시 클릭하면 "전체"로 변경)
  useEffect(() => {
    const prevCountry = prevSelectedCountryRef.current
    
    if (selectedCountry === prevCountry && selectedCountry !== "전체" && selectedCountry !== null) {
      // 같은 국가를 다시 클릭한 경우 "전체"로 변경
      setCurrentCountry("전체")
      prevSelectedCountryRef.current = null
    } else {
      // 새로운 국가 선택 또는 "전체" 선택
      setCurrentCountry(selectedCountry || "전체")
      prevSelectedCountryRef.current = selectedCountry
    }
  }, [selectedCountry])
  
  // API에서 제보하기 추이 데이터 가져오기
  useEffect(() => {
    const loadReportTrend = async () => {
      const type = activeTab === 'daily' ? 'daily' : activeTab === 'weekly' ? 'weekly' : 'monthly'
      
      setLoading(true)
      try {
        let data: ReportTrendData[]
        
        // filter_country 파라미터 사용 (전체는 null, 특정 국가는 국가명)
        const filterCountry = currentCountry === "전체" ? null : currentCountry
        console.log(`📡 [제보-추이] 요청: type=${type}, 국가=${filterCountry || '전체'}`)
        data = await fetchReportTrend(
          type,
          startDate,
          endDate,
          filterCountry
        )
        console.log(`✅ [제보-추이] 응답: ${data.length}개 데이터`)
        setReportTrendData(data)
      } catch (error) {
        console.error('❌ Failed to load report trend data:', error)
        setReportTrendData([])
      } finally {
        setLoading(false)
      }
    }
    loadReportTrend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, startDate, endDate, currentCountry])
  
  // 현재 탭에 맞는 데이터 선택 (API 데이터 사용)
  const currentData = useMemo(() => {
    return reportTrendData.map(item => {
      // period를 사용하여 원본 날짜 추적 (없으면 date 사용)
      const originalDate = item.period || item.date
      
      // 날짜 형식 통일 (실제값과 예측값 모두 동일한 날짜 사용)
      let displayDate = originalDate
      let fullDate = originalDate
      
      if (activeTab === 'monthly') {
        // 월별: YYYY-MM 형식
        displayDate = originalDate.length >= 7 ? originalDate.substring(0, 7) : originalDate
        fullDate = originalDate
      } else if (activeTab === 'weekly') {
        // 주별: YYYY-MM-주 형식 (이미 API에서 제공)
        displayDate = originalDate
        fullDate = originalDate
      } else if (activeTab === 'daily') {
        // 일별: YYYY-MM-DD 형식
        displayDate = originalDate.length >= 10 ? originalDate.substring(0, 10) : originalDate
        fullDate = originalDate
      }
      
      return {
        ...item, // HT, COP, Global, Wechat, HT_Predicted, COP_Predicted 등 모든 필드 포함
        date: displayDate, // x축 표시용
        period: originalDate, // 원본 날짜 보존
        fullDate: fullDate // 툴팁용 전체 날짜
      }
    })
  }, [reportTrendData, activeTab])

  return (
    <div className="p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {currentCountry === "전체" 
            ? "전체 제보 추이" 
            : `${currentCountry} 제보 추이`}
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
              <SelectItem value="Wechat" className="cursor-pointer hover:bg-blue-50">Wechat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex justify-end mb-4">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="monthly">월별</TabsTrigger>
            <TabsTrigger value="weekly">주별</TabsTrigger>
            <TabsTrigger value="daily">일별</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="daily" className="flex-1 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                minTickGap={50}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              {selectedApp === "전체" && (
                <>
                  <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                  <Bar dataKey="Wechat" stackId="actual" fill="#f59e0b" name="Wechat" />
                  <Bar dataKey="HT_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="HT (예측)" />
                  <Bar dataKey="COP_Predicted" stackId="predicted" fill="#10b981" fillOpacity={0.3} name="COP (예측)" />
                  <Bar dataKey="Global_Predicted" stackId="predicted" fill="#8b5cf6" fillOpacity={0.3} name="Global (예측)" />
                  <Bar dataKey="Wechat_Predicted" stackId="predicted" fill="#f59e0b" fillOpacity={0.3} name="Wechat (예측)" />
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
              {selectedApp === "Wechat" && (
                <>
                  <Bar dataKey="Wechat" stackId="actual" fill="#f59e0b" name="Wechat" />
                  <Bar dataKey="Wechat_Predicted" stackId="predicted" fill="#f59e0b" fillOpacity={0.3} name="Wechat (예측)" />
                </>
              )}
              <Line 
                type="monotone" 
                dataKey="predictedTotal" 
                stroke="#ef4444" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                name="예측" 
                connectNulls 
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="weekly" className="flex-1 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                minTickGap={40}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              {selectedApp === "전체" && (
                <>
                  <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                  <Bar dataKey="Wechat" stackId="actual" fill="#f59e0b" name="Wechat" />
                  <Bar dataKey="HT_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="HT (예측)" />
                  <Bar dataKey="COP_Predicted" stackId="predicted" fill="#10b981" fillOpacity={0.3} name="COP (예측)" />
                  <Bar dataKey="Global_Predicted" stackId="predicted" fill="#8b5cf6" fillOpacity={0.3} name="Global (예측)" />
                  <Bar dataKey="Wechat_Predicted" stackId="predicted" fill="#f59e0b" fillOpacity={0.3} name="Wechat (예측)" />
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
              {selectedApp === "Wechat" && (
                <>
                  <Bar dataKey="Wechat" stackId="actual" fill="#f59e0b" name="Wechat" />
                  <Bar dataKey="Wechat_Predicted" stackId="predicted" fill="#f59e0b" fillOpacity={0.3} name="Wechat (예측)" />
                </>
              )}
              <Line 
                type="monotone" 
                dataKey="predictedTotal" 
                stroke="#ef4444" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                name="예측" 
                connectNulls 
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="monthly" className="flex-1 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                minTickGap={30}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              {selectedApp === "전체" && (
                <>
                  <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                  <Bar dataKey="Wechat" stackId="actual" fill="#f59e0b" name="Wechat" />
                  <Bar dataKey="HT_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="HT (예측)" />
                  <Bar dataKey="COP_Predicted" stackId="predicted" fill="#10b981" fillOpacity={0.3} name="COP (예측)" />
                  <Bar dataKey="Global_Predicted" stackId="predicted" fill="#8b5cf6" fillOpacity={0.3} name="Global (예측)" />
                  <Bar dataKey="Wechat_Predicted" stackId="predicted" fill="#f59e0b" fillOpacity={0.3} name="Wechat (예측)" />
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
              {selectedApp === "Wechat" && (
                <>
                  <Bar dataKey="Wechat" stackId="actual" fill="#f59e0b" name="Wechat" />
                  <Bar dataKey="Wechat_Predicted" stackId="predicted" fill="#f59e0b" fillOpacity={0.3} name="Wechat (예측)" />
                </>
              )}
              <Line 
                type="monotone" 
                dataKey="predictedTotal" 
                stroke="#ef4444" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                name="예측" 
                connectNulls 
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}

