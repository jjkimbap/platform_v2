"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { CustomLegend } from "@/components/platform/common/custom-legend"
import { getCountryMultiplier } from "@/lib/platform-utils"

interface AppTrendProps {
  selectedCountry: string
  metricType: "실행" | "스캔"
}

// 앱별 추이 데이터
const monthlyAppTrendData = {
  실행: [
    { date: "1월", HT: 8500, COP: 5200, Global: 2800, HTPredicted: 8600, COPPredicted: 5300, GlobalPredicted: 2900 },
    { date: "2월", HT: 9200, COP: 5600, Global: 3000, HTPredicted: 9300, COPPredicted: 5700, GlobalPredicted: 3100 },
    { date: "3월", HT: 8800, COP: 5400, Global: 2900, HTPredicted: 8900, COPPredicted: 5500, GlobalPredicted: 3000 },
    { date: "4월", HT: 9800, COP: 6000, Global: 3200, HTPredicted: 9900, COPPredicted: 6100, GlobalPredicted: 3300 },
    { date: "5월", HT: 9500, COP: 5800, Global: 3100, HTPredicted: 9600, COPPredicted: 5900, GlobalPredicted: 3200 },
    { date: "6월", HT: 9200, COP: 5600, Global: 3000, HTPredicted: 9300, COPPredicted: 5700, GlobalPredicted: 3100 },
    { date: "7월", HT: 8800, COP: 5400, Global: 2900, HTPredicted: 8900, COPPredicted: 5500, GlobalPredicted: 3000 },
    { date: "8월", HT: 9800, COP: 6000, Global: 3200, HTPredicted: 9900, COPPredicted: 6100, GlobalPredicted: 3300 },
    { date: "9월", HT: 9500, COP: 5800, Global: 3100, HTPredicted: 9600, COPPredicted: 5900, GlobalPredicted: 3200 },
    { date: "10월", HT: 9200, COP: 5600, Global: 3000, HTPredicted: 9300, COPPredicted: 5700, GlobalPredicted: 3100 },
    { date: "11월", HT: null, COP: null, Global: null, HTPredicted: 10100, COPPredicted: 6200, GlobalPredicted: 3400 },
    { date: "12월", HT: null, COP: null, Global: null, HTPredicted: 10500, COPPredicted: 6500, GlobalPredicted: 3600 },
  ],
  스캔: [
    { date: "1월", HT: 5800, COP: 3600, Global: 1900, HTPredicted: 5900, COPPredicted: 3700, GlobalPredicted: 2000 },
    { date: "2월", HT: 6400, COP: 3900, Global: 2100, HTPredicted: 6500, COPPredicted: 4000, GlobalPredicted: 2200 },
    { date: "3월", HT: 6100, COP: 3700, Global: 2000, HTPredicted: 6200, COPPredicted: 3800, GlobalPredicted: 2100 },
    { date: "4월", HT: 7000, COP: 4200, Global: 2300, HTPredicted: 7100, COPPredicted: 4300, GlobalPredicted: 2400 },
    { date: "5월", HT: 6800, COP: 4100, Global: 2200, HTPredicted: 6900, COPPredicted: 4200, GlobalPredicted: 2300 },
    { date: "6월", HT: 6400, COP: 3900, Global: 2100, HTPredicted: 6500, COPPredicted: 4000, GlobalPredicted: 2200 },
    { date: "7월", HT: 6100, COP: 3700, Global: 2000, HTPredicted: 6200, COPPredicted: 3800, GlobalPredicted: 2100 },
    { date: "8월", HT: 7000, COP: 4200, Global: 2300, HTPredicted: 7100, COPPredicted: 4300, GlobalPredicted: 2400 },
    { date: "9월", HT: 6800, COP: 4100, Global: 2200, HTPredicted: 6900, COPPredicted: 4200, GlobalPredicted: 2300 },
    { date: "10월", HT: 6400, COP: 3900, Global: 2100, HTPredicted: 6500, COPPredicted: 4000, GlobalPredicted: 2200 },
    { date: "11월", HT: null, COP: null, Global: null, HTPredicted: 7200, COPPredicted: 4400, GlobalPredicted: 2500 },
    { date: "12월", HT: null, COP: null, Global: null, HTPredicted: 7500, COPPredicted: 4600, GlobalPredicted: 2700 },
  ]
}

const weeklyAppTrendData = {
  실행: [
    { date: "1주", HT: 5950, COP: 3640, Global: 1960, HTPredicted: 6020, COPPredicted: 3710, GlobalPredicted: 2030 },
    { date: "2주", HT: 6440, COP: 3920, Global: 2100, HTPredicted: 6510, COPPredicted: 3990, GlobalPredicted: 2170 },
    { date: "3주", HT: 6160, COP: 3780, Global: 2030, HTPredicted: 6230, COPPredicted: 3850, GlobalPredicted: 2100 },
    { date: "4주", HT: 6860, COP: 4200, Global: 2240, HTPredicted: 6930, COPPredicted: 4270, GlobalPredicted: 2310 },
    { date: "5주", HT: 6650, COP: 4060, Global: 2170, HTPredicted: 6720, COPPredicted: 4130, GlobalPredicted: 2240 },
    { date: "6주", HT: null, COP: null, Global: null, HTPredicted: 7070, COPPredicted: 4340, GlobalPredicted: 2380 },
    { date: "7주", HT: null, COP: null, Global: null, HTPredicted: 7350, COPPredicted: 4550, GlobalPredicted: 2520 },
  ],
  스캔: [
    { date: "1주", HT: 4060, COP: 2520, Global: 1330, HTPredicted: 4130, COPPredicted: 2590, GlobalPredicted: 1400 },
    { date: "2주", HT: 4480, COP: 2730, Global: 1470, HTPredicted: 4550, COPPredicted: 2800, GlobalPredicted: 1540 },
    { date: "3주", HT: 4270, COP: 2590, Global: 1400, HTPredicted: 4340, COPPredicted: 2660, GlobalPredicted: 1470 },
    { date: "4주", HT: 4900, COP: 2940, Global: 1610, HTPredicted: 4970, COPPredicted: 3010, GlobalPredicted: 1680 },
    { date: "5주", HT: 4760, COP: 2870, Global: 1540, HTPredicted: 4830, COPPredicted: 2940, GlobalPredicted: 1610 },
    { date: "6주", HT: null, COP: null, Global: null, HTPredicted: 5040, COPPredicted: 3080, GlobalPredicted: 1750 },
    { date: "7주", HT: null, COP: null, Global: null, HTPredicted: 5250, COPPredicted: 3220, GlobalPredicted: 1890 },
  ]
}

const dailyAppTrendData = {
  실행: [
    { date: "1일", HT: 850, COP: 520, Global: 280, HTPredicted: 860, COPPredicted: 530, GlobalPredicted: 290 },
    { date: "2일", HT: 920, COP: 560, Global: 300, HTPredicted: 930, COPPredicted: 570, GlobalPredicted: 310 },
    { date: "3일", HT: 880, COP: 540, Global: 290, HTPredicted: 890, COPPredicted: 550, GlobalPredicted: 300 },
    { date: "4일", HT: 980, COP: 600, Global: 320, HTPredicted: 990, COPPredicted: 610, GlobalPredicted: 330 },
    { date: "5일", HT: 950, COP: 580, Global: 310, HTPredicted: 960, COPPredicted: 590, GlobalPredicted: 320 },
    { date: "6일", HT: 920, COP: 560, Global: 300, HTPredicted: 930, COPPredicted: 570, GlobalPredicted: 310 },
    { date: "7일", HT: null, COP: null, Global: null, HTPredicted: 1010, COPPredicted: 620, GlobalPredicted: 340 },
  ],
  스캔: [
    { date: "1일", HT: 580, COP: 360, Global: 190, HTPredicted: 590, COPPredicted: 370, GlobalPredicted: 200 },
    { date: "2일", HT: 640, COP: 390, Global: 210, HTPredicted: 650, COPPredicted: 400, GlobalPredicted: 220 },
    { date: "3일", HT: 610, COP: 370, Global: 200, HTPredicted: 620, COPPredicted: 380, GlobalPredicted: 210 },
    { date: "4일", HT: 700, COP: 420, Global: 230, HTPredicted: 710, COPPredicted: 430, GlobalPredicted: 240 },
    { date: "5일", HT: 680, COP: 410, Global: 220, HTPredicted: 690, COPPredicted: 420, GlobalPredicted: 230 },
    { date: "6일", HT: 640, COP: 390, Global: 210, HTPredicted: 650, COPPredicted: 400, GlobalPredicted: 220 },
    { date: "7일", HT: null, COP: null, Global: null, HTPredicted: 720, COPPredicted: 440, GlobalPredicted: 250 },
  ]
}

export function AppTrend({ selectedCountry, metricType }: AppTrendProps) {
  const [activeTab, setActiveTab] = useState<"monthly" | "weekly" | "daily">("monthly")

  const currentData = useMemo(() => {
    switch (activeTab) {
      case "daily":
        return dailyAppTrendData[metricType]
      case "weekly":
        return weeklyAppTrendData[metricType]
      default:
        return monthlyAppTrendData[metricType]
    }
  }, [activeTab, metricType])

  const multiplier = getCountryMultiplier(selectedCountry)

  const processedData = useMemo(() => {
    return currentData.map(item => ({
      ...item,
      HT: item.HT ? Math.round(item.HT * multiplier) : null,
      COP: item.COP ? Math.round(item.COP * multiplier) : null,
      Global: item.Global ? Math.round(item.Global * multiplier) : null,
      HTPredicted: item.HTPredicted ? Math.round(item.HTPredicted * multiplier) : null,
      COPPredicted: item.COPPredicted ? Math.round(item.COPPredicted * multiplier) : null,
      GlobalPredicted: item.GlobalPredicted ? Math.round(item.GlobalPredicted * multiplier) : null,
    }))
  }, [currentData, multiplier])

  // 예측치를 실제 데이터가 없는 경우에만 표시하도록 데이터 처리
  const chartData = useMemo(() => {
    return processedData.map(item => ({
      ...item,
      HTPredictedDisplay: item.HT === null ? item.HTPredicted : null,
      COPPredictedDisplay: item.COP === null ? item.COPPredicted : null,
      GlobalPredictedDisplay: item.Global === null ? item.GlobalPredicted : null,
    }))
  }, [processedData])

  return (
    <div className="p-6 h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {selectedCountry === "전체" ? `전체 ${metricType} 앱별 추이` : `${selectedCountry} ${metricType} 앱별 추이`}
        </h3>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "monthly" | "weekly" | "daily")}>
          <TabsList className="grid w-fit grid-cols-3 bg-muted justify-self-end">
            <TabsTrigger value="monthly">월별</TabsTrigger>
            <TabsTrigger value="weekly">주별</TabsTrigger>
            <TabsTrigger value="daily">일별</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="HT" stackId="actual" fill="#3b82f6" name="HT" />
          <Bar dataKey="COP" stackId="actual" fill="#10b981" name="COP" />
          <Bar dataKey="Global" stackId="actual" fill="#8b5cf6" name="Global" />
          <Bar 
            dataKey="HTPredictedDisplay" 
            stackId="predicted" 
            fill="#3b82f6" 
            fillOpacity={0.3} 
            name="HT (예측)" 
          />
          <Bar 
            dataKey="COPPredictedDisplay" 
            stackId="predicted" 
            fill="#10b981" 
            fillOpacity={0.3} 
            name="COP (예측)" 
          />
          <Bar 
            dataKey="GlobalPredictedDisplay" 
            stackId="predicted" 
            fill="#8b5cf6" 
            fillOpacity={0.3} 
            name="Global (예측)" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

