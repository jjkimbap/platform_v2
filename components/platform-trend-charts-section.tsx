"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { TrendChart } from "@/components/trend-chart"
import { MiniTrendChart } from "@/components/mini-trend-chart"
import { MetricCard } from "@/components/metric-card"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTargetsConfig, TargetsConfig } from "@/lib/targets-config"
import { Users, Scan, Target } from "lucide-react"
import { TargetEditModal } from "@/components/target-edit-modal"
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ComposedChart } from "recharts"
import { CustomLegend } from "@/components/platform/common/custom-legend"
import { getColorByRate } from "@/lib/platform-utils"
import { fetchNewUserTrend, formatDateForAPI, getTodayDateString, NewMemberTrendData, fetchCommunityPostTrend, CommunityPostTrendData, fetchChatRoomTrend, ChatRoomTrendData, fetchExecutionTrend, ExecutionTrendResponse, fetchScanTrend, ScanTrendResponse, NewMemberForecast, CommunityPostForecast, ChatRoomForecast } from "@/lib/api"
// 다운로드 트렌드 관련 import는 타입 에러 방지를 위해 별도 처리
import type { DownloadTrendResponse } from "@/lib/api"
import { fetchDownloadTrend } from "@/lib/api"
import { useDateRange } from "@/hooks/use-date-range"
import { useTrendChartConfig } from "@/hooks/use-trend-chart-config"

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

interface PlatformTrendChartsSectionProps {
  selectedCountry?: string
  targetsConfig?: TargetsConfig | null
  onTargetsUpdate?: (config: TargetsConfig) => void
}

export function PlatformTrendChartsSection({ selectedCountry = "전체", targetsConfig: externalTargetsConfig, onTargetsUpdate }: PlatformTrendChartsSectionProps) {
  // 커스텀 툴팁 컴포넌트 (TrendChart와 동일한 스타일)
  // 주별 날짜를 "00월0주" 형식으로 변환하는 함수
  // period는 주의 시작일(월요일)의 날짜(YYYY-MM-DD 형식)
  const formatWeeklyDate = (dateStr: string): string => {
    if (!dateStr) return dateStr
    
    // yyyy-MM-dd 형식인 경우 (주 시작일, 월요일)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number)
      const weekStartDate = new Date(year, month - 1, day)
      
      // 해당 주가 속한 월의 첫 번째 날짜
      const firstDayOfMonth = new Date(year, month - 1, 1)
      
      // 주 시작일(월요일)이 해당 월의 몇 번째 주인지 계산
      // 월의 첫 번째 날짜부터 주 시작일까지의 일수 계산
      const daysFromMonthStart = Math.floor((weekStartDate.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24))
      
      // 주 번호 계산: (일수 / 7) + 1 (첫 주는 1주차)
      // 단, 주 시작일이 월의 첫 번째 날짜보다 이전이면 이전 달의 마지막 주이므로 해당 월의 1주차로 처리
      const weekNumber = Math.max(1, Math.floor(daysFromMonthStart / 7) + 1)
      
      return `${month}월${weekNumber}주`
    }
    
    // 이미 "N주" 형식인 경우 (mock 데이터)
    if (/^\d+주$/.test(dateStr)) {
      const weekNum = parseInt(dateStr.replace('주', ''))
      // 현재 월을 기본값으로 사용 (실제로는 데이터에서 월 정보를 가져와야 함)
      const currentMonth = new Date().getMonth() + 1
      return `${currentMonth}월${weekNum}주`
    }
    
    return dateStr
  }

  const createCustomTooltip = (activeTab: string) => {
    return ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        // 일별일 때 날짜 포맷팅
        let formattedLabel = label
        if (activeTab === 'daily') {
          if (typeof label === 'string') {
            // yyyy-MM-dd 형식인 경우 그대로 반환
            if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
              formattedLabel = label
            }
            // yyyy-MM 형식인 경우 (일별 데이터가 아닌 경우)
            else if (/^\d{4}-\d{2}$/.test(label)) {
              formattedLabel = label
            }
            // yyyyMMdd 형식인 경우
            else if (/^\d{8}$/.test(label)) {
              formattedLabel = `${label.substring(0, 4)}-${label.substring(4, 6)}-${label.substring(6, 8)}`
            }
          }
        } else if (activeTab === 'weekly') {
          // 주별일 때 "00월0주" 형식으로 변환
          formattedLabel = formatWeeklyDate(label)
        }
        
        return (
          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
            <p className="font-semibold text-foreground mb-2">{formattedLabel}</p>
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ 
                    backgroundColor: entry.color,
                    opacity: entry.dataKey.includes('Predicted') ? 0.7 : 1
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
  }
  const [activeTab, setActiveTab] = useState("monthly")
  const [internalTargetsConfig, setInternalTargetsConfig] = useState<TargetsConfig | null>(null)
  
  // 목표치 설정: 외부에서 전달되면 사용, 없으면 내부에서 로드
  const targetsConfig = externalTargetsConfig || internalTargetsConfig
  const [communityViewType, setCommunityViewType] = useState<"all" | "community" | "chat">("all")
  const [memberViewType, setMemberViewType] = useState<"total" | "signupMethod">("total")
  const [newMemberTrendData, setNewMemberTrendData] = useState<NewMemberTrendData[]>([])
  const [newMemberForecast, setNewMemberForecast] = useState<NewMemberForecast[]>([])
  const [communityPostTrendData, setCommunityPostTrendData] = useState<CommunityPostTrendData[]>([])
  const [communityPostForecast, setCommunityPostForecast] = useState<CommunityPostForecast[]>([])
  const [chatRoomTrendData, setChatRoomTrendData] = useState<ChatRoomTrendData[]>([])
  const [chatRoomForecast, setChatRoomForecast] = useState<ChatRoomForecast[]>([])
  const [downloadTrendData, setDownloadTrendData] = useState<DownloadTrendResponse | null>(null)
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
  
  // 각 타입별 데이터 캐시 (날짜 범위별로 관리)
  const [dataCache, setDataCache] = useState<{
    [key: string]: {
      daily?: NewMemberTrendData[]
      weekly?: NewMemberTrendData[]
      monthly?: NewMemberTrendData[]
    }
  }>({})
  
  // 커뮤니티 게시물 데이터 캐시
  const [communityPostCache, setCommunityPostCache] = useState<{
    [key: string]: {
      daily?: CommunityPostTrendData[]
      weekly?: CommunityPostTrendData[]
      monthly?: CommunityPostTrendData[]
    }
  }>({})
  
  // 채팅방 데이터 캐시
  const [chatRoomCache, setChatRoomCache] = useState<{
    [key: string]: {
      daily?: ChatRoomTrendData[]
      weekly?: ChatRoomTrendData[]
      monthly?: ChatRoomTrendData[]
    }
  }>({})
  
  // 실행 추이 데이터 상태
  const [executionTrendData, setExecutionTrendData] = useState<ExecutionTrendResponse | null>(null)
  // 스캔 추이 데이터 상태
  const [scanTrendData, setScanTrendData] = useState<ScanTrendResponse | null>(null)
  
  // 캐시 키 생성 (날짜 범위 기반)
  const cacheKey = `${startDate}_${endDate}`

  const loadTargets = useCallback(async (newConfig?: TargetsConfig) => {
    if (newConfig) {
      // 새로운 설정이 전달되면 즉시 반영
      if (onTargetsUpdate) {
        onTargetsUpdate(newConfig)
      } else {
        setInternalTargetsConfig(newConfig)
      }
    } else {
      // 설정이 없으면 API에서 다시 로드
      const config = await getTargetsConfig()
      if (onTargetsUpdate) {
        onTargetsUpdate(config)
      } else {
        setInternalTargetsConfig(config)
      }
    }
  }, [onTargetsUpdate])

  useEffect(() => {
    if (!externalTargetsConfig) {
      loadTargets()
    }
  }, [externalTargetsConfig, loadTargets])

  // API에서 신규 회원 추이 데이터 가져오기 (캐싱 적용)
  useEffect(() => {
    const loadNewMemberTrend = async () => {
      const type = activeTab === 'daily' ? 'daily' : activeTab === 'weekly' ? 'weekly' : 'monthly'
      
      // 현재 날짜 범위의 캐시 확인
      const currentCache = dataCache[cacheKey]
      
      // 캐시에 해당 타입의 데이터가 있으면 캐시 사용
      if (currentCache && currentCache[type] && currentCache[type]!.length > 0) {
        console.log(`✅ 캐시에서 ${type} 데이터 사용 (날짜: ${cacheKey})`)
        setNewMemberTrendData(currentCache[type]!)
        return
      }
      
      // 캐시에 없으면 API 호출
      console.log(`📡 API에서 ${type} 데이터 가져오기 (날짜: ${startDate} ~ ${endDate})`)
      setLoading(true)
      try {
        const data = await fetchNewUserTrend(
          type,
          startDate,
          endDate
        )
        setNewMemberTrendData(data)
        
        // forecast 데이터 가져오기 (fetchNewUserTrend 내부에서 처리하도록 수정 필요)
        // 임시로 별도 호출
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
        
        // 캐시에 저장 (날짜 범위별로)
        setDataCache(prev => ({
          ...prev,
          [cacheKey]: {
            ...(prev[cacheKey] || {}),
            [type]: data
          }
        }))
      } catch (error) {
        console.error('Failed to load new member trend data:', error)
        setNewMemberTrendData([])
        setNewMemberForecast([])
      } finally {
        setLoading(false)
      }
    }
    loadNewMemberTrend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, startDate, endDate])

  // API에서 커뮤니티 게시물 추이 데이터 가져오기 (캐싱 적용)
  useEffect(() => {
    const loadCommunityPostTrend = async () => {
      const type = activeTab === 'daily' ? 'daily' : activeTab === 'weekly' ? 'weekly' : 'monthly'
      
      // 현재 날짜 범위의 캐시 확인
      const currentCache = communityPostCache[cacheKey]
      
      // 캐시에 해당 타입의 데이터가 있으면 캐시 사용
      if (currentCache && currentCache[type] && currentCache[type]!.length > 0) {
        console.log(`✅ 캐시에서 커뮤니티 게시물 ${type} 데이터 사용 (날짜: ${cacheKey})`)
        setCommunityPostTrendData(currentCache[type]!)
        return
      }
      
      // 캐시에 없으면 API 호출
      console.log(`📡 API에서 커뮤니티 게시물 ${type} 데이터 가져오기 (날짜: ${startDate} ~ ${endDate})`)
      setLoading(true)
      try {
        const data = await fetchCommunityPostTrend(
          type,
          startDate,
          endDate
        )
        setCommunityPostTrendData(data)
        
        // forecast 데이터 가져오기
        try {
          const timestamp = Date.now()
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analytics/community-post/trend?type=${type}&start_date=${startDate}&end_date=${endDate}&_t=${timestamp}`,
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
              setCommunityPostForecast(apiResponse.forecast)
            } else {
              setCommunityPostForecast([])
            }
          } else {
            setCommunityPostForecast([])
          }
        } catch (forecastError) {
          console.error('Failed to load community post forecast data:', forecastError)
          setCommunityPostForecast([])
        }
        
        // 캐시에 저장 (날짜 범위별로)
        setCommunityPostCache(prev => ({
          ...prev,
          [cacheKey]: {
            ...(prev[cacheKey] || {}),
            [type]: data
          }
        }))
      } catch (error) {
        console.error('❌ Failed to load community post trend data:', error)
        setCommunityPostTrendData([])
        setCommunityPostForecast([])
        // 에러 발생 시 기본 데이터 사용을 위해 빈 배열로 설정
      } finally {
        setLoading(false)
      }
    }
    loadCommunityPostTrend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, startDate, endDate])

  // API에서 채팅방 추이 데이터 가져오기 (캐싱 적용)
  useEffect(() => {
    const loadChatRoomTrend = async () => {
      const type = activeTab === 'daily' ? 'daily' : activeTab === 'weekly' ? 'weekly' : 'monthly'
      
      // 현재 날짜 범위의 캐시 확인
      const currentCache = chatRoomCache[cacheKey]
      
      // 캐시에 해당 타입의 데이터가 있으면 캐시 사용
      if (currentCache && currentCache[type] && currentCache[type]!.length > 0) {
        console.log(`✅ 캐시에서 채팅방 ${type} 데이터 사용 (날짜: ${cacheKey})`)
        setChatRoomTrendData(currentCache[type]!)
        return
      }
      
      // 캐시에 없으면 API 호출
      console.log(`📡 API에서 채팅방 ${type} 데이터 가져오기 (날짜: ${startDate} ~ ${endDate})`)
      setLoading(true)
      try {
        const { data, forecast } = await fetchChatRoomTrend(
          type,
          startDate,
          endDate
        )
        setChatRoomTrendData(data)
        setChatRoomForecast(forecast || [])
        
        // 캐시에 저장 (날짜 범위별로)
        setChatRoomCache(prev => ({
          ...prev,
          [cacheKey]: {
            ...(prev[cacheKey] || {}),
            [type]: data
          }
        }))
      } catch (error) {
        console.error('❌ Failed to load chat room trend data:', error)
        setChatRoomTrendData([])
        setChatRoomForecast([])
      } finally {
        setLoading(false)
      }
    }
    loadChatRoomTrend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, startDate, endDate])

  // API에서 다운로드 트렌드 데이터 가져오기
  useEffect(() => {
    const loadDownloadTrend = async () => {
      const type = activeTab === 'daily' ? 'daily' : activeTab === 'weekly' ? 'weekly' : 'monthly'
      
      console.log(`📡 API에서 다운로드 트렌드 ${type} 데이터 가져오기 (날짜: ${startDate} ~ ${endDate})`)
      setLoading(true)
      try {
        const data = await fetchDownloadTrend(
          type,
          startDate,
          endDate
        )
        setDownloadTrendData(data)
      } catch (error) {
        console.error('❌ Failed to load download trend data:', error)
        setDownloadTrendData(null)
      } finally {
        setLoading(false)
      }
    }
    loadDownloadTrend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, startDate, endDate])

  // API에서 실행 추이 데이터 가져오기
  useEffect(() => {
    const loadExecutionTrend = async () => {
      const type = activeTab === 'daily' ? 'daily' : activeTab === 'weekly' ? 'weekly' : 'monthly'
      
      console.log(`📡 API에서 실행 추이 ${type} 데이터 가져오기 (날짜: ${startDate} ~ ${endDate})`)
      setLoading(true)
      try {
        const data = await fetchExecutionTrend(
          type,
          startDate,
          endDate
        )
        console.log('✅ 실행 추이 데이터 로드 완료:', data)
        setExecutionTrendData(data)
      } catch (error) {
        console.error('❌ Failed to load execution trend data:', error)
        setExecutionTrendData(null)
      } finally {
        setLoading(false)
      }
    }
    loadExecutionTrend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, startDate, endDate])

  // API에서 스캔 추이 데이터 가져오기
  useEffect(() => {
    const loadScanTrend = async () => {
      const type = activeTab === 'daily' ? 'daily' : activeTab === 'weekly' ? 'weekly' : 'monthly'
      
      console.log(`📡 API에서 스캔 추이 ${type} 데이터 가져오기 (날짜: ${startDate} ~ ${endDate})`)
      setLoading(true)
      try {
        const data = await fetchScanTrend(
          type,
          startDate,
          endDate
        )
        console.log('✅ 스캔 추이 데이터 로드 완료:', data)
        setScanTrendData(data)
      } catch (error) {
        console.error('❌ Failed to load scan trend data:', error)
        setScanTrendData(null)
      } finally {
        setLoading(false)
      }
    }
    loadScanTrend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, startDate, endDate])

  // 날짜 범위 변경 시 캐시 초기화
  useEffect(() => {
    setDataCache({})
    setCommunityPostCache({})
    setChatRoomCache({})
  }, [startDate, endDate])

  // useMemo로 데이터 선택 최적화
  const currentDownloadData = useMemo(() => {
    switch (activeTab) {
      case "daily":
        return dailyDownloadData
      case "weekly":
        return weeklyDownloadData
      default:
        return monthlyDownloadData
    }
  }, [activeTab])

  // 실행 추이 데이터를 차트 형식으로 변환 (period별 appKind별 scanUsers 누적 막대그래프)
  const currentExecutionScanData = useMemo(() => {
    // API 데이터가 없거나 스캔 데이터가 없으면 빈 배열 반환
    if (!executionTrendData?.data || executionTrendData.data.length === 0) {
      console.log('⚠️ 실행 추이 데이터가 없습니다.')
      return []
    }
    
    if (!scanTrendData?.data || scanTrendData.data.length === 0) {
      console.log('⚠️ 스캔 추이 데이터가 없습니다.')
      return []
    }

    // period별로 그룹화 (실행, 스캔, 전환율 계산용)
    const periodMap = new Map<string, {
      date: string
      execution: number  // 실행: scanUsers 합계
      scan: number        // 스캔: activeUsers 합계
      HT: number
      COP: number
      GLOBAL: number
      [key: string]: string | number
    }>()

    console.log('🔍 [실행 추이 데이터] 총 개수:', executionTrendData.data.length)
    executionTrendData.data.forEach(item => {
      // appKind가 'TOTAL'이 아니고, period가 'TOTAL'이 아닌 것만 처리
      if (!item.period || item.period === 'TOTAL' || item.appKind === 'TOTAL') {
        console.log('⏭️ [실행 추이] 필터링됨:', { period: item.period, appKind: item.appKind })
        return
      }
      
      const period = item.period
      const appKind = item.appKind || 'OTHER'
      const activeUsers = item.activeUsers || 0
      const activeAppUsers = item.activeAppUsers || 0
      const activeAppUsersGrowthRate = item.activeAppUsersGrowthRate || 0

      // period 정규화: activeTab에 따라 다르게 처리
      let normalizedPeriod = period
      if (activeTab === 'monthly') {
        // 월별일 때만 월별 형식으로 정규화 (yyyy-MM-dd -> yyyy-MM)
        if (period.includes('-')) {
          if (period.length > 7) {
            // yyyy-MM-dd 형식이면 yyyy-MM으로 변환
            normalizedPeriod = period.substring(0, 7)
          } else if (period.length === 7) {
            // 이미 yyyy-MM 형식이면 그대로 사용
            normalizedPeriod = period
          }
        }
      } else {
        // 주별/일별일 때는 period를 그대로 사용
        normalizedPeriod = period
      }

      if (!periodMap.has(normalizedPeriod)) {
        periodMap.set(normalizedPeriod, {
          date: normalizedPeriod,
          execution: 0,  // 실행: activeUsers 합계
          scan: 0,        // 스캔: activeUsers 합계
          activeAppUsers: 0, // 회원 스캔 사용자 수
          HT: 0,
          COP: 0,
          GLOBAL: 0,
          OTHER: 0
        })
      }

      const periodData = periodMap.get(normalizedPeriod)!
      
      // 실행: activeUsers 합계 (월별 실행활성자 수) - 실행 API의 activeUsers
      periodData.execution += activeUsers
      
      // 회원 스캔 사용자 수: activeAppUsers 합계 (실행 API의 activeAppUsers는 스캔 사용자 중 회원 수)
      periodData.activeAppUsers = (periodData.activeAppUsers as number || 0) + activeAppUsers
      
      // appKind에 따라 분류 (누적 막대그래프용)
      if (appKind === 'HT' || appKind === '1') {
        periodData.HT += activeUsers
      } else if (appKind === 'COP' || appKind === '2') {
        periodData.COP += activeUsers
      } else if (appKind === 'GLOBAL' || appKind === '20') {
        periodData.GLOBAL += activeUsers
      } else {
        periodData.OTHER = (periodData.OTHER as number || 0) + activeUsers
      }
    })

    // 스캔 추이 데이터 처리 (월별 activeUsers의 앱별 합산값)
    // period가 'TOTAL'이 아닌 값들 중에서 같은 년-월의 activeUsers를 합산
    console.log('🔍 [스캔 추이 데이터] 총 개수:', scanTrendData?.data?.length || 0)
    if (scanTrendData?.data && scanTrendData.data.length > 0) {
      scanTrendData.data.forEach(item => {
        // appKind가 'TOTAL'이 아니고, period가 'TOTAL'이 아닌 것만 처리
        if (!item.period || item.period === 'TOTAL' || item.appKind === 'TOTAL') {
          console.log('⏭️ [스캔 추이] 필터링됨:', { period: item.period, appKind: item.appKind })
          return
        }
        
        const period = item.period
        const activeUsers = item.activeUsers || 0

        // period 정규화: activeTab에 따라 다르게 처리
        let normalizedPeriod = period
        if (activeTab === 'monthly') {
          // 월별일 때만 월별 형식으로 정규화 (yyyy-MM-dd -> yyyy-MM)
          if (period.includes('-')) {
            if (period.length > 7) {
              // yyyy-MM-dd 형식이면 yyyy-MM으로 변환
              normalizedPeriod = period.substring(0, 7)
            } else if (period.length === 7) {
              // 이미 yyyy-MM 형식이면 그대로 사용
              normalizedPeriod = period
            }
          }
        } else {
          // 주별/일별일 때는 period를 그대로 사용
          normalizedPeriod = period
        }

        if (!periodMap.has(normalizedPeriod)) {
          periodMap.set(normalizedPeriod, {
            date: normalizedPeriod,
            execution: 0,
            scan: 0,
            activeAppUsers: 0,
            HT: 0,
            COP: 0,
            GLOBAL: 0,
            OTHER: 0
          })
        }

        const periodData = periodMap.get(normalizedPeriod)!
        
        // 스캔: activeUsers 합계 (월별 스캔활성자 수) - 스캔 API의 activeUsers
        periodData.scan += activeUsers
      })
    }

    // 실행 forecast 데이터를 Map으로 변환
    const executionForecastMap = new Map<string, number>()
    if (executionTrendData?.forecast) {
      executionTrendData.forecast.forEach((item: any) => {
        if (item.date && item.predicted != null) {
          let normalizedDate = item.date
          if (activeTab === 'monthly' && item.date.length > 7) {
            normalizedDate = item.date.substring(0, 7)
          }
          executionForecastMap.set(normalizedDate, item.predicted)
        }
      })
    }
    
    // 스캔 forecast 데이터를 Map으로 변환
    const scanForecastMap = new Map<string, number>()
    if (scanTrendData?.forecast) {
      scanTrendData.forecast.forEach((item: any) => {
        if (item.date && item.predicted != null) {
          let normalizedDate = item.date
          if (activeTab === 'monthly' && item.date.length > 7) {
            normalizedDate = item.date.substring(0, 7)
          }
          scanForecastMap.set(normalizedDate, item.predicted)
        }
      })
    }
    
    // 날짜순으로 정렬 및 날짜 범위 필터링
    const allPeriods = Array.from(periodMap.keys())
    console.log('📅 [실행•스캔 추이] 모든 period:', allPeriods)
    console.log('📅 [실행•스캔 추이] 필터링 범위:', { startDate, endDate, activeTab })
    
    const sortedData = Array.from(periodMap.values())
      .filter(item => {
        // 날짜 범위 필터링: activeTab에 따라 다르게 처리
        let isInRange = false
        if (activeTab === 'monthly') {
          const itemDate = item.date.length > 7 ? item.date.substring(0, 7) : item.date
          const startMonth = startDate.substring(0, 7)
          const endMonth = endDate.substring(0, 7)
          isInRange = itemDate >= startMonth && itemDate <= endMonth
        } else if (activeTab === 'weekly') {
          isInRange = item.date >= startDate && item.date <= endDate
        } else {
          isInRange = item.date >= startDate && item.date <= endDate
        }
        return isInRange || executionForecastMap.has(item.date) || scanForecastMap.has(item.date)
      })
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA.getTime() - dateB.getTime()
      })
      .map(item => {
        // 날짜 형식 변환: activeTab에 따라 다르게 처리
        let formattedDate = item.date
        if (activeTab === 'monthly' && item.date.includes('-') && item.date.length > 7) {
          formattedDate = item.date.substring(0, 7)
        }
        
        const execution = item.execution || 0
        const scan = item.scan || 0
        const activeAppUsers = item.activeAppUsers || 0
        const conversionRate = execution > 0 ? (scan / execution) * 100 : 0
        
        // forecast에서 예측값 가져오기
        const executionPredicted = executionForecastMap.get(formattedDate) || null
        const scanPredicted = scanForecastMap.get(formattedDate) || null
        
        // 전환율(예측) 계산: executionPredicted와 scanPredicted가 모두 존재하는 경우
        const conversionRatePredicted = 
          executionPredicted != null && 
          scanPredicted != null && 
          executionPredicted > 0
            ? (scanPredicted / executionPredicted) * 100
            : null
        
        return {
          date: formattedDate,
          HT: item.HT || 0,
          COP: item.COP || 0,
          GLOBAL: item.GLOBAL || 0,
          OTHER: item.OTHER || 0,
          execution: execution,
          scan: scan,
          activeAppUsers: activeAppUsers,
          conversionRate: conversionRate,
          executionPredicted: executionPredicted,
          scanPredicted: scanPredicted,
          conversionRatePredicted: conversionRatePredicted
        }
      })

    // forecast에만 있고 periodMap에 없는 기간 추가 (미래 예측값)
    const allForecastDates = new Set([...executionForecastMap.keys(), ...scanForecastMap.keys()])
    allForecastDates.forEach((date) => {
      if (!periodMap.has(date)) {
        const isInRange = activeTab === 'monthly' 
          ? date >= startDate.substring(0, 7) && date <= endDate.substring(0, 7)
          : date >= startDate && date <= endDate
        const executionPredicted = executionForecastMap.get(date) || null
        const scanPredicted = scanForecastMap.get(date) || null
        
        // 전환율(예측) 계산: executionPredicted와 scanPredicted가 모두 존재하는 경우
        const conversionRatePredicted = 
          executionPredicted != null && 
          scanPredicted != null && 
          executionPredicted > 0
            ? (scanPredicted / executionPredicted) * 100
            : null
        
        if (isInRange || executionPredicted || scanPredicted) {
          sortedData.push({
            date: date,
            HT: null,
            COP: null,
            GLOBAL: null,
            OTHER: null,
            execution: null,
            scan: null,
            activeAppUsers: null,
            conversionRate: null,
            executionPredicted: executionPredicted,
            scanPredicted: scanPredicted,
            conversionRatePredicted: conversionRatePredicted
          })
        }
      }
    })
    
    // period 순서로 다시 정렬
    sortedData.sort((a, b) => a.date.localeCompare(b.date))

    return sortedData
  }, [executionTrendData, scanTrendData, activeTab, startDate, endDate])

  // 날짜 형식 변환 함수 (월별일 때 "00월" -> "yyyy-MM" 형식)
  const formatDateToYYYYMM = (dateStr: string, type: string): string => {
    if (type === 'monthly') {
      // 이미 yyyy-MM 형식인 경우
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        return dateStr
      }
      
      // "00월" 형식인 경우 (예: "7월", "12월")
      const monthMatch = dateStr.match(/(\d+)월/)
      if (monthMatch) {
        const month = parseInt(monthMatch[1], 10)
        // 현재 날짜 기준으로 년도 추정 (startDate와 endDate 사용)
        const currentYear = new Date().getFullYear()
        const startYear = startDate ? parseInt(startDate.substring(0, 4), 10) : currentYear
        // 월이 1-6이면 올해, 7-12면 작년 또는 올해
        const year = month >= 7 ? startYear : startYear
        return `${year}-${String(month).padStart(2, '0')}`
      }
      
      // yyyy-MM-dd 형식인 경우
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr.substring(0, 7)
      }
    } else if (type === 'daily') {
      // 일별일 때 yyyy-MM-dd 형식으로 변환
      // 이미 yyyy-MM-dd 형식인 경우
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr
      }
      // yyyyMMdd 형식인 경우
      if (/^\d{8}$/.test(dateStr)) {
        return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
      }
      // yyyy-MM 형식인 경우 (일별 데이터가 아닌 경우)
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        return dateStr
      }
    }
    
    // 주별은 그대로 반환 (정렬은 별도 처리)
    return dateStr
  }

  // 날짜 정렬 함수 (원본 period 값 기준으로 YYYY-MM-DD 형식으로 정렬)
  const sortByDate = (a: { date: string; period?: string }, b: { date: string; period?: string }, type: string): number => {
    // period 필드가 있으면 우선 사용 (YYYY-MM-DD 형식)
    if (a.period && b.period) {
      return a.period.localeCompare(b.period)
    }
    
    // period가 하나만 있는 경우
    if (a.period && !b.period) {
      return -1 // a가 앞
    }
    if (!a.period && b.period) {
      return 1 // b가 앞
    }
    
    // period가 없으면 date 필드로 정렬 (fallback)
    // yyyy-MM-dd 형식인 경우
    if (/^\d{4}-\d{2}-\d{2}$/.test(a.date) && /^\d{4}-\d{2}-\d{2}$/.test(b.date)) {
      return a.date.localeCompare(b.date)
    }
    
    // yyyy-MM 형식인 경우 (월별)
    if (/^\d{4}-\d{2}$/.test(a.date) && /^\d{4}-\d{2}$/.test(b.date)) {
      return a.date.localeCompare(b.date)
    }
    
    // 기본적으로 문자열 비교
    return a.date.localeCompare(b.date)
  }

  const currentNewMemberData = useMemo(() => {
    console.log('🔍 currentNewMemberData 계산:', {
      newMemberTrendDataLength: newMemberTrendData.length,
      newMemberForecastLength: newMemberForecast.length,
      activeTab
    })
    
    // forecast 데이터를 Map으로 변환 (date별 predicted 매핑)
    const forecastMap = new Map<string, number>()
    newMemberForecast.forEach((item) => {
      if (item.date && item.predicted != null) {
        let normalizedDate = item.date.trim()
        // activeTab에 따라 날짜 형식 정규화
        if (activeTab === 'monthly') {
          // 월별: YYYY-MM 형식으로 정규화
          if (normalizedDate.length >= 7) {
            normalizedDate = normalizedDate.substring(0, 7)
          }
        } else if (activeTab === 'daily') {
          // 일별: YYYY-MM-DD 형식으로 정규화
          if (normalizedDate.length >= 10) {
            normalizedDate = normalizedDate.substring(0, 10)
          }
        } else if (activeTab === 'weekly') {
          // 주별: YYYY-MM-DD 형식으로 정규화 (주 시작일 기준)
          if (normalizedDate.length >= 10) {
            normalizedDate = normalizedDate.substring(0, 10)
          }
        }
        forecastMap.set(normalizedDate, item.predicted)
      }
    })
    
    console.log('📊 Forecast 데이터 매핑:', {
      forecastCount: newMemberForecast.length,
      forecastMapSize: forecastMap.size,
      forecastMapEntries: Array.from(forecastMap.entries()).slice(0, 5),
      activeTab
    })
    
    // API에서 가져온 데이터를 사용하되, 없으면 기본 데이터 사용
    if (newMemberTrendData.length > 0) {
      console.log('✅ API 데이터 사용 (신규회원):', newMemberTrendData.slice(0, 3))
      // API 데이터를 기존 형식으로 변환 (app + commerce 합산)
      const result = newMemberTrendData
        .map(item => {
          const app = (item.ht || 0) + (item.cop || 0) + (item.global || 0) + (item.etc || 0)
          const commerce = item.commerce || 0
          const total = app + commerce // 월별 합계 (앱 + 커머스)
          
          const formattedDate = formatDateToYYYYMM(item.date, activeTab)
          const period = item.period || formattedDate
          const periodStr = typeof period === 'string' ? period : formattedDate
          
          // period를 forecast와 매칭하기 위한 정규화
          let normalizedPeriod = periodStr
          if (activeTab === 'monthly' && periodStr.length >= 7) {
            normalizedPeriod = periodStr.substring(0, 7) // YYYY-MM
          } else if (activeTab === 'daily' && periodStr.length >= 10) {
            normalizedPeriod = periodStr.substring(0, 10) // YYYY-MM-DD
          } else if (activeTab === 'weekly' && periodStr.length >= 10) {
            normalizedPeriod = periodStr.substring(0, 10) // YYYY-MM-DD (주 시작일)
          }
          
          // forecast에서 예측값 가져오기 (여러 형식으로 시도)
          let predictedTotal = forecastMap.get(normalizedPeriod) || null
          
          // 매칭 실패 시 다른 형식으로 재시도
          if (predictedTotal === null && periodStr) {
            // 원본 period로 직접 시도
            predictedTotal = forecastMap.get(periodStr) || null
            // formattedDate로도 시도
            if (predictedTotal === null) {
              predictedTotal = forecastMap.get(formattedDate) || null
            }
          }
          
          return {
            date: formattedDate,
            period: period,  // 원본 period 유지 (정렬용)
            app: app,
            commerce: commerce,
            cumulative: total, // 월별 합계 (app + commerce)
            cumulativePredicted: predictedTotal, // 예측 월별 합계
            appPredicted: null,
            commercePredicted: null
          } as { [key: string]: string | number | null; date: string }
        })
        .sort((a, b) => sortByDate(a, b, activeTab)) // 원본 period 기준으로 정렬 (YYYY-MM-DD)
      
      // forecast에만 있고 기존 데이터에 없는 기간 추가
      forecastMap.forEach((predicted, date) => {
        const exists = result.some(item => {
          const itemPeriod = item.period || item.date
          const itemPeriodStr = typeof itemPeriod === 'string' ? itemPeriod : (typeof item.date === 'string' ? item.date : '')
          const normalizedItemPeriod = activeTab === 'monthly' && itemPeriodStr.length > 7 
            ? itemPeriodStr.substring(0, 7) 
            : (activeTab === 'daily' && itemPeriodStr.length > 10 
              ? itemPeriodStr.substring(0, 10) 
              : itemPeriodStr)
          return normalizedItemPeriod === date
        })
        if (!exists) {
          result.push({
            date: date,
            period: date,
            app: null,
            commerce: null,
            cumulative: null,
            cumulativePredicted: predicted,
            appPredicted: null,
            commercePredicted: null
          } as { [key: string]: string | number | null; date: string })
        }
      })
      
      // 다시 정렬
      result.sort((a, b) => sortByDate(a, b, activeTab))
      
      console.log('✅ 변환된 신규회원 데이터:', result.slice(0, 3))
      return result
    }
    
    // 기본 데이터 (fallback)
    console.log('⚠️ 기본 데이터 사용 (신규회원 fallback)')
    switch (activeTab) {
      case "daily":
        return dailyNewMemberData
      case "weekly":
        return weeklyNewMemberData
      default:
        return monthlyNewMemberData
    }
  }, [activeTab, newMemberTrendData, newMemberForecast])

  const currentCommunityActivityData = useMemo(() => {
    console.log('🔍 currentCommunityActivityData 계산:', {
      communityPostTrendDataLength: communityPostTrendData.length,
      communityViewType,
      activeTab
    })
    
    // forecast 데이터를 Map으로 변환
    const communityPostForecastMap = new Map<string, number>()
    communityPostForecast.forEach((item) => {
      if (item.date && item.predicted != null) {
        let normalizedDate = item.date
        if (activeTab === 'monthly' && item.date.length > 7) {
          normalizedDate = item.date.substring(0, 7)
        } else if (activeTab === 'daily' && item.date.length > 10) {
          normalizedDate = item.date.substring(0, 10)
        }
        communityPostForecastMap.set(normalizedDate, item.predicted)
      }
    })
    
    const chatRoomForecastMap = new Map<string, number>()
    chatRoomForecast.forEach((item) => {
      if (item.date && item.predicted != null) {
        let normalizedDate = item.date
        if (activeTab === 'monthly' && item.date.length > 7) {
          normalizedDate = item.date.substring(0, 7)
        } else if (activeTab === 'daily' && item.date.length > 10) {
          normalizedDate = item.date.substring(0, 10)
        }
        chatRoomForecastMap.set(normalizedDate, item.predicted)
      }
    })
    
    // API에서 가져온 데이터가 있으면 사용
    if (communityPostTrendData.length > 0 || chatRoomTrendData.length > 0) {
      console.log('✅ API 데이터 사용:', {
        communityPost: communityPostTrendData.length,
        chatRoom: chatRoomTrendData.length
      })
      
      if (communityViewType === "all") {
        // 전체인 경우: 커뮤니티 게시물과 채팅방 데이터를 함께 표시
        // 날짜별로 매칭하여 데이터 합치기
        const dateMap = new Map<string, { communityPosts: number, newChatRooms: number }>()
        
        // 커뮤니티 게시물 데이터 추가 (period를 키로 사용하여 정렬 보장)
        const periodMap = new Map<string, { 
          date: string
          period: string
          communityPosts: number
          newChatRooms: number 
        }>()
        
        communityPostTrendData.forEach(item => {
          // period가 없으면 date에서 추출 시도 (YYYY-MM-DD 형식이어야 함)
          const period = item.period || (item.date.match(/^\d{4}-\d{2}-\d{2}$/) ? item.date : item.date)
          // 일별일 때는 period(원본 날짜)를 사용, 그 외에는 formatDateToYYYYMM 사용
          const formattedDate = activeTab === 'daily' && item.period 
            ? item.period 
            : formatDateToYYYYMM(item.date, activeTab)
          periodMap.set(period, { 
            date: formattedDate,
            period: period,
            communityPosts: item.communityPosts ?? 0, 
            newChatRooms: 0 
          })
        })
        
        // 채팅방 데이터 추가 (있으면)
        if (chatRoomTrendData.length > 0) {
          chatRoomTrendData.forEach(item => {
            // period가 없으면 date에서 추출 시도 (YYYY-MM-DD 형식이어야 함)
            const period = item.period || (item.date.match(/^\d{4}-\d{2}-\d{2}$/) ? item.date : item.date)
            // 일별일 때는 period(원본 날짜)를 사용, 그 외에는 formatDateToYYYYMM 사용
            const formattedDate = activeTab === 'daily' && item.period 
              ? item.period 
              : formatDateToYYYYMM(item.date, activeTab)
            const existing = periodMap.get(period)
            if (existing) {
              existing.newChatRooms = item.roomCount ?? 0
            } else {
              periodMap.set(period, { 
                date: formattedDate,
                period: period,
                communityPosts: 0, 
                newChatRooms: item.roomCount ?? 0 
              })
            }
          })
        }
        
        // period 기준으로 정렬 (YYYY-MM-DD 형식)
        const sortedEntries = Array.from(periodMap.entries())
          .sort((a, b) => a[1].period.localeCompare(b[1].period))
        
        const result = sortedEntries.map(([_, data]) => {
          // period 정규화 (forecast 매칭용)
          const normalizedPeriod = activeTab === 'monthly' && data.period.length > 7 
            ? data.period.substring(0, 7) 
            : (activeTab === 'daily' && data.period.length > 10 
              ? data.period.substring(0, 10) 
              : data.period)
          
          // forecast에서 예측값 가져오기
          const communityPostsPredicted = communityPostForecastMap.get(normalizedPeriod) || null
          const newChatRoomsPredicted = chatRoomForecastMap.get(normalizedPeriod) || null
          
          return {
            date: data.date,
            period: data.period,
            communityPosts: data.communityPosts,
            newChatRooms: data.newChatRooms,
            qa: null,
            review: null,
            tips: null,
            trade: null,
            oneOnOne: null,
            tradingChat: null,
            communityPostsPredicted: communityPostsPredicted,
            newChatRoomsPredicted: newChatRoomsPredicted,
            qaPredicted: null,
            reviewPredicted: null,
            tipsPredicted: null,
            tradePredicted: null,
            oneOnOnePredicted: null,
            tradingChatPredicted: null
          } as { [key: string]: string | number | null; date: string }
        })
        
        // forecast에만 있고 기존 데이터에 없는 기간 추가
        const allForecastDates = new Set([...communityPostForecastMap.keys(), ...chatRoomForecastMap.keys()])
        allForecastDates.forEach((date) => {
          const exists = result.some(item => {
            const itemPeriod = item.period || item.date
            const itemPeriodStr = typeof itemPeriod === 'string' ? itemPeriod : (typeof item.date === 'string' ? item.date : '')
            const normalizedItemPeriod = activeTab === 'monthly' && itemPeriodStr.length > 7 
              ? itemPeriodStr.substring(0, 7) 
              : (activeTab === 'daily' && itemPeriodStr.length > 10 
                ? itemPeriodStr.substring(0, 10) 
                : itemPeriodStr)
            return normalizedItemPeriod === date
          })
          if (!exists) {
            const communityPostsPredicted = communityPostForecastMap.get(date) || null
            const newChatRoomsPredicted = chatRoomForecastMap.get(date) || null
            result.push({
              date: date,
              period: date,
              communityPosts: null,
              newChatRooms: null,
              qa: null,
              review: null,
              tips: null,
              trade: null,
              oneOnOne: null,
              tradingChat: null,
              communityPostsPredicted: communityPostsPredicted,
              newChatRoomsPredicted: newChatRoomsPredicted,
              qaPredicted: null,
              reviewPredicted: null,
              tipsPredicted: null,
              tradePredicted: null,
              oneOnOnePredicted: null,
              tradingChatPredicted: null
            } as { [key: string]: string | number | null; date: string })
          }
        })
        
        // 다시 정렬
        result.sort((a, b) => sortByDate(a, b, activeTab))
        console.log('✅ 전체 보기 데이터 (커뮤니티 + 채팅방):', result.slice(0, 3))
        return result
      } else if (communityViewType === "chat") {
        // 채팅인 경우: chatRoomType별 추이
        if (chatRoomTrendData.length > 0) {
          const result = chatRoomTrendData
            .map(item => ({
              date: activeTab === 'daily' && item.period 
                ? item.period 
                : formatDateToYYYYMM(item.date, activeTab),
              period: item.period || null,  // 원본 period 유지 (정렬용)
              communityPosts: null,
              newChatRooms: null,
              qa: null,
              review: null,
              tips: null,
              trade: null,
              oneOnOne: item.oneOnOne ?? 0,
              tradingChat: item.tradingChat ?? 0,
              communityPostsPredicted: null,
              newChatRoomsPredicted: null,
              qaPredicted: null,
              reviewPredicted: null,
              tipsPredicted: null,
              tradePredicted: null,
              oneOnOnePredicted: null,
              tradingChatPredicted: null
            } as { [key: string]: string | number | null; date: string }))
            .sort((a, b) => sortByDate(a, b, activeTab)) // 원본 period 기준으로 정렬 (YYYY-MM-DD)
          console.log('✅ 채팅 보기 데이터:', result.slice(0, 3))
          return result
        }
      } else if (communityViewType === "community") {
        // 커뮤니티인 경우: 각 statusKey별 추이
        const result = communityPostTrendData
          .map(item => ({
            date: activeTab === 'daily' && item.period 
              ? item.period 
              : formatDateToYYYYMM(item.date, activeTab),
            period: item.period || null,  // 원본 period 유지 (정렬용)
            communityPosts: null,
            newChatRooms: null,
            qa: item.qa ?? 0,
            review: item.review ?? 0,
            tips: item.tips ?? 0,
            trade: item.trade ?? 0,
            oneOnOne: null,
            tradingChat: null,
            communityPostsPredicted: null,
            newChatRoomsPredicted: null,
            qaPredicted: null,
            reviewPredicted: null,
            tipsPredicted: null,
            tradePredicted: null,
            oneOnOnePredicted: null,
            tradingChatPredicted: null
          } as { [key: string]: string | number | null; date: string }))
          .sort((a, b) => sortByDate(a, b, activeTab)) // 원본 period 기준으로 정렬 (YYYY-MM-DD)
        console.log('✅ 커뮤니티 보기 데이터:', result.slice(0, 3))
        return result
      }
    }
    
    // 기본 데이터 (fallback)
    console.log('⚠️ 기본 데이터 사용 (fallback)')
    switch (activeTab) {
      case "daily":
        return dailyCommunityActivityData
      case "weekly":
        return weeklyCommunityActivityData
      default:
        return monthlyCommunityActivityData
    }
  }, [activeTab, communityPostTrendData, chatRoomTrendData, communityViewType, communityPostForecast, chatRoomForecast])

  const currentSignupMethodData = useMemo(() => {
    switch (activeTab) {
      case "daily":
        return dailySignupMethodData
      case "weekly":
        return weeklySignupMethodData
      default:
        return monthlySignupMethodData
    }
  }, [activeTab])

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
                  // API 데이터에서 실제 다운로드 수 계산
                  let currentTotal = 0
                  
                  if (downloadTrendData?.data && downloadTrendData.data.length > 0) {
                    // type이 "AppTrend"인 데이터만 필터링 (실제 다운로드 수)
                    const appTrendData = downloadTrendData.data.filter(
                      (item: any) => item.type === "AppTrend" && item.totalDownloads !== null && item.totalDownloads !== undefined
                    )
                    
                    if (appTrendData.length > 0) {
                      // 최신 period 찾기
                      const periods = [...new Set(appTrendData.map((item: any) => item.period).filter(Boolean))].sort()
                      const latestPeriod = periods[periods.length - 1]
                      
                      if (latestPeriod) {
                        // 최신 period의 모든 appGubun별 totalDownloads 합계
                        currentTotal = appTrendData
                          .filter((item: any) => item.period === latestPeriod)
                          .reduce((sum: number, item: any) => sum + (item.totalDownloads || 0), 0)
                      }
                    }
                  }
                  
                  // API 데이터가 없으면 mock 데이터 사용 (fallback)
                  if (currentTotal === 0) {
                    const downloadData = currentDownloadData
                    const lastData = downloadData.filter(d => d.total !== null).pop() || downloadData[downloadData.length - 1]
                    currentTotal = lastData.total || lastData.totalPredicted || 0
                  }
                  
                  // targetsConfig에서 다운로드 목표 가져오기 (우선순위: targets.json > 월별 mock 데이터 > 기본값)
                  // 목표 값은 항상 월별 기준으로 고정
                  const target = targetsConfig?.download?.value || monthlyDownloadData[0]?.target || 1500000
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
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{target.toLocaleString()} 건</p>
                          {/* {targetsConfig && (
                            <TargetEditModal 
                              targetsConfig={targetsConfig} 
                              onSave={loadTargets}
                            />
                          )} */}
                        </div>
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
              {(() => {
                // type이 "AppTrend" 또는 "monthly"인 데이터 필터링 (예측 데이터 포함)
                const appTrendData = downloadTrendData?.data?.filter(
                  (item: any) => item.type === "AppTrend" || item.type === "monthly"
                ) || []
                
                console.log('📊 다운로드 추이 차트 데이터:', {
                  hasDownloadTrendData: !!downloadTrendData,
                  appTrendDataCount: appTrendData.length,
                  downloadTrendDataLength: downloadTrendData?.data?.length || 0,
                  marketSummaryCount: downloadTrendData?.data?.filter((item: any) => item.type === "MarketSummary").length || 0
                })
                
                // appGubun 이름 매핑 (lib/api.ts의 APP_GUBUN_MAP 사용)
                const appNames: Record<number, string> = {
                  1: "HT",
                  2: "COP",
                  3: "어바웃미",
                  5: "스키니온",
                  8: "휴롬",
                  11: "마사",
                  20: "Global"
                }
                const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#14b8a6", "#a855f7", "#eab308"]
                
                let chartData: any[]
                let appGubunKeys: number[]
                
                if (appTrendData.length === 0) {
                  // API 데이터가 없으면 기존 데이터 사용 (date 키를 period로 변환)
                  chartData = currentDownloadData.map(d => {
                    // 예측치를 제외한 총 다운로드 수 계산 (total 사용, totalPredicted 제외)
                    const totalDownloads = d.total || 0
                    return { ...d, period: d.date, totalDownloads }
                  })
                  appGubunKeys = [1, 2, 3, 5, 8, 11, 20] // fallback용
                  console.log('📊 Fallback 데이터 사용:', chartData.length, '개 항목')
                } else {
                  // period별로 그룹화: 앱별 totalDownloads
                  const periodMap = new Map<string, { downloads: Record<number, number> }>()
                  const allAppGubuns = new Set<number>()
                  
                  appTrendData.forEach((item: any) => {
                    if (item.type !== "AppTrend" || !item.period) return
                    
                    if (!periodMap.has(item.period)) {
                      periodMap.set(item.period, { downloads: {} })
                    }
                    const periodData = periodMap.get(item.period)!
                    
                    // appGubun별 totalDownloads 수집 (막대그래프용)
                    if (item.appGubun != null && item.totalDownloads != null) {
                      allAppGubuns.add(item.appGubun)
                      periodData.downloads[item.appGubun] = (periodData.downloads[item.appGubun] || 0) + item.totalDownloads
                    }
                  })
                  
                  appGubunKeys = Array.from(allAppGubuns).sort((a, b) => a - b)
                  
                  // forecast 데이터를 Map으로 변환 (period별 predicted 매핑)
                  const forecastMap = new Map<string, number>()
                  if (downloadTrendData?.forecast) {
                    downloadTrendData.forecast.forEach((item: any) => {
                      if (item.date && item.predicted != null) {
                        forecastMap.set(item.date, item.predicted)
                      }
                    })
                  }
                  
                  // period별 차트 데이터 생성
                  chartData = Array.from(periodMap.entries())
                    .filter(([period]) => {
                      const isInRange = activeTab === 'monthly' 
                        ? period >= startDate.substring(0, 7) && period <= endDate.substring(0, 7)
                        : period >= startDate && period <= endDate
                      return isInRange || forecastMap.has(period)
                    })
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([period, periodData]) => {
                      const totalDownloads = appGubunKeys.reduce((sum, appGubun) => 
                        sum + (periodData.downloads[appGubun] || 0), 0
                      )
                      
                      const data: Record<string, string | number | boolean> = { period }
                      
                      // 막대그래프: totalDownloads가 있는 경우만 표시
                      appGubunKeys.forEach(appGubun => {
                        data[`app${appGubun}`] = periodData.downloads[appGubun] || 0
                      })
                      data.totalDownloads = totalDownloads
                      
                      // 점선: forecast의 predicted 사용 (period와 일치하는 경우)
                      data.predictTotal = forecastMap.get(period) || null
                      
                      return data
                    })
                  
                  // forecast에만 있고 periodMap에 없는 기간 추가 (미래 예측값)
                  forecastMap.forEach((predicted, date) => {
                    if (!periodMap.has(date)) {
                      const isInRange = activeTab === 'monthly' 
                        ? date >= startDate.substring(0, 7) && date <= endDate.substring(0, 7)
                        : date >= startDate && date <= endDate
                      if (isInRange || predicted > 0) {
                        const data: Record<string, string | number | boolean | null> = { period: date }
                        appGubunKeys.forEach(appGubun => {
                          data[`app${appGubun}`] = null
                        })
                        data.totalDownloads = null
                        data.predictTotal = predicted
                        chartData.push(data)
                      }
                    }
                  })
                  
                  // period 순서로 다시 정렬
                  chartData.sort((a, b) => a.period.localeCompare(b.period))
                  console.log('📊 차트 데이터 (날짜 범위 필터링 적용):', {
                    totalPeriods: chartData.length,
                    periods: chartData.map(d => d.period),
                    startDate: startDate,
                    endDate: endDate,
                    selectedStartDate: dateRange?.from ? formatDateForAPI(dateRange.from) : 'N/A',
                    selectedEndDate: dateRange?.to ? formatDateForAPI(dateRange.to) : 'N/A'
                  })
                  
                  console.log('📊 차트 데이터 생성 완료:', {
                    periodCount: chartData.length,
                    appGubunCount: appGubunKeys.length,
                    appGubuns: appGubunKeys,
                    periods: chartData.map(d => d.period),
                    sampleData: chartData[0]
                  })
                }
                
                // 다운로드 추이 Y축 설정 계산
                const downloadDataKeys = [
                  ...appGubunKeys.map(appGubun => `app${appGubun}`),
                  'totalDownloads',
                  'predictTotal'
                ]
                const downloadYAxisConfig = useTrendChartConfig(chartData, downloadDataKeys, activeTab)

                // 다운로드 추이 차트용 커스텀 툴팁 (통일된 스타일 + 총 다운로드 수 추가)
                const DownloadTooltip = ({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    const totalDownloads = payload[0]?.payload?.totalDownloads || 0
                    const predictTotal = payload[0]?.payload?.predictTotal || 0
                    const baseTooltip = downloadYAxisConfig.unifiedTooltip({ active, payload, label })
                    
                    if (baseTooltip && totalDownloads > 0) {
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          {baseTooltip.props.children[0]} {/* 날짜 라벨 */}
                          {baseTooltip.props.children[1]} {/* 데이터 항목들 */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            marginTop: '8px',
                            paddingTop: '8px',
                            borderTop: '1px solid hsl(var(--border))'
                          }}>
                            <span className="text-sm font-semibold text-foreground" style={{ textAlign: 'left' }}>
                              총 다운로드 수 (예측치 제외):
                            </span>
                            <span className="text-sm font-bold text-foreground" style={{ textAlign: 'right' }}>
                              {totalDownloads.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )
                    }
                    return baseTooltip
                  }
                  return null
                }

                return (
                  <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tickFormatter={(value) => activeTab === 'weekly' ? formatWeeklyDate(value) : value}
                      stroke="#737373"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis {...downloadYAxisConfig.yAxisProps} />
                    <Tooltip content={<DownloadTooltip />} />
                    <Legend content={<CustomLegend />} />
                    {appGubunKeys.map((appGubun: number, index: number) => {
                      const appName = appNames[appGubun] || `앱${appGubun}`
                      const color = colors[index % colors.length]
                      return (
                        <Bar 
                          key={appGubun} 
                          dataKey={`app${appGubun}`} 
                          stackId="a" 
                          fill={color} 
                          name={appName}
                        />
                      )
                    })}
                    <Line 
                      type="monotone" 
                      dataKey="predictTotal" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="예측치"
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  </ComposedChart>
                )
              })()}
            </ResponsiveContainer>
          </div>
        </Card>
        {/* 실행,스캔 추이 그래프 */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            {/* 지표 카드들 */}
            {(() => {
              // 실제값이 0이 아닌 가장 최근 월의 데이터를 찾음
              const findLastNonZeroData = (dataArray: any[], key: string) => {
                for (let i = dataArray.length - 1; i >= 0; i--) {
                  if (dataArray[i] && dataArray[i][key] > 0) {
                    return dataArray[i]
                  }
                }
                return dataArray.length > 0 ? dataArray[dataArray.length - 1] : null
              }
              
              const lastExecutionData = findLastNonZeroData(currentExecutionScanData, 'execution')
              const lastScanData = findLastNonZeroData(currentExecutionScanData, 'scan')
              const lastConversionData = findLastNonZeroData(currentExecutionScanData, 'conversionRate')
              
              const executionValue = lastExecutionData?.execution || 0
              const scanValue = lastScanData?.scan || 0
              const conversionRateValue = lastConversionData?.conversionRate || 0
              
              const executionTarget = targetsConfig?.execution?.value || 0
              const scanTarget = targetsConfig?.scan?.value || 0
              const conversionRateTarget = targetsConfig?.conversionRate?.value || 0
              
              const executionRate = executionTarget > 0 ? ((executionValue / executionTarget) * 100) : 0
              const scanRate = scanTarget > 0 ? ((scanValue / scanTarget) * 100) : 0
              const conversionRateAchievement = conversionRateTarget > 0 ? ((conversionRateValue / conversionRateTarget) * 100) : 0
              
              return (
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex flex-col space-y-2">
                      <div className={`text-3xl font-bold ${getColorByRate(executionRate).text}`}>{executionRate.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${getColorByRate(executionRate).bg} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(executionRate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">실행 활성자 수 목표</p>
                        <p className="text-xs text-muted-foreground">{executionTarget.toLocaleString()} 명</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex flex-col space-y-2">
                      <div className={`text-3xl font-bold ${getColorByRate(scanRate).text}`}>{scanRate.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${getColorByRate(scanRate).bg} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(scanRate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">스캔 활성자 수 목표</p>
                        <p className="text-xs text-muted-foreground">{scanTarget.toLocaleString()} 명</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex flex-col space-y-2">
                      <div className={`text-3xl font-bold ${getColorByRate(conversionRateAchievement).text}`}>{conversionRateAchievement.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${getColorByRate(conversionRateAchievement).bg} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(conversionRateAchievement, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">실행→스캔 전환율 목표</p>
                        <p className="text-xs text-muted-foreground">{conversionRateTarget.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

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
            {(() => {
              // 실행•스캔 활성자 추이 Y축 설정 계산
              const executionScanYAxisConfig = useTrendChartConfig(
                currentExecutionScanData,
                ["execution", "scan", "executionPredicted", "scanPredicted"],
                activeTab
              )

              return (
                <TrendChart
                  data={currentExecutionScanData}
                  lines={[
                    { dataKey: "execution", name: "실행", color: "#3b82f6", yAxisId: "left" },
                    { dataKey: "executionPredicted", name: "실행 (예측)", color: "#3b82f6", strokeDasharray: "5 5", yAxisId: "left" },
                    { dataKey: "scan", name: "스캔", color: "#10b981", yAxisId: "left" },
                    { dataKey: "scanPredicted", name: "스캔 (예측)", color: "#10b981", strokeDasharray: "5 5", yAxisId: "left" },
                  ]}
                  bars={[
                    { dataKey: "conversionRate", name: "전환율", color: "#f59e0b", yAxisId: "right" },
                    { dataKey: "conversionRatePredicted", name: "전환율(예측)", color: "rgba(253, 195, 95, 0.32)", yAxisId: "right" }
                  ]}
                  targets={[]}
                  height={300}
                  rightDomain={[0, 100]}
                  activeTab={activeTab}
                  leftDomain={executionScanYAxisConfig.yAxisConfig.domain}
                  leftTicks={executionScanYAxisConfig.yAxisConfig.ticks}
                />
              )
            })()}
          </div>
        </Card>

        {/* 신규 회원 추이 */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            {/* 신규 회원 수 메트릭 카드 */}
            {(() => {
              // 실제값이 0이 아닌 가장 최근 월의 데이터를 찾음
              const findLastNonZeroData = (dataArray: any[], key: string) => {
                for (let i = dataArray.length - 1; i >= 0; i--) {
                  if (dataArray[i] && dataArray[i][key] > 0) {
                    return dataArray[i]
                  }
                }
                return dataArray.length > 0 ? dataArray[dataArray.length - 1] : null
              }
              
              const lastAppData = findLastNonZeroData(currentNewMemberData, 'app')
              const lastCommerceData = findLastNonZeroData(currentNewMemberData, 'commerce')
              
              const appInflowValue = Number(lastAppData?.app) || 0
              const commerceInflowValue = Number(lastCommerceData?.commerce) || 0
              
              const appInflowTarget = targetsConfig?.appInflow?.value || 0
              const commerceInflowTarget = targetsConfig?.commerceInflow?.value || 0
              
              const appInflowRate = appInflowTarget > 0 ? ((appInflowValue / appInflowTarget) * 100) : 0
              const commerceInflowRate = commerceInflowTarget > 0 ? ((commerceInflowValue / commerceInflowTarget) * 100) : 0
              
              return (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex flex-col space-y-2">
                      <div className={`text-3xl font-bold ${getColorByRate(appInflowRate).text}`}>{appInflowRate.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${getColorByRate(appInflowRate).bg} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(appInflowRate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">3종 앱 유입 목표</p>
                        <p className="text-xs text-muted-foreground">{appInflowTarget.toLocaleString()} 명</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex flex-col space-y-2">
                      <div className={`text-3xl font-bold ${getColorByRate(commerceInflowRate).text}`}>{commerceInflowRate.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${getColorByRate(commerceInflowRate).bg} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(commerceInflowRate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">커머스 유입 목표</p>
                        <p className="text-xs text-muted-foreground">{commerceInflowTarget.toLocaleString()} 명</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              <h3 className="text-2xl font-semibold text-foreground">신규 회원 추이</h3>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                  <TabsTrigger value="monthly">월별</TabsTrigger>
                  <TabsTrigger value="weekly">주별</TabsTrigger>
                  <TabsTrigger value="daily">일별</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {(() => {
              // 신규 회원 추이 Y축 설정 계산
              const newMemberYAxisConfig = useTrendChartConfig(
                currentNewMemberData,
                ["app", "commerce", "appPredicted", "commercePredicted"],
                activeTab
              )

              return (
                <ResponsiveContainer width="100%" height={300}>
                  {memberViewType === "total" ? (
                    <ComposedChart 
                      data={currentNewMemberData}
                      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => {
                          // activeTab에 따라 다르게 처리
                          if (activeTab === 'weekly') {
                            // 주별일 때 "00월0주" 형식으로 변환
                            return formatWeeklyDate(value)
                          } else if (activeTab === 'daily') {
                            // 일별일 때 yyyy-MM-dd 형식 유지
                            if (typeof value === 'string') {
                              // yyyy-MM-dd 형식인 경우 그대로 반환
                              if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                                return value
                              }
                              // yyyyMMdd 형식인 경우
                              if (/^\d{8}$/.test(value)) {
                                return `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`
                              }
                            }
                            return value
                          } else {
                            // 월별일 때 yyyy-MM 형식으로 변환
                            if (typeof value === 'string') {
                              // 이미 yyyy-MM 형식인 경우
                              if (/^\d{4}-\d{2}$/.test(value)) {
                                return value
                              }
                              // yyyy-MM-dd 형식인 경우
                              if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                                return value.substring(0, 7)
                              }
                              // yyyyMMdd 형식인 경우
                              if (/^\d{8}$/.test(value)) {
                                return `${value.substring(0, 4)}-${value.substring(4, 6)}`
                              }
                            }
                            return value
                          }
                        }}
                        stroke="#737373"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis {...newMemberYAxisConfig.yAxisProps} />
                      <Tooltip content={newMemberYAxisConfig.unifiedTooltip} />
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
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    name="누적" 
                    connectNulls 
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativePredicted" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    name="예측" 
                    connectNulls 
                    dot={false}
                  />
                </ComposedChart>
              ) : (() => {
                // 가입 경로별 추이 Y축 설정 계산
                const signupMethodYAxisConfig = useTrendChartConfig(
                  currentSignupMethodData,
                  ["email", "apple", "google", "kakao", "naver", "line", "facebook", "wechat",
                   "emailPredicted", "applePredicted", "googlePredicted", "kakaoPredicted",
                   "naverPredicted", "linePredicted", "facebookPredicted", "wechatPredicted"],
                  activeTab
                )

                return (
                  <LineChart 
                    data={currentSignupMethodData}
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(value) => {
                        // activeTab에 따라 다르게 처리
                        if (activeTab === 'weekly') {
                          // 주별일 때 "00월0주" 형식으로 변환
                          return formatWeeklyDate(value)
                        } else if (activeTab === 'daily') {
                          // 일별일 때 yyyy-MM-dd 형식 유지
                          if (typeof value === 'string') {
                            // yyyy-MM-dd 형식인 경우 그대로 반환
                            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                              return value
                            }
                            // yyyyMMdd 형식인 경우
                            if (/^\d{8}$/.test(value)) {
                              return `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`
                            }
                          }
                          return value
                        } else {
                          // 월별일 때 yyyy-MM 형식으로 변환
                          if (typeof value === 'string') {
                            // 이미 yyyy-MM 형식인 경우
                            if (/^\d{4}-\d{2}$/.test(value)) {
                              return value
                            }
                            // yyyy-MM-dd 형식인 경우
                            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                              return value.substring(0, 7)
                            }
                            // yyyyMMdd 형식인 경우
                            if (/^\d{8}$/.test(value)) {
                              return `${value.substring(0, 4)}-${value.substring(4, 6)}`
                            }
                          }
                          return value
                        }
                      }}
                      stroke="#737373"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis {...signupMethodYAxisConfig.yAxisProps} />
                    <Tooltip content={signupMethodYAxisConfig.unifiedTooltip} />
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
                  )
                })()}
                </ResponsiveContainer>
              )
            })()}
          </div>
        </Card>

        {/* 커뮤니티 활동 추이 */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            {/* 커뮤니티 메트릭 카드들 */}
            {(() => {
              // 실제값이 0이 아닌 가장 최근 월의 데이터를 찾음
              const findLastNonZeroData = (dataArray: any[], key: string) => {
                for (let i = dataArray.length - 1; i >= 0; i--) {
                  if (dataArray[i] && dataArray[i][key] > 0) {
                    return dataArray[i]
                  }
                }
                return dataArray.length > 0 ? dataArray[dataArray.length - 1] : null
              }
              
              const lastCommunityPostsData = findLastNonZeroData(currentCommunityActivityData, 'communityPosts')
              const lastChatRoomsData = findLastNonZeroData(currentCommunityActivityData, 'newChatRooms')
              
              const communityPostsValue = Number(lastCommunityPostsData?.communityPosts) || 0
              const newChatRoomsValue = Number(lastChatRoomsData?.newChatRooms) || 0
              
              const communityPostsTarget = targetsConfig?.communityPosts?.value || 0
              const newChatRoomsTarget = targetsConfig?.newChatRooms?.value || 0
              
              const communityPostsRate = communityPostsTarget > 0 ? ((communityPostsValue / communityPostsTarget) * 100) : 0
              const newChatRoomsRate = newChatRoomsTarget > 0 ? ((newChatRoomsValue / newChatRoomsTarget) * 100) : 0
              
              return (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex flex-col space-y-2">
                      <div className={`text-3xl font-bold ${getColorByRate(communityPostsRate).text}`}>{communityPostsRate.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${getColorByRate(communityPostsRate).bg} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(communityPostsRate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">신규 게시물 목표</p>
                        <p className="text-xs text-muted-foreground">{communityPostsTarget.toLocaleString()} 개</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex flex-col space-y-2">
                      <div className={`text-3xl font-bold ${getColorByRate(newChatRoomsRate).text}`}>{newChatRoomsRate.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${getColorByRate(newChatRoomsRate).bg} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(newChatRoomsRate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">신규 채팅방 목표</p>
                        <p className="text-xs text-muted-foreground">{newChatRoomsTarget.toLocaleString()} 개</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
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
            {(() => {
              // 커뮤니티 활동 추이 Y축 설정 계산
              const communityDataKeys = communityViewType === "community" 
                ? ["qa", "qaPredicted", "review", "reviewPredicted", "tips", "tipsPredicted", "trade", "tradePredicted"]
                : communityViewType === "chat"
                ? ["oneOnOne", "oneOnOnePredicted", "tradingChat", "tradingChatPredicted"]
                : ["communityPosts", "communityPostsPredicted", "newChatRooms", "newChatRoomsPredicted"]
              
              const communityYAxisConfig = useTrendChartConfig(
                currentCommunityActivityData,
                communityDataKeys,
                activeTab
              )

              return (
                <TrendChart
                  data={currentCommunityActivityData}
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
                  activeTab={activeTab}
                  leftDomain={communityYAxisConfig.yAxisConfig.domain}
                  leftTicks={communityYAxisConfig.yAxisConfig.ticks}
                />
              )
            })()}
          </div>
        </Card>
      </div>
    </section>
  )
}
