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
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts"

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

// === 다운로드 추이 데이터 ===
const monthlyDownloadData = [
  { date: "1월", appStore: 12000, playStore: 18500, chinaStore: 8500, total: 39000, appStorePredicted: 12200, playStorePredicted: 18800, chinaStorePredicted: 8700, totalPredicted: 39700, target: 50000 },
  { date: "2월", appStore: 13500, playStore: 21000, chinaStore: 9500, total: 44000, appStorePredicted: 13700, playStorePredicted: 21300, chinaStorePredicted: 9700, totalPredicted: 44700, target: 50000 },
  { date: "3월", appStore: 12800, playStore: 19800, chinaStore: 9000, total: 41600, appStorePredicted: 13000, playStorePredicted: 20100, chinaStorePredicted: 9200, totalPredicted: 42300, target: 50000 },
  { date: "4월", appStore: 14200, playStore: 22000, chinaStore: 9800, total: 46000, appStorePredicted: 14400, playStorePredicted: 22300, chinaStorePredicted: 10000, totalPredicted: 46700, target: 50000 },
  { date: "5월", appStore: 13800, playStore: 21500, chinaStore: 9600, total: 44900, appStorePredicted: 14000, playStorePredicted: 21800, chinaStorePredicted: 9800, totalPredicted: 45600, target: 50000 },
  { date: "6월", appStore: 13200, playStore: 20500, chinaStore: 9200, total: 42900, appStorePredicted: 13400, playStorePredicted: 20800, chinaStorePredicted: 9400, totalPredicted: 43600, target: 50000 },
  { date: "7월", appStore: 12800, playStore: 19800, chinaStore: 9000, total: 41600, appStorePredicted: 13000, playStorePredicted: 20100, chinaStorePredicted: 9200, totalPredicted: 42300, target: 50000 },
  { date: "8월", appStore: 14200, playStore: 22000, chinaStore: 9800, total: 46000, appStorePredicted: 14400, playStorePredicted: 22300, chinaStorePredicted: 10000, totalPredicted: 46700, target: 50000 },
  { date: "9월", appStore: 13800, playStore: 21500, chinaStore: 9600, total: 44900, appStorePredicted: 14000, playStorePredicted: 21800, chinaStorePredicted: 9800, totalPredicted: 45600, target: 50000 },
  { date: "10월", appStore: 13200, playStore: 20500, chinaStore: 9200, total: 42900, appStorePredicted: 13400, playStorePredicted: 20800, chinaStorePredicted: 9400, totalPredicted: 43600, target: 50000 },
  { date: "11월", appStore: null, playStore: null, chinaStore: null, total: null, appStorePredicted: 14800, playStorePredicted: 22800, chinaStorePredicted: 10200, totalPredicted: 47800, target: 50000 },
  { date: "12월", appStore: null, playStore: null, chinaStore: null, total: null, appStorePredicted: 15200, playStorePredicted: 23500, chinaStorePredicted: 10500, totalPredicted: 49200, target: 50000 },
]

const dailyDownloadData = [
  { date: "1일", appStore: 400, playStore: 620, chinaStore: 280, total: 1300, appStorePredicted: 410, playStorePredicted: 630, chinaStorePredicted: 290, totalPredicted: 1330, target: 1670 },
  { date: "2일", appStore: 450, playStore: 700, chinaStore: 320, total: 1470, appStorePredicted: 460, playStorePredicted: 710, chinaStorePredicted: 330, totalPredicted: 1500, target: 1670 },
  { date: "3일", appStore: 430, playStore: 660, chinaStore: 300, total: 1390, appStorePredicted: 440, playStorePredicted: 670, chinaStorePredicted: 310, totalPredicted: 1420, target: 1670 },
  { date: "4일", appStore: 470, playStore: 730, chinaStore: 330, total: 1530, appStorePredicted: 480, playStorePredicted: 740, chinaStorePredicted: 340, totalPredicted: 1560, target: 1670 },
  { date: "5일", appStore: 460, playStore: 720, chinaStore: 320, total: 1500, appStorePredicted: 470, playStorePredicted: 730, chinaStorePredicted: 330, totalPredicted: 1530, target: 1670 },
  { date: "6일", appStore: 440, playStore: 680, chinaStore: 310, total: 1430, appStorePredicted: 450, playStorePredicted: 690, chinaStorePredicted: 320, totalPredicted: 1460, target: 1670 },
  { date: "7일", appStore: null, playStore: null, chinaStore: null, total: null, appStorePredicted: 490, playStorePredicted: 760, chinaStorePredicted: 340, totalPredicted: 1590, target: 1670 },
]

const weeklyDownloadData = [
  { date: "1주", appStore: 2800, playStore: 4340, chinaStore: 1960, total: 9100, appStorePredicted: 2870, playStorePredicted: 4410, chinaStorePredicted: 2030, totalPredicted: 9310, target: 11670 },
  { date: "2주", appStore: 3150, playStore: 4900, chinaStore: 2240, total: 10290, appStorePredicted: 3220, playStorePredicted: 4970, chinaStorePredicted: 2310, totalPredicted: 10500, target: 11670 },
  { date: "3주", appStore: 3010, playStore: 4620, chinaStore: 2100, total: 9730, appStorePredicted: 3080, playStorePredicted: 4690, chinaStorePredicted: 2170, totalPredicted: 9940, target: 11670 },
  { date: "4주", appStore: 3290, playStore: 5110, chinaStore: 2310, total: 10710, appStorePredicted: 3360, playStorePredicted: 5180, chinaStorePredicted: 2380, totalPredicted: 10920, target: 11670 },
  { date: "5주", appStore: 3220, playStore: 5040, chinaStore: 2240, total: 10500, appStorePredicted: 3290, playStorePredicted: 5110, chinaStorePredicted: 2310, totalPredicted: 10710, target: 11670 },
  { date: "6주", appStore: null, playStore: null, chinaStore: null, total: null, appStorePredicted: 3430, playStorePredicted: 5320, chinaStorePredicted: 2380, totalPredicted: 11130, target: 11670 },
  { date: "7주", appStore: null, playStore: null, chinaStore: null, total: null, appStorePredicted: 3560, playStorePredicted: 5490, chinaStorePredicted: 2450, totalPredicted: 11500, target: 11670 },
]

// === 실행/스캔 추이 데이터 ===
const monthlyExecutionScanData = [
  { date: "1월", execution: 12500, scan: 8500, conversionRate: 68.0, executionPredicted: 12600, scanPredicted: 8600, conversionRatePredicted: 68.3 },
  { date: "2월", execution: 13200, scan: 9200, conversionRate: 69.7, executionPredicted: 13300, scanPredicted: 9300, conversionRatePredicted: 69.9 },
  { date: "3월", execution: 12800, scan: 8800, conversionRate: 68.8, executionPredicted: 12900, scanPredicted: 8900, conversionRatePredicted: 69.0 },
  { date: "4월", execution: 14100, scan: 10100, conversionRate: 71.6, executionPredicted: 14200, scanPredicted: 10200, conversionRatePredicted: 71.8 },
  { date: "5월", execution: 13900, scan: 9900, conversionRate: 71.2, executionPredicted: 14000, scanPredicted: 10000, conversionRatePredicted: 71.4 },
  { date: "6월", execution: 13200, scan: 9200, conversionRate: 69.7, executionPredicted: 13300, scanPredicted: 9300, conversionRatePredicted: 69.9 },
  { date: "7월", execution: 12800, scan: 8800, conversionRate: 68.8, executionPredicted: 12900, scanPredicted: 8900, conversionRatePredicted: 69.0 },
  { date: "8월", execution: 14100, scan: 10100, conversionRate: 71.6, executionPredicted: 14200, scanPredicted: 10200, conversionRatePredicted: 71.8 },
  { date: "9월", execution: 13900, scan: 9900, conversionRate: 71.2, executionPredicted: 14000, scanPredicted: 10000, conversionRatePredicted: 71.4 },
  { date: "10월", execution: 13200, scan: 9200, conversionRate: 69.7, executionPredicted: 13300, scanPredicted: 9300, conversionRatePredicted: 69.9 },
  { date: "11월", execution: null, scan: null, conversionRate: null, executionPredicted: 14200, scanPredicted: 11200, conversionRatePredicted: 73.7 },
  { date: "12월", execution: null, scan: null, conversionRate: null, executionPredicted: 14800, scanPredicted: 11800, conversionRatePredicted: 74.7 },
]

const dailyExecutionScanData = [
  { date: "1일", execution: 1250, scan: 850, conversionRate: 68.0, executionPredicted: 1260, scanPredicted: 860, conversionRatePredicted: 68.3 },
  { date: "2일", execution: 1320, scan: 920, conversionRate: 69.7, executionPredicted: 1330, scanPredicted: 930, conversionRatePredicted: 69.9 },
  { date: "3일", execution: 1280, scan: 880, conversionRate: 68.8, executionPredicted: 1290, scanPredicted: 890, conversionRatePredicted: 69.0 },
  { date: "4일", execution: 1410, scan: 1010, conversionRate: 71.6, executionPredicted: 1420, scanPredicted: 1020, conversionRatePredicted: 71.8 },
  { date: "5일", execution: 1390, scan: 990, conversionRate: 71.2, executionPredicted: 1400, scanPredicted: 1000, conversionRatePredicted: 71.4 },
  { date: "6일", execution: 1320, scan: 920, conversionRate: 69.7, executionPredicted: 1330, scanPredicted: 930, conversionRatePredicted: 69.9 },
  { date: "7일", execution: null, scan: null, conversionRate: null, executionPredicted: 1420, scanPredicted: 1120, conversionRatePredicted: 73.7 },
]

const weeklyExecutionScanData = [
  { date: "1주", execution: 8750, scan: 5950, conversionRate: 68.0, executionPredicted: 8820, scanPredicted: 6020, conversionRatePredicted: 68.3 },
  { date: "2주", execution: 9240, scan: 6440, conversionRate: 69.7, executionPredicted: 9310, scanPredicted: 6510, conversionRatePredicted: 69.9 },
  { date: "3주", execution: 8960, scan: 6160, conversionRate: 68.8, executionPredicted: 9030, scanPredicted: 6230, conversionRatePredicted: 69.0 },
  { date: "4주", execution: 9870, scan: 7070, conversionRate: 71.6, executionPredicted: 9940, scanPredicted: 7140, conversionRatePredicted: 71.8 },
  { date: "5주", execution: 9730, scan: 6930, conversionRate: 71.2, executionPredicted: 9800, scanPredicted: 7000, conversionRatePredicted: 71.4 },
  { date: "6주", execution: null, scan: null, conversionRate: null, executionPredicted: 9940, scanPredicted: 7840, conversionRatePredicted: 73.7 },
  { date: "7주", execution: null, scan: null, conversionRate: null, executionPredicted: 10360, scanPredicted: 7840, conversionRatePredicted: 74.7 },
]

// === 신규 회원 추이 데이터 ===
const monthlyNewMemberData = [
  { date: "1월", app: 850, commerce: 350, appPredicted: 870, commercePredicted: 360 },
  { date: "2월", app: 920, commerce: 380, appPredicted: 940, commercePredicted: 390 },
  { date: "3월", app: 880, commerce: 360, appPredicted: 900, commercePredicted: 370 },
  { date: "4월", app: 950, commerce: 390, appPredicted: 970, commercePredicted: 400 },
  { date: "5월", app: 910, commerce: 370, appPredicted: 930, commercePredicted: 380 },
  { date: "6월", app: 920, commerce: 380, appPredicted: 940, commercePredicted: 390 },
  { date: "7월", app: 880, commerce: 360, appPredicted: 900, commercePredicted: 370 },
  { date: "8월", app: 950, commerce: 390, appPredicted: 970, commercePredicted: 400 },
  { date: "9월", app: 910, commerce: 370, appPredicted: 930, commercePredicted: 380 },
  { date: "10월", app: null, commerce: null, appPredicted: 980, commercePredicted: 400 },
  { date: "11월", app: null, commerce: null, appPredicted: 1020, commercePredicted: 420 },
]

const dailyNewMemberData = [
  { date: "1일", app: 85, commerce: 35, appPredicted: 87, commercePredicted: 36 },
  { date: "2일", app: 92, commerce: 38, appPredicted: 94, commercePredicted: 39 },
  { date: "3일", app: 88, commerce: 36, appPredicted: 90, commercePredicted: 37 },
  { date: "4일", app: 95, commerce: 39, appPredicted: 97, commercePredicted: 40 },
  { date: "5일", app: 91, commerce: 37, appPredicted: 93, commercePredicted: 38 },
  { date: "6일", app: 94, commerce: 39, appPredicted: 96, commercePredicted: 40 },
  { date: "7일", app: null, commerce: null, appPredicted: 102, commercePredicted: 42 },
]

const weeklyNewMemberData = [
  { date: "1주", app: 595, commerce: 245, appPredicted: 610, commercePredicted: 250 },
  { date: "2주", app: 644, commerce: 266, appPredicted: 660, commercePredicted: 270 },
  { date: "3주", app: 616, commerce: 252, appPredicted: 630, commercePredicted: 260 },
  { date: "4주", app: 665, commerce: 273, appPredicted: 680, commercePredicted: 280 },
  { date: "5주", app: 658, commerce: 270, appPredicted: 670, commercePredicted: 275 },
  { date: "6주", app: null, commerce: null, appPredicted: 714, commercePredicted: 294 },
  { date: "7주", app: null, commerce: null, appPredicted: 740, commercePredicted: 305 },
]

// === 가입 경로별 신규 회원 추이 데이터 ===
const monthlySignupMethodData = [
  { date: "1월", email: 180, apple: 140, google: 220, kakao: 185, naver: 160, line: 95, facebook: 85, wechat: 135, emailPredicted: 185, applePredicted: 145, googlePredicted: 225, kakaoPredicted: 190, naverPredicted: 165, linePredicted: 98, facebookPredicted: 88, wechatPredicted: 140 },
  { date: "2월", email: 195, apple: 155, google: 235, kakao: 195, naver: 170, line: 100, facebook: 90, wechat: 145, emailPredicted: 200, applePredicted: 160, googlePredicted: 240, kakaoPredicted: 200, naverPredicted: 175, linePredicted: 103, facebookPredicted: 93, wechatPredicted: 150 },
  { date: "3월", email: 185, apple: 145, google: 225, kakao: 188, naver: 165, line: 98, facebook: 88, wechat: 140, emailPredicted: 190, applePredicted: 150, googlePredicted: 230, kakaoPredicted: 193, naverPredicted: 170, linePredicted: 101, facebookPredicted: 91, wechatPredicted: 145 },
  { date: "4월", email: 200, apple: 160, google: 245, kakao: 205, naver: 175, line: 105, facebook: 95, wechat: 150, emailPredicted: 205, applePredicted: 165, googlePredicted: 250, kakaoPredicted: 210, naverPredicted: 180, linePredicted: 108, facebookPredicted: 98, wechatPredicted: 155 },
  { date: "5월", email: 195, apple: 155, google: 240, kakao: 200, naver: 170, line: 102, facebook: 92, wechat: 146, emailPredicted: 200, applePredicted: 160, googlePredicted: 245, kakaoPredicted: 205, naverPredicted: 175, linePredicted: 105, facebookPredicted: 95, wechatPredicted: 151 },
  { date: "6월", email: 198, apple: 158, google: 242, kakao: 202, naver: 172, line: 103, facebook: 93, wechat: 148, emailPredicted: 203, applePredicted: 163, googlePredicted: 247, kakaoPredicted: 207, naverPredicted: 177, linePredicted: 106, facebookPredicted: 96, wechatPredicted: 153 },
  { date: "7월", email: 188, apple: 148, google: 232, kakao: 192, naver: 162, line: 98, facebook: 88, wechat: 138, emailPredicted: 193, applePredicted: 153, googlePredicted: 237, kakaoPredicted: 197, naverPredicted: 167, linePredicted: 101, facebookPredicted: 91, wechatPredicted: 143 },
  { date: "8월", email: 202, apple: 162, google: 248, kakao: 208, naver: 178, line: 107, facebook: 97, wechat: 152, emailPredicted: 207, applePredicted: 167, googlePredicted: 253, kakaoPredicted: 213, naverPredicted: 183, linePredicted: 110, facebookPredicted: 100, wechatPredicted: 157 },
  { date: "9월", email: 195, apple: 155, google: 240, kakao: 200, naver: 170, line: 102, facebook: 92, wechat: 146, emailPredicted: 200, applePredicted: 160, googlePredicted: 245, kakaoPredicted: 205, naverPredicted: 175, linePredicted: 105, facebookPredicted: 95, wechatPredicted: 151 },
  { date: "10월", email: 203, apple: 163, google: 250, kakao: 210, naver: 180, line: 108, facebook: 98, wechat: 155, emailPredicted: 208, applePredicted: 168, googlePredicted: 255, kakaoPredicted: 215, naverPredicted: 185, linePredicted: 112, facebookPredicted: 102, wechatPredicted: 160 },
  { date: "11월", email: null, apple: null, google: null, kakao: null, naver: null, line: null, facebook: null, wechat: null, emailPredicted: 220, applePredicted: 178, googlePredicted: 268, kakaoPredicted: 225, naverPredicted: 195, linePredicted: 118, facebookPredicted: 108, wechatPredicted: 168 },
]

const dailySignupMethodData = [
  { date: "1일", email: 18, apple: 14, google: 22, kakao: 19, naver: 16, line: 10, facebook: 9, wechat: 14, emailPredicted: 19, applePredicted: 15, googlePredicted: 23, kakaoPredicted: 20, naverPredicted: 17, linePredicted: 10, facebookPredicted: 9, wechatPredicted: 15 },
  { date: "2일", email: 19, apple: 16, google: 24, kakao: 20, naver: 17, line: 10, facebook: 9, wechat: 15, emailPredicted: 20, applePredicted: 17, googlePredicted: 25, kakaoPredicted: 21, naverPredicted: 18, linePredicted: 11, facebookPredicted: 10, wechatPredicted: 16 },
  { date: "3일", email: 18, apple: 15, google: 23, kakao: 19, naver: 17, line: 10, facebook: 9, wechat: 14, emailPredicted: 19, applePredicted: 16, googlePredicted: 24, kakaoPredicted: 20, naverPredicted: 18, linePredicted: 11, facebookPredicted: 10, wechatPredicted: 15 },
  { date: "4일", email: 20, apple: 16, google: 25, kakao: 21, naver: 18, line: 11, facebook: 10, wechat: 15, emailPredicted: 21, applePredicted: 17, googlePredicted: 26, kakaoPredicted: 22, naverPredicted: 19, linePredicted: 11, facebookPredicted: 10, wechatPredicted: 16 },
  { date: "5일", email: 19, apple: 15, google: 24, kakao: 20, naver: 17, line: 10, facebook: 9, wechat: 15, emailPredicted: 20, applePredicted: 16, googlePredicted: 25, kakaoPredicted: 21, naverPredicted: 18, linePredicted: 11, facebookPredicted: 10, wechatPredicted: 16 },
  { date: "6일", email: 20, apple: 16, google: 25, kakao: 21, naver: 18, line: 10, facebook: 10, wechat: 15, emailPredicted: 21, applePredicted: 17, googlePredicted: 26, kakaoPredicted: 22, naverPredicted: 19, linePredicted: 11, facebookPredicted: 10, wechatPredicted: 16 },
  { date: "7일", email: null, apple: null, google: null, kakao: null, naver: null, line: null, facebook: null, wechat: null, emailPredicted: 22, applePredicted: 18, googlePredicted: 27, kakaoPredicted: 23, naverPredicted: 20, linePredicted: 12, facebookPredicted: 11, wechatPredicted: 17 },
]

const weeklySignupMethodData = [
  { date: "1주", email: 126, apple: 98, google: 154, kakao: 130, naver: 112, line: 67, facebook: 60, wechat: 95, emailPredicted: 130, applePredicted: 102, googlePredicted: 158, kakaoPredicted: 134, naverPredicted: 116, linePredicted: 69, facebookPredicted: 62, wechatPredicted: 98 },
  { date: "2주", email: 137, apple: 108, google: 168, kakao: 140, naver: 122, line: 72, facebook: 65, wechat: 102, emailPredicted: 141, applePredicted: 112, googlePredicted: 172, kakaoPredicted: 144, naverPredicted: 126, linePredicted: 74, facebookPredicted: 67, wechatPredicted: 105 },
  { date: "3주", email: 131, apple: 103, google: 161, kakao: 134, naver: 117, line: 69, facebook: 62, wechat: 98, emailPredicted: 135, applePredicted: 107, googlePredicted: 165, kakaoPredicted: 138, naverPredicted: 121, linePredicted: 71, facebookPredicted: 64, wechatPredicted: 101 },
  { date: "4주", email: 142, apple: 112, google: 175, kakao: 146, naver: 126, line: 75, facebook: 68, wechat: 106, emailPredicted: 146, applePredicted: 116, googlePredicted: 179, kakaoPredicted: 150, naverPredicted: 130, linePredicted: 77, facebookPredicted: 70, wechatPredicted: 109 },
  { date: "5주", email: 137, apple: 107, google: 168, kakao: 140, naver: 119, line: 71, facebook: 64, wechat: 101, emailPredicted: 140, applePredicted: 110, googlePredicted: 172, kakaoPredicted: 143, naverPredicted: 122, linePredicted: 73, facebookPredicted: 66, wechatPredicted: 104 },
  { date: "6주", email: null, apple: null, google: null, kakao: null, naver: null, line: null, facebook: null, wechat: null, emailPredicted: 152, applePredicted: 120, googlePredicted: 187, kakaoPredicted: 156, naverPredicted: 133, linePredicted: 80, facebookPredicted: 72, wechatPredicted: 114 },
  { date: "7주", email: null, apple: null, google: null, kakao: null, naver: null, line: null, facebook: null, wechat: null, emailPredicted: 158, applePredicted: 125, googlePredicted: 195, kakaoPredicted: 162, naverPredicted: 139, linePredicted: 83, facebookPredicted: 75, wechatPredicted: 118 },
]

// === 커뮤니티 활동 추이 데이터 ===
const monthlyCommunityActivityData = [
  { date: "1월", communityPosts: 1250, newChatRooms: 320, qa: 450, review: 380, tips: 220, trade: 200, oneOnOne: 180, tradingChat: 140, communityPostsPredicted: 1280, newChatRoomsPredicted: 330, qaPredicted: 460, reviewPredicted: 390, tipsPredicted: 225, tradePredicted: 205, oneOnOnePredicted: 185, tradingChatPredicted: 145 },
  { date: "2월", communityPosts: 1380, newChatRooms: 350, qa: 490, review: 420, tips: 250, trade: 220, oneOnOne: 200, tradingChat: 150, communityPostsPredicted: 1410, newChatRoomsPredicted: 360, qaPredicted: 500, reviewPredicted: 430, tipsPredicted: 255, tradePredicted: 225, oneOnOnePredicted: 205, tradingChatPredicted: 155 },
  { date: "3월", communityPosts: 1320, newChatRooms: 340, qa: 470, review: 400, tips: 240, trade: 210, oneOnOne: 190, tradingChat: 150, communityPostsPredicted: 1350, newChatRoomsPredicted: 350, qaPredicted: 480, reviewPredicted: 410, tipsPredicted: 245, tradePredicted: 215, oneOnOnePredicted: 195, tradingChatPredicted: 155 },
  { date: "4월", communityPosts: 1450, newChatRooms: 380, qa: 520, review: 440, tips: 270, trade: 220, oneOnOne: 220, tradingChat: 160, communityPostsPredicted: 1480, newChatRoomsPredicted: 390, qaPredicted: 530, reviewPredicted: 450, tipsPredicted: 275, tradePredicted: 225, oneOnOnePredicted: 225, tradingChatPredicted: 165 },
  { date: "5월", communityPosts: 1390, newChatRooms: 360, qa: 500, review: 420, tips: 260, trade: 210, oneOnOne: 210, tradingChat: 150, communityPostsPredicted: 1420, newChatRoomsPredicted: 370, qaPredicted: 510, reviewPredicted: 430, tipsPredicted: 265, tradePredicted: 215, oneOnOnePredicted: 215, tradingChatPredicted: 155 },
  { date: "6월", communityPosts: 1380, newChatRooms: 350, qa: 490, review: 420, tips: 250, trade: 220, oneOnOne: 200, tradingChat: 150, communityPostsPredicted: 1410, newChatRoomsPredicted: 360, qaPredicted: 500, reviewPredicted: 430, tipsPredicted: 255, tradePredicted: 225, oneOnOnePredicted: 205, tradingChatPredicted: 155 },
  { date: "7월", communityPosts: 1320, newChatRooms: 340, qa: 470, review: 400, tips: 240, trade: 210, oneOnOne: 190, tradingChat: 150, communityPostsPredicted: 1350, newChatRoomsPredicted: 350, qaPredicted: 480, reviewPredicted: 410, tipsPredicted: 245, tradePredicted: 215, oneOnOnePredicted: 195, tradingChatPredicted: 155 },
  { date: "8월", communityPosts: 1450, newChatRooms: 380, qa: 520, review: 440, tips: 270, trade: 220, oneOnOne: 220, tradingChat: 160, communityPostsPredicted: 1480, newChatRoomsPredicted: 390, qaPredicted: 530, reviewPredicted: 450, tipsPredicted: 275, tradePredicted: 225, oneOnOnePredicted: 225, tradingChatPredicted: 165 },
  { date: "9월", communityPosts: 1390, newChatRooms: 360, qa: 500, review: 420, tips: 260, trade: 210, oneOnOne: 210, tradingChat: 150, communityPostsPredicted: 1420, newChatRoomsPredicted: 370, qaPredicted: 510, reviewPredicted: 430, tipsPredicted: 265, tradePredicted: 215, oneOnOnePredicted: 215, tradingChatPredicted: 155 },
  { date: "10월", communityPosts: null, newChatRooms: null, qa: null, review: null, tips: null, trade: null, oneOnOne: null, tradingChat: null, communityPostsPredicted: 1520, newChatRoomsPredicted: 400, qaPredicted: 550, reviewPredicted: 470, tipsPredicted: 290, tradePredicted: 240, oneOnOnePredicted: 240, tradingChatPredicted: 170 },
  { date: "11월", communityPosts: null, newChatRooms: null, qa: null, review: null, tips: null, trade: null, oneOnOne: null, tradingChat: null, communityPostsPredicted: 1580, newChatRoomsPredicted: 420, qaPredicted: 570, reviewPredicted: 490, tipsPredicted: 300, tradePredicted: 250, oneOnOnePredicted: 250, tradingChatPredicted: 180 },
]

const dailyCommunityActivityData = [
  { date: "1일", communityPosts: 125, newChatRooms: 32, qa: 45, review: 38, tips: 22, trade: 20, oneOnOne: 18, tradingChat: 14, communityPostsPredicted: 128, newChatRoomsPredicted: 33, qaPredicted: 46, reviewPredicted: 39, tipsPredicted: 23, tradePredicted: 21, oneOnOnePredicted: 19, tradingChatPredicted: 15 },
  { date: "2일", communityPosts: 138, newChatRooms: 35, qa: 49, review: 42, tips: 25, trade: 22, oneOnOne: 20, tradingChat: 15, communityPostsPredicted: 141, newChatRoomsPredicted: 36, qaPredicted: 50, reviewPredicted: 43, tipsPredicted: 26, tradePredicted: 23, oneOnOnePredicted: 21, tradingChatPredicted: 16 },
  { date: "3일", communityPosts: 132, newChatRooms: 34, qa: 47, review: 40, tips: 24, trade: 21, oneOnOne: 19, tradingChat: 15, communityPostsPredicted: 135, newChatRoomsPredicted: 35, qaPredicted: 48, reviewPredicted: 41, tipsPredicted: 25, tradePredicted: 22, oneOnOnePredicted: 20, tradingChatPredicted: 16 },
  { date: "4일", communityPosts: 145, newChatRooms: 38, qa: 52, review: 44, tips: 27, trade: 22, oneOnOne: 22, tradingChat: 16, communityPostsPredicted: 148, newChatRoomsPredicted: 39, qaPredicted: 53, reviewPredicted: 45, tipsPredicted: 28, tradePredicted: 23, oneOnOnePredicted: 23, tradingChatPredicted: 17 },
  { date: "5일", communityPosts: 139, newChatRooms: 36, qa: 50, review: 42, tips: 26, trade: 21, oneOnOne: 21, tradingChat: 15, communityPostsPredicted: 142, newChatRoomsPredicted: 37, qaPredicted: 51, reviewPredicted: 43, tipsPredicted: 27, tradePredicted: 22, oneOnOnePredicted: 22, tradingChatPredicted: 16 },
  { date: "6일", communityPosts: 138, newChatRooms: 35, qa: 49, review: 42, tips: 25, trade: 22, oneOnOne: 20, tradingChat: 15, communityPostsPredicted: 141, newChatRoomsPredicted: 36, qaPredicted: 50, reviewPredicted: 43, tipsPredicted: 26, tradePredicted: 23, oneOnOnePredicted: 21, tradingChatPredicted: 16 },
  { date: "7일", communityPosts: null, newChatRooms: null, qa: null, review: null, tips: null, trade: null, oneOnOne: null, tradingChat: null, communityPostsPredicted: 152, newChatRoomsPredicted: 40, qaPredicted: 55, reviewPredicted: 47, tipsPredicted: 29, tradePredicted: 24, oneOnOnePredicted: 24, tradingChatPredicted: 17 },
]

const weeklyCommunityActivityData = [
  { date: "1주", communityPosts: 1250, newChatRooms: 320, qa: 450, review: 380, tips: 220, trade: 200, oneOnOne: 180, tradingChat: 140, communityPostsPredicted: 1280, newChatRoomsPredicted: 330, qaPredicted: 460, reviewPredicted: 390, tipsPredicted: 225, tradePredicted: 205, oneOnOnePredicted: 185, tradingChatPredicted: 145 },
  { date: "2주", communityPosts: 1380, newChatRooms: 350, qa: 490, review: 420, tips: 250, trade: 220, oneOnOne: 200, tradingChat: 150, communityPostsPredicted: 1410, newChatRoomsPredicted: 360, qaPredicted: 500, reviewPredicted: 430, tipsPredicted: 255, tradePredicted: 225, oneOnOnePredicted: 205, tradingChatPredicted: 155 },
  { date: "3주", communityPosts: 1320, newChatRooms: 340, qa: 470, review: 400, tips: 240, trade: 210, oneOnOne: 190, tradingChat: 150, communityPostsPredicted: 1350, newChatRoomsPredicted: 350, qaPredicted: 480, reviewPredicted: 410, tipsPredicted: 245, tradePredicted: 215, oneOnOnePredicted: 195, tradingChatPredicted: 155 },
  { date: "4주", communityPosts: 1450, newChatRooms: 380, qa: 520, review: 440, tips: 270, trade: 220, oneOnOne: 220, tradingChat: 160, communityPostsPredicted: 1480, newChatRoomsPredicted: 390, qaPredicted: 530, reviewPredicted: 450, tipsPredicted: 275, tradePredicted: 225, oneOnOnePredicted: 225, tradingChatPredicted: 165 },
  { date: "5주", communityPosts: 1390, newChatRooms: 360, qa: 500, review: 420, tips: 260, trade: 210, oneOnOne: 210, tradingChat: 150, communityPostsPredicted: 1420, newChatRoomsPredicted: 370, qaPredicted: 510, reviewPredicted: 430, tipsPredicted: 265, tradePredicted: 215, oneOnOnePredicted: 215, tradingChatPredicted: 155 },
  { date: "6주", communityPosts: null, newChatRooms: null, qa: null, review: null, tips: null, trade: null, oneOnOne: null, tradingChat: null, communityPostsPredicted: 1520, newChatRoomsPredicted: 400, qaPredicted: 550, reviewPredicted: 470, tipsPredicted: 290, tradePredicted: 240, oneOnOnePredicted: 240, tradingChatPredicted: 170 },
  { date: "7주", communityPosts: null, newChatRooms: null, qa: null, review: null, tips: null, trade: null, oneOnOne: null, tradingChat: null, communityPostsPredicted: 1580, newChatRoomsPredicted: 420, qaPredicted: 570, reviewPredicted: 490, tipsPredicted: 300, tradePredicted: 250, oneOnOnePredicted: 250, tradingChatPredicted: 180 },
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

  const getCurrentDownloadData = () => {
    switch (activeTab) {
      case "daily":
        return dailyDownloadData
      case "weekly":
        return weeklyDownloadData
      default:
        return monthlyDownloadData
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
      <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 2fr' }}>
        {/* 다운로드 추이 그래프  */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            {/* 다운로드 목표 카드 */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex flex-col space-y-2">
                {(() => {
                  const downloadData = getCurrentDownloadData()
                  const lastData = downloadData.filter(d => d.total !== null).pop() || downloadData[downloadData.length - 1]
                  const currentTotal = lastData.total || lastData.totalPredicted || 0
                  const target = lastData.target || 1500000
                  const rate = target > 0 ? ((currentTotal / target) * 100) : 0
                  return (
                    <>
                      <div className={`text-3xl font-bold ${getColorByRate(rate).text}`}>{rate.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${getColorByRate(rate).bg} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">다운로드 목표</p>
                        <p className="text-xs text-muted-foreground">{target.toLocaleString()}건</p>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-foreground">다운로드 추이</h3>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                  <TabsTrigger value="monthly">월별</TabsTrigger>
                  <TabsTrigger value="weekly">주별</TabsTrigger>
                  <TabsTrigger value="daily">일별</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCurrentDownloadData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="appStore" stackId="actual" fill="#3b82f6" name="App Store" />
                <Bar dataKey="playStore" stackId="actual" fill="#10b981" name="Play Store" />
                <Bar dataKey="chinaStore" stackId="actual" fill="#f59e0b" name="China Store" />
                <Bar dataKey="appStorePredicted" stackId="predicted" fill="#3b82f6" fillOpacity={0.3} name="App Store (예측)" />
                <Bar dataKey="playStorePredicted" stackId="predicted" fill="#10b981" fillOpacity={0.3} name="Play Store (예측)" />
                <Bar dataKey="chinaStorePredicted" stackId="predicted" fill="#f59e0b" fillOpacity={0.3} name="China Store (예측)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
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
                    <p className="text-xs text-muted-foreground">실행→스캔 전환율 목표</p>
                    <p className="text-xs text-muted-foreground">100%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-foreground">실행•스캔 활성자 추이</h3>
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
                    <p className="text-xs text-muted-foreground">3종 앱 유입 목표</p>
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
                  <Legend content={<CustomLegend />} />
                  <Bar 
                    dataKey="commerce" 
                    stackId="actual"
                    fill="#f59e0b" 
                    name="커머스"
                  />
                  <Bar 
                    dataKey="app" 
                    stackId="actual"
                    fill="#8b5cf6" 
                    name="앱"
                  />
                  <Bar 
                    dataKey="commercePredicted" 
                    stackId="predicted"
                    fill="#f59e0b" 
                    fillOpacity={0.5}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    name="커머스 (예측)"
                  />
                  <Bar 
                    dataKey="appPredicted" 
                    stackId="predicted"
                    fill="#8b5cf6" 
                    fillOpacity={0.5}
                    stroke="#8b5cf6"
                    strokeDasharray="5 5"
                    name="앱 (예측)"
                  />
                </BarChart>
              ) : (
                <LineChart 
                  data={getCurrentSignupMethodData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 'dataMax + 50']} />
                  <Tooltip />
                  <Legend content={<CustomLegend />} />
                  <Line type="monotone" dataKey="email" stroke="#ef4444" strokeWidth={2} name="이메일" connectNulls />
                  <Line type="monotone" dataKey="apple" stroke="#6b7280" strokeWidth={2} name="애플" connectNulls />
                  <Line type="monotone" dataKey="google" stroke="#3b82f6" strokeWidth={2} name="구글" connectNulls />
                  <Line type="monotone" dataKey="kakao" stroke="#fbbf24" strokeWidth={2} name="카카오" connectNulls />
                  <Line type="monotone" dataKey="naver" stroke="#10b981" strokeWidth={2} name="네이버" connectNulls />
                  <Line type="monotone" dataKey="line" stroke="#22c55e" strokeWidth={2} name="라인" connectNulls />
                  <Line type="monotone" dataKey="facebook" stroke="#3b5998" strokeWidth={2} name="페이스북" connectNulls />
                  <Line type="monotone" dataKey="wechat" stroke="#8b5cf6" strokeWidth={2} name="위챗" connectNulls />
                  <Line type="monotone" dataKey="emailPredicted" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.5} name="이메일 (예측)" connectNulls />
                  <Line type="monotone" dataKey="applePredicted" stroke="#6b7280" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.5} name="애플 (예측)" connectNulls />
                  <Line type="monotone" dataKey="googlePredicted" stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.5} name="구글 (예측)" connectNulls />
                  <Line type="monotone" dataKey="kakaoPredicted" stroke="#fbbf24" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.5} name="카카오 (예측)" connectNulls />
                  <Line type="monotone" dataKey="naverPredicted" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.5} name="네이버 (예측)" connectNulls />
                  <Line type="monotone" dataKey="linePredicted" stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.5} name="라인 (예측)" connectNulls />
                  <Line type="monotone" dataKey="facebookPredicted" stroke="#3b5998" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.5} name="페이스북 (예측)" connectNulls />
                  <Line type="monotone" dataKey="wechatPredicted" stroke="#8b5cf6" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.5} name="위챗 (예측)" connectNulls />
                </LineChart>
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
                  { dataKey: "qaPredicted", name: "정품Q&A (예측)", color: "#3b82f6", strokeDasharray: "5 5", yAxisId: "left" },
                  { dataKey: "review", name: "정품제품리뷰", color: "#10b981", yAxisId: "left" },
                  { dataKey: "reviewPredicted", name: "정품제품리뷰 (예측)", color: "#10b981", strokeDasharray: "5 5", yAxisId: "left" },
                  { dataKey: "tips", name: "정품판별팁", color: "#f59e0b", yAxisId: "left" },
                  { dataKey: "tipsPredicted", name: "정품판별팁 (예측)", color: "#f59e0b", strokeDasharray: "5 5", yAxisId: "left" },
                  { dataKey: "trade", name: "정품인증거래", color: "#8b5cf6", yAxisId: "left" },
                  { dataKey: "tradePredicted", name: "정품인증거래 (예측)", color: "#8b5cf6", strokeDasharray: "5 5", yAxisId: "left" }
                ] : communityViewType === "chat" ? [
                  { dataKey: "oneOnOne", name: "1:1채팅", color: "#3b82f6", yAxisId: "left" },
                  { dataKey: "oneOnOnePredicted", name: "1:1채팅 (예측)", color: "#3b82f6", strokeDasharray: "5 5", yAxisId: "left" },
                  { dataKey: "tradingChat", name: "인증거래채팅", color: "#10b981", yAxisId: "left" },
                  { dataKey: "tradingChatPredicted", name: "인증거래채팅 (예측)", color: "#10b981", strokeDasharray: "5 5", yAxisId: "left" }
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
