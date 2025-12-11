"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, TrendingDown, Info } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, Cell } from "recharts"
import { formatDateForAPI, getTodayDateString, fetchCommunityPostSummary, CommunityPostSummary, fetchChatRoomSummary, ChatRoomSummary, fetchDownloadTrend, DownloadTrendResponse, DownloadTrendMarketSummary, fetchAnalyticsSummary, AnalyticsSummaryItem, AnalyticsSummaryResponse, fetchExecutionTrend, ExecutionTrendResponse, ExecutionTrendDistributionInfo, fetchScanTrend, ScanTrendResponse, ScanTrendDistributionInfo } from "@/lib/api"
import { fetchNewMemberComprehensive } from "@/lib/fetchNewMemberComprehensive"
import { useDateRange } from "@/hooks/use-date-range"
import { getTargetsConfig, TargetsConfig } from "@/lib/targets-config"
import { getColorByRate } from "@/lib/platform-utils"
import { APP_TYPE_MAP } from "@/lib/type-mappings"

// 통일된 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        {label && <p className="font-semibold text-foreground mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ 
                backgroundColor: entry.color,
                opacity: entry.dataKey?.includes('Predicted') ? 0.7 : 1
              }}
            />
            <span className="text-sm text-muted-foreground">{entry.name}:</span>
            <span className="text-sm font-medium text-foreground">
              {entry.value !== null && entry.value !== undefined ? entry.value.toLocaleString() : 0 }
              {entry.dataKey?.includes('Rate') || typeof entry.value === 'number' && entry.value <= 100 ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

interface PlatformComprehensiveMetricsProps {
  targetsConfig?: TargetsConfig | null
  onTargetsUpdate?: (config: TargetsConfig) => void
}

export function PlatformComprehensiveMetrics({ targetsConfig: externalTargetsConfig, onTargetsUpdate }: PlatformComprehensiveMetricsProps = {}) {
  console.log('🚀 PlatformComprehensiveMetrics 컴포넌트 렌더링 시작')
  
  const [newMemberData, setNewMemberData] = useState<{
    summary: { newMembers: number; growthRate: number; comparisonLabel: string }
    distribution: { email: number; naver: number; kakao: number; facebook: number; google: number; apple: number; line: number }
  } | null>(null)
  const [communityPostData, setCommunityPostData] = useState<CommunityPostSummary | null>(null)
  const [chatRoomData, setChatRoomData] = useState<ChatRoomSummary | null>(null)
  const [downloadTrendData, setDownloadTrendData] = useState<DownloadTrendResponse | null>(null)
  const [analyticsSummaryData, setAnalyticsSummaryData] = useState<AnalyticsSummaryResponse | null>(null)
  const [totalAnalyticsSummaryData, setTotalAnalyticsSummaryData] = useState<AnalyticsSummaryResponse | null>(null) // 누적 전체 수치 (2011-01-01 ~ 현재)
  const [executionTrendData, setExecutionTrendData] = useState<ExecutionTrendResponse | null>(null)
  const [scanTrendData, setScanTrendData] = useState<ScanTrendResponse | null>(null)
  const [isMoreAppsModalOpen, setIsMoreAppsModalOpen] = useState(false)
  const [isCountryDistributionModalOpen, setIsCountryDistributionModalOpen] = useState(false)
  const [isScanCountryDistributionModalOpen, setIsScanCountryDistributionModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [internalTargetsConfig, setInternalTargetsConfig] = useState<TargetsConfig | null>(null)
  
  // 전역 날짜 범위 사용
  const { dateRange } = useDateRange()

  // 목표치 설정: 외부에서 전달되면 사용, 없으면 내부에서 로드
  const targetsConfig = externalTargetsConfig || internalTargetsConfig

  const loadTargets = useCallback(async (newConfig?: TargetsConfig) => {
    if (newConfig) {
      if (onTargetsUpdate) {
        onTargetsUpdate(newConfig)
      } else {
        setInternalTargetsConfig(newConfig)
      }
    } else {
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
  
  // 클라이언트에서만 오늘 날짜 가져오기 (Hydration 오류 방지)
  const [todayDate, setTodayDate] = useState<string>('')
  useEffect(() => {
    // 클라이언트에서만 실행되도록 확인
    if (typeof window !== 'undefined') {
      const today = getTodayDateString()
      console.log('📅 오늘 날짜 설정:', today)
      setTodayDate(today)
    }
  }, [])
  
  // 날짜 범위를 문자열로 변환
  const startDate = dateRange?.from ? formatDateForAPI(dateRange.from) : '2025-01-01'
  // todayDate가 아직 설정되지 않았으면 getTodayDateString() 직접 호출 (fallback)
  const endDate = dateRange?.to ? formatDateForAPI(dateRange.to) : (todayDate || (typeof window !== 'undefined' ? getTodayDateString() : '2025-01-01'))

  useEffect(() => {
    // AbortController를 사용하여 이전 요청 취소
    const controller = new AbortController()
    let isMounted = true
    
    const loadData = async () => {
      if (!isMounted) return
      setLoading(true)
      try {
        // 1. 앱 종합 지표 데이터를 먼저 로드
        console.log('📊 [1단계] 앱 종합 지표 데이터 로드 시작')
        const summaryData = await fetchAnalyticsSummary(startDate, endDate)
        setAnalyticsSummaryData(summaryData)
        console.log('✅ [1단계] 앱 종합 지표 데이터 로드 완료')
        
        // 2. 다운로드 트렌드, 실행 추이, 스캔 추이 데이터를 한 묶음으로 병렬 로드
        console.log('📊 [2단계] 다운로드 트렌드, 실행 추이, 스캔 추이 데이터 병렬 로드 시작')
        const [downloadData, executionData, scanDataResponse] = await Promise.all([
          fetchDownloadTrend('monthly', startDate, endDate),
          fetchExecutionTrend('monthly', startDate, endDate),
          fetchScanTrend('monthly', startDate, endDate)
        ])
        setDownloadTrendData(downloadData)
        setExecutionTrendData(executionData)
        setScanTrendData(scanDataResponse)
        console.log('✅ [2단계] 다운로드 트렌드, 실행 추이, 스캔 추이 데이터 로드 완료')
        
        // 3. 나머지 데이터들을 순차적으로 로드
        console.log('📊 [3단계] 신규 회원 데이터 로드 시작')
        const memberData = await fetchNewMemberComprehensive('monthly', startDate, endDate)
        setNewMemberData({
          summary: memberData.summary,
          distribution: memberData.distribution
        })
        console.log('✅ [3단계] 신규 회원 데이터 로드 완료')
        
        console.log('📊 [4단계] 커뮤니티 게시물 데이터 로드 시작')
        const postData = await fetchCommunityPostSummary(startDate, endDate)
        setCommunityPostData(postData)
        console.log('✅ [4단계] 커뮤니티 게시물 데이터 로드 완료')
        
        console.log('📊 [5단계] 채팅방 데이터 로드 시작')
        const chatData = await fetchChatRoomSummary(startDate, endDate)
        setChatRoomData(chatData)
        console.log('✅ [5단계] 채팅방 데이터 로드 완료')
        
        // 6. 누적 전체 수치 데이터 로드 (2011-01-01 ~ 현재)
        console.log('📊 [6단계] 누적 전체 수치 데이터 로드 시작 (2011-01-01 ~ 현재)')
        const finalTodayDate = todayDate || getTodayDateString()
        console.log('📅 사용할 오늘 날짜:', finalTodayDate)
        const totalSummaryData = await fetchAnalyticsSummary('2011-01-01', finalTodayDate)
        console.log('🔍 [누적 전체 수치] API 응답:', totalSummaryData)
        const totalCommunityActivity = totalSummaryData.data.reduce((sum, item) => sum + (item.totalCommunityActivity || 0), 0)
        console.log('🔍 [누적 전체 수치] totalCommunityActivity 합계:', totalCommunityActivity)
        console.log('🔍 [현재 기간] communityPost.posts:', communityPostData?.posts)
        setTotalAnalyticsSummaryData(totalSummaryData)
        console.log('✅ [6단계] 누적 전체 수치 데이터 로드 완료')
      } catch (error) {
        if (!isMounted) {
          console.log('⚠️ 컴포넌트가 언마운트되어 데이터 로드 중단')
          return
        }
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
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    loadData()
    
    // cleanup: 컴포넌트 언마운트 시 요청 취소
    return () => {
      isMounted = false
      controller.abort()
    }
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

  // 실행 활성자 수 데이터 처리 (appKind가 'GLOBAL'인 row)
  const executionData = useMemo(() => {
    if (!executionTrendData?.data) {
      return {
        activeUsers: 0,
        growthRate: 0,
        totalExecution: 0,
        countryDistribution: {
          country1: { name: '', percent: 0, color: '#3b82f6' },
          country2: { name: '', percent: 0, color: '#10b981' },
          country3: { name: '', percent: 0, color: '#8b5cf6' },
          country4: { name: '', percent: 0, color: '#f59e0b' },
          country5: { name: '', percent: 0, color: '#ef4444' },
          other: 0
        },
        allCountriesData: []
      }
    }

    // appKind가 'GLOBAL'인 row 찾기
    const globalRow = executionTrendData.data.find((item: { appKind: string }) => item.appKind === 'GLOBAL')
    
    if (!globalRow) {
      return {
        activeUsers: 0,
        growthRate: 0,
        totalExecution: 0,
        countryDistribution: {
          country1: { name: '', percent: 0, color: '#3b82f6' },
          country2: { name: '', percent: 0, color: '#10b981' },
          country3: { name: '', percent: 0, color: '#8b5cf6' },
          country4: { name: '', percent: 0, color: '#f59e0b' },
          country5: { name: '', percent: 0, color: '#ef4444' },
          other: 0
        },
        allCountriesData: []
      }
    }

    const activeUsers = Number(globalRow.activeUsers) || 0
    const growthRate = globalRow.growthRate || 0
    const totalExecution = globalRow.totalExecution || 0

    // distributionInfo 파싱 (JSON 문자열인 경우 파싱)
    let distributionInfoArray: ExecutionTrendDistributionInfo[] = []
    try {
      if (typeof globalRow.distributionInfo === 'string') {
        // JSON 문자열인 경우 파싱
        distributionInfoArray = JSON.parse(globalRow.distributionInfo)
      } else if (Array.isArray(globalRow.distributionInfo)) {
        // 이미 배열인 경우 그대로 사용
        distributionInfoArray = globalRow.distributionInfo
      }
    } catch (error) {
      console.error('❌ distributionInfo 파싱 실패:', error)
      distributionInfoArray = []
    }

    // distributionInfo를 country별 percent로 desc 정렬
    const sortedDistribution = [...distributionInfoArray]
      .sort((a, b) => (b.percent || 0) - (a.percent || 0))

    // Top 5 추출
    const top5Distribution = sortedDistribution.slice(0, 5)

    // 나머지 국가들의 percent 합산
    const otherPercent = sortedDistribution
      .slice(5)
      .reduce((sum: number, item: { percent?: number }) => sum + (item.percent || 0), 0)

    // 한글 국가명을 국가 코드로 매핑 (차트에 표시할 주요 국가만)
    const countryNameToCodeMap: Record<string, string> = {
      '대한민국': 'kr',
      '한국': 'kr',
      '일본': 'jp',
      '미국': 'us',
      '미 합중국': 'us',
      '중국': 'cn',
      '베트남': 'vn',
      '태국': 'th',
      '필리핀': 'ph',
      '인도네시아': 'id',
      '싱가포르': 'sg',
      '말레이시아': 'my',
      '대만': 'tw',
      '홍콩': 'hk',
      '인도': 'in',
      '러시아': 'ru',
      '방글라데시': 'bd',
      '카자흐스탄': 'kz',
      '없음': 'other'
    }

    const countryDistribution: { 
      country1: { name: string; percent: number; color: string }
      country2: { name: string; percent: number; color: string }
      country3: { name: string; percent: number; color: string }
      country4: { name: string; percent: number; color: string }
      country5: { name: string; percent: number; color: string }
      other: number
    } = {
      country1: { name: '', percent: 0, color: '#3b82f6' },
      country2: { name: '', percent: 0, color: '#10b981' },
      country3: { name: '', percent: 0, color: '#8b5cf6' },
      country4: { name: '', percent: 0, color: '#f59e0b' },
      country5: { name: '', percent: 0, color: '#ef4444' },
      other: 0
    }

    // Top 5 국가 매핑
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']
    top5Distribution.forEach((item, index) => {
      if (index === 0) {
        countryDistribution.country1 = { name: item.country || '', percent: item.percent || 0, color: colors[0] }
      } else if (index === 1) {
        countryDistribution.country2 = { name: item.country || '', percent: item.percent || 0, color: colors[1] }
      } else if (index === 2) {
        countryDistribution.country3 = { name: item.country || '', percent: item.percent || 0, color: colors[2] }
      } else if (index === 3) {
        countryDistribution.country4 = { name: item.country || '', percent: item.percent || 0, color: colors[3] }
      } else if (index === 4) {
        countryDistribution.country5 = { name: item.country || '', percent: item.percent || 0, color: colors[4] }
      }
    })

    // 전체 국가 데이터 저장 (모달용)
    const allCountriesData = sortedDistribution.map((item, index) => ({
      rank: index + 1,
      country: item.country || '',
      percent: item.percent || 0
    }))

    // 나머지 국가들을 기타에 추가
    countryDistribution.other += otherPercent

    return {
      activeUsers,
      growthRate,
      totalExecution,
      countryDistribution,
      allCountriesData // 모달용 전체 국가 데이터
    }
  }, [executionTrendData])

  // 스캔 활성자 수 데이터 처리 (appKind가 'GLOBAL'인 row)
  const scanData = useMemo(() => {
    if (!scanTrendData?.data) {
      return {
        activeUsers: 0,
        growthRate: 0,
        totalScan: 0,
        activeAppUsers: 0,
        countryDistribution: {
          country1: { name: '', percent: 0, color: '#3b82f6' },
          country2: { name: '', percent: 0, color: '#10b981' },
          country3: { name: '', percent: 0, color: '#8b5cf6' },
          country4: { name: '', percent: 0, color: '#f59e0b' },
          country5: { name: '', percent: 0, color: '#ef4444' },
          other: 0
        },
        allCountriesData: []
      }
    }

    // appKind가 'GLOBAL'인 row 찾기
    const globalRow = scanTrendData.data.find((item: { appKind: string }) => item.appKind === 'GLOBAL')
    
    if (!globalRow) {
      return {
        activeUsers: 0,
        growthRate: 0,
        totalScan: 0,
        activeAppUsers: 0,
        countryDistribution: {
          country1: { name: '', percent: 0, color: '#3b82f6' },
          country2: { name: '', percent: 0, color: '#10b981' },
          country3: { name: '', percent: 0, color: '#8b5cf6' },
          country4: { name: '', percent: 0, color: '#f59e0b' },
          country5: { name: '', percent: 0, color: '#ef4444' },
          other: 0
        },
        allCountriesData: []
      }
    }
    
    const activeUsers = Number(globalRow.activeUsers) || 0
    const growthRate = Number(globalRow.scanGrowthRate) || 0
    const totalScan = Number(globalRow.activeUsers) || 0 // 총 스캔은 activeUsers와 동일
    
    // activeAppUsers 계산 (실행 추이 데이터의 GLOBAL row에서 가져오기)
    // 스캔 API에는 activeAppUsers가 없으므로 실행 API에서 가져온 값을 사용
    let activeAppUsers = 0
    if (executionTrendData?.data) {
      // period가 'TOTAL'인 GLOBAL row 찾기 (없으면 첫 번째 GLOBAL row 사용)
      const executionGlobalRow = executionTrendData.data.find((item: { appKind: string; period?: string }) => 
        item.appKind === 'GLOBAL' && item.period === 'TOTAL'
      ) || executionTrendData.data.find((item: { appKind: string }) => item.appKind === 'GLOBAL')
      
      if (executionGlobalRow) {
        activeAppUsers = Number((executionGlobalRow as any).activeAppUsers) || 0
      }
    }
    
    // 디버깅: activeUsers와 activeAppUsers 값 확인
    console.log('🔍 [스캔 데이터] activeUsers:', activeUsers, 'activeAppUsers:', activeAppUsers, '회원 비율:', activeUsers > 0 ? ((activeAppUsers / activeUsers) * 100).toFixed(1) + '%' : '0.0%')

    // distributionInfo 파싱 (JSON 문자열인 경우 파싱)
    let distributionInfoArray: ScanTrendDistributionInfo[] = []
    try {
      if (typeof globalRow.distributionInfo === 'string') {
        // JSON 문자열인 경우 파싱
        distributionInfoArray = JSON.parse(globalRow.distributionInfo)
      } else if (Array.isArray(globalRow.distributionInfo)) {
        // 이미 배열인 경우 그대로 사용
        distributionInfoArray = globalRow.distributionInfo
      }
    } catch (error) {
      console.error('❌ scan distributionInfo 파싱 실패:', error)
      distributionInfoArray = []
    }

    // distributionInfo를 country별 percent로 desc 정렬
    // percent가 없으면 users를 사용하여 percent 계산
    const totalUsers = distributionInfoArray.reduce((sum: number, item: ScanTrendDistributionInfo) => {
      return sum + (item.users || 0)
    }, 0)

    const distributionWithPercent = distributionInfoArray.map(item => ({
      country: item.country || '',
      percent: item.percent !== undefined ? item.percent : (totalUsers > 0 ? ((item.users || 0) / totalUsers) * 100 : 0)
    }))

    const sortedDistribution = [...distributionWithPercent]
      .sort((a, b) => (b.percent || 0) - (a.percent || 0))

    // Top 5 추출
    const top5Distribution = sortedDistribution.slice(0, 5)

    // 나머지 국가들의 percent 합산
    const otherPercent = sortedDistribution
      .slice(5)
      .reduce((sum: number, item: { percent?: number }) => sum + (item.percent || 0), 0)

    const countryDistribution: { 
      country1: { name: string; percent: number; color: string }
      country2: { name: string; percent: number; color: string }
      country3: { name: string; percent: number; color: string }
      country4: { name: string; percent: number; color: string }
      country5: { name: string; percent: number; color: string }
      other: number
    } = {
      country1: { name: '', percent: 0, color: '#3b82f6' },
      country2: { name: '', percent: 0, color: '#10b981' },
      country3: { name: '', percent: 0, color: '#8b5cf6' },
      country4: { name: '', percent: 0, color: '#f59e0b' },
      country5: { name: '', percent: 0, color: '#ef4444' },
      other: 0
    }

    // Top 5 국가 매핑
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']
    top5Distribution.forEach((item, index) => {
      if (index === 0) {
        countryDistribution.country1 = { name: item.country || '', percent: item.percent || 0, color: colors[0] }
      } else if (index === 1) {
        countryDistribution.country2 = { name: item.country || '', percent: item.percent || 0, color: colors[1] }
      } else if (index === 2) {
        countryDistribution.country3 = { name: item.country || '', percent: item.percent || 0, color: colors[2] }
      } else if (index === 3) {
        countryDistribution.country4 = { name: item.country || '', percent: item.percent || 0, color: colors[3] }
      } else if (index === 4) {
        countryDistribution.country5 = { name: item.country || '', percent: item.percent || 0, color: colors[4] }
      }
    })

    // 전체 국가 데이터 저장 (모달용)
    const allCountriesData = sortedDistribution.map((item, index) => ({
      rank: index + 1,
      country: item.country || '',
      percent: item.percent || 0
    }))

    // 나머지 국가들을 기타에 추가
    countryDistribution.other += otherPercent

    return {
      activeUsers,
      growthRate,
      totalScan,
      activeAppUsers, // 회원 스캔 사용자 수
      countryDistribution,
      allCountriesData // 모달용 전체 국가 데이터
    }
  }, [scanTrendData, executionTrendData]) // executionTrendData도 dependency에 추가 (activeAppUsers 계산에 필요)

  // 앱 타입 매핑 함수 (type-mappings.ts의 APP_TYPE_MAP 사용)
  const getAppName = (app: number | null): string => {
    if (app === null) return 'WEB'
    // APP_TYPE_MAP에서 찾기
    if (APP_TYPE_MAP[app]) {
      return APP_TYPE_MAP[app]
    }
    // 매핑에 없는 경우 기본값
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

  // 모든 앱들 (HT, COP, Global 포함, null과 0도 포함)
  const allApps = useMemo(() => {
    if (!analyticsSummaryData?.data) return []
    // 모든 항목 포함 (null과 0도 포함)
    return analyticsSummaryData.data.sort((a, b) => {
      // HT(1), COP(2), Global(20)을 먼저, 그 다음 앱0과 null(알수없음), 그 다음 다른 앱들
      const priority = (app: number | null) => {
        if (app === 1) return 1
        if (app === 2) return 2
        if (app === 20) return 3
        if (app === 0 || app === null) return 4
        return 5
      }
      return priority(a.app) - priority(b.app)
    })
  }, [analyticsSummaryData])

  // 모달용 레이더 차트 데이터 계산
  const getModalRadarChartData = (appData: AnalyticsSummaryItem | null) => {
    if (!analyticsSummaryData?.data) {
      return [
        { subject: '다운로드', value: 0, actualValue: 0, fullMark: 100 },
        { subject: '스캔', value: 0, actualValue: 0, fullMark: 100 },
        { subject: '회원', value: 0, actualValue: 0, fullMark: 100 },
        { subject: '커뮤니티', value: 0, actualValue: 0, fullMark: 100 },
        { subject: '실행', value: 0, actualValue: 0, fullMark: 100 },
      ]
    }

    // appData가 null인 경우 실제 데이터 찾기
    let targetAppData = appData
    if (!targetAppData) {
      // app이 null인 항목 찾기
      targetAppData = analyticsSummaryData.data.find(item => item.app === null) || null
    }

    if (!targetAppData) {
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
    const downloadPercent = totalDownload > 0 ? ((targetAppData.totalDownload || 0) / totalDownload) * 100 : 0
    const scanPercent = totalScan > 0 ? ((targetAppData.totalScan || 0) / totalScan) * 100 : 0
    const usersPercent = totalUsers > 0 ? ((targetAppData.totalUsers || 0) / totalUsers) * 100 : 0
    const communityPercent = totalCommunity > 0 ? ((targetAppData.totalCommunityActivity || 0) / totalCommunity) * 100 : 0
    const executionPercent = totalExecution > 0 ? ((targetAppData.totalExecution || 0) / totalExecution) * 100 : 0

    return [
      { 
        subject: '다운로드', 
        value: downloadPercent, 
        actualValue: targetAppData.totalDownload || 0,
        fullMark: 100 
      },
      { 
        subject: '스캔', 
        value: scanPercent,
        actualValue: targetAppData.totalScan || 0,
        fullMark: 100 
      },
      { 
        subject: '회원', 
        value: usersPercent,
        actualValue: targetAppData.totalUsers || 0,
        fullMark: 100 
      },
      { 
        subject: '커뮤니티', 
        value: communityPercent,
        actualValue: targetAppData.totalCommunityActivity || 0,
        fullMark: 100 
      },
      { 
        subject: '실행', 
        value: executionPercent,
        actualValue: targetAppData.totalExecution || 0,
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
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          {label && <p className="font-semibold text-foreground mb-2">{label}</p>}
                          {payload.map((entry: any, index: number) => {
                            const dataKey = entry.dataKey as 'HT' | 'COP' | 'Global'
                            const valueKey = `${dataKey}Value` as 'HTValue' | 'COPValue' | 'GlobalValue'
                            const actualValue = entry.payload[valueKey] || 0
                            return (
                              <div key={index} className="flex items-center gap-2 mb-1">
                                <div 
                                  className="w-3 h-3 rounded-sm" 
                                  style={{ 
                                    backgroundColor: entry.color,
                                    opacity: 1
                                  }}
                                />
                                <span className="text-sm text-muted-foreground">{entry.name}:</span>
                                <span className="text-sm font-medium text-foreground">
                                  {entry.value?.toFixed(1)}% ({actualValue.toLocaleString()})
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
              {(() => {
                const target = targetsConfig?.download?.value || 0
                const rate = target > 0 ? ((totalDownloads / target) * 100) : 0
                return (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      총 다운로드: <span className="text-green-600">
                        {totalAnalyticsSummaryData?.data 
                          ? totalAnalyticsSummaryData.data.reduce((sum, item) => sum + (item.totalDownload || 0), 0).toLocaleString()
                          : totalDownloads.toLocaleString()}
                      </span>
                    </p>
                  </div>
                )
              })()}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">마켓별 점유율</p>
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                  <BarChart layout="vertical" data={[{ name: "", playStore: playStorePercentage, appStore: appStorePercentage, chinaStore: chinaStorePercentage }]} stackOffset="expand">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const labels: Record<string, string> = {
                          playStore: "Play Store", appStore: "App Store", chinaStore: "China Store"
                        };
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            {payload.map((entry: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 mb-1">
                                <div 
                                  className="w-3 h-3 rounded-sm" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-muted-foreground">{labels[entry.dataKey as string] || entry.dataKey}:</span>
                                <span className="text-sm font-medium text-foreground">
                                  {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%
                                </span>
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
                <div className="text-xl md:text-2xl lg:text-3xl font-bold">
                  {executionData.activeUsers.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 text-sm ${executionData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {executionData.growthRate >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{executionData.growthRate >= 0 ? '+' : ''}{executionData.growthRate.toFixed(1)}%</span>
                </div>
              </div>
              {(() => {
                const target = targetsConfig?.execution?.value || 0
                const rate = target > 0 ? ((executionData.activeUsers / target) * 100) : 0
                return (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      총 실행: <span className="text-blue-600">
                        {totalAnalyticsSummaryData?.data 
                          ? totalAnalyticsSummaryData.data.reduce((sum, item) => sum + (item.totalExecution || 0), 0).toLocaleString()
                          : executionData.totalExecution.toLocaleString()}
                      </span>
                    </p>
                  </div>
                )
              })()}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">국가별 점유율</p>
                <button
                  onClick={() => setIsCountryDistributionModalOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  더 많은 국가 보기
                </button>
              </div>
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                  <BarChart layout="vertical" data={[{ 
                    name: "", 
                    country1: executionData.countryDistribution.country1.percent, 
                    country2: executionData.countryDistribution.country2.percent, 
                    country3: executionData.countryDistribution.country3.percent, 
                    country4: executionData.countryDistribution.country4.percent, 
                    country5: executionData.countryDistribution.country5.percent, 
                    other: executionData.countryDistribution.other 
                  }]} stackOffset="expand">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            {payload.map((entry: any, index: number) => {
                              const countryName = index === 0 ? executionData.countryDistribution.country1.name :
                                index === 1 ? executionData.countryDistribution.country2.name :
                                index === 2 ? executionData.countryDistribution.country3.name :
                                index === 3 ? executionData.countryDistribution.country4.name :
                                index === 4 ? executionData.countryDistribution.country5.name : '기타'
                              return (
                                <div key={index} className="flex items-center gap-2 mb-1">
                                  <div 
                                    className="w-3 h-3 rounded-sm" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm text-muted-foreground">{countryName}:</span>
                                  <span className="text-sm font-medium text-foreground">
                                    {typeof entry.value === 'number' ? entry.value.toFixed(1) : Number(entry.value || 0).toFixed(1)}%
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )
                      }
                      return null
                    }} />
                    <Bar dataKey="country1" stackId="a" fill={executionData.countryDistribution.country1.color} barSize={30} />
                    <Bar dataKey="country2" stackId="a" fill={executionData.countryDistribution.country2.color} barSize={30} />
                    <Bar dataKey="country3" stackId="a" fill={executionData.countryDistribution.country3.color} barSize={30} />
                    <Bar dataKey="country4" stackId="a" fill={executionData.countryDistribution.country4.color} barSize={30} />
                    <Bar dataKey="country5" stackId="a" fill={executionData.countryDistribution.country5.color} barSize={30} />
                    <Bar dataKey="other" stackId="a" fill="#94a3b8" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: executionData.countryDistribution.country1.color }}>
                  {executionData.countryDistribution.country1.name || '-'}
                </span>
                <span style={{ color: executionData.countryDistribution.country2.color }}>
                  {executionData.countryDistribution.country2.name || '-'}
                </span>
                <span style={{ color: executionData.countryDistribution.country3.color }}>
                  {executionData.countryDistribution.country3.name || '-'}
                </span>
                <span style={{ color: executionData.countryDistribution.country4.color }}>
                  {executionData.countryDistribution.country4.name || '-'}
                </span>
                <span style={{ color: executionData.countryDistribution.country5.color }}>
                  {executionData.countryDistribution.country5.name || '-'}
                </span>
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
                <div className="text-xl md:text-2xl lg:text-3xl font-bold">
                  {scanData.activeUsers.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 text-sm ${scanData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {scanData.growthRate >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{scanData.growthRate >= 0 ? '+' : ''}{scanData.growthRate.toFixed(1)}%</span>
                </div>
              </div>
              {(() => {
                const target = targetsConfig?.scan?.value || 0
                const rate = target > 0 ? ((Number(scanData.activeUsers) / target) * 100) : 0
                return (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      총 스캔: <span className="text-purple-600">
                        {totalAnalyticsSummaryData?.data 
                          ? totalAnalyticsSummaryData.data.reduce((sum, item) => sum + (item.totalScan || 0), 0).toLocaleString()
                          : scanData.totalScan.toLocaleString()}
                      </span>
                    </p>
                  </div>
                )
              })()}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">국가별 점유율</p>
                <button
                  onClick={() => setIsScanCountryDistributionModalOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  더 많은 국가 보기
                </button>
              </div>
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                  <BarChart layout="vertical" data={[{ 
                    name: "", 
                    country1: scanData.countryDistribution.country1.percent, 
                    country2: scanData.countryDistribution.country2.percent, 
                    country3: scanData.countryDistribution.country3.percent, 
                    country4: scanData.countryDistribution.country4.percent, 
                    country5: scanData.countryDistribution.country5.percent, 
                    other: scanData.countryDistribution.other 
                  }]} stackOffset="expand">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            {payload.map((entry: any, index: number) => {
                              const countryName = index === 0 ? scanData.countryDistribution.country1.name :
                                index === 1 ? scanData.countryDistribution.country2.name :
                                index === 2 ? scanData.countryDistribution.country3.name :
                                index === 3 ? scanData.countryDistribution.country4.name :
                                index === 4 ? scanData.countryDistribution.country5.name : '기타'
                              return (
                                <div key={index} className="flex items-center gap-2 mb-1">
                                  <div 
                                    className="w-3 h-3 rounded-sm" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm text-muted-foreground">{countryName}:</span>
                                  <span className="text-sm font-medium text-foreground">
                                    {typeof entry.value === 'number' ? entry.value.toFixed(1) : Number(entry.value || 0).toFixed(1)}%
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )
                      }
                      return null
                    }} />
                    <Bar dataKey="country1" stackId="a" fill={scanData.countryDistribution.country1.color} barSize={30} />
                    <Bar dataKey="country2" stackId="a" fill={scanData.countryDistribution.country2.color} barSize={30} />
                    <Bar dataKey="country3" stackId="a" fill={scanData.countryDistribution.country3.color} barSize={30} />
                    <Bar dataKey="country4" stackId="a" fill={scanData.countryDistribution.country4.color} barSize={30} />
                    <Bar dataKey="country5" stackId="a" fill={scanData.countryDistribution.country5.color} barSize={30} />
                    <Bar dataKey="other" stackId="a" fill="#94a3b8" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: scanData.countryDistribution.country1.color }}>
                  {scanData.countryDistribution.country1.name || '-'}
                </span>
                <span style={{ color: scanData.countryDistribution.country2.color }}>
                  {scanData.countryDistribution.country2.name || '-'}
                </span>
                <span style={{ color: scanData.countryDistribution.country3.color }}>
                  {scanData.countryDistribution.country3.name || '-'}
                </span>
                <span style={{ color: scanData.countryDistribution.country4.color }}>
                  {scanData.countryDistribution.country4.name || '-'}
                </span>
                <span style={{ color: scanData.countryDistribution.country5.color }}>
                  {scanData.countryDistribution.country5.name || '-'}
                </span>
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
                <div className="text-xl md:text-2xl lg:text-3xl font-bold">{executionData.activeUsers > 0 
                    ? ((Number(scanData.activeUsers) / Number(executionData.activeUsers)) * 100).toFixed(1)
                    : '0.0'
                  }%</div>              
                <div className="text-xl md:text-2xl lg:text-3xl font-bold">
                  <span><br/></span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-purple-600">
                  <br/>
                </span>
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">스캔 사용자의 회원/비회원 비율</p>
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                  <BarChart layout="vertical" data={[{ 
                    name: "", 
                    member: (() => {
                      // 캐싱으로 인해 string일 수 있으므로 number로 변환
                      const activeUsers = Number(scanData.activeUsers) || 0
                      const activeAppUsers = Number(scanData.activeAppUsers) || 0
                      const memberPercent = activeUsers > 0 ? (activeAppUsers / activeUsers) * 100 : 0
                      console.log('🔍 [회원/비회원 비율 계산] activeUsers:', activeUsers, 'activeAppUsers:', activeAppUsers, 'memberPercent:', memberPercent.toFixed(1) + '%')
                      return memberPercent
                    })(), 
                    nonmember: (() => {
                      // 캐싱으로 인해 string일 수 있으므로 number로 변환
                      const activeUsers = Number(scanData.activeUsers) || 0
                      const activeAppUsers = Number(scanData.activeAppUsers) || 0
                      const nonMemberPercent = activeUsers > 0 ? ((activeUsers - activeAppUsers) / activeUsers) * 100 : 0
                      console.log('🔍 [회원/비회원 비율 계산] nonMemberPercent:', nonMemberPercent.toFixed(1) + '%', '합계:', (activeUsers > 0 ? ((activeAppUsers / activeUsers) * 100) + ((activeUsers - activeAppUsers) / activeUsers) * 100 : 0).toFixed(1) + '%')
                      return nonMemberPercent
                    })()
                  }]} stackOffset="expand">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const labels: Record<string, string> = {
                          member: "회원", nonmember: "비회원"
                        };
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            {payload.map((entry: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 mb-1">
                                <div 
                                  className="w-3 h-3 rounded-sm" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-muted-foreground">{labels[entry.dataKey as string] || entry.dataKey}:</span>
                                <span className="text-sm font-medium text-foreground">
                                  {typeof entry.value === 'number' ? entry.value.toFixed(1) : Number(entry.value || 0).toFixed(1)}%
                                </span>
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
                <span className="text-blue-600">
                  회원 {(() => {
                    // 캐싱으로 인해 string일 수 있으므로 number로 변환
                    const activeUsers = Number(scanData.activeUsers) || 0
                    const activeAppUsers = Number(scanData.activeAppUsers) || 0
                    return activeUsers > 0 ? ((activeAppUsers / activeUsers) * 100).toFixed(1) : '0.0'
                  })()}%
                </span>
                <span className="text-green-600">
                  비회원 {(() => {
                    // 캐싱으로 인해 string일 수 있으므로 number로 변환
                    const activeUsers = Number(scanData.activeUsers) || 0
                    const activeAppUsers = Number(scanData.activeAppUsers) || 0
                    return activeUsers > 0 ? (((activeUsers - activeAppUsers) / activeUsers) * 100).toFixed(1) : '0.0'
                  })()}%
                </span>
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
              {(() => {
                const target = targetsConfig?.userInflow?.value || 0
                const rate = target > 0 ? ((summary.newMembers / target) * 100) : 0
                return (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      총 회원: <span className="text-purple-600">
                        {totalAnalyticsSummaryData?.data 
                          ? totalAnalyticsSummaryData.data.reduce((sum, item) => sum + (item.totalUsers || 0), 0).toLocaleString()
                          : '0'}
                      </span>
                    </p>
                  </div>
                )
              })()}
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
                    <Tooltip content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const labels: Record<string, string> = {
                          email: "이메일", naver: "네이버", kakao: "카카오", facebook: "페이스북",
                          google: "구글", apple: "애플", line: "라인"
                        };
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            {payload.map((entry: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 mb-1">
                                <div 
                                  className="w-3 h-3 rounded-sm" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-muted-foreground">{labels[entry.dataKey as string] || entry.dataKey}:</span>
                                <span className="text-sm font-medium text-foreground">
                                  {entry.value}%
                                </span>
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
              {(() => {
                const target = targetsConfig?.communityPosts?.value || 0
                const rate = target > 0 ? ((communityPost.posts / target) * 100) : 0
                return (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      총 게시물: <span className="text-purple-600">
                        {(() => {
                          if (!totalAnalyticsSummaryData?.data) return '0'
                          const total = totalAnalyticsSummaryData.data.reduce((sum, item) => sum + (item.totalCommunityActivity || 0), 0)
                          console.log('🔍 [총 게시물 계산] totalCommunityActivity 합계:', total, '현재 기간 posts:', communityPost.posts)
                          return total.toLocaleString()
                        })()}
                      </span>
                    </p>
                  </div>
                )
              })()}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">커뮤니티별 점유율</p>
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                  <BarChart layout="vertical" data={[{ name: "", trade: communityPost.tradeRatio, tip: communityPost.commInfoRatio, review: communityPost.commReviewRatio, qa: communityPost.commDebateRatio }]} stackOffset="expand">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip 
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const labels: { [key: string]: string } = {
                            trade: '인증거래',
                            tip: '판별팁',
                            review: '정품리뷰',
                            qa: 'Q&A'
                          }
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              {payload.map((entry: any, index: number) => (
                                <div key={index} className="flex items-center gap-2 mb-1">
                                  <div 
                                    className="w-3 h-3 rounded-sm" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm text-muted-foreground">{labels[entry.dataKey] || entry.dataKey}:</span>
                                  <span className="text-sm font-medium text-foreground">
                                    {entry.value?.toFixed(1)}%
                                  </span>
                                </div>
                              ))}
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
              {(() => {
                const target = targetsConfig?.newChatRooms?.value || 0
                const rate = target > 0 ? ((chatRoom.roomCount / target) * 100) : 0
                return (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      총 채팅방: <span className="text-purple-600">
                        {totalAnalyticsSummaryData?.data 
                          ? totalAnalyticsSummaryData.data.reduce((sum, item) => sum + (item.totalChats || 0), 0).toLocaleString()
                          : '0'}
                      </span>
                    </p>
                  </div>
                )
              })()}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm md:text-md lg:text-base font-medium text-muted-foreground">채팅방별 점유율</p>
              <div className="h-20 min-h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                  <BarChart layout="vertical" data={[{ name: "", oneOnOne: chatRoom.chatRatio, tradeChat: chatRoom.tradeChatRatio }]} stackOffset="expand">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip 
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const labels: { [key: string]: string } = {
                            oneOnOne: '1:1 채팅',
                            tradeChat: '인증거래 채팅'
                          }
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              {payload.map((entry: any, index: number) => (
                                <div key={index} className="flex items-center gap-2 mb-1">
                                  <div 
                                    className="w-3 h-3 rounded-sm" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm text-muted-foreground">{labels[entry.dataKey] || entry.dataKey}:</span>
                                  <span className="text-sm font-medium text-foreground">
                                    {entry.value?.toFixed(1)}%
                                  </span>
                                </div>
                              ))}
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
                  <Card key={app.app ?? 'null'} className="p-4">
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
                              content={({ active, payload, label }: any) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                      {label && <p className="font-semibold text-foreground mb-2">{label}</p>}
                                      {payload.map((entry: any, index: number) => {
                                        const actualValue = entry.payload.actualValue || 0
                                        return (
                                          <div key={index} className="flex items-center gap-2 mb-1">
                                            <div 
                                              className="w-3 h-3 rounded-sm" 
                                              style={{ 
                                                backgroundColor: entry.color,
                                                opacity: 1
                                              }}
                                            />
                                            <span className="text-sm text-muted-foreground">{entry.name}:</span>
                                            <span className="text-sm font-medium text-foreground">
                                              {entry.value?.toFixed(1)}% ({actualValue.toLocaleString()})
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

      {/* 국가별 점유율 상세 모달 */}
      <Dialog open={isCountryDistributionModalOpen} onOpenChange={setIsCountryDistributionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">실행 활성자 수 국가별 점유율</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            {executionData.allCountriesData && executionData.allCountriesData.length > 0 ? (
              (() => {
                // 0%인 항목 필터링
                const filteredData = executionData.allCountriesData.filter(country => country.percent > 0)
               
                return filteredData.length > 0 ? (
                  <div className="space-y-1">
                    {filteredData.map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-8">
                            {country.rank}
                          </span>
                          <span className="text-sm font-medium">{country.country}</span>
                        </div>
                        <span className="text-sm font-semibold">{country.percent.toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">표시할 국가 데이터가 없습니다.</p>
                )
              })()
            ) : (
              <p className="text-center text-muted-foreground py-8">표시할 국가 데이터가 없습니다.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 스캔 활성자 수 국가별 점유율 상세 모달 */}
      <Dialog open={isScanCountryDistributionModalOpen} onOpenChange={setIsScanCountryDistributionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">스캔 활성자 수 국가별 점유율</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            {scanData.allCountriesData && scanData.allCountriesData.length > 0 ? (
              (() => {
                // 0%인 항목 필터링
                const filteredData = scanData.allCountriesData.filter(country => country.percent > 0)
                return filteredData.length > 0 ? (
                  <div className="space-y-1">
                    {filteredData.map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-8">
                            {country.rank}
                          </span>
                          <span className="text-sm font-medium">{country.country}</span>
                        </div>
                        <span className="text-sm font-semibold">{country.percent.toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">표시할 국가 데이터가 없습니다.</p>
                )
              })()
            ) : (
              <p className="text-center text-muted-foreground py-8">표시할 국가 데이터가 없습니다.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


