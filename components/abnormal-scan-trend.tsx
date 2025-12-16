"use client"

import { useState, useMemo, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ComposedChart, Line } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { CustomLegend } from "@/components/platform/common/custom-legend"
import { getCountryMultiplier, getAppMultiplier } from "@/lib/platform-utils"
import { fetchInvalidScanTrend, formatDateForAPI, getTodayDateString, InvalidScanTrendData, InvalidScanForecast } from "@/lib/api"
import { useDateRange } from "@/hooks/use-date-range"

// 커스텀 툴팁 컴포넌트 (제보하기 추이와 동일한 스타일)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground mb-2">{label}</p>
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

interface AbnormalScanTrendProps {
  selectedCountry: string
  filterCountry?: string | null
}

export function AbnormalScanTrend({ selectedCountry, filterCountry }: AbnormalScanTrendProps) {
  const [selectedApp, setSelectedApp] = useState<string>("전체")
  const [selectedScanType, setSelectedScanType] = useState<string>("전체")
  const [activeTab, setActiveTab] = useState<string>("monthly")
  const [trendData, setTrendData] = useState<InvalidScanTrendData[]>([])
  const [forecastData, setForecastData] = useState<InvalidScanForecast[]>([])
  const [loading, setLoading] = useState(false)
  
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
  
  // API에서 비정상 스캔 추이 데이터 가져오기
  useEffect(() => {
    const loadTrendData = async () => {
      setLoading(true)
      try {
        const type = activeTab === 'daily' ? 'daily' : activeTab === 'weekly' ? 'weekly' : 'monthly'
        console.log(`📡 [비정상스캔-추이] 요청: type=${type}, filterCountry=${filterCountry || 'null'}`)
        const data = await fetchInvalidScanTrend(type, startDate, endDate, filterCountry)
        console.log(`✅ [비정상스캔-추이] 응답: ${data.length}개 데이터`)
        setTrendData(data)
        
        // forecast 데이터 가져오기
        try {
          const timestamp = Date.now()
          let url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://52.77.138.41:8025'}/api/report/invalid-scan/trend?type=${type}&start_date=${startDate}&end_date=${endDate}&_t=${timestamp}`
          if (filterCountry) {
            const encodedCountry = encodeURIComponent(filterCountry)
            url += `&filter_country=${encodedCountry}`
          }
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Cache-Control': 'no-cache',
            },
          })
          if (response.ok) {
            const apiResponse = await response.json()
            if (apiResponse.forecast) {
              setForecastData(apiResponse.forecast)
            } else {
              setForecastData([])
            }
          } else {
            setForecastData([])
          }
        } catch (forecastError) {
          console.error('Failed to load forecast data:', forecastError)
          setForecastData([])
        }
      } catch (error) {
        console.error('❌ Failed to load invalid scan trend data:', error)
        setTrendData([])
        setForecastData([])
      } finally {
        setLoading(false)
      }
    }
    loadTrendData()
  }, [activeTab, startDate, endDate, filterCountry])
  
  // 현재 탭에 맞는 비정상 스캔 데이터 생성
  const currentData = useMemo(() => {
    // forecast 데이터를 Map으로 변환 (period 형식으로 정규화)
    const forecastMap = new Map<string, number>()
    forecastData.forEach((item) => {
      if (item.date && item.predictedCnt != null) {
        // forecast의 date는 이미 "2025-12" 형식이므로 그대로 사용
        let normalizedPeriod = item.date
        if (activeTab === 'monthly') {
          // 월별일 때는 YYYY-MM 형식 유지
          normalizedPeriod = item.date.length >= 7 ? item.date.substring(0, 7) : item.date
        } else if (activeTab === 'daily') {
          // 일별일 때는 YYYY-MM-DD 형식으로 변환 (forecast는 월별만 제공될 수 있음)
          normalizedPeriod = item.date
        } else {
          // 주별일 때는 그대로 사용
          normalizedPeriod = item.date
        }
        forecastMap.set(normalizedPeriod, item.predictedCnt)
      }
    })
    
    if (trendData.length === 0) {
      // forecast에만 있는 경우
      if (forecastMap.size > 0) {
        const result = Array.from(forecastMap.entries()).map(([period, predictedCnt]) => {
          // period를 date 형식으로 변환 (표시용)
          let displayDate = period
          if (activeTab === 'monthly' && period.length >= 7) {
            const month = parseInt(period.substring(5, 7))
            displayDate = `${month}월`
          }
          return {
            date: displayDate,
            period: period, // 정렬용
            HT: 0,
            COP: 0,
            Global: 0,
            predicted: predictedCnt
          }
        })
        // period 기준으로 정렬 (YYYY-MM 형식)
        result.sort((a, b) => (a.period || '').localeCompare(b.period || ''))
        return result
      }
      return []
    }
    
    const result = trendData.map(item => {
      // period를 사용하여 forecast 매칭 (period가 없으면 date에서 추출 시도)
      const period = item.period || item.date
      
      // forecast에서 예측값 가져오기
      const predicted = forecastMap.get(period) || null
      
      return {
        date: item.date,
        period: period, // 정렬용
        HT: item.HT || 0,
        COP: item.COP || 0,
        Global: item.Global || 0,
        predicted: predicted
      }
    })
    
    // forecast에만 있고 기존 데이터에 없는 기간 추가
    forecastMap.forEach((predictedCnt, period) => {
      const exists = result.some(item => {
        const itemPeriod = item.period || item.date
        return itemPeriod === period
      })
      if (!exists) {
        // period를 date 형식으로 변환 (표시용)
        let displayDate = period
        if (activeTab === 'monthly' && period.length >= 7) {
          const month = parseInt(period.substring(5, 7))
          displayDate = `${month}월`
        }
        result.push({
          date: displayDate,
          period: period, // 정렬용
          HT: 0,
          COP: 0,
          Global: 0,
          predicted: predictedCnt
        })
      }
    })
    
    // period 기준으로 정렬 (YYYY-MM 형식으로 정렬하면 순차적으로 정렬됨)
    result.sort((a, b) => {
      const periodA = a.period || a.date
      const periodB = b.period || b.date
      return periodA.localeCompare(periodB)
    })
    
    return result
  }, [trendData, forecastData, activeTab])

  return (
    <div className="p-6 h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {filterCountry 
            ? `${filterCountry} 비정상 스캔 추이` 
            : "전체 비정상 스캔 추이"}
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
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              {loading ? (
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  로딩 중...
                </text>
              ) : currentData.length === 0 ? (
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  데이터 없음
                </text>
              ) : (
                <>
                  {selectedApp === "전체" && (
                    <>
                      <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                      <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                      <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                    </>
                  )}
                  {selectedApp === "HT" && (
                    <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  )}
                  {selectedApp === "COP" && (
                    <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  )}
                  {selectedApp === "Global" && (
                    <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    name="예측" 
                    connectNulls 
                    dot={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="weekly" className="flex-1 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              {selectedApp === "전체" && (
                <>
                  <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                </>
              )}
              {selectedApp === "HT" && (
                <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
              )}
              {selectedApp === "COP" && (
                <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
              )}
              {selectedApp === "Global" && (
                <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
              )}
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#10b981" 
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
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              {loading ? (
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  로딩 중...
                </text>
              ) : currentData.length === 0 ? (
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  데이터 없음
                </text>
              ) : (
                <>
                  {selectedApp === "전체" && (
                    <>
                      <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                      <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                      <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                    </>
                  )}
                  {selectedApp === "HT" && (
                    <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
                  )}
                  {selectedApp === "COP" && (
                    <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
                  )}
                  {selectedApp === "Global" && (
                    <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    name="예측" 
                    connectNulls 
                    dot={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}