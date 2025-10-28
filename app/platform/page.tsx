"use client"

import { PlatformDashboardHeader } from "@/components/platform-dashboard-header"
import { PlatformActivityMetrics } from "@/components/platform-activity-metrics"
import { PlatformTrendChartsSection } from "@/components/platform-trend-charts-section"
import { PlatformRankingAccordions } from "@/components/platform-ranking-accordions"
import { RealtimePanel } from "@/components/realtime-panel"
import CountryHeatmapECharts from "@/components/country-heatmap-echarts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Play, Scan, Store, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts"

export default function PlatformPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("전체")
  const [selectedMetric, setSelectedMetric] = useState<"실행" | "스캔">("실행")
  const [rankingAppFilter, setRankingAppFilter] = useState<string>("전체")
  const [rankingCountryFilter, setRankingCountryFilter] = useState<string>("전체")

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country)
  }

  return (
    <div className="min-h-screen bg-background">
      <PlatformDashboardHeader />
      <main className="w-full px-4 py-6 space-y-8">
    
        {/* 그리드 레이아웃: 모든 카드를 한 줄로 배치 */}
        <div className="grid grid-cols-8 grid-rows-1 gap-1">
          {/* Radar Chart */}
          <Card>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
              <CardTitle className="text-sm md:text-lg lg:text-2xl font-medium">앱별 종합 지표 분석</CardTitle>
            </CardHeader>
            <CardContent className="px-3 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={[
                  { subject: '다운로드', HT: 45.2, COP: 38.7, Global: 16.1, fullMark: 100 },
                  { subject: '스캔', HT: 48.3, COP: 35.2, Global: 16.5, fullMark: 100 },
                  { subject: '회원', HT: 48.3, COP: 35.2, Global: 16.5, fullMark: 100 },
                  { subject: '게시물', HT: 50.5, COP: 32.8, Global: 16.7, fullMark: 100 },
                  { subject: '실행', HT: 52.8, COP: 31.4, Global: 15.8, fullMark: 100 },
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="HT" dataKey="HT" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name="COP" dataKey="COP" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Radar name="Global" dataKey="Global" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 첫 번째 행: 다운로드, 실행, 스캔 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 pt-1.5 px-2.5">
                <CardTitle className="text-sm md:text-lg lg:text-2xl font-medium">다운로드</CardTitle>
                
              </CardHeader>
              <CardContent className="px-2.5 pb-1.5">
              <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="text-xl md:text-2xl lg:text-3xl font-bold">1,250,000</div>
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <TrendingUp className="h-3 w-3" />
                      <span>+12.5%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    총 다운로드: <span className="text-green-600">2,500,000</span>
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">마켓별 점유율</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={[{ name: "", play: 52.8, store: 35.4, one: 11.8 }]} stackOffset="expand">
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const labels: Record<string, string> = {
                              play: "Play Store", store: "App Store", one: "One Store"
                            };
                            return (
                              <div className="bg-card border border-border rounded-md p-2 shadow-md">
                                {payload.map((entry, index) => (
                                  <div key={index} className="text-xs">
                                    <span className="font-semibold">{labels[entry.dataKey as string] || entry.dataKey}: </span>
                                    <span>{entry.value}%</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }} />
                        <Bar dataKey="play" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="store" stackId="a" fill="#10b981" />
                        <Bar dataKey="one" stackId="a" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">Play Store 52.8%</span>
                    <span className="text-green-600">App Store 35.4%</span>
                    <span className="text-purple-600">One Store 11.8%</span>
                  </div>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 pt-1.5 px-2.5">
              <CardTitle className="text-sm md:text-lg lg:text-2xl font-medium">실행 활성자 수</CardTitle>
              
            </CardHeader>
            <CardContent className="px-2.5 pb-1.5">
            <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold">15,800</div>
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <TrendingDown className="h-3 w-3" />
                    <span>-3.2%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  총 실행: <span className="text-blue-600">125,000</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">국가별 점유율</p>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={[{ name: "", kr: 32.4, jp: 24.8, us: 18.5, cn: 12.3, vn: 7.8, other: 4.2 }]} stackOffset="expand">
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" hide />
                      <Bar dataKey="kr" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="jp" stackId="a" fill="#10b981" />
                      <Bar dataKey="us" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="cn" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="vn" stackId="a" fill="#ef4444" />
                      <Bar dataKey="other" stackId="a" fill="#94a3b8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">KR</span>
                  <span className="text-green-600">JP</span>
                  <span className="text-purple-600">US</span>
                  <span className="text-orange-600">CN</span>
                  <span className="text-red-600">VN</span>
                  <span className="text-gray-600">기타</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 pt-1.5 px-2.5">
              <CardTitle className="text-sm md:text-lg lg:text-2xl font-medium">스캔 활성자 수</CardTitle>
             
            </CardHeader>
            <CardContent className="px-2.5 pb-1.5">
            <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold">12,340</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    <span>+8.7%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  총 스캔: <span className="text-purple-600">98,500</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">국가별 점유율</p>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={[{ name: "", kr: 32.4, jp: 24.8, us: 18.5, cn: 12.3, vn: 7.8, other: 4.2 }]} stackOffset="expand">
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" hide />
                      <Bar dataKey="kr" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="jp" stackId="a" fill="#10b981" />
                      <Bar dataKey="us" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="cn" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="vn" stackId="a" fill="#ef4444" />
                      <Bar dataKey="other" stackId="a" fill="#94a3b8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">KR</span>
                  <span className="text-green-600">JP</span>
                  <span className="text-purple-600">US</span>
                  <span className="text-orange-600">CN</span>
                  <span className="text-red-600">VN</span>
                  <span className="text-gray-600">기타</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 실행 대비 스캔 활성자 비율 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 pt-1.5 px-2.5">
              <CardTitle className="text-sm md:text-lg lg:text-xl font-medium">실행 대비 스캔 활성자 비율</CardTitle>
              
            </CardHeader>
            <CardContent className="px-2.5 pb-1.5">
            <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold">41.4%</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    <span>+3.1%</span>
                  </div>
                </div>
                  <p className="text-xs text-muted-foreground">
                   <span className="text-purple-600"><br></br></span>
                  </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">스캔 사용자의 회원/비회원 비율</p>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={[{ name: "", member: 65.5, nonmember: 34.5 }]} stackOffset="expand">
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" hide />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card border border-border rounded-md p-2 shadow-md">
                              {payload.map((entry, index) => {
                                const labels: Record<string, string> = {
                                  play: "Play Store", store: "App Store", one: "One Store",
                                  kr: "KR", jp: "JP", us: "US", cn: "CN", vn: "VN", other: "기타",
                                  ht: "HT", cop: "COP", global: "Global", commerce: "커머스",
                                  trade: "인증거래", tip: "판별팁", review: "제품리뷰", qa: "Q&A",
                                  oneOnOne: "1:1채팅", tradeChat: "인증거래채팅",
                                  member: "회원", nonmember: "비회원"
                                };
                                return (
                                  <div key={index} className="text-xs">
                                    <span className="font-semibold">{labels[entry.dataKey as string] || entry.dataKey}: </span>
                                    <span>{entry.value}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Bar dataKey="member" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="nonmember" stackId="a" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">회원 65.5%</span>
                  <span className="text-green-600">비회원 34.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 pt-1.5 px-2.5">
              <CardTitle className="text-sm md:text-lg lg:text-2xl font-medium">신규 회원</CardTitle>
              
            </CardHeader>
            <CardContent className="px-2.5 pb-1.5">
            <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold">2,340</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    <span>+8.7%</span>
                    <span className="text-xs text-muted-foreground">vs 전월</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  총 회원: <span className="text-purple-600">18,500</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">유입별 점유율</p>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={[{ name: "", ht: 42.5, cop: 35.2, global: 15.8, commerce: 6.5 }]} stackOffset="expand">
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" hide />
                      <Bar dataKey="ht" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="cop" stackId="a" fill="#10b981" />
                      <Bar dataKey="global" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="commerce" stackId="a" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">HT 42.5%</span>
                  <span className="text-green-600">COP 35.2%</span>
                  <span className="text-purple-600">Global 15.8%</span>
                  <span className="text-orange-600">커머스 6.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 pt-1.5 px-2.5">
              <CardTitle className="text-sm md:text-lg lg:text-2xl font-medium">신규 게시물</CardTitle>
              
            </CardHeader>
            <CardContent className="px-2.5 pb-1.5">
            <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold">245</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    <span>+2.2%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  총 게시물: <span className="text-purple-600">1,180</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">커뮤니티별 점유율</p>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={[{ name: "", trade: 38.4, tip: 28.6, review: 21.2, qa: 11.8 }]} stackOffset="expand">
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" hide />
                      <Bar dataKey="trade" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="tip" stackId="a" fill="#10b981" />
                      <Bar dataKey="review" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="qa" stackId="a" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-between gap-1 text-xs">
                  <span className="text-blue-400">인증거래</span>
                  <span className="text-green-600">판별팁</span>
                  <span className="text-purple-600">제품리뷰</span>
                  <span className="text-orange-600">Q&A</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 pt-1.5 px-2.5">
              <CardTitle className="text-sm md:text-lg lg:text-2xl font-medium">신규 채팅방</CardTitle>
              
            </CardHeader>
            <CardContent className="px-2.5 pb-1.5">
            <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold">45</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    <span>+5.2%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  총 채팅방: <span className="text-purple-600">280</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">채팅방별 점유율</p>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={[{ name: "", oneOnOne: 68.9, tradeChat: 31.1 }]} stackOffset="expand">
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" hide />
                      <Bar dataKey="oneOnOne" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="tradeChat" stackId="a" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">1:1 채팅 68.9%</span>
                  <span className="text-green-600">인증거래 채팅 31.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          
        </div>
        
        {/* 추이 차트 섹션 */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-semibold">앱 관련 추이 분석</h3>
            
            {/* 달성률 색상 범례 */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">달성률:</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span className="text-xs text-muted-foreground">≤50%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span className="text-xs text-muted-foreground">51-79%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-xs text-muted-foreground">≥80%</span>
              </div>
            </div>
          </div>
          
          <PlatformTrendChartsSection selectedCountry={selectedCountry} />
        </div>

        {/* 국가별 히트맵 및 시각 분포 */}
        <div className="space-y-4">
          {/* Select Box for 실행/스캔 */}
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-semibold">국가별 분포 및 시각 분석</h3>
            <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as "실행" | "스캔")}>
              <SelectTrigger className="w-[140px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                <SelectItem value="실행" className="cursor-pointer hover:bg-blue-50">실행</SelectItem>
                <SelectItem value="스캔" className="cursor-pointer hover:bg-blue-50">스캔</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 국가별 히트맵 */}
            <CountryHeatmapECharts 
              height="h-[500px]"
              title={`국가별 ${selectedMetric} 분포도`}
              onCountrySelect={handleCountrySelect}
              selectedCountry={selectedCountry}
            />
            
            {/* 시각 분포 (누적 차트) */}
            <Card className="p-6 h-[500px] flex flex-col">
              <h3 className="text-xl font-semibold mb-4">
                {selectedCountry === "전체" ? `전체 ${selectedMetric} 시각 분포` : `${selectedCountry} ${selectedMetric} 시각 분포`}
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(() => {
                  // 시간대별 데이터 생성 (HT, COP, Global)
                  const baseMultipliers = selectedMetric === "실행" ? {
                    HT: { base: 1.0, variance: 0.15 },
                    COP: { base: 0.7, variance: 0.12 },
                    Global: { base: 0.4, variance: 0.08 }
                  } : {
                    HT: { base: 0.8, variance: 0.12 },
                    COP: { base: 0.6, variance: 0.10 },
                    Global: { base: 0.3, variance: 0.06 }
                  };

                  const countryMultiplier: { [key: string]: number } = {
                    "전체": 1.0,
                    "한국": 1.2,
                    "일본": 0.8,
                    "미국": 0.6,
                    "중국": 0.9,
                    "베트남": 0.5
                  };

                  const multiplier = countryMultiplier[selectedCountry] || 0.3;

                  // 시간대별 기본 패턴
                  const hourlyPattern = [
                    120, 80, 60, 45, 55, 90, 180, 320, 450, 520, 480, 460,
                    550, 480, 420, 380, 400, 430, 520, 580, 620, 550, 420, 280
                  ];

                  return hourlyPattern.map((base, index) => {
                    const hour = index.toString().padStart(2, '0');
                    return {
                      hour,
                      HT: Math.round(base * baseMultipliers.HT.base * multiplier * (1 + Math.random() * baseMultipliers.HT.variance)),
                      COP: Math.round(base * baseMultipliers.COP.base * multiplier * (1 + Math.random() * baseMultipliers.COP.variance)),
                      Global: Math.round(base * baseMultipliers.Global.base * multiplier * (1 + Math.random() * baseMultipliers.Global.variance))
                    };
                  });
                })()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    label={{ value: '시간 (24h)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: `${selectedMetric} 수`, angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value}회`, name]}
                    labelFormatter={(label) => `${label}시`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="HT" 
                    stackId="a"
                    fill="#3b82f6"
                    name="HT"
                  />
                  <Bar 
                    dataKey="COP" 
                    stackId="a"
                    fill="#10b981"
                    name="COP"
                  />
                  <Bar 
                    dataKey="Global" 
                    stackId="a"
                    fill="#8b5cf6"
                    name="Global"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

      {/* 랭킹 아코디언 */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-semibold">랭킹 분석</h3>
          
          {/* 앱 필터 */}
          <Select value={rankingAppFilter} onValueChange={setRankingAppFilter}>
            <SelectTrigger className="w-[140px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
              <SelectItem value="전체" className="cursor-pointer hover:bg-blue-50">전체</SelectItem>
              <SelectItem value="HT" className="cursor-pointer hover:bg-blue-50">HT</SelectItem>
              <SelectItem value="COP" className="cursor-pointer hover:bg-blue-50">COP</SelectItem>
              <SelectItem value="Global" className="cursor-pointer hover:bg-blue-50">Global</SelectItem>
            </SelectContent>
          </Select>

          {/* 국가 필터 */}
          <Select value={rankingCountryFilter} onValueChange={setRankingCountryFilter}>
            <SelectTrigger className="w-[140px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
              <SelectItem value="전체" className="cursor-pointer hover:bg-blue-50">전체</SelectItem>
              <SelectItem value="중국" className="cursor-pointer hover:bg-blue-50">중국</SelectItem>
              <SelectItem value="한국" className="cursor-pointer hover:bg-blue-50">한국</SelectItem>
              <SelectItem value="베트남" className="cursor-pointer hover:bg-blue-50">베트남</SelectItem>
              <SelectItem value="태국" className="cursor-pointer hover:bg-blue-50">태국</SelectItem>
              <SelectItem value="일본" className="cursor-pointer hover:bg-blue-50">일본</SelectItem>
              <SelectItem value="미국" className="cursor-pointer hover:bg-blue-50">미국</SelectItem>
              <SelectItem value="인도" className="cursor-pointer hover:bg-blue-50">인도</SelectItem>
              <SelectItem value="기타" className="cursor-pointer hover:bg-blue-50">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <PlatformRankingAccordions 
          selectedCountry={selectedCountry}
          appFilter={rankingAppFilter}
          countryFilter={rankingCountryFilter}
        />
      </div>
        {/* 활동 지표 */}
        <div className="space-y-4">
          
          <PlatformActivityMetrics selectedCountry={selectedCountry} />
        </div>

        


      </main>
    </div>
  )
}




