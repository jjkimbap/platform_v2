"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, TrendingDown, Info } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, Cell } from "recharts"
import { formatDateForAPI, getTodayDateString, fetchCommunityPostSummary, CommunityPostSummary, fetchChatRoomSummary, ChatRoomSummary, fetchDownloadTrend, DownloadTrendResponse, DownloadTrendMarketSummary, fetchAnalyticsSummary, AnalyticsSummaryItem, AnalyticsSummaryResponse } from "@/lib/api"
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
  const [downloadTrendData, setDownloadTrendData] = useState<DownloadTrendResponse | null>(null)
  const [analyticsSummaryData, setAnalyticsSummaryData] = useState<AnalyticsSummaryResponse | null>(null)
  const [isMoreAppsModalOpen, setIsMoreAppsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // 신규 회원 데이터, 커뮤니티 게시물 데이터, 채팅방 데이터, 다운로드 트렌드 데이터, Analytics Summary 데이터를 병렬로 가져오기
        const [memberData, postData, chatData, downloadData, summaryData] = await Promise.all([
          fetchNewMemberComprehensive('monthly', startDate, endDate),
          fetchCommunityPostSummary(startDate, endDate),
          fetchChatRoomSummary(startDate, endDate),
          fetchDownloadTrend('monthly', startDate, endDate),
          fetchAnalyticsSummary(startDate, endDate)
        ])
        setNewMemberData({
          summary: memberData.summary,
          distribution: memberData.distribution
        })
        setCommunityPostData(postData)
        setChatRoomData(chatData)
        setDownloadTrendData(downloadData)
        setAnalyticsSummaryData(summaryData)
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
  
  // 다운로드 데이터 계산
  const marketSummaryData = downloadTrendData?.data.filter(
    (item): item is DownloadTrendMarketSummary => item.type === "MarketSummary"
  ) || []
  
  const totalDownloads = marketSummaryData.reduce((sum: number, item: DownloadTrendMarketSummary) => sum + (item.totalDownloads || 0), 0)
  const totalGrowthRate = marketSummaryData.length > 0
    ? marketSummaryData.reduce((sum: number, item: DownloadTrendMarketSummary) => sum + (item.growthRate || 0), 0) / marketSummaryData.length
    : 0
  
  // 마켓별 점유율 계산
  const appStoreData = marketSummaryData.find((item: DownloadTrendMarketSummary) => item.groupKey === "appstore")
  const playStoreData = marketSummaryData.find((item: DownloadTrendMarketSummary) => item.groupKey === "playstore")
  const chinaStoreData = marketSummaryData.find((item: DownloadTrendMarketSummary) => item.groupKey === "chinastore")
  
  const appStoreDownloads = appStoreData?.totalDownloads || 0
  const playStoreDownloads = playStoreData?.totalDownloads || 0
  const chinaStoreDownloads = chinaStoreData?.totalDownloads || 0
  const totalMarketDownloads = appStoreDownloads + playStoreDownloads + chinaStoreDownloads
  
  const appStorePercentage = totalMarketDownloads > 0 ? (appStoreDownloads / totalMarketDownloads) * 100 : 0
  const playStorePercentage = totalMarketDownloads > 0 ? (playStoreDownloads / totalMarketDownloads) * 100 : 0
  const chinaStorePercentage = totalMarketDownloads > 0 ? (chinaStoreDownloads / totalMarketDownloads) * 100 : 0

  // 앱 타입 매핑 함수
  const getAppName = (app: number | null): string => {
    if (app === 1) return 'HT'
    if (app === 2) return 'COP'
    if (app === 20) return 'Global'
    return `앱 ${app}`
  }

  // 레이더 차트 데이터 계산 (HT, COP, Global만)
  const radarChartData = useMemo(() => {
    if (!analyticsSummaryData?.data) {
      return [
        { subject: '다운로드', HT: 0, COP: 0, Global: 0, HTValue: 0, COPValue: 0, GlobalValue: 0, fullMark: 100 },
        { subject: '스캔', HT: 0, COP: 0, Global: 0, HTValue: 0, COPValue: 0, GlobalValue: 0, fullMark: 100 },
        { subject: '회원', HT: 0, COP: 0, Global: 0, HTValue: 0, COPValue: 0, GlobalValue: 0, fullMark: 100 },
        { subject: '커뮤니티', HT: 0, COP: 0, Global: 0, HTValue: 0, COPValue: 0, GlobalValue: 0, fullMark: 100 },
        { subject: '실행', HT: 0, COP: 0, Global: 0, HTValue: 0, COPValue: 0, GlobalValue: 0, fullMark: 100 },
      ]
    }

    // HT, COP, Global 데이터 추출
    const htData = analyticsSummaryData.data.find(item => item.app === 1)
    const copData = analyticsSummaryData.data.find(item => item.app === 2)
    const globalData = analyticsSummaryData.data.find(item => item.app === 20)

    // 각 지표별 총합 계산 (HT, COP, Global만)
    const totalDownload = (htData?.totalDownload || 0) + (copData?.totalDownload || 0) + (globalData?.totalDownload || 0)
    const totalScan = (htData?.totalScan || 0) + (copData?.totalScan || 0) + (globalData?.totalScan || 0)
    const totalUsers = (htData?.totalUsers || 0) + (copData?.totalUsers || 0) + (globalData?.totalUsers || 0)
    const totalCommunity = (htData?.totalCommunityActivity || 0) + (copData?.totalCommunityActivity || 0) + (globalData?.totalCommunityActivity || 0)
    const totalExecution = (htData?.totalExecution || 0) + (copData?.totalExecution || 0) + (globalData?.totalExecution || 0)

    // 각 앱별 점유율 계산 (0-100%)
    const htDownload = totalDownload > 0 ? ((htData?.totalDownload || 0) / totalDownload) * 100 : 0
    const copDownload = totalDownload > 0 ? ((copData?.totalDownload || 0) / totalDownload) * 100 : 0
    const globalDownload = totalDownload > 0 ? ((globalData?.totalDownload || 0) / totalDownload) * 100 : 0

    const htScan = totalScan > 0 ? ((htData?.totalScan || 0) / totalScan) * 100 : 0
    const copScan = totalScan > 0 ? ((copData?.totalScan || 0) / totalScan) * 100 : 0
    const globalScan = totalScan > 0 ? ((globalData?.totalScan || 0) / totalScan) * 100 : 0

    const htUsers = totalUsers > 0 ? ((htData?.totalUsers || 0) / totalUsers) * 100 : 0
    const copUsers = totalUsers > 0 ? ((copData?.totalUsers || 0) / totalUsers) * 100 : 0
    const globalUsers = totalUsers > 0 ? ((globalData?.totalUsers || 0) / totalUsers) * 100 : 0

    const htCommunity = totalCommunity > 0 ? ((htData?.totalCommunityActivity || 0) / totalCommunity) * 100 : 0
    const copCommunity = totalCommunity > 0 ? ((copData?.totalCommunityActivity || 0) / totalCommunity) * 100 : 0
    const globalCommunity = totalCommunity > 0 ? ((globalData?.totalCommunityActivity || 0) / totalCommunity) * 100 : 0

    const htExecution = totalExecution > 0 ? ((htData?.totalExecution || 0) / totalExecution) * 100 : 0
    const copExecution = totalExecution > 0 ? ((copData?.totalExecution || 0) / totalExecution) * 100 : 0
    const globalExecution = totalExecution > 0 ? ((globalData?.totalExecution || 0) / totalExecution) * 100 : 0

    return [
      { 
        subject: '다운로드', 
        HT: htDownload, COP: copDownload, Global: globalDownload, 
        HTValue: htData?.totalDownload || 0, COPValue: copData?.totalDownload || 0, GlobalValue: globalData?.totalDownload || 0,
        fullMark: 100 
      },
      { 
        subject: '스캔', 
        HT: htScan, COP: copScan, Global: globalScan,
        HTValue: htData?.totalScan || 0, COPValue: copData?.totalScan || 0, GlobalValue: globalData?.totalScan || 0,
        fullMark: 100 
      },
      { 
        subject: '회원', 
        HT: htUsers, COP: copUsers, Global: globalUsers,
        HTValue: htData?.totalUsers || 0, COPValue: copData?.totalUsers || 0, GlobalValue: globalData?.totalUsers || 0,
        fullMark: 100 
      },
      { 
        subject: '커뮤니티', 
        HT: htCommunity, COP: copCommunity, Global: globalCommunity,
        HTValue: htData?.totalCommunityActivity || 0, COPValue: copData?.totalCommunityActivity || 0, GlobalValue: globalData?.totalCommunityActivity || 0,
        fullMark: 100 
      },
      { 
        subject: '실행', 
        HT: htExecution, COP: copExecution, Global: globalExecution,
        HTValue: htData?.totalExecution || 0, COPValue: copData?.totalExecution || 0, GlobalValue: globalData?.totalExecution || 0,
        fullMark: 100 
      },
    ]
  }, [analyticsSummaryData])

  // 모든 앱들 (HT, COP, Global 포함)
  const allApps = useMemo(() => {
    if (!analyticsSummaryData?.data) return []
    return analyticsSummaryData.data.filter(item => item.app !== null).sort((a, b) => {
      // HT(1), COP(2), Global(20)을 먼저, 그 다음 다른 앱들
      const priority = (app: number | null) => {
        if (app === 1) return 1
        if (app === 2) return 2
        if (app === 20) return 3
        return 4
      }
      return priority(a.app) - priority(b.app)
    })
  }, [analyticsSummaryData])

  // 모달용 레이더 차트 데이터 계산
  const getModalRadarChartData = (appData: AnalyticsSummaryItem | null) => {
    if (!appData || !analyticsSummaryData?.data) {
      return [
        { subject: '다운로드', value: 0, actualValue: 0, fullMark: 100 },
        { subject: '스캔', value: 0, actualValue: 0, fullMark: 100 },
        { subject: '회원', value: 0, actualValue: 0, fullMark: 100 },
        { subject: '커뮤니티', value: 0, actualValue: 0, fullMark: 100 },
        { subject: '실행', value: 0, actualValue: 0, fullMark: 100 },
      ]
    }

    // 전체 데이터에서 각 지표별 총합 계산
    const totalDownload = analyticsSummaryData.data.reduce((sum, item) => sum + (item.totalDownload || 0), 0)
    const totalScan = analyticsSummaryData.data.reduce((sum, item) => sum + (item.totalScan || 0), 0)
    const totalUsers = analyticsSummaryData.data.reduce((sum, item) => sum + (item.totalUsers || 0), 0)
    const totalCommunity = analyticsSummaryData.data.reduce((sum, item) => sum + (item.totalCommunityActivity || 0), 0)
    const totalExecution = analyticsSummaryData.data.reduce((sum, item) => sum + (item.totalExecution || 0), 0)

    // 선택된 앱의 점유율 계산
    const downloadPercent = totalDownload > 0 ? ((appData.totalDownload || 0) / totalDownload) * 100 : 0
    const scanPercent = totalScan > 0 ? ((appData.totalScan || 0) / totalScan) * 100 : 0
    const usersPercent = totalUsers > 0 ? ((appData.totalUsers || 0) / totalUsers) * 100 : 0
    const communityPercent = totalCommunity > 0 ? ((appData.totalCommunityActivity || 0) / totalCommunity) * 100 : 0
    const executionPercent = totalExecution > 0 ? ((appData.totalExecution || 0) / totalExecution) * 100 : 0

    return [
      { 
        subject: '다운로드', 
        value: downloadPercent, 
        actualValue: appData.totalDownload || 0,
        fullMark: 100 
      },
      { 
        subject: '스캔', 
        value: scanPercent,
        actualValue: appData.totalScan || 0,
        fullMark: 100 
      },
      { 
        subject: '회원', 
        value: usersPercent,
        actualValue: appData.totalUsers || 0,
        fullMark: 100 
      },
      { 
        subject: '커뮤니티', 
        value: communityPercent,
        actualValue: appData.totalCommunityActivity || 0,
        fullMark: 100 
      },
      { 
        subject: '실행', 
        value: executionPercent,
        actualValue: appData.totalExecution || 0,
        fullMark: 100 
      },
    ]
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">앱 종합 지표</h2>
      {/* 그리드 레이아웃: 모든 카드를 한 줄로 배치 */}
      <div className="grid grid-cols-8 grid-rows-1 gap-1">
        {/* Radar Chart */}
        <Card className="flex flex-col">
          <CardContent className="px-2 py-2 flex-1 flex flex-col items-center justify-center min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <RadarChart data={radarChartData}>
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
                  formatter={(value: number, name: string, props: any) => {
                    const dataKey = name as 'HT' | 'COP' | 'Global'
                    const valueKey = `${dataKey}Value` as 'HTValue' | 'COPValue' | 'GlobalValue'
                    const actualValue = props.payload[valueKey] || 0
                    return `${value.toFixed(1)}% (${actualValue.toLocaleString()})`
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            {allApps.length > 3 && (
              <p 
                className="text-xs text-muted-foreground cursor-pointer hover:text-foreground mt-2"
                onClick={() => setIsMoreAppsModalOpen(true)}
              >
                모든 앱 보기 ({allApps.length})
              </p>
            )}
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
                <div className="text-xl md:text-2xl lg:text-3xl font-bold">
                  {loading ? '...' : totalDownloads.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 text-sm ${totalGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGrowthRate >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{totalGrowthRate >= 0 ? '+' : ''}{totalGrowthRate.toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                총 다운로드: <span className="text-green-600">{totalDownloads.toLocaleString()}</span>
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">마켓별 점유율</p>
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                  <BarChart layout="vertical" data={[{ name: "", playStore: playStorePercentage, appStore: appStorePercentage, chinaStore: chinaStorePercentage }]} stackOffset="expand">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const labels: Record<string, string> = {
                          playStore: "Play Store", appStore: "App Store", chinaStore: "China Store"
                        };
                        return (
                          <div className="bg-card border border-border rounded-md p-2 shadow-md">
                            {payload.map((entry, index) => (
                              <div key={index} className="text-xs">
                                <span className="font-semibold">{labels[entry.dataKey as string] || entry.dataKey}: </span>
                                <span>{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Bar dataKey="playStore" stackId="a" fill="#3b82f6" barSize={30} />
                    <Bar dataKey="appStore" stackId="a" fill="#10b981" barSize={30} />
                    <Bar dataKey="chinaStore" stackId="a" fill="#8b5cf6" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-600">Play Store {playStorePercentage.toFixed(1)}%</span>
                <span className="text-green-600">App Store {appStorePercentage.toFixed(1)}%</span>
                <span className="text-purple-600">China Store {chinaStorePercentage.toFixed(1)}%</span>
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
                {/* <div className="text-xs text-muted-foreground">
                  <span>{summary.comparisonLabel}</span>
                </div> */}
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
                                  review: '정품리뷰',
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
                <span className="text-purple-600">정품리뷰</span>
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

      {/* 모든 앱 보기 모달 */}
      <Dialog open={isMoreAppsModalOpen} onOpenChange={setIsMoreAppsModalOpen}>
        <DialogContent 
          className="!max-w-[95vw] !w-[95vw] sm:!max-w-[95vw] md:!max-w-[95vw] lg:!max-w-[95vw] !max-h-[95vh] overflow-y-auto"
          style={{ maxWidth: '95vw', width: '95vw', maxHeight: '95vh' }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">앱별 종합 지표</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {allApps.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">표시할 앱이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allApps.map((app) => (
                  <Card key={app.app} className="p-4">
                    <h3 className="text-lg font-semibold mb-4">{getAppName(app.app)}</h3>
                    <div className="space-y-4">
                      {/* 레이더 차트 */}
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={getModalRadarChartData(app)}>
                            <PolarGrid strokeDasharray="3 3" stroke="#d1d5db" />
                            <PolarAngleAxis 
                              dataKey="subject" 
                              tick={{ fill: '#374151', fontSize: 10, fontWeight: 600 }}
                            />
                            <PolarRadiusAxis 
                              angle={90} 
                              domain={[0, 100]} 
                              tick={{ fill: '#6b7280', fontSize: 8 }}
                            />
                            <Radar 
                              name={getAppName(app.app)} 
                              dataKey="value" 
                              stroke="#2563eb" 
                              fill="#3b82f6" 
                              fillOpacity={0.4} 
                              strokeWidth={2}
                            />
                            <Legend 
                              verticalAlign="bottom"
                              height={20}
                              wrapperStyle={{ 
                                paddingTop: '5px',
                                fontSize: '10px',
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
                              formatter={(value: number, name: string, props: any) => {
                                const actualValue = props.payload.actualValue || 0
                                return `${value.toFixed(1)}% (${actualValue.toLocaleString()})`
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                     
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


