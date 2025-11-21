"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from "recharts"
import { sampleReports, ReportItem } from "@/lib/report-data"
import { format, subDays, subWeeks, subMonths, startOfWeek, startOfMonth } from "date-fns"
import { CustomLegend } from "@/components/platform/common/custom-legend"

interface ReportTrendProps {
  selectedCountry: string
}

export function ReportTrend({ selectedCountry }: ReportTrendProps) {
  const [selectedApp, setSelectedApp] = useState<string>("전체")
  
  // 필터링된 제보 데이터
  const filteredReports = useMemo(() => {
    return sampleReports.filter(report => {
      const countryMatch = selectedCountry === "전체" || report.country === selectedCountry
      const appMatch = selectedApp === "전체" || report.appType === selectedApp
      return countryMatch && appMatch
    })
  }, [selectedCountry, selectedApp])

  // 제보 수 계산
  const reportCount = filteredReports.length

  // 일별 데이터 생성
  const dailyData = useMemo(() => {
    const data: Record<string, number> = {}
    const dates: string[] = []
    
    // 과거 7일 + 현재일 + 미래 5일
    for (let i = -6; i <= 6; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const dateKey = format(date, 'MM/dd')
      dates.push(dateKey)
      data[dateKey] = 0
    }
    
    // 실제 데이터 집계
    filteredReports.forEach(report => {
      if (report.date) {
        const dateKey = format(report.date, 'MM/dd')
        if (data.hasOwnProperty(dateKey)) {
          data[dateKey] = (data[dateKey] || 0) + 1
        }
      }
    })
    
    // 미래 데이터 예측값 추가
    return dates.map((dateKey, index) => {
      const isFuture = index > 6
      const baseCount = data[dateKey] || 0
      const predictedCount = Math.round(baseCount * (1 + (index - 6) * 0.1))
      
      return {
        date: dateKey,
        count: isFuture ? null : baseCount,
        count_Predicted: predictedCount
      }
    })
  }, [filteredReports])

  // 주별 데이터 생성
  const weeklyData = useMemo(() => {
    const data: Record<string, number> = {}
    const weeks: string[] = []
    
    // 과거 7주 + 현재주 + 미래 5주
    for (let i = -7; i <= 5; i++) {
      const weekStart = startOfWeek(subWeeks(new Date(), -i), { weekStartsOn: 1 })
      const weekKey = `${format(weekStart, 'MM/dd')}주`
      weeks.push(weekKey)
      data[weekKey] = 0
    }
    
    // 실제 데이터 집계
    filteredReports.forEach(report => {
      if (report.date) {
        const weekStart = startOfWeek(report.date, { weekStartsOn: 1 })
        const weekKey = `${format(weekStart, 'MM/dd')}주`
        if (data.hasOwnProperty(weekKey)) {
          data[weekKey] = (data[weekKey] || 0) + 1
        }
      }
    })
    
    // 미래 데이터 예측값 추가
    return weeks.map((weekKey, index) => {
      const isFuture = index > 7
      const baseCount = data[weekKey] || 0
      const predictedCount = Math.round(baseCount * (1 + (index - 7) * 0.08))
      
      return {
        date: weekKey,
        count: isFuture ? null : baseCount,
        count_Predicted: predictedCount
      }
    })
  }, [filteredReports])

  // 월별 데이터 생성
  const monthlyData = useMemo(() => {
    const data: Record<string, number> = {}
    const months: string[] = []
    
    // 과거 6개월 + 현재월 + 미래 5개월
    for (let i = -6; i <= 5; i++) {
      const monthStart = startOfMonth(subMonths(new Date(), -i))
      const monthKey = `${monthStart.getMonth() + 1}월`
      months.push(monthKey)
      data[monthKey] = 0
    }
    
    // 실제 데이터 집계
    filteredReports.forEach(report => {
      if (report.date) {
        const monthStart = startOfMonth(report.date)
        const monthKey = `${monthStart.getMonth() + 1}월`
        if (data.hasOwnProperty(monthKey)) {
          data[monthKey] = (data[monthKey] || 0) + 1
        }
      }
    })
    
    // 미래 데이터 예측값 추가
    return months.map((monthKey, index) => {
      const isFuture = index > 6
      const baseCount = data[monthKey] || 0
      const predictedCount = Math.round(baseCount * (1 + (index - 6) * 0.1))
      
      return {
        date: monthKey,
        count: isFuture ? null : baseCount,
        count_Predicted: predictedCount
      }
    })
  }, [filteredReports])

  return (
    <div className="p-6 h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {selectedCountry === "전체" 
            ? "전체 제보 추이" 
            : `${selectedCountry} 제보 추이`}
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
      

      <Tabs defaultValue="monthly" className="flex-1 flex flex-col">
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
              <Bar dataKey="count" stackId="actual" fill="#3b82f6" name="제보 수" />
              <Bar dataKey="count_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="제보 수 (예측)" />
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
              <Bar dataKey="count" stackId="actual" fill="#3b82f6" name="제보 수" />
              <Bar dataKey="count_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="제보 수 (예측)" />
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
              <Bar dataKey="count" stackId="actual" fill="#3b82f6" name="제보 수" />
              <Bar dataKey="count_Predicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="제보 수 (예측)" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}

