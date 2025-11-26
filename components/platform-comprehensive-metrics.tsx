"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, TrendingDown, Info } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, Cell } from "recharts"
import { formatDateForAPI, getTodayDateString, fetchCommunityPostSummary, CommunityPostSummary, fetchChatRoomSummary, ChatRoomSummary } from "@/lib/api"
import { fetchNewMemberComprehensive } from "@/lib/fetchNewMemberComprehensive"
import { useDateRange } from "@/hooks/use-date-range"

export function PlatformComprehensiveMetrics() {
  console.log('🚀 PlatformComprehensiveMetrics 컴포넌트 렌더링 시작')
  
  const [newMemberData, setNewMemberData] = useState<{
    summary: { newMembers: number; growthRate: number; comparisonLabel: string }
    distribution: { email: number; naver: number; kakao: number; facebook: number; google: number; apple: number; line: number }
  } | null>(null)
  const [communityPostData, setCommunityPostData] = useState<CommunityPostSummary | null>(null)
  const [chatRoomData, setChatRoomData] = useState<ChatRoomSummary | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 전역 날짜 범위 사용
  const { dateRange } = useDateRange()
  
  // 날짜 범위를 문자열로 변환
  const startDate = dateRange?.from ? formatDateForAPI(dateRange.from) : '2025-01-01'
  const endDate = dateRange?.to ? formatDateForAPI(dateRange.to) : getTodayDateString()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // 신규 회원 데이터, 커뮤니티 게시물 데이터, 채팅방 데이터를 병렬로 가져오기
        const [memberData, postData, chatData] = await Promise.all([
          fetchNewMemberComprehensive('monthly', startDate, endDate),
          fetchCommunityPostSummary(startDate, endDate),
          fetchChatRoomSummary(startDate, endDate)
        ])
        setNewMemberData({
          summary: memberData.summary,
          distribution: memberData.distribution
        })
        setCommunityPostData(postData)
        setChatRoomData(chatData)
      } catch (error) {
        console.error('Failed to load data:', error)
        setNewMemberData({
          summary: { newMembers: 0, growthRate: 0, comparisonLabel: '데이터 로드 실패' },
          distribution: { email: 0, naver: 0, kakao: 0, facebook: 0, google: 0, apple: 0, line: 0 }
        })
        setCommunityPostData({
          posts: 0,
          growthRate: 0,
          tradeRatio: 0,
          commInfoRatio: 0,
          commReviewRatio: 0,
          commDebateRatio: 0
        })
        setChatRoomData({
          roomCount: 0,
          growthRate: 0,
          tradeChatRatio: 0,
          chatRatio: 0
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [startDate, endDate])

  // 기본값 설정
  const summary = newMemberData?.summary || { newMembers: 2340, growthRate: 8.7, comparisonLabel: '' }
  const distribution = newMemberData?.distribution || { email: 0, naver: 0, kakao: 0, facebook: 0, google: 0, apple: 0, line: 0 }
  const communityPost = communityPostData || { posts: 245, growthRate: 2.2, tradeRatio: 38.4, commInfoRatio: 28.6, commReviewRatio: 21.2, commDebateRatio: 11.8 }
  const chatRoom = chatRoomData || { roomCount: 45, growthRate: 5.2, tradeChatRatio: 31.1, chatRatio: 68.9 }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">앱 종합 지표</h2>
      {/* 그리드 레이아웃: 모든 카드를 한 줄로 배치 */}
      <div className="grid grid-cols-8 grid-rows-1 gap-1">
        {/* Radar Chart */}
        <Card className="flex flex-col">
          <CardContent className="px-2 py-2 flex-1 flex items-center justify-center min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
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
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
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
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
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
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
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
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
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
                <div className="text-xl md:text-2xl lg:text-3xl font-bold">
                  {loading ? '...' : summary.newMembers.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 text-sm ${summary.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.growthRate >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{summary.growthRate >= 0 ? '+' : ''}{summary.growthRate.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span>{summary.comparisonLabel}</span>
                </div>
              </div>
              {summary.comparisonLabel && (
                <p className="text-xs text-muted-foreground">{summary.comparisonLabel}</p>
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">가입 경로별 점유율</p>
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                  <BarChart layout="vertical" data={[{ 
                    name: "", 
                    email: distribution.email, 
                    naver: distribution.naver, 
                    kakao: distribution.kakao, 
                    facebook: distribution.facebook,
                    google: distribution.google,
                    apple: distribution.apple,
                    line: distribution.line
                  }]} stackOffset="expand">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const labels: Record<string, string> = {
                          email: "이메일", naver: "네이버", kakao: "카카오", facebook: "페이스북",
                          google: "구글", apple: "애플", line: "라인"
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
                    <Bar dataKey="email" stackId="a" fill="#3b82f6" barSize={30} />
                    <Bar dataKey="naver" stackId="a" fill="#10b981" barSize={30} />
                    <Bar dataKey="kakao" stackId="a" fill="#8b5cf6" barSize={30} />
                    <Bar dataKey="facebook" stackId="a" fill="#f59e0b" barSize={30} />
                    <Bar dataKey="google" stackId="a" fill="#ef4444" barSize={30} />
                    <Bar dataKey="apple" stackId="a" fill="#06b6d4" barSize={30} />
                    <Bar dataKey="line" stackId="a" fill="#84cc16" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-between gap-1 text-xs">
                {distribution.email > 0 && <span className="text-blue-600">이메일 {distribution.email.toFixed(1)}%</span>}
                {distribution.naver > 0 && <span className="text-green-600">네이버 {distribution.naver.toFixed(1)}%</span>}
                {distribution.kakao > 0 && <span className="text-purple-600">카카오 {distribution.kakao.toFixed(1)}%</span>}
                {distribution.facebook > 0 && <span className="text-orange-600">페이스북 {distribution.facebook.toFixed(1)}%</span>}
                {distribution.google > 0 && <span className="text-red-600">구글 {distribution.google.toFixed(1)}%</span>}
                {distribution.apple > 0 && <span className="text-cyan-600">애플 {distribution.apple.toFixed(1)}%</span>}
                {distribution.line > 0 && <span className="text-lime-600">라인 {distribution.line.toFixed(1)}%</span>}
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
                <div className="text-xl md:text-2xl lg:text-3xl font-bold">{communityPost.posts}</div>
                <div className={`flex items-center gap-1 text-sm ${communityPost.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {communityPost.growthRate >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{communityPost.growthRate >= 0 ? '+' : ''}{communityPost.growthRate.toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                총 게시물: <span className="text-purple-600">1,180</span>
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">커뮤니티별 점유율</p>
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                  <BarChart layout="vertical" data={[{ name: "", trade: communityPost.tradeRatio, tip: communityPost.commInfoRatio, review: communityPost.commReviewRatio, qa: communityPost.commDebateRatio }]} stackOffset="expand">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold text-foreground mb-2">커뮤니티별 점유율</p>
                              {payload.map((entry: any, index: number) => {
                                const labels: { [key: string]: string } = {
                                  trade: '인증거래',
                                  tip: '판별팁',
                                  review: '제품리뷰',
                                  qa: 'Q&A'
                                }
                                const colors: { [key: string]: string } = {
                                  trade: '#3b82f6',
                                  tip: '#10b981',
                                  review: '#8b5cf6',
                                  qa: '#f59e0b'
                                }
                                return (
                                  <div key={index} className="flex items-center gap-2 mb-1">
                                    <div 
                                      className="w-3 h-3 rounded-sm" 
                                      style={{ backgroundColor: colors[entry.dataKey] }}
                                    />
                                    <span className="text-sm text-muted-foreground">{labels[entry.dataKey]}:</span>
                                    <span className="text-sm font-medium text-foreground">
                                      {entry.value?.toFixed(1)}%
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
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
                <div className="text-xl md:text-2xl lg:text-3xl font-bold">{chatRoom.roomCount}</div>
                <div className={`flex items-center gap-1 text-sm ${chatRoom.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {chatRoom.growthRate >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{chatRoom.growthRate >= 0 ? '+' : ''}{chatRoom.growthRate.toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                총 채팅방: <span className="text-purple-600">280</span>
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">채팅방별 점유율</p>
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                  <BarChart layout="vertical" data={[{ name: "", oneOnOne: chatRoom.chatRatio, tradeChat: chatRoom.tradeChatRatio }]} stackOffset="expand">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold text-foreground mb-2">채팅방별 점유율</p>
                              {payload.map((entry: any, index: number) => {
                                const labels: { [key: string]: string } = {
                                  oneOnOne: '1:1 채팅',
                                  tradeChat: '인증거래 채팅'
                                }
                                const colors: { [key: string]: string } = {
                                  oneOnOne: '#3b82f6',
                                  tradeChat: '#10b981'
                                }
                                return (
                                  <div key={index} className="flex items-center gap-2 mb-1">
                                    <div 
                                      className="w-3 h-3 rounded-sm" 
                                      style={{ backgroundColor: colors[entry.dataKey] }}
                                    />
                                    <span className="text-sm text-muted-foreground">{labels[entry.dataKey]}:</span>
                                    <span className="text-sm font-medium text-foreground">
                                      {entry.value?.toFixed(1)}%
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="oneOnOne" stackId="a" fill="#3b82f6" barSize={30} />
                    <Bar dataKey="tradeChat" stackId="a" fill="#10b981" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-600">1:1 채팅 {chatRoom.chatRatio.toFixed(1)}%</span>
                <span className="text-green-600">인증거래 채팅 {chatRoom.tradeChatRatio.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


