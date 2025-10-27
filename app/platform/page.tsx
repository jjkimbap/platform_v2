"use client"

import { PlatformDashboardHeader } from "@/components/platform-dashboard-header"
import { PlatformActivityMetrics } from "@/components/platform-activity-metrics"
import { PlatformTrendChartsSection } from "@/components/platform-trend-charts-section"
import { PlatformRankingAccordions } from "@/components/platform-ranking-accordions"
import { RealtimePanel } from "@/components/realtime-panel"
// import { CountryHeatmapECharts } from "@/components/country-heatmap-echarts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Play, Scan, Store, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts"

export default function PlatformPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("전체")

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country)
  }

  return (
    <div className="min-h-screen bg-background">
      <PlatformDashboardHeader />
      <main className="w-full px-4 py-6 space-y-6">
    
        
    
        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
                <CardTitle className="text-sm font-medium">다운로드</CardTitle>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold">1,250,000</div>
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <TrendingUp className="h-3 w-3" />
                      <span>+12.5%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    총 다운로드: <span className="text-green-600">2,500,000</span>
                  </p>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
              
              {/* 앱별 점유율과 국가별 TOP3 - 가로 레이아웃 */}
              <div className="flex gap-4">
                {/* 앱별 점유율 - 파이차트 */}
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">앱별 점유율</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "HT", value: 45.2, color: "#3b82f6" },
                            { name: "COP", value: 38.7, color: "#10b981" },
                            { name: "Global", value: 16.1, color: "#8b5cf6" }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={15}
                          outerRadius={30}
                          dataKey="value"
                        >
                          {[
                            { name: "HT", value: 45.2, color: "#3b82f6" },
                            { name: "COP", value: 38.7, color: "#10b981" },
                            { name: "Global", value: 16.1, color: "#8b5cf6" }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">HT 45.2%</span>
                    <span className="text-green-600">COP 38.7%</span>
                    <span className="text-purple-600">Global 16.1%</span>
                  </div>
                </div>

                {/* 국가별 TOP3 - 세로형 막대차트 */}
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">국가별 TOP3</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { country: "중국", value: 32.1 },
                          { country: "대한민국", value: 18.5 },
                          { country: "베트남", value: 12.3 }
                        ]}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <XAxis 
                          dataKey="country" 
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis hide />
                        <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
              <CardTitle className="text-sm font-medium">실행 수</CardTitle>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold">15,800</div>
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <TrendingDown className="h-3 w-3" />
                    <span>-3.2%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  총 실행: <span className="text-blue-600">125,000</span>
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              
              {/* 앱별 점유율과 국가별 TOP3 - 가로 레이아웃 */}
              <div className="flex gap-4">
                {/* 앱별 점유율 - 파이차트 */}
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">앱별 점유율</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "HT", value: 52.8, color: "#3b82f6" },
                            { name: "COP", value: 31.4, color: "#10b981" },
                            { name: "Global", value: 15.8, color: "#8b5cf6" }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={15}
                          outerRadius={30}
                          dataKey="value"
                        >
                          {[
                            { name: "HT", value: 52.8, color: "#3b82f6" },
                            { name: "COP", value: 31.4, color: "#10b981" },
                            { name: "Global", value: 15.8, color: "#8b5cf6" }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">HT 52.8%</span>
                    <span className="text-green-600">COP 31.4%</span>
                    <span className="text-purple-600">Global 15.8%</span>
                  </div>
                </div>

                {/* 국가별 TOP3 - 세로형 막대차트 */}
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">국가별 TOP3</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { country: "중국", value: 28.5 },
                          { country: "대한민국", value: 22.1 },
                          { country: "베트남", value: 15.3 }
                        ]}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <XAxis 
                          dataKey="country" 
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis hide />
                        <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
              <CardTitle className="text-sm font-medium">스캔 수</CardTitle>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold">12,340</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    <span>+8.7%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  총 스캔: <span className="text-purple-600">98,500</span>
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              
              {/* 앱별 점유율과 국가별 TOP3 - 가로 레이아웃 */}
              <div className="flex gap-4">
                {/* 앱별 점유율 - 파이차트 */}
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">앱별 점유율</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "HT", value: 48.3, color: "#3b82f6" },
                            { name: "COP", value: 35.2, color: "#10b981" },
                            { name: "Global", value: 16.5, color: "#8b5cf6" }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={15}
                          outerRadius={30}
                          dataKey="value"
                        >
                          {[
                            { name: "HT", value: 48.3, color: "#3b82f6" },
                            { name: "COP", value: 35.2, color: "#10b981" },
                            { name: "Global", value: 16.5, color: "#8b5cf6" }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">HT 48.3%</span>
                    <span className="text-green-600">COP 35.2%</span>
                    <span className="text-purple-600">Global 16.5%</span>
                  </div>
                </div>

                {/* 국가별 TOP3 - 세로형 막대차트 */}
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">국가별 TOP3</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { country: "중국", value: 35.2 },
                          { country: "대한민국", value: 19.8 },
                          { country: "베트남", value: 13.5 }
                        ]}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <XAxis 
                          dataKey="country" 
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis hide />
                        <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
              <CardTitle className="text-sm font-medium">신규 회원</CardTitle>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold">2,340</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    <span>+8.7%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  총 회원: <span className="text-purple-600">18,500</span>
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              
              {/* 앱별 점유율과 국가별 TOP3 - 가로 레이아웃 */}
              <div className="flex gap-4">
                {/* 앱별 점유율 - 파이차트 */}
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">앱별 점유율</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "HT", value: 48.3, color: "#3b82f6" },
                            { name: "COP", value: 35.2, color: "#10b981" },
                            { name: "Global", value: 16.5, color: "#8b5cf6" }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={15}
                          outerRadius={30}
                          dataKey="value"
                        >
                          {[
                            { name: "HT", value: 48.3, color: "#3b82f6" },
                            { name: "COP", value: 35.2, color: "#10b981" },
                            { name: "Global", value: 16.5, color: "#8b5cf6" }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">HT 48.3%</span>
                    <span className="text-green-600">COP 35.2%</span>
                    <span className="text-purple-600">Global 16.5%</span>
                  </div>
                </div>

                {/* 국가별 TOP3 - 세로형 막대차트 */}
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">국가별 TOP3</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { country: "중국", value: 35.2 },
                          { country: "대한민국", value: 19.8 },
                          { country: "베트남", value: 13.5 }
                        ]}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <XAxis 
                          dataKey="country" 
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis hide />
                        <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">신규 게시물</CardTitle>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold">245</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    <span>+2.2%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  총 게시물: <span className="text-purple-600">1,180</span>
                </p>
              </div>
              
            </CardHeader>
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">신규 채팅방</CardTitle>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold">45</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    <span>+5.2%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  총 채팅방: <span className="text-purple-600">280</span>
                </p>
              </div>
            </CardHeader>
          </Card>
        </div>
        

        {/* 추이 차트 섹션 */}
        <div className="space-y-4">
          {selectedCountry !== "전체" && (
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold">{selectedCountry}</span>
              <span className="text-muted-foreground">지역 데이터</span>
            </div>
          )}
          <PlatformTrendChartsSection selectedCountry={selectedCountry} />
        </div>
        {/* 랭킹 아코디언 */}
        <div className="space-y-4">
            {selectedCountry !== "전체" && (
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold">{selectedCountry}</span>
              <span className="text-muted-foreground">랭킹 분석</span>
            </div>
          )}
          <PlatformRankingAccordions selectedCountry={selectedCountry} />
        </div>
        {/* 선택된 국가 표시 - 스크롤 시 고정 */}
        {/* {selectedCountry !== "전체" && (
          <div className="sticky top-16 z-40 bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4 -mx-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-600">현재 선택된 국가:</span>
                <span className="font-semibold text-blue-800">{selectedCountry}</span>
              </div>
              <button 
                onClick={() => setSelectedCountry("전체")}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                전체 보기로 돌아가기
              </button>
            </div>
          </div>
        )} */}
        {/* 국가별 히트맵 */}
        {/* <CountryHeatmapECharts 
          height="h-96"
          onCountrySelect={handleCountrySelect}
          selectedCountry={selectedCountry}
        /> */}
        {/* 활동 지표 */}
        <div className="space-y-4">
          {selectedCountry !== "전체" && (
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold">{selectedCountry}</span>
              <span className="text-muted-foreground">활동 지표</span>
            </div>
          )}
          <PlatformActivityMetrics selectedCountry={selectedCountry} />
        </div>


        
      </main>
    </div>
  )
}
