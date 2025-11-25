"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { CustomLegend } from "@/components/platform/common/custom-legend"
import { getCountryMultiplier, getAppMultiplier } from "@/lib/platform-utils"

interface AbnormalScanTrendProps {
  selectedCountry: string
}

export function AbnormalScanTrend({ selectedCountry }: AbnormalScanTrendProps) {
  const [selectedApp, setSelectedApp] = useState<string>("전체")
  const [selectedScanType, setSelectedScanType] = useState<string>("전체")
  const [activeTab, setActiveTab] = useState<string>("monthly")
  
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
      const appMultiplier = getAppMultiplier(selectedApp)
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
  
  // 현재 탭에 맞는 비정상 스캔 데이터 생성
  const currentData = useMemo(() => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    
    if (activeTab === 'daily') {
      return Array.from({ length: 13 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - 6 + i)
        const isFuture = i > 6
        
        return {
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          HT: isFuture ? null : 0,
          COP: isFuture ? null : 0,
          Global: isFuture ? null : 0,
          Wechat: isFuture ? null : 0,
          HT_Predicted: null,
          COP_Predicted: null,
          Global_Predicted: null,
          Wechat_Predicted: null
        }
      })
    } else if (activeTab === 'weekly') {
      return Array.from({ length: 13 }, (_, i) => {
        const isFuture = i > 7
        const weekNum = i < 8 ? i + 1 : i - 6
        
        return {
          date: `${weekNum}주`,
          HT: isFuture ? null : 0,
          COP: isFuture ? null : 0,
          Global: isFuture ? null : 0,
          Wechat: isFuture ? null : 0,
          HT_Predicted: null,
          COP_Predicted: null,
          Global_Predicted: null,
          Wechat_Predicted: null
        }
      })
    } else {
      return Array.from({ length: 12 }, (_, i) => {
        const monthOffset = i - 5
        let monthNum = currentMonth + monthOffset
        if (monthNum <= 0) monthNum += 12
        if (monthNum > 12) monthNum -= 12
        const isFuture = monthOffset > 0
        
        return {
          date: `${monthNum}월`,
          HT: isFuture ? null : 0,
          COP: isFuture ? null : 0,
          Global: isFuture ? null : 0,
          Wechat: isFuture ? null : 0,
          HT_Predicted: null,
          COP_Predicted: null,
          Global_Predicted: null,
          Wechat_Predicted: null
        }
      })
    }
  }, [activeTab])

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
              <SelectItem value="Wechat" className="cursor-pointer hover:bg-blue-50">Wechat</SelectItem>
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
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}