"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, TrendingDown, Info } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts"

export function PlatformComprehensiveMetrics() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">앱 종합 지표</h2>
      {/* 그리드 레이아웃: 모든 카드를 한 줄로 배치 */}
      <div className="grid grid-cols-8 grid-rows-1 gap-1">
        {/* Radar Chart */}
        <Card className="flex flex-col">
          <CardContent className="px-2 py-2 flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { subject: '다운로드', HT: 45.2, COP: 38.7, Global: 16.1, fullMark: 100 },
                { subject: '스캔', HT: 48.3, COP: 35.2, Global: 16.5, fullMark: 100 },
                { subject: '회원', HT: 48.3, COP: 35.2, Global: 16.5, fullMark: 100 },
                { subject: '커뮤니티', HT: 50.5, COP: 32.8, Global: 16.7, fullMark: 100 },
                { subject: '실행', HT: 52.8, COP: 31.4, Global: 15.8, fullMark: 100 },
              ]}>
                <PolarGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <Radar 
                  name="HT" 
                  dataKey="HT" 
                  stroke="#2563eb" 
                  fill="#3b82f6" 
                  fillOpacity={0.4} 
                  strokeWidth={3}
                />
                <Radar 
                  name="COP" 
                  dataKey="COP" 
                  stroke="#059669" 
                  fill="#10b981" 
                  fillOpacity={0.4} 
                  strokeWidth={3}
                />
                <Radar 
                  name="Global" 
                  dataKey="Global" 
                  stroke="#7c3aed" 
                  fill="#8b5cf6" 
                  fillOpacity={0.4} 
                  strokeWidth={3}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={30}
                  wrapperStyle={{ 
                    paddingTop: '5px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontWeight: 600
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 다운로드 */}
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
                    <Bar dataKey="play" stackId="a" fill="#3b82f6" barSize={30} />
                    <Bar dataKey="store" stackId="a" fill="#10b981" barSize={30} />
                    <Bar dataKey="one" stackId="a" fill="#8b5cf6" barSize={30} />
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

        {/* 실행 활성자 수 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 pt-1.5 px-2.5">
                <CardTitle className="text-sm md:text-lg lg:text-2xl font-medium flex items-center gap-2">
                  <span>실행 활성자 수</span>
                  <UITooltip> 
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger> 
                    <TooltipContent className="whitespace-nowrap">
                      <p>실행한 고유 사용자(기기 기준)수 입니다.</p>
                    </TooltipContent>
                  </UITooltip>
                </CardTitle>
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
                    <Bar dataKey="kr" stackId="a" fill="#3b82f6" barSize={30} />
                    <Bar dataKey="jp" stackId="a" fill="#10b981" barSize={30} />
                    <Bar dataKey="us" stackId="a" fill="#8b5cf6" barSize={30} />
                    <Bar dataKey="cn" stackId="a" fill="#f59e0b" barSize={30} />
                    <Bar dataKey="vn" stackId="a" fill="#ef4444" barSize={30} />
                    <Bar dataKey="other" stackId="a" fill="#94a3b8" barSize={30} />
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

        {/* 스캔 활성자 수 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 pt-1.5 px-2.5">
          <CardTitle className="text-sm md:text-lg lg:text-2xl font-medium flex items-center gap-2">
                  <span>스캔 활성자 수</span>
                  <UITooltip> 
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger> 
                    <TooltipContent className="whitespace-nowrap">
                      <p>스캔한 고유 사용자(기기 기준)수 입니다.</p>
                    </TooltipContent>
                  </UITooltip>
                </CardTitle>
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
                    <Bar dataKey="kr" stackId="a" fill="#3b82f6" barSize={30} />
                    <Bar dataKey="jp" stackId="a" fill="#10b981" barSize={30} />
                    <Bar dataKey="us" stackId="a" fill="#8b5cf6" barSize={30} />
                    <Bar dataKey="cn" stackId="a" fill="#f59e0b" barSize={30} />
                    <Bar dataKey="vn" stackId="a" fill="#ef4444" barSize={30} />
                    <Bar dataKey="other" stackId="a" fill="#94a3b8" barSize={30} />
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
                        const labels: Record<string, string> = {
                          member: "회원", nonmember: "비회원"
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
                    <Bar dataKey="member" stackId="a" fill="#3b82f6" barSize={30} />
                    <Bar dataKey="nonmember" stackId="a" fill="#10b981" barSize={30} />
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

        {/* 신규 회원 */}
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
                  {/* <span className="text-xs text-muted-foreground">vs 전월</span> */}
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
                    <Bar dataKey="ht" stackId="a" fill="#3b82f6" barSize={30} />
                    <Bar dataKey="cop" stackId="a" fill="#10b981" barSize={30} />
                    <Bar dataKey="global" stackId="a" fill="#8b5cf6" barSize={30} />
                    <Bar dataKey="commerce" stackId="a" fill="#f59e0b" barSize={30} />
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

        {/* 신규 게시물 */}
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
                    <Bar dataKey="trade" stackId="a" fill="#3b82f6" barSize={30} />
                    <Bar dataKey="tip" stackId="a" fill="#10b981" barSize={30} />
                    <Bar dataKey="review" stackId="a" fill="#8b5cf6" barSize={30} />
                    <Bar dataKey="qa" stackId="a" fill="#f59e0b" barSize={30} />
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

        {/* 신규 채팅방 */}
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
                    <Bar dataKey="oneOnOne" stackId="a" fill="#3b82f6" barSize={30} />
                    <Bar dataKey="tradeChat" stackId="a" fill="#10b981" barSize={30} />
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
    </div>
  )
}


