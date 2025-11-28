"use client"

import { useState, useMemo, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { CustomLegend } from "@/components/platform/common/custom-legend"
import { getCountryMultiplier, getAppMultiplier } from "@/lib/platform-utils"
import { fetchInvalidScanTrend, formatDateForAPI, getTodayDateString, InvalidScanTrendData } from "@/lib/api"
import { useDateRange } from "@/hooks/use-date-range"

interface AbnormalScanTrendProps {
  selectedCountry: string
  filterCountry?: string | null
}

export function AbnormalScanTrend({ selectedCountry, filterCountry }: AbnormalScanTrendProps) {
  const [selectedApp, setSelectedApp] = useState<string>("전체")
  const [selectedScanType, setSelectedScanType] = useState<string>("전체")
  const [activeTab, setActiveTab] = useState<string>("monthly")
  const [trendData, setTrendData] = useState<InvalidScanTrendData[]>([])
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
      } catch (error) {
        console.error('❌ Failed to load invalid scan trend data:', error)
        setTrendData([])
      } finally {
        setLoading(false)
      }
    }
    loadTrendData()
  }, [activeTab, startDate, endDate, filterCountry])
  
  // 현재 탭에 맞는 비정상 스캔 데이터 생성
  const currentData = useMemo(() => {
    if (trendData.length === 0) {
      return []
    }
    
    return trendData.map(item => ({
      date: item.date,
      HT: item.HT || 0,
      COP: item.COP || 0,
      Global: item.Global || 0
    }))
  }, [trendData])

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
          {/* <Select value={selectedScanType} onValueChange={setSelectedScanType}>
            <SelectTrigger className="w-[120px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
              <SelectItem value="전체" className="cursor-pointer hover:bg-blue-50">전체</SelectItem>
              <SelectItem value="중간이탈" className="cursor-pointer hover:bg-blue-50">중간이탈</SelectItem>
              <SelectItem value="시간경과" className="cursor-pointer hover:bg-blue-50">시간경과</SelectItem>
            </SelectContent>
          </Select> */}
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
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
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
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="weekly" className="flex-1 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData}>
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
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="monthly" className="flex-1 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
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
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}