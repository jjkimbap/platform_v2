"use client"

import React, { useState, useMemo, useEffect } from "react"
import { flushSync } from "react-dom"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip, PieChart, Pie, Cell, BarChart } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, MessageCircle, TrendingUp, Eye, Heart, MessageSquare, Bookmark, Calendar, Info } from "lucide-react"
import { CustomUserSearch } from "@/components/custom-user-search"
import { 
  defaultTrendingScoreConfig, 
  getTrendingScoreConfig,
  calculateCommunityGrowth,
  adjustThresholdsByGrowth,
  type TrendingScoreConfig,
  type CommunityGrowthMetrics
} from "@/lib/trending-score-config"
import { CustomLegend } from "@/components/platform/common/custom-legend"
import { UserDetailModal, UserDetail } from "@/components/platform/common/user-detail-modal"
import { fetchUserRanking, formatDateForAPI, getTodayDateString, type UserRankingItem, fetchUserDetailTrend, type MonthlyTrendItem, fetchPostRanking, fetchTrendingPostRanking, fetchPostDetail, type PostRankingItem, type PostDetailResponse, API_IMG_URL, fetchRankingSummary, type RankingSummaryItem, fetchRankingSummaryPost, type PostRankingSummaryItem } from "@/lib/api"
import { getAppTypeLabel, getOsTypeLabel, getGenderLabel, OS_TYPE_MAP, APP_TYPE_MAP } from "@/lib/type-mappings"
import { useDateRange } from "@/hooks/use-date-range"
import { getCategoryName, getBoardTypeName } from "@/lib/category-mapping"

// 날짜를 yyyy-mm-dd 형식으로 변환하는 유틸리티 함수
const formatDateToYYYYMMDD = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      // 이미 yyyy-mm-dd 형식인 경우 그대로 반환
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString
      }
      return dateString
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    return dateString
  }
}

// 커스텀 툴팁 컴포넌트
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg z-50">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => {
            if (entry.value === null || entry.value === undefined) return null
            const value = typeof entry.value === 'number' ? entry.value : 0
            return (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ 
                    backgroundColor: entry.color,
                    opacity: entry.dataKey?.includes('Predicted') ? 0.7 : 1
                  }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}:</span>
                <span className="text-sm font-medium text-foreground">
                  {value.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

// 게시물 상세 정보 타입 정의
interface PostDetail {
  title: string
  imageUrl?: string
  content?: string
  author: string
  authorUserNo?: string
  views: number
  comments: number
  likes: number
  bookmarks: number
  language: string
  createdAt: string
  registeredApp: string
  category: string
  country: string
  trendData?: any
}

// 게시물 랭킹 데이터 변환 함수
const convertPostRankingData = (postData: PostRankingItem[]) => {
  return postData.map((item, index) => ({
    rank: item.postRank || index + 1,
    title: item.title || '',
    author: item.userNickname || `사용자${item.userNo}`,
    country: item.country || '기타',
    category: getCategoryName(item.category),
    views: item.views || 0,
    likes: item.likes || 0,
    comments: item.comments || 0,
    bookmarks: item.bookmarks || 0,
    createdAt: item.createDate || '',
    postId: item.postId,
    boardType: item.boardType,
    userNo: item.userNo,
    img: item.img,
    content: item.content || '',
    totalEngagement: (item.views || 0) + (item.likes || 0) + (item.comments || 0) + (item.bookmarks || 0),
    trendData: undefined,
    trendScore: undefined
  }))
}



export function PlatformRankingAccordions({ 
  selectedCountry = "전체"
}: { selectedCountry?: string }) {

  // 필터 상태
  const [selectedCommunity, setSelectedCommunity] = useState<string>("전체")
  const [selectedCategory, setSelectedCategory] = useState<string>("전체")
  const [postSortBy, setPostSortBy] = useState<string>("totalEngagement") // 게시물 정렬 기준
  
  // 날짜 범위 및 API 데이터 상태
  const { dateRange } = useDateRange()
  const [todayDate, setTodayDate] = useState<string>('2025-01-01')
  const [communityRankingData, setCommunityRankingData] = useState<UserRankingItem[]>([])
  const [chatRankingData, setChatRankingData] = useState<UserRankingItem[]>([])
  const [integratedRankingData, setIntegratedRankingData] = useState<UserRankingItem[]>([])
  const [growthRateRankingData, setGrowthRateRankingData] = useState<UserRankingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [postRankingData, setPostRankingData] = useState<PostRankingItem[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  // 급상승 게시물 데이터
  const [trendingPostRankingData, setTrendingPostRankingData] = useState<PostRankingItem[]>([])
  const [loadingTrendingPosts, setLoadingTrendingPosts] = useState(false)
  // 선택된 급상승 게시물의 추이 데이터
  const [selectedTrendingPostTrendData, setSelectedTrendingPostTrendData] = useState<any[] | null>(null)
  // 첫 번째 급상승 게시물의 추이 데이터 (기본 표시용)
  const [firstTrendingPostTrendData, setFirstTrendingPostTrendData] = useState<any[] | null>(null)
  
  // 랭킹 요약 데이터 상태
  const [rankingSummaryData, setRankingSummaryData] = useState<RankingSummaryItem[]>([])
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summaryFilters, setSummaryFilters] = useState<{ country?: string; gender?: string; lang?: string; os?: string; app?: string }>({})
  
  // 게시물 랭킹 요약 데이터 상태
  const [postRankingSummaryData, setPostRankingSummaryData] = useState<PostRankingSummaryItem[]>([])
  const [loadingPostSummary, setLoadingPostSummary] = useState(false)
  const [postSummaryFilters, setPostSummaryFilters] = useState<{ country?: string; lang?: string; boardType?: string; category?: string; gender?: string }>({})
  
  useEffect(() => {
    setTodayDate(getTodayDateString())
  }, [])
  
  const startDate = dateRange?.from ? formatDateForAPI(dateRange.from) : '2025-01-01'
  const endDate = dateRange?.to ? formatDateForAPI(dateRange.to) : todayDate
  
  // 모든 유저 랭킹 API 호출 (종합, 커뮤니티, 채팅, 급상승)
  useEffect(() => {
    const loadAllRanking = async () => {
      setLoading(true)
      try {
        const response = await fetchUserRanking(startDate, endDate, 30)
        setCommunityRankingData(response.communityRankList || [])
        setChatRankingData(response.chatRankList || [])
        setIntegratedRankingData(response.integratedRankList || [])
        setGrowthRateRankingData(response.growthRatePercentList || [])
        console.log('✅ 유저 랭킹 데이터 로드:', {
          community: response.communityRankList?.length || 0,
          chat: response.chatRankList?.length || 0,
          integrated: response.integratedRankList?.length || 0,
          growthRate: response.growthRatePercentList?.length || 0
        })
      } catch (error) {
        console.error('❌ 유저 랭킹 데이터 로드 실패:', error)
        setCommunityRankingData([])
        setChatRankingData([])
        setIntegratedRankingData([])
        setGrowthRateRankingData([])
      } finally {
        setLoading(false)
      }
    }
    loadAllRanking()
  }, [startDate, endDate])

  // 게시물 랭킹 API 호출
  useEffect(() => {
    const loadPostRanking = async () => {
      setLoadingPosts(true)
      try {
        const response = await fetchPostRanking(startDate, endDate, 0, 100)
        setPostRankingData(response.postRankingList || [])
        console.log('✅ 게시물 랭킹 데이터 로드:', response.postRankingList?.length || 0, '개 게시물')
      } catch (error) {
        console.error('❌ 게시물 랭킹 데이터 로드 실패:', error)
        setPostRankingData([])
      } finally {
        setLoadingPosts(false)
      }
    }
    loadPostRanking()
  }, [startDate, endDate])

  // 급상승 게시물 랭킹 API 호출
  useEffect(() => {
    const loadTrendingPostRanking = async () => {
      setLoadingTrendingPosts(true)
      try {
        const response = await fetchTrendingPostRanking(startDate, endDate)
        setTrendingPostRankingData(response.postRankingList || [])
        console.log('✅ 급상승 게시물 랭킹 데이터 로드:', response.postRankingList?.length || 0, '개 게시물')
        
        // 첫 번째 게시물의 추이 데이터 자동 로드
        if (response.postRankingList && response.postRankingList.length > 0) {
          const firstPost = response.postRankingList[0]
          try {
            const postDetailResponse = await fetchPostDetail(
              startDate,
              endDate,
              firstPost.postId,
              firstPost.boardType
            )
            
            // 게시물 추이 데이터 변환
            const trendData = postDetailResponse.monthlyTrend?.map(item => ({
              month: item.periodMonth || '',
              views: item.views || null,
              viewsPredicted: null,
              likes: item.likes || null,
              likesPredicted: null,
              comments: item.comments || null,
              commentsPredicted: null,
              bookmarks: item.bookmarks || null,
              bookmarksPredicted: null,
            })) || []
            
            setFirstTrendingPostTrendData(trendData)
          } catch (error) {
            console.error('❌ 첫 번째 급상승 게시물 추이 데이터 로드 실패:', error)
            setFirstTrendingPostTrendData(null)
          }
        } else {
          setFirstTrendingPostTrendData(null)
        }
      } catch (error) {
        console.error('❌ 급상승 게시물 랭킹 데이터 로드 실패:', error)
        setTrendingPostRankingData([])
        setFirstTrendingPostTrendData(null)
      } finally {
        setLoadingTrendingPosts(false)
      }
    }
    loadTrendingPostRanking()
  }, [startDate, endDate])

  // 랭킹 요약 API 호출
  useEffect(() => {
    const loadRankingSummary = async () => {
      setLoadingSummary(true)
      try {
        const response = await fetchRankingSummary(
          startDate,
          endDate,
          30,
          summaryFilters.country,
          summaryFilters.gender,
          summaryFilters.lang,
          summaryFilters.os,
          summaryFilters.app
        )
        setRankingSummaryData(response.list || [])
      } catch (error) {
        console.error('❌ 랭킹 요약 데이터 로드 실패:', error)
        setRankingSummaryData([])
      } finally {
        setLoadingSummary(false)
      }
    }
    loadRankingSummary()
  }, [startDate, endDate, summaryFilters])

  // 게시물 랭킹 요약 데이터 로드
  useEffect(() => {
    const loadPostRankingSummary = async () => {
      setLoadingPostSummary(true)
      try {
        const response = await fetchRankingSummaryPost(
          startDate,
          endDate,
          postSummaryFilters.country,
          postSummaryFilters.lang,
          postSummaryFilters.boardType,
          postSummaryFilters.category,
          postSummaryFilters.gender
        )
        setPostRankingSummaryData(response.list || [])
      } catch (error) {
        console.error('❌ 게시물 랭킹 요약 데이터 로드 실패:', error)
        setPostRankingSummaryData([])
      } finally {
        setLoadingPostSummary(false)
      }
    }
    loadPostRankingSummary()
  }, [startDate, endDate, postSummaryFilters])

  // 커뮤니티 유저 점유율 계산 (게시물 + 댓글 + 좋아요 + 북마크)
  const calculateCommunityUserShare = (user: any, users: any[], limit: number) => {
    const userTotal = user.posts + user.comments + user.likes + user.bookmarks
    const allTotal = users.slice(0, limit).reduce((sum: number, u: any) => sum + u.posts + u.comments + u.likes + u.bookmarks, 0)
    return allTotal > 0 ? ((userTotal / allTotal) * 100).toFixed(1) : "0.0"
  }

  // 채팅 유저 점유율 계산 (채팅방 + 메시지)
  const calculateChatUserShare = (user: typeof convertedChatUsers[0], users: typeof convertedChatUsers, limit: number) => {
    if (users.length === 0) return "0.0"
    const userTotal = user.chatRooms + user.messages
    const allTotal = users.slice(0, limit).reduce((sum, u) => sum + u.chatRooms + u.messages, 0)
    return allTotal > 0 ? ((userTotal / allTotal) * 100).toFixed(1) : "0.0"
  }

  // 급상승 유저 점유율 계산 (게시물 + 댓글 + 채팅방 + 메시지)
  const calculateTrendingUserShare = (user: any, users: any[], limit: number) => {
    const userTotal = user.posts + user.comments + user.chatRooms + user.messages
    const allTotal = users.slice(0, limit).reduce((sum, u) => sum + u.posts + u.comments + u.chatRooms + u.messages, 0)
    return allTotal > 0 ? ((userTotal / allTotal) * 100).toFixed(1) : "0.0"
  }

  // 급상승 점수 계산 설정 (기본값 사용, 나중에 config 파일로 변경 가능)
  const [trendingConfig, setTrendingConfig] = useState<TrendingScoreConfig>(defaultTrendingScoreConfig)
  const [communityMetrics, setCommunityMetrics] = useState<CommunityGrowthMetrics | null>(null)

  // 단계별 혼합 방식으로 급상승 점수 계산 (동적 설정 사용)
  const calculateTrendScore = (currentActivity: number, previousActivity: number, config: TrendingScoreConfig): number => {
    // 1. 최소 활동량 필터 (기존 활동이 없을 때)
    if (previousActivity === 0) {
      if (currentActivity >= config.zeroActivityThreshold) {
        return Math.min(
          config.zeroActivityBaseScore + (currentActivity - config.zeroActivityThreshold) * config.zeroActivityMultiplier,
          100
        )
      }
      return 0
    }
    
    // 2. 낮은 활동량 구간 (기존 활동 < lowActivityThreshold): 절대 증가량 기준
    if (previousActivity < config.lowActivityThreshold) {
      const absoluteIncrease = currentActivity - previousActivity
      if (absoluteIncrease >= config.lowActivityIncreases.high) {
        return config.lowActivityIncreases.highScore
      }
      if (absoluteIncrease >= config.lowActivityIncreases.medium) {
        return config.lowActivityIncreases.mediumScore
      }
      if (absoluteIncrease >= config.lowActivityIncreases.low) {
        return config.lowActivityIncreases.lowScore
      }
      return 0
    }
    
    // 3. 높은 활동량 구간 (기존 활동 >= lowActivityThreshold): 비율 + 절대 증가량 복합
    const percentageIncrease = ((currentActivity - previousActivity) / previousActivity) * 100
    const absoluteIncrease = currentActivity - previousActivity
    
    let score = 0
    
    // 비율 + 절대값 기준 체크 (우선순위 높음)
    for (const threshold of config.highActivityThresholds.percentageAndAbsolute) {
      if (percentageIncrease >= threshold.percentage && absoluteIncrease >= threshold.absolute) {
        score = Math.max(score, threshold.score)
      }
    }
    
    // 절대값만 기준 체크
    for (const threshold of config.highActivityThresholds.absoluteOnly) {
      if (absoluteIncrease >= threshold.absolute) {
        score = Math.max(score, threshold.score)
      }
    }
    
    // 비율만 기준 체크
    for (const threshold of config.highActivityThresholds.percentageOnly) {
      if (percentageIncrease >= threshold.percentage) {
        score = Math.max(score, threshold.score)
      }
    }
    
    return Math.min(score, 100)
  }

  // 급상승 유저의 trendScore 계산 (trendData 활용)
  const getTrendingUserScore = (user: any): number => {
    // 현재 활동량 (전체 활동량)
    const currentActivity = user.posts + user.comments + user.chatRooms + user.messages
    
    // 이전 기간 활동량 계산 (trendData에서 3개월 전 데이터 사용)
    let previousActivity = 0
    if (user.trendData && user.trendData.length >= 4) {
      // 3개월 전 데이터 합산 (7월, 8월, 9월)
      const prevMonths = user.trendData.slice(0, 3)
      prevMonths.forEach((month: any) => {
        const monthActivity = (month.posts || 0) + (month.comments || 0) + (month.chatRooms || 0) + (month.messages || 0)
        previousActivity += monthActivity
      })
      // 3개월 평균
      previousActivity = Math.round(previousActivity / 3)
    }
    
    // trendScore 계산 (동적 설정 사용)
    return calculateTrendScore(currentActivity, previousActivity, trendingConfig)
  }

  // 게시물 점유율 계산 (조회수 + 좋아요 + 댓글 + 북마크)
  const calculatePostShare = (post: any, posts: any[], limit: number) => {
    const postTotal = post.views + post.likes + post.comments + post.bookmarks
    const allTotal = posts.slice(0, limit).reduce((sum, p) => sum + p.views + p.likes + p.comments + p.bookmarks, 0)
    return allTotal > 0 ? ((postTotal / allTotal) * 100).toFixed(1) : "0.0"
  }

  // API 데이터를 기존 형식으로 변환
  const convertedCommunityUsers = useMemo(() => {
    if (communityRankingData.length === 0) {
      return []
    }
    
    return communityRankingData.map((item, index) => ({
      rank: item.communityRank || index + 1,
      name: item.userNickname || `사용자${item.userNo}`,
      country: "한국", // API에 국가 정보가 없으면 기본값
      score: item.currentCommScore || 0,
      posts: item.totalPosts || 0,
      comments: item.totalComments || 0,
      likes: item.totalLikes || 0,
      bookmarks: item.totalBookmarks || 0,
      chatRooms: item.totalChatRooms || 0,
      messages: item.totalChatMessages || 0,
      lastActivity: endDate, // 마지막 활동일은 종료일로 설정
      communityType: "전체", // API에 커뮤니티 타입 정보가 없으면 기본값
      productCategory: "전체", // API에 카테고리 정보가 없으면 기본값
      userNo: item.userNo,
      userNickname: item.userNickname,
      currentCommScore: item.currentCommScore,
      growthRatePercent: item.growthRatePercent
    }))
  }, [communityRankingData, endDate])

  // 필터링 - 커뮤니티와 카테고리 기준으로 필터링
  const filteredCommunityUsers = useMemo(() => {
    return convertedCommunityUsers.filter(user => {
      const matchCommunity = selectedCommunity === "전체" || user.communityType === selectedCommunity
      const matchCategory = selectedCategory === "전체" || user.productCategory === selectedCategory
      return matchCommunity && matchCategory
    })
  }, [convertedCommunityUsers, selectedCommunity, selectedCategory])

  // 게시물 랭킹 데이터 변환
  const convertedPosts = useMemo(() => {
    return convertPostRankingData(postRankingData)
  }, [postRankingData])

  // 급상승 게시물 데이터 변환
  const convertedTrendingPosts = useMemo(() => {
    return convertPostRankingData(trendingPostRankingData)
  }, [trendingPostRankingData])

  // 필터링 - 게시물 (API 데이터 사용)
  const filteredPosts = useMemo(() => {
    return convertedPosts.filter((post: any) => {
      const matchCommunity = selectedCommunity === "전체" || post.category === selectedCommunity
      const matchCategory = selectedCategory === "전체" || true
      return matchCommunity && matchCategory
    })
  }, [convertedPosts, selectedCommunity, selectedCategory])

  // 필터링 - 급상승 게시물 (현재는 전체 게시물 사용, 추후 급상승 필터링 로직 추가 가능)
  const filteredTrendingPosts = useMemo(() => {
    return filteredPosts
  }, [filteredPosts])

  // 채팅 유저 랭킹 데이터 변환
  const convertedChatUsers = useMemo(() => {
    if (chatRankingData.length === 0) {
      return []
    }
    
    return chatRankingData.map((item, index) => ({
      rank: item.chatRank || index + 1,
      name: item.userNickname || `사용자${item.userNo}`,
      country: "한국", // API에 국가 정보가 없으면 기본값
      score: item.currentChatScore || 0,
      posts: item.totalPosts || 0,
      comments: item.totalComments || 0,
      likes: item.totalLikes || 0,
      bookmarks: item.totalBookmarks || 0,
      chatRooms: item.totalChatRooms || 0,
      messages: item.totalChatMessages || 0,
      lastChat: endDate,
      userNo: item.userNo,
      userNickname: item.userNickname,
      currentChatScore: item.currentChatScore
    }))
  }, [chatRankingData, endDate])

  // 필터링 - 채팅 유저 (채팅 유저는 communityType/productCategory가 없으므로 일단 통과)
  const filteredChatUsers = useMemo(() => {
    return convertedChatUsers
  }, [convertedChatUsers])

  // 급상승 유저 랭킹 데이터 변환
  const convertedTrendingUsers = useMemo(() => {
    if (growthRateRankingData.length === 0) {
      return []
    }
    
    return growthRateRankingData.map((item, index) => ({
      rank: index + 1,
      name: item.userNickname || `사용자${item.userNo}`,
      posts: item.totalPosts || 0,
      comments: item.totalComments || 0,
      likes: item.totalLikes || 0,
      bookmarks: item.totalBookmarks || 0,
      chatRooms: item.totalChatRooms || 0,
      messages: item.totalChatMessages || 0,
      trendScore: item.growthRatePercent || 0,
      lastActivity: endDate,
      userNo: item.userNo,
      userNickname: item.userNickname,
      growthRatePercent: item.growthRatePercent,
      currentTotalScore: item.currentTotalScore,
      previousTotalScore: item.previousTotalScore
    }))
  }, [growthRateRankingData, endDate])

  // 필터링 - 급상승 유저 (유저는 communityType/productCategory가 없으므로 일단 통과)
  const filteredTrendingUsers = useMemo(() => {
    return convertedTrendingUsers
  }, [convertedTrendingUsers])

  // 필터링 - 인기 게시물 (현재는 전체 게시물 사용, 추후 인기 필터링 로직 추가 가능)
  const filteredPopularPosts = useMemo(() => {
    return filteredPosts
  }, [filteredPosts])

  // 종합 유저 랭킹 데이터 변환 (API에서 가져온 integratedRankList 사용)
  const combinedUsers = useMemo(() => {
    if (integratedRankingData.length === 0) {
      return []
    }
    
    return integratedRankingData.map((item, index) => ({
      rank: item.integratedRank || index + 1,
      name: item.userNickname || `사용자${item.userNo}`,
      country: item.country || "기타",
      lang: item.lang || null,
      gender: item.gender || null,
      age: item.age || null,
      posts: item.totalPosts || 0,
      comments: item.totalComments || 0,
      likes: item.totalLikes || 0,
      bookmarks: item.totalBookmarks || 0,
      chatRooms: item.totalChatRooms || 0,
      messages: item.totalChatMessages || 0,
      lastActivity: endDate,
      growthRate: item.growthRatePercent || 0,
      userNo: item.userNo,
      userNickname: item.userNickname,
      currentTotalScore: item.currentTotalScore,
      previousTotalScore: item.previousTotalScore,
      currentCommScore: item.currentCommScore,
      currentChatScore: item.currentChatScore
    }))
  }, [integratedRankingData, endDate])

  // API 데이터 기반 국가별 점유율 계산
  const combinedCountryShareData = useMemo(() => {
    const countryData = rankingSummaryData.filter(item => item.type === 'Country')
    const total = countryData.reduce((sum, item) => sum + item.total, 0)
    
    return countryData
      .map(item => ({
        name: item.code === 'etc' ? '기타' : (item.value || item.code),
        value: item.total,
        percentage: total > 0 ? ((item.total / total) * 100).toFixed(1) : '0.0',
        countryCode: item.code
      }))
      .sort((a, b) => b.value - a.value)
  }, [rankingSummaryData])

  // API 데이터 기반 OS별 점유율 계산
  const combinedOsShareData = useMemo(() => {
    const osData = rankingSummaryData.filter(item => item.type === 'Os')
    const total = osData.reduce((sum, item) => sum + item.total, 0)
    
    return osData
      .map(item => {
        const osCode = item.code ? parseInt(item.code, 10) : null
        const osName = osCode && OS_TYPE_MAP[osCode] ? OS_TYPE_MAP[osCode] : (item.code || '알수없음')
        
        return {
          name: osName,
          value: item.total,
          percentage: total > 0 ? ((item.total / total) * 100).toFixed(1) : '0.0',
          osCode: item.code
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [rankingSummaryData])

  // API 데이터 기반 app별 점유율 계산
  const combinedAppShareData = useMemo(() => {
    const appData = rankingSummaryData.filter(item => item.type === 'App')
    const total = appData.reduce((sum, item) => sum + item.total, 0)
    
    return appData
      .map(item => {
        const appCode = item.code ? parseInt(item.code, 10) : null
        const appName = appCode !== null ? getAppTypeLabel(appCode) : (item.code || '알수없음')
        
        return {
          name: appName,
          value: item.total,
          percentage: total > 0 ? ((item.total / total) * 100).toFixed(1) : '0.0',
          appCode: item.code
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [rankingSummaryData])

  // API 데이터 기반 언어별 점유율 계산
  const combinedLanguageShareData = useMemo(() => {
    const languageMap: Record<string, string> = {
      'ko': '한국어',
      'ja': '일본어',
      'zh': '중국어',
      'cn': '중국어',
      'en': '영어',
      'hi': '인도어',
      'vi': '베트남어',
      'th': '태국어',
      'ru': '러시아어',
      'etc': '기타'
    }
    
    const languageData = rankingSummaryData.filter(item => item.type === 'Language')
    const total = languageData.reduce((sum, item) => sum + item.total, 0)
    
    return languageData
      .map(item => ({
        name: languageMap[item.code] || item.code,
        value: item.total,
        percentage: total > 0 ? ((item.total / total) * 100).toFixed(1) : '0.0',
        langCode: item.code
      }))
      .sort((a, b) => b.value - a.value)
  }, [rankingSummaryData])

  // 종합 유저 성별 및 나잇대별 점유율 계산 (누적 막대그래프용)
  const combinedGenderAgeShareData = useMemo(() => {
    // 나이대별로 Male과 Female 값을 저장
    const ageGroupData: Record<string, { Male: number; Female: number }> = {}
    
    // 나이대 순서
    const ageOrder = ['10대', '20대', '30대', '40대', '50대 이상', '미지정']
    
    // 초기화
    ageOrder.forEach(ageGroup => {
      ageGroupData[ageGroup] = { Male: 0, Female: 0 }
    })
    
    combinedUsers.forEach(user => {
      const gender = user.gender
      if (gender === 'Male' || gender === 'Female') {
        const age = user.age !== null && user.age !== undefined ? user.age : null
        
        // 나이대 그룹화
        let ageGroup = '미지정'
        if (age !== null) {
          if (age < 20) ageGroup = '10대'
          else if (age < 30) ageGroup = '20대'
          else if (age < 40) ageGroup = '30대'
          else if (age < 50) ageGroup = '40대'
          else ageGroup = '50대 이상'
        }
        
        const userActivity = user.posts + user.comments + user.likes + user.bookmarks + user.chatRooms + user.messages
        
        if (ageGroupData[ageGroup]) {
          ageGroupData[ageGroup][gender as 'Male' | 'Female'] += userActivity
        }
      }
    })
    
    // 전체 합계 계산
    let totalMale = 0
    let totalFemale = 0
    ageOrder.forEach(ageGroup => {
      totalMale += ageGroupData[ageGroup].Male
      totalFemale += ageGroupData[ageGroup].Female
    })
    const total = totalMale + totalFemale
    
    // 데이터 형식 변환
    return ageOrder
      .filter(ageGroup => ageGroupData[ageGroup].Male > 0 || ageGroupData[ageGroup].Female > 0)
      .map(ageGroup => {
        const maleValue = ageGroupData[ageGroup].Male
        const femaleValue = ageGroupData[ageGroup].Female
        return {
          name: ageGroup,
          'Male_10대': ageGroup === '10대' ? maleValue : 0,
          'Male_20대': ageGroup === '20대' ? maleValue : 0,
          'Male_30대': ageGroup === '30대' ? maleValue : 0,
          'Male_40대': ageGroup === '40대' ? maleValue : 0,
          'Male_50대 이상': ageGroup === '50대 이상' ? maleValue : 0,
          'Male_미지정': ageGroup === '미지정' ? maleValue : 0,
          'Female_10대': ageGroup === '10대' ? femaleValue : 0,
          'Female_20대': ageGroup === '20대' ? femaleValue : 0,
          'Female_30대': ageGroup === '30대' ? femaleValue : 0,
          'Female_40대': ageGroup === '40대' ? femaleValue : 0,
          'Female_50대 이상': ageGroup === '50대 이상' ? femaleValue : 0,
          'Female_미지정': ageGroup === '미지정' ? femaleValue : 0,
          maleValue,
          femaleValue,
          malePercentage: totalMale > 0 ? ((maleValue / totalMale) * 100).toFixed(1) : '0.0',
          femalePercentage: totalFemale > 0 ? ((femaleValue / totalFemale) * 100).toFixed(1) : '0.0',
          totalPercentage: total > 0 ? (((maleValue + femaleValue) / total) * 100).toFixed(1) : '0.0'
        }
      })
  }, [combinedUsers])
  
  // 성별 점유율 데이터 (남, 녀, 미지정)
  const genderShareData = useMemo(() => {
    const summaryData = rankingSummaryData.find(item => item.type === 'Summary')
    
    if (!summaryData) {
      return []
    }
    
    const male = summaryData.male || 0
    const female = summaryData.female || 0
    const total = summaryData.total || 0
    const unspecified = total - (male + female)
    
    return [{
      name: '',
      male: total > 0 ? (male / total) * 100 : 0,
      female: total > 0 ? (female / total) * 100 : 0,
      unspecified: total > 0 ? (unspecified / total) * 100 : 0,
      maleValue: male,
      femaleValue: female,
      unspecifiedValue: unspecified,
      total: total
    }]
  }, [rankingSummaryData])

  // 나잇대별 점유율 데이터 (Population Pyramid용)
  const ageGroupShareData = useMemo(() => {
    const summaryData = rankingSummaryData.find(item => item.type === 'Summary')
    
    if (!summaryData) {
      return { data: [], maxValue: 0 }
    }
    
    const m10 = summaryData.m10 || 0
    const m20 = summaryData.m20 || 0
    const m30 = summaryData.m30 || 0
    const m40 = summaryData.m40 || 0
    const m50 = summaryData.m50 || 0
    const male = summaryData.male || 0
    const maleUnspecified = male - (m10 + m20 + m30 + m40 + m50)
    
    const f10 = summaryData.f10 || 0
    const f20 = summaryData.f20 || 0
    const f30 = summaryData.f30 || 0
    const f40 = summaryData.f40 || 0
    const f50 = summaryData.f50 || 0
    const female = summaryData.female || 0
    const femaleUnspecified = female - (f10 + f20 + f30 + f40 + f50)
    
    const total = summaryData.total || 0
    
    // Population Pyramid 형태로 변환: 각 나이대별로 하나의 데이터 포인트, 남성은 음수, 여성은 양수
    // X축은 실제 수치(명)로 표시
    const data = [
      {
        age: '10대',
        male: -m10,
        female: f10,
        maleValue: m10,
        femaleValue: f10,
        malePercent: total > 0 ? (m10 / total) * 100 : 0,
        femalePercent: total > 0 ? (f10 / total) * 100 : 0
      },
      {
        age: '20대',
        male: -m20,
        female: f20,
        maleValue: m20,
        femaleValue: f20,
        malePercent: total > 0 ? (m20 / total) * 100 : 0,
        femalePercent: total > 0 ? (f20 / total) * 100 : 0
      },
      {
        age: '30대',
        male: -m30,
        female: f30,
        maleValue: m30,
        femaleValue: f30,
        malePercent: total > 0 ? (m30 / total) * 100 : 0,
        femalePercent: total > 0 ? (f30 / total) * 100 : 0
      },
      {
        age: '40대',
        male: -m40,
        female: f40,
        maleValue: m40,
        femaleValue: f40,
        malePercent: total > 0 ? (m40 / total) * 100 : 0,
        femalePercent: total > 0 ? (f40 / total) * 100 : 0
      },
      {
        age: '50대 이상',
        male: -m50,
        female: f50,
        maleValue: m50,
        femaleValue: f50,
        malePercent: total > 0 ? (m50 / total) * 100 : 0,
        femalePercent: total > 0 ? (f50 / total) * 100 : 0
      },
      {
        age: '미지정',
        male: -maleUnspecified,
        female: femaleUnspecified,
        maleValue: maleUnspecified,
        femaleValue: femaleUnspecified,
        malePercent: total > 0 ? (maleUnspecified / total) * 100 : 0,
        femalePercent: total > 0 ? (femaleUnspecified / total) * 100 : 0
      }
    ]
    
    // 최대 절댓값 찾기 (실제 수치 기준, 대칭 domain을 위해)
    const maxValue = Math.max(
      ...data.map(d => Math.max(Math.abs(d.male), Math.abs(d.female)))
    )
    
    // 최대값을 10의 배수로 올림 (10% 여유 포함)
    const maxValueWithPadding = maxValue > 0 ? Math.ceil(maxValue * 1.1 / 10) * 10 : 10
    
    return { data, maxValue: maxValueWithPadding }
  }, [rankingSummaryData])

  

  // 종합 유저 커뮤니티별 활동 점유율 계산 (인증거래, 제품리뷰, 판별팁, Q&A)
  const combinedCommunityActivityShareData = useMemo(() => {
    // 각 유저의 게시물 카테고리별 활동량 계산
    // 실제로는 백엔드에서 각 유저의 카테고리별 게시물/댓글/좋아요/북마크 데이터를 가져와야 함
    // 현재는 mock 데이터로 각 유저의 전체 활동을 카테고리별로 분배
    const categoryCounts: Record<string, number> = {
      '인증거래': 4,
      '정품리뷰': 1,
      '판별팁': 3,
      'Q&A': 2
    }
    
    // 각 유저의 게시물 카테고리 매핑 (mock 데이터)
    const getUserCategoryDistribution = (user: any) => {
      // 실제로는 백엔드에서 가져와야 함
      // 일단 전체 게시물 수를 기반으로 각 카테고리별 활동량 추정
      const totalPosts = user.posts || 0
      const totalComments = user.comments || 0
      const totalLikes = user.likes || 0
      const totalBookmarks = user.bookmarks || 0
      const totalActivity = totalPosts + totalComments + totalLikes + totalBookmarks
      
      // Mock 분배 (실제로는 백엔드 데이터 필요)
      // 각 유저별로 카테고리 분배율이 다를 수 있음
      const nameHash = user.name.charCodeAt(0) % 4
      const distributions = [
        { '인증거래': 0.3, '제품리뷰': 0.4, '판별팁': 0.15, 'Q&A': 0.15 }, // 0
        { '인증거래': 0.25, '제품리뷰': 0.35, '판별팁': 0.2, 'Q&A': 0.2 }, // 1
        { '인증거래': 0.35, '제품리뷰': 0.3, '판별팁': 0.2, 'Q&A': 0.15 }, // 2
        { '인증거래': 0.2, '제품리뷰': 0.3, '판별팁': 0.25, 'Q&A': 0.25 }, // 3
      ]
      const distribution = distributions[nameHash]
      
      return {
        '인증거래': Math.round(totalActivity * distribution['인증거래']),
        '제품리뷰': Math.round(totalActivity * distribution['제품리뷰']),
        '판별팁': Math.round(totalActivity * distribution['판별팁']),
        'Q&A': Math.round(totalActivity * distribution['Q&A'])
      }
    }
    
    combinedUsers.forEach(user => {
      const categoryActivity = getUserCategoryDistribution(user)
      Object.keys(categoryCounts).forEach(category => {
        const categoryKey = category as keyof typeof categoryActivity
        categoryCounts[category] += categoryActivity[categoryKey] || 0
      })
    })
    
    const total = Object.values(categoryCounts).reduce((sum, val) => sum + val, 0)
    
    return Object.entries(categoryCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
  }, [combinedUsers])

  // 종합 유저 국가 수
  const combinedUniqueCountries = useMemo(() => {
    return new Set(combinedUsers.map(u => u.country || "기타")).size
  }, [combinedUsers])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

  // 종합 유저 점유율 계산
  const calculateCombinedUserShare = (user: typeof combinedUsers[0], users: typeof combinedUsers, limit: number) => {
    // 활동량 계산: 게시글수, 댓글수, 좋아요수, 채팅방수, 메시지수 합산
    const userTotal = user.posts + user.comments + user.likes + user.chatRooms + user.messages
    const allTotal = users.slice(0, limit).reduce((sum, u) => {
      return sum + (u.posts + u.comments + u.likes + u.chatRooms + u.messages)
    }, 0)
    return allTotal > 0 ? ((userTotal / allTotal) * 100).toFixed(1) : "0.0"
  }

  // 종합 게시물 랭킹 생성 (API 데이터 사용)
  const combinedPosts = useMemo(() => {
    const sorted = [...filteredPosts].sort((a: any, b: any) => {
      switch (postSortBy) {
        case "views":
          return b.views - a.views
        case "likes":
          return b.likes - a.likes
        case "comments":
          return b.comments - a.comments
        case "bookmarks":
          return b.bookmarks - a.bookmarks
        case "totalEngagement":
        default:
          return b.totalEngagement - a.totalEngagement
      }
    })
    
    return sorted.map((post: any, index: number) => ({
      ...post,
      rank: index + 1
    }))
  }, [filteredPosts, postSortBy])

  // 게시물 국가별 점유율 계산 (API 데이터 사용)
  const combinedPostCountryShareData = useMemo(() => {
    const countryData = postRankingSummaryData.filter(item => item.type === 'Country')
    const total = countryData.reduce((sum, item) => sum + item.total, 0)
    
    // 빈값과 null값을 '미지정'으로 합치기
    const countryMap: Record<string, { total: number; value: string }> = {}
    
    countryData.forEach(item => {
      const key = item.value || item.code || '미지정'
      if (!countryMap[key]) {
        countryMap[key] = { total: 0, value: key === '미지정' ? '미지정' : (item.value || item.code) }
      }
      countryMap[key].total += item.total
    })
    
    return Object.entries(countryMap)
      .map(([key, data]) => ({
        name: data.value,
        value: data.total,
        percentage: total > 0 ? ((data.total / total) * 100).toFixed(1) : '0.0',
        countryCode: key === '미지정' ? 'etc' : countryData.find(item => (item.value || item.code) === key)?.code || key
      }))
      .sort((a, b) => b.value - a.value)
  }, [postRankingSummaryData])

  // 종합 게시물 국가 수
  const combinedPostUniqueCountries = useMemo(() => {
    return new Set(combinedPosts.map(p => p.country || "기타")).size
  }, [combinedPosts])

  // 게시물 카테고리별 점유율 계산 (API 데이터 사용)
  const combinedPostCategoryShareData = useMemo(() => {
    const categoryData = postRankingSummaryData.filter(item => item.type === 'Category')
    const total = categoryData.reduce((sum, item) => sum + item.total, 0)
    
    return categoryData
      .map(item => ({
        name: item.value,
        value: item.total,
        percentage: total > 0 ? ((item.total / total) * 100).toFixed(1) : '0.0',
        code: item.code
      }))
      .sort((a, b) => b.value - a.value)
  }, [postRankingSummaryData])

  // 게시물 커뮤니티별 점유율 계산 (API 데이터 사용)
  const combinedPostCommunityShareData = useMemo(() => {
    const boardData = postRankingSummaryData.filter(item => item.type === 'Board')
    const total = boardData.reduce((sum, item) => sum + item.total, 0)
    
    return boardData
      .map(item => ({
        name: getBoardTypeName(Number(item.code)),
        value: item.total,
        percentage: total > 0 ? ((item.total / total) * 100).toFixed(1) : '0.0',
        code: item.code
      }))
      .sort((a, b) => b.value - a.value)
  }, [postRankingSummaryData])

  // 게시물 언어별 점유율 계산 (API 데이터 사용)
  const combinedPostLanguageShareData = useMemo(() => {
    const languageMap: Record<string, string> = {
      'ko': '한국어',
      'ja': '일본어',
      'zh': '중국어',
      'cn': '중국어',
      'en': '영어',
      'hi': '인도어',
      'vi': '베트남어',
      'th': '태국어',
      'ru': '러시아어',
      'etc': '기타'
    }
    
    const languageData = postRankingSummaryData.filter(item => item.type === 'Language')
    const total = languageData.reduce((sum, item) => sum + item.total, 0)
    
    return languageData
      .map(item => ({
        name: languageMap[item.code] || item.value || item.code,
        value: item.total,
        percentage: total > 0 ? ((item.total / total) * 100).toFixed(1) : '0.0',
        langCode: item.code
      }))
      .sort((a, b) => b.value - a.value)
  }, [postRankingSummaryData])

  // 종합 게시물 점유율 계산
  const calculateCombinedPostShare = (post: typeof combinedPosts[0], posts: typeof combinedPosts, limit: number) => {
    const postTotal = post.totalEngagement
    const allTotal = posts.slice(0, limit).reduce((sum, p) => sum + p.totalEngagement, 0)
    return allTotal > 0 ? ((postTotal / allTotal) * 100).toFixed(1) : "0.0"
  }

  // 필터링 제거 - 모든 급상승 유저 사용
  // 설정 로드 및 커뮤니티 성장률 계산
  useEffect(() => {
    const loadConfig = async () => {
      const config = await getTrendingScoreConfig()
      setTrendingConfig(config)
      
      // 커뮤니티 성장률 계산 (모든 유저 데이터 사용)
      // 타입 맞추기 위해 필요한 필드만 추출
      const allUsers = [
        ...filteredCommunityUsers.map(u => ({ 
          posts: u.posts, 
          comments: u.comments, 
          chatRooms: 0, 
          messages: 0, 
          trendData: undefined 
        })),
        ...filteredChatUsers.map(u => ({ 
          posts: 0, 
          comments: 0, 
          chatRooms: u.chatRooms, 
          messages: u.messages, 
          trendData: undefined 
        })),
        ...filteredTrendingUsers.map(u => ({ 
          posts: u.posts, 
          comments: u.comments, 
          chatRooms: u.chatRooms, 
          messages: u.messages
        }))
      ]
      const metrics = calculateCommunityGrowth(allUsers)
      setCommunityMetrics(metrics)
      
      // 성장률에 따른 설정 조정
      if (config.adaptiveScoring.enabled) {
        const adjustedConfig = adjustThresholdsByGrowth(config, metrics)
        setTrendingConfig(adjustedConfig)
      }
    }
    loadConfig()
  }, [filteredCommunityUsers, filteredChatUsers, filteredTrendingUsers])

  // 선택된 유저 추이 데이터를 관리하는 state
  const [selectedCommunityUser, setSelectedCommunityUser] = useState<typeof filteredCommunityUsers[0] | null>(null)
  const [selectedChatUser, setSelectedChatUser] = useState<typeof convertedChatUsers[0] | null>(null)
  const [selectedTrendingUser, setSelectedTrendingUser] = useState<typeof convertedTrendingUsers[0] | null>(null)
  const [selectedCommunityUserTrendData, setSelectedCommunityUserTrendData] = useState<MonthlyTrendItem[] | null>(null)
  const [firstCommunityUserTrendData, setFirstCommunityUserTrendData] = useState<MonthlyTrendItem[] | null>(null)
  const [selectedCommunityUserForecast, setSelectedCommunityUserForecast] = useState<{ date: string; predicted: number }[]>([])
  const [firstCommunityUserForecast, setFirstCommunityUserForecast] = useState<{ date: string; predicted: number }[]>([])
  const [firstChatUserTrendData, setFirstChatUserTrendData] = useState<MonthlyTrendItem[] | null>(null)
  const [firstChatUserForecast, setFirstChatUserForecast] = useState<{ date: string; predicted: number }[]>([])
  const [firstTrendingUserTrendData, setFirstTrendingUserTrendData] = useState<MonthlyTrendItem[] | null>(null)
  const [selectedTrendingUserTrendData, setSelectedTrendingUserTrendData] = useState<MonthlyTrendItem[] | null>(null)
  const [firstTrendingUserForecast, setFirstTrendingUserForecast] = useState<{ date: string; predicted: number }[]>([])
  const [selectedTrendingUserForecast, setSelectedTrendingUserForecast] = useState<{ date: string; predicted: number }[]>([])
  const [top5CombinedUsersTrendData, setTop5CombinedUsersTrendData] = useState<Map<number, MonthlyTrendItem[]>>(new Map())
  const [loadingTrendData, setLoadingTrendData] = useState(false)
  const [selectedPopularPost, setSelectedPopularPost] = useState<typeof filteredPopularPosts[0] | null>(null)
  const [selectedPostAuthor, setSelectedPostAuthor] = useState<any | null>(null)  // 작성자 상세 모달용
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false)
  const [isCombinedUsersModalOpen, setIsCombinedUsersModalOpen] = useState(false)  // 종합 유저 상세 모달용
  // 페이징 상태
  const [pagedCombinedUsers, setPagedCombinedUsers] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)
  const [totalUserCount, setTotalUserCount] = useState(0)
  const [loadingPagedUsers, setLoadingPagedUsers] = useState(false)
  const [selectedCombinedUser, setSelectedCombinedUser] = useState<any | null>(null)  // 선택된 종합 유저
  const [filteredCombinedUserLanguage, setFilteredCombinedUserLanguage] = useState<string>('전체')  // 종합 유저 필터: 언어
  const [filteredCombinedUserApp, setFilteredCombinedUserApp] = useState<string>('전체')  // 종합 유저 필터: 가입앱
  // 종합 유저 모달에서 선택된 유저의 상세 정보 state
  const [selectedCombinedUserDetail, setSelectedCombinedUserDetail] = useState<UserDetail | null>(null)
  const [selectedCombinedUserTrendData, setSelectedCombinedUserTrendData] = useState<ReturnType<typeof convertTrendDataToChartFormat> | null>(null)


  // 종합 유저 선택 시 상세 정보 가져오기
  // 유저 상세 정보는 유저의 가입일자부터 현재까지 API를 조회하여 월별 추이를 나타냅니다.
  useEffect(() => {
    const loadCombinedUserDetail = async () => {
    if (selectedCombinedUser && (selectedCombinedUser as any).userNo) {
        try {
          const userNo = (selectedCombinedUser as any).userNo
          
          // 1단계: 먼저 기본 날짜로 API를 호출하여 가입일자(joinDate)를 가져옴
          const initialResponse = await fetchUserDetailTrend(
            startDate,
            endDate,
            userNo
          )
          
          if (!initialResponse.userDetail) {
            console.error('❌ 종합 유저 상세 정보: userDetail이 없습니다.')
            return
          }
          
          // 2단계: 가입일자를 startDate로, 현재 날짜를 endDate로 설정
          const userJoinDate = initialResponse.userDetail.joinDate
          const currentDateStr = getTodayDateString()
          
          // 가입일자를 YYYY-MM-DD 형식으로 변환
          let userStartDateStr: string
          if (userJoinDate) {
            try {
              const joinDateObj = new Date(userJoinDate)
              const year = joinDateObj.getFullYear()
              const month = String(joinDateObj.getMonth() + 1).padStart(2, '0')
              const day = String(joinDateObj.getDate()).padStart(2, '0')
              userStartDateStr = `${year}-${month}-${day}`
            } catch (error) {
              console.warn('⚠️ 가입일자 파싱 실패, 기본 startDate 사용:', userJoinDate)
              userStartDateStr = startDate
            }
          } else {
            console.warn('⚠️ 가입일자가 없어 기본 startDate 사용')
            userStartDateStr = startDate
          }
          
          // 3단계: 가입일부터 현재까지의 데이터로 다시 API 호출
          const trendResponse = await fetchUserDetailTrend(
            userStartDateStr,
            currentDateStr,
            userNo
          )
          
          if (trendResponse.userDetail) {
            const apiUserDetail = trendResponse.userDetail
            // 유저 이미지 URL 처리
            const userImageUrl = apiUserDetail.img
              ? (apiUserDetail.img.startsWith('http')
                  ? apiUserDetail.img
                  : `${API_IMG_URL}${apiUserDetail.img.replace(/^\/+/, '')}`)
              : ''
            const enrichedUserDetail: UserDetail = {
              id: apiUserDetail.id,
              nickname: apiUserDetail.nickName,
              signupDate: apiUserDetail.joinDate,
              email: apiUserDetail.email || '',
              language: apiUserDetail.lang || '',
              gender: getGenderLabel(apiUserDetail.userGender),
              country: apiUserDetail.userCountry || '',
              signupApp: apiUserDetail.joinApp ? getAppTypeLabel(Number(apiUserDetail.joinApp)) : '',
              osInfo: getOsTypeLabel(apiUserDetail.userOs),
              img: apiUserDetail.img,
              imageUrl: userImageUrl,
              posts: selectedCombinedUser.posts || apiUserDetail.countPosts || 0,
              comments: selectedCombinedUser.comments || apiUserDetail.countComments || 0,
              likes: selectedCombinedUser.likes || apiUserDetail.countLikes || 0,
              bookmarks: selectedCombinedUser.bookmarks || apiUserDetail.countBookmarks || 0,
              chatRooms: selectedCombinedUser.chatRooms || apiUserDetail.countChats || 0,
              messages: apiUserDetail.countMessages || 0,
            }
            setSelectedCombinedUserDetail(enrichedUserDetail)
            // 가입일부터 현재까지의 월별 추이 데이터 변환 (forecast 포함)
            const trendData = convertTrendDataToChartFormat(
              trendResponse.monthlyTrend || [],
              trendResponse.forecast
            )
            setSelectedCombinedUserTrendData(trendData)
          }
        } catch (error) {
          console.error('❌ 종합 유저 상세 정보 로딩 실패:', error)
          setSelectedCombinedUserDetail(null)
          setSelectedCombinedUserTrendData([])
        }
    } else {
      setSelectedCombinedUserDetail(null)
      setSelectedCombinedUserTrendData(null)
    }
    }
    
    loadCombinedUserDetail()
  }, [selectedCombinedUser, startDate, endDate])
  
  // 통합 유저 상세 모달용 state
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false)
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetail | null>(null)
  const [selectedUserTrendData, setSelectedUserTrendData] = useState<any>(null)

  // 게시물 상세 모달용 state
  const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false)
  const [selectedPostDetail, setSelectedPostDetail] = useState<PostDetail | null>(null)
  const [selectedPostDetailAuthor, setSelectedPostDetailAuthor] = useState<UserDetail | null>(null)  // 게시물 상세 모달 내 유저 정보
  const [selectedPostDetailAuthorTrendData, setSelectedPostDetailAuthorTrendData] = useState<ReturnType<typeof convertTrendDataToChartFormat> | null>(null)
  
  // 종합 게시물 랭킹 전체보기 모달용 state
  const [isCombinedPostsModalOpen, setIsCombinedPostsModalOpen] = useState(false)
  const [selectedCombinedPost, setSelectedCombinedPost] = useState<PostDetail | null>(null)
  const [selectedCombinedPostAuthor, setSelectedCombinedPostAuthor] = useState<UserDetail | null>(null)
  const [selectedCombinedPostAuthorTrendData, setSelectedCombinedPostAuthorTrendData] = useState<ReturnType<typeof convertTrendDataToChartFormat> | null>(null)
  const [selectedCombinedPostAuthorForecast, setSelectedCombinedPostAuthorForecast] = useState<{ date: string; predicted: number }[]>([])
  const [isLoadingPostAuthor, setIsLoadingPostAuthor] = useState(false)

  // 게시물 작성자 정보 자동 로딩 함수
  const loadPostAuthorDetail = async (post: PostDetail, targetState: 'postDetail' | 'combinedPost' = 'combinedPost') => {
    setIsLoadingPostAuthor(true)
    let userNo: number | undefined
    
    // authorUserNo가 있으면 직접 사용
    if (post.authorUserNo) {
      const parsedUserNo = parseInt(post.authorUserNo, 10)
      if (!isNaN(parsedUserNo)) {
        userNo = parsedUserNo
      }
    }
    
    // authorUserNo가 없거나 파싱 실패 시 이름으로 유저 찾기
    if (!userNo) {
      const user = filteredCommunityUsers.find(u => u.name === post.author) ||
                  filteredChatUsers.find(u => u.name === post.author) ||
                  filteredTrendingUsers.find(u => u.name === post.author) ||
                  combinedUsers.find(u => u.name === post.author)
      
      if (user && (user as any).userNo) {
        userNo = (user as any).userNo
      } else {
        setIsLoadingPostAuthor(false)
        return // 유저를 찾을 수 없음
      }
    }
    
    if (!userNo) {
      setIsLoadingPostAuthor(false)
      return // userNo가 없으면 종료
    }
    
    try {
      // 유저 상세 정보는 유저의 가입일자부터 현재까지 API를 조회합니다.
      // 1단계: 먼저 기본 날짜로 API를 호출하여 가입일자(joinDate)를 가져옴
      const initialResponse = await fetchUserDetailTrend(
        startDate,
        endDate,
        userNo
      )
      
      if (!initialResponse.userDetail) {
        console.error('❌ 게시물 작성자 상세 정보: userDetail이 없습니다.')
        return
      }
      
      // 2단계: 가입일자를 startDate로, 현재 날짜를 endDate로 설정
      const userJoinDate = initialResponse.userDetail.joinDate
      const currentDateStr = getTodayDateString()
      
      // 가입일자를 YYYY-MM-DD 형식으로 변환
      let userStartDateStr: string
      if (userJoinDate) {
        try {
          const joinDateObj = new Date(userJoinDate)
          const year = joinDateObj.getFullYear()
          const month = String(joinDateObj.getMonth() + 1).padStart(2, '0')
          const day = String(joinDateObj.getDate()).padStart(2, '0')
          userStartDateStr = `${year}-${month}-${day}`
        } catch (error) {
          console.warn('⚠️ 가입일자 파싱 실패, 기본 startDate 사용:', userJoinDate)
          userStartDateStr = startDate
        }
      } else {
        console.warn('⚠️ 가입일자가 없어 기본 startDate 사용')
        userStartDateStr = startDate
      }
      
      // 3단계: 가입일부터 현재까지의 데이터로 다시 API 호출
      const trendResponse = await fetchUserDetailTrend(
        userStartDateStr,
        currentDateStr,
        userNo
      )
      
      if (trendResponse.userDetail) {
        const apiUserDetail = trendResponse.userDetail
        
        // user 정보 찾기
        const foundUser = filteredCommunityUsers.find(u => (u as any).userNo === userNo) ||
                         filteredChatUsers.find(u => (u as any).userNo === userNo) ||
                         filteredTrendingUsers.find(u => (u as any).userNo === userNo) ||
                         combinedUsers.find(u => (u as any).userNo === userNo)
        
        // 유저 이미지 URL 처리
        const userImageUrl = apiUserDetail.img
          ? (apiUserDetail.img.startsWith('http')
              ? apiUserDetail.img
              : `${API_IMG_URL}${apiUserDetail.img.replace(/^\/+/, '')}`)
          : ''
        
        console.log('👤 [유저상세] 이미지 URL 처리:', {
          originalImg: apiUserDetail.img,
          finalImageUrl: userImageUrl,
          API_IMG_URL: API_IMG_URL,
          hasImg: !!apiUserDetail.img,
          userNo: userNo
        })
        
        const enrichedUserDetail: UserDetail = {
          id: apiUserDetail.id,
          nickname: apiUserDetail.nickName,
          signupDate: apiUserDetail.joinDate,
          email: apiUserDetail.email || '',
          language: apiUserDetail.lang || '',
          gender: getGenderLabel(apiUserDetail.userGender),
          country: apiUserDetail.userCountry || (foundUser as any)?.country || '미지정',
          signupApp: apiUserDetail.joinApp ? getAppTypeLabel(Number(apiUserDetail.joinApp)) : '',
          osInfo: getOsTypeLabel(apiUserDetail.userOs),
          img: apiUserDetail.img,
          imageUrl: userImageUrl,
          posts: (foundUser as any)?.posts || apiUserDetail.countPosts || 0,
          comments: (foundUser as any)?.comments || apiUserDetail.countComments || 0,
          likes: (foundUser as any)?.likes || apiUserDetail.countLikes || 0,
          bookmarks: (foundUser as any)?.bookmarks || apiUserDetail.countBookmarks || 0,
          chatRooms: (foundUser as any)?.chatRooms || apiUserDetail.countChats || 0,
          messages: apiUserDetail.countMessages || 0,
        }
        
        // targetState에 따라 적절한 state 설정
        if (targetState === 'postDetail') {
          setSelectedPostDetailAuthor(enrichedUserDetail)
          
          // 추이 데이터도 함께 설정 (forecast 포함)
          const trendData = convertTrendDataToChartFormat(
            trendResponse.monthlyTrend || [],
            trendResponse.forecast
          )
          setSelectedPostDetailAuthorTrendData(trendData)
        } else {
        setSelectedCombinedPostAuthor(enrichedUserDetail)
        
        // 추이 데이터도 함께 설정 (forecast 포함)
        const trendData = convertTrendDataToChartFormat(
          trendResponse.monthlyTrend || [],
          trendResponse.forecast
        )
        setSelectedCombinedPostAuthorTrendData(trendData)
        setSelectedCombinedPostAuthorForecast(trendResponse.forecast || [])
        }
      }
    } catch (error) {
      console.error('❌ 게시물 작성자 상세 정보 로딩 실패:', error)
      if (targetState === 'postDetail') {
        setSelectedPostDetailAuthor(null)
        setSelectedPostDetailAuthorTrendData(null)
      } else {
      setSelectedCombinedPostAuthor(null)
      setSelectedCombinedPostAuthorTrendData(null)
      }
    } finally {
      setIsLoadingPostAuthor(false)
    }
  }

  // 게시물 상세 선택 시 작성자 정보 자동 로딩
  useEffect(() => {
    if (selectedPostDetail && isPostDetailModalOpen) {
      loadPostAuthorDetail(selectedPostDetail, 'postDetail')
    } else {
      // 게시물이 선택되지 않았거나 모달이 닫혔을 때 초기화
      setSelectedPostDetailAuthor(null)
      setSelectedPostDetailAuthorTrendData(null)
      setIsLoadingPostAuthor(false)
    }
  }, [selectedPostDetail, isPostDetailModalOpen, startDate, endDate, filteredCommunityUsers, filteredChatUsers, filteredTrendingUsers, combinedUsers])

  // 모달이 열릴 때 첫 번째 게시물 자동 선택 및 로드
  useEffect(() => {
    if (isCombinedPostsModalOpen && combinedPosts.length > 0 && !selectedCombinedPost) {
      const firstPost = combinedPosts[0]
      const foundUser = filteredCommunityUsers.find(u => u.name === firstPost.author) ||
                        filteredChatUsers.find(u => u.name === firstPost.author) ||
                        filteredTrendingUsers.find(u => u.name === firstPost.author) ||
                        combinedUsers.find(u => u.name === firstPost.author)
      
      // 이미지 URL 처리
      const imageUrl = firstPost.img 
        ? (firstPost.img.startsWith('http') ? firstPost.img : `${API_IMG_URL}${firstPost.img.replace(/^\/+/, '')}`)
        : '/placeholder.jpg'
      
      const languageMap: Record<string, string> = {
        'ko': '한국어',
        'ja': '일본어',
        'zh': '중국어',
        'en': '영어',
        'hi': '인도어',
        'vi': '베트남어',
        'th': '태국어',
        'ru': '러시아어'
      }
      
      const initialPostDetail: PostDetail = {
        title: firstPost.title,
        imageUrl: imageUrl,
        content: '', // API에서 가져올 예정
        author: firstPost.author,
        authorUserNo: foundUser ? (foundUser as any).userNo?.toString() : firstPost.userNo?.toString(),
        views: firstPost.views,
        comments: firstPost.comments,
        likes: firstPost.likes,
        bookmarks: firstPost.bookmarks,
        language: foundUser && (foundUser as any).lang ? (languageMap[(foundUser as any).lang] || '한국어') : '한국어',
        createdAt: firstPost.createdAt,
        registeredApp: 'HT', // API에서 제공되지 않음
        category: firstPost.category,
        country: firstPost.country,
        trendData: []
      }
      
      // 첫 번째 게시물 선택 및 API 호출
      flushSync(() => {
        setIsLoadingPostAuthor(true)
        setSelectedCombinedPost(initialPostDetail)
      })
      
      // API에서 게시물 상세 정보 가져오기
      if (firstPost.postId && firstPost.boardType) {
        fetchPostDetail(startDate, endDate, firstPost.postId, firstPost.boardType)
          .then(async (postDetailResponse) => {
            let finalPostDetail = initialPostDetail
            
            if (postDetailResponse.monthlyTrend && postDetailResponse.monthlyTrend.length > 0) {
              const postData = postDetailResponse.monthlyTrend[0]
              const finalImageUrl = postData.img 
                ? (postData.img.startsWith('http') 
                    ? postData.img 
                    : `${API_IMG_URL}${postData.img.replace(/^\/+/, '')}`)
                : initialPostDetail.imageUrl
              
              console.log('📸 [게시물상세] 이미지 URL 처리:', {
                originalImg: postData.img,
                finalImageUrl: finalImageUrl,
                API_IMG_URL: API_IMG_URL,
                hasImg: !!postData.img
              })
              
              finalPostDetail = {
                ...initialPostDetail,
                imageUrl: finalImageUrl,
                content: postData.content || initialPostDetail.content,
                title: postData.title || initialPostDetail.title,
                views: postData.views || initialPostDetail.views,
                comments: postData.comments || initialPostDetail.comments,
                likes: postData.likes || initialPostDetail.likes,
                bookmarks: postData.bookmarks || initialPostDetail.bookmarks,
                createdAt: postData.createDate || initialPostDetail.createdAt,
              }
              setSelectedCombinedPost(finalPostDetail)
            }
            
            // 게시물 상세 정보 로드 후 작성자 정보 로드
            await loadPostAuthorDetail(finalPostDetail, 'combinedPost')
          })
          .catch(async (error) => {
            console.error('❌ 첫 번째 게시물 상세 정보 로딩 실패:', error)
            // 에러 발생 시 기본 정보로 작성자만 로드
            await loadPostAuthorDetail(initialPostDetail, 'combinedPost')
          })
      } else {
        // postId나 boardType이 없으면 작성자만 로드
        loadPostAuthorDetail(initialPostDetail, 'combinedPost')
      }
    }
  }, [isCombinedPostsModalOpen, combinedPosts, startDate, endDate, filteredCommunityUsers, filteredChatUsers, filteredTrendingUsers, combinedUsers])

  // 종합 게시물 선택 시 작성자 정보 자동 로딩
  // 주의: 클릭 핸들러에서 직접 loadPostAuthorDetail을 호출하므로,
  // 여기서는 모달이 열릴 때나 다른 의존성이 변경될 때만 처리
  useEffect(() => {
    if (selectedCombinedPost && isCombinedPostsModalOpen) {
      // 클릭 핸들러에서 이미 로딩이 시작되었을 수 있으므로,
      // 로딩 중이 아닐 때만 호출 (중복 방지)
      // 단, startDate나 endDate 등이 변경된 경우에는 다시 로드
      const shouldReload = !isLoadingPostAuthor
      if (shouldReload) {
        loadPostAuthorDetail(selectedCombinedPost, 'combinedPost')
      }
    } else if (!isCombinedPostsModalOpen) {
      // 모달이 닫혔을 때 초기화
      setSelectedCombinedPost(null)
      setSelectedCombinedPostAuthor(null)
      setSelectedCombinedPostAuthorTrendData(null)
      setIsLoadingPostAuthor(false)
    }
  }, [selectedCombinedPost, isCombinedPostsModalOpen, startDate, endDate, filteredCommunityUsers, filteredChatUsers, filteredTrendingUsers, combinedUsers])
  
  // 급상승 게시물 전체보기 모달용 state
  const [isTrendingPostsModalOpen, setIsTrendingPostsModalOpen] = useState(false)
  const [selectedTrendingPostInModal, setSelectedTrendingPostInModal] = useState<PostDetail | null>(null)
  const [selectedTrendingPostAuthorInModal, setSelectedTrendingPostAuthorInModal] = useState<UserDetail | null>(null)

  // 유저 클릭 핸들러
  // 유저 상세 정보는 유저의 가입일자부터 현재까지 API를 조회하여 월별 추이를 나타냅니다.
  const handleUserClick = async (user: any, source: 'community' | 'chat' | 'trending' | 'combined') => {
    if (!user.userNo) {
      console.error('❌ userNo가 없습니다.')
      return
    }
    
    try {
      // 1단계: 먼저 기본 날짜로 API를 호출하여 가입일자(joinDate)를 가져옴
      const initialResponse = await fetchUserDetailTrend(
        startDate,
        endDate,
        user.userNo
      )
      
      if (!initialResponse.userDetail) {
        console.error('❌ 유저 상세 정보: userDetail이 없습니다.')
        return
      }
      
      // 2단계: 가입일자를 startDate로, 현재 날짜를 endDate로 설정
      const userJoinDate = initialResponse.userDetail.joinDate
      const currentDateStr = getTodayDateString()
      
      // 가입일자를 YYYY-MM-DD 형식으로 변환
      let userStartDateStr: string
      if (userJoinDate) {
        try {
          const joinDateObj = new Date(userJoinDate)
          const year = joinDateObj.getFullYear()
          const month = String(joinDateObj.getMonth() + 1).padStart(2, '0')
          const day = String(joinDateObj.getDate()).padStart(2, '0')
          userStartDateStr = `${year}-${month}-${day}`
        } catch (error) {
          console.warn('⚠️ 가입일자 파싱 실패, 기본 startDate 사용:', userJoinDate)
          userStartDateStr = startDate
        }
      } else {
        console.warn('⚠️ 가입일자가 없어 기본 startDate 사용')
        userStartDateStr = startDate
      }
      
      // 3단계: 가입일부터 현재까지의 데이터로 다시 API 호출
      const trendResponse = await fetchUserDetailTrend(
        userStartDateStr,
        currentDateStr,
        user.userNo
      )
      
      if (trendResponse.userDetail) {
        const apiUserDetail = trendResponse.userDetail
        // 유저 이미지 URL 처리
        const userImageUrl = apiUserDetail.img
          ? (apiUserDetail.img.startsWith('http')
              ? apiUserDetail.img
              : `${API_IMG_URL}${apiUserDetail.img.replace(/^\/+/, '')}`)
          : ''
        const enrichedUserDetail: UserDetail = {
          id: apiUserDetail.id,
          nickname: apiUserDetail.nickName,
          signupDate: apiUserDetail.joinDate,
          email: apiUserDetail.email || '',
          language: apiUserDetail.lang || '',
          gender: getGenderLabel(apiUserDetail.userGender),
          country: apiUserDetail.userCountry || user.country || '',
          signupApp: apiUserDetail.joinApp ? getAppTypeLabel(Number(apiUserDetail.joinApp)) : '',
          osInfo: getOsTypeLabel(apiUserDetail.userOs),
          img: apiUserDetail.img,
          imageUrl: userImageUrl,
          posts: user.posts || apiUserDetail.countPosts || 0,
          comments: user.comments || apiUserDetail.countComments || 0,
          likes: user.likes || apiUserDetail.countLikes || 0,
          bookmarks: user.bookmarks || apiUserDetail.countBookmarks || 0,
          chatRooms: user.chatRooms || apiUserDetail.countChats || 0,
          messages: user.messages || apiUserDetail.countMessages || 0,
        }
        setSelectedUserDetail(enrichedUserDetail)
        // 가입일부터 현재까지의 월별 추이 데이터 변환 (forecast 포함)
        const trendData = convertCombinedTrendDataToChartFormat(
          trendResponse.monthlyTrend || [],
          trendResponse.forecast
        )
        setSelectedUserTrendData(trendData)
        setIsUserDetailModalOpen(true)
      }
    } catch (error) {
      console.error('❌ 유저 상세 정보 로딩 실패:', error)
    }
  }

  // 커뮤니티 유저 클릭 핸들러 (첫 클릭: 추이 변경, 두 번째 클릭: 모달 열기)
  // 유저 상세 정보는 유저의 가입일자부터 현재까지 API를 조회하여 월별 추이를 나타냅니다.
  const handleCommunityUserClick = async (user: typeof filteredCommunityUsers[0]) => {
    // 같은 유저를 다시 클릭한 경우 모달 열기 (userNo로 비교)
    if (selectedCommunityUser && (selectedCommunityUser as any).userNo === (user as any).userNo) {
      const userNo = (user as any).userNo
      if (!userNo) {
        console.error('❌ userNo가 없습니다.')
        return
      }
      
      try {
        // 1단계: 먼저 기본 날짜로 API를 호출하여 가입일자(joinDate)를 가져옴
        const initialResponse = await fetchUserDetailTrend(
          startDate,
          endDate,
          userNo
        )
        
        if (!initialResponse.userDetail) {
          console.error('❌ 커뮤니티 유저 상세 정보: userDetail이 없습니다.')
          return
        }
        
        // 2단계: 가입일자를 startDate로, 현재 날짜를 endDate로 설정
        const userJoinDate = initialResponse.userDetail.joinDate
        const currentDateStr = getTodayDateString()
        
        // 가입일자를 YYYY-MM-DD 형식으로 변환
        let userStartDateStr: string
        if (userJoinDate) {
          try {
            const joinDateObj = new Date(userJoinDate)
            const year = joinDateObj.getFullYear()
            const month = String(joinDateObj.getMonth() + 1).padStart(2, '0')
            const day = String(joinDateObj.getDate()).padStart(2, '0')
            userStartDateStr = `${year}-${month}-${day}`
          } catch (error) {
            console.warn('⚠️ 가입일자 파싱 실패, 기본 startDate 사용:', userJoinDate)
            userStartDateStr = startDate
          }
        } else {
          console.warn('⚠️ 가입일자가 없어 기본 startDate 사용')
          userStartDateStr = startDate
        }
        
        // 3단계: 가입일부터 현재까지의 데이터로 다시 API 호출
        const trendResponse = await fetchUserDetailTrend(
          userStartDateStr,
          currentDateStr,
          userNo
        )
        
        if (trendResponse.userDetail) {
          const apiUserDetail = trendResponse.userDetail
          // 유저 이미지 URL 처리
          const userImageUrl = apiUserDetail.img
            ? (apiUserDetail.img.startsWith('http')
                ? apiUserDetail.img
                : `${API_IMG_URL}${apiUserDetail.img}`)
            : ''
          const enrichedUserDetail: UserDetail = {
            id: apiUserDetail.id,
            nickname: apiUserDetail.nickName,
            signupDate: apiUserDetail.joinDate,
            email: apiUserDetail.email || '',
            language: apiUserDetail.lang || '',
            gender: getGenderLabel(apiUserDetail.userGender),
            country: apiUserDetail.userCountry || user.country || '',
            signupApp: apiUserDetail.joinApp ? getAppTypeLabel(Number(apiUserDetail.joinApp)) : '',
            osInfo: getOsTypeLabel(apiUserDetail.userOs),
            img: apiUserDetail.img,
            imageUrl: userImageUrl,
            posts: user.posts || apiUserDetail.countPosts || 0,
            comments: user.comments || apiUserDetail.countComments || 0,
            likes: user.likes || apiUserDetail.countLikes || 0,
            bookmarks: user.bookmarks || apiUserDetail.countBookmarks || 0,
            chatRooms: (user as any).chatRooms || apiUserDetail.countChats || 0,
            messages: (user as any).messages || apiUserDetail.countMessages || 0,
          }
          setSelectedUserDetail(enrichedUserDetail)
          // 가입일부터 현재까지의 월별 추이 데이터 변환 (forecast 포함)
          const trendData = convertTrendDataToChartFormat(
            trendResponse.monthlyTrend || [],
            trendResponse.forecast
          )
          setSelectedUserTrendData(trendData)
          setIsUserDetailModalOpen(true)
        }
      } catch (error) {
        console.error('❌ 커뮤니티 유저 상세 정보 로딩 실패:', error)
      }
    } else {
      // 다른 유저를 클릭한 경우 추이만 변경
      setSelectedCommunityUser(user)
    }
  }

  // 채팅 유저 클릭 핸들러 (첫 클릭: 추이 변경, 두 번째 클릭: 모달 열기)
  // 유저 상세 정보는 유저의 가입일자부터 현재까지 API를 조회하여 월별 추이를 나타냅니다.
  const handleChatUserClick = async (user: typeof convertedChatUsers[0]) => {
    // 같은 유저를 다시 클릭한 경우 모달 열기 (userNo로 비교)
    if (selectedChatUser && (selectedChatUser as any).userNo === (user as any).userNo) {
      const userNo = (user as any).userNo
      if (!userNo) {
        console.error('❌ userNo가 없습니다.')
        return
      }
      
      try {
        // 1단계: 먼저 기본 날짜로 API를 호출하여 가입일자(joinDate)를 가져옴
        const initialResponse = await fetchUserDetailTrend(
          startDate,
          endDate,
          userNo
        )
        
        if (!initialResponse.userDetail) {
          console.error('❌ 채팅 유저 상세 정보: userDetail이 없습니다.')
          return
        }
        
        // 2단계: 가입일자를 startDate로, 현재 날짜를 endDate로 설정
        const userJoinDate = initialResponse.userDetail.joinDate
        const currentDateStr = getTodayDateString()
        
        // 가입일자를 YYYY-MM-DD 형식으로 변환
        let userStartDateStr: string
        if (userJoinDate) {
          try {
            const joinDateObj = new Date(userJoinDate)
            const year = joinDateObj.getFullYear()
            const month = String(joinDateObj.getMonth() + 1).padStart(2, '0')
            const day = String(joinDateObj.getDate()).padStart(2, '0')
            userStartDateStr = `${year}-${month}-${day}`
          } catch (error) {
            console.warn('⚠️ 가입일자 파싱 실패, 기본 startDate 사용:', userJoinDate)
            userStartDateStr = startDate
          }
        } else {
          console.warn('⚠️ 가입일자가 없어 기본 startDate 사용')
          userStartDateStr = startDate
        }
        
        // 3단계: 가입일부터 현재까지의 데이터로 다시 API 호출
        const trendResponse = await fetchUserDetailTrend(
          userStartDateStr,
          currentDateStr,
          userNo
        )
        
        if (trendResponse.userDetail) {
          const apiUserDetail = trendResponse.userDetail
          // 유저 이미지 URL 처리
          const userImageUrl = apiUserDetail.img
            ? (apiUserDetail.img.startsWith('http')
                ? apiUserDetail.img
                : `${API_IMG_URL}${apiUserDetail.img}`)
            : ''
          const enrichedUserDetail: UserDetail = {
            id: apiUserDetail.id,
            nickname: apiUserDetail.nickName,
            signupDate: apiUserDetail.joinDate,
            email: apiUserDetail.email || '',
            language: apiUserDetail.lang || '',
            gender: getGenderLabel(apiUserDetail.userGender),
            country: apiUserDetail.userCountry || user.country || '',
            signupApp: apiUserDetail.joinApp ? getAppTypeLabel(Number(apiUserDetail.joinApp)) : '',
            osInfo: getOsTypeLabel(apiUserDetail.userOs),
            img: apiUserDetail.img,
            imageUrl: userImageUrl,
            posts: user.posts || apiUserDetail.countPosts || 0,
            comments: user.comments || apiUserDetail.countComments || 0,
            likes: user.likes || apiUserDetail.countLikes || 0,
            bookmarks: user.bookmarks || apiUserDetail.countBookmarks || 0,
            chatRooms: (user as any).chatRooms || apiUserDetail.countChats || 0,
            messages: (user as any).messages || apiUserDetail.countMessages || 0,
          }
          setSelectedUserDetail(enrichedUserDetail)
          // 가입일부터 현재까지의 월별 추이 데이터 변환 (forecast 포함)
          const trendData = convertChatTrendDataToChartFormat(
            trendResponse.monthlyTrend || [],
            trendResponse.forecast
          )
          setSelectedUserTrendData(trendData)
          setIsUserDetailModalOpen(true)
        }
      } catch (error) {
        console.error('❌ 채팅 유저 상세 정보 로딩 실패:', error)
      }
    } else {
      // 다른 유저를 클릭한 경우 추이만 변경
      setSelectedChatUser(user)
    }
  }

  // 급상승 유저 클릭 핸들러 (첫 클릭: 추이 변경, 두 번째 클릭: 모달 열기)
  // 유저 상세 정보는 유저의 가입일자부터 현재까지 API를 조회하여 월별 추이를 나타냅니다.
  const handleTrendingUserClick = async (user: typeof convertedTrendingUsers[0]) => {
    // 같은 유저를 다시 클릭한 경우 모달 열기 (userNo로 비교)
    if (selectedTrendingUser && (selectedTrendingUser as any).userNo === (user as any).userNo) {
      const userNo = (user as any).userNo
      if (!userNo) {
        console.error('❌ userNo가 없습니다.')
        return
      }
      
      try {
        // 1단계: 먼저 기본 날짜로 API를 호출하여 가입일자(joinDate)를 가져옴
        const initialResponse = await fetchUserDetailTrend(
          startDate,
          endDate,
          userNo
        )
        
        if (!initialResponse.userDetail) {
          console.error('❌ 급상승 유저 상세 정보: userDetail이 없습니다.')
          return
        }
        
        // 2단계: 가입일자를 startDate로, 현재 날짜를 endDate로 설정
        const userJoinDate = initialResponse.userDetail.joinDate
        const currentDateStr = getTodayDateString()
        
        // 가입일자를 YYYY-MM-DD 형식으로 변환
        let userStartDateStr: string
        if (userJoinDate) {
          try {
            const joinDateObj = new Date(userJoinDate)
            const year = joinDateObj.getFullYear()
            const month = String(joinDateObj.getMonth() + 1).padStart(2, '0')
            const day = String(joinDateObj.getDate()).padStart(2, '0')
            userStartDateStr = `${year}-${month}-${day}`
          } catch (error) {
            console.warn('⚠️ 가입일자 파싱 실패, 기본 startDate 사용:', userJoinDate)
            userStartDateStr = startDate
          }
        } else {
          console.warn('⚠️ 가입일자가 없어 기본 startDate 사용')
          userStartDateStr = startDate
        }
        
        // 3단계: 가입일부터 현재까지의 데이터로 다시 API 호출
        const trendResponse = await fetchUserDetailTrend(
          userStartDateStr,
          currentDateStr,
          userNo
        )
        
        if (trendResponse.userDetail) {
          const apiUserDetail = trendResponse.userDetail
          // 유저 이미지 URL 처리
          const userImageUrl = apiUserDetail.img
            ? (apiUserDetail.img.startsWith('http')
                ? apiUserDetail.img
                : `${API_IMG_URL}${apiUserDetail.img}`)
            : ''
          const enrichedUserDetail: UserDetail = {
            id: apiUserDetail.id,
            nickname: apiUserDetail.nickName,
            signupDate: apiUserDetail.joinDate,
            email: apiUserDetail.email || '',
            language: apiUserDetail.lang || '',
            gender: getGenderLabel(apiUserDetail.userGender),
            country: apiUserDetail.userCountry || "한국",
            signupApp: apiUserDetail.joinApp ? getAppTypeLabel(Number(apiUserDetail.joinApp)) : '',
            osInfo: getOsTypeLabel(apiUserDetail.userOs),
            img: apiUserDetail.img,
            imageUrl: userImageUrl,
            posts: user.posts || apiUserDetail.countPosts || 0,
            comments: user.comments || apiUserDetail.countComments || 0,
            likes: user.likes || apiUserDetail.countLikes || 0,
            bookmarks: user.bookmarks || apiUserDetail.countBookmarks || 0,
            chatRooms: (user as any).chatRooms || apiUserDetail.countChats || 0,
            messages: (user as any).messages || apiUserDetail.countMessages || 0,
          }
          setSelectedUserDetail(enrichedUserDetail)
          // 가입일부터 현재까지의 월별 추이 데이터 변환 (forecast 포함)
          const trendData = convertCombinedTrendDataToChartFormat(
            trendResponse.monthlyTrend || [],
            trendResponse.forecast
          )
          setSelectedUserTrendData(trendData)
          setIsUserDetailModalOpen(true)
        }
      } catch (error) {
        console.error('❌ 급상승 유저 상세 정보 로딩 실패:', error)
      }
    } else {
      // 다른 유저를 클릭한 경우 추이만 변경
      setSelectedTrendingUser(user)
      
      // 선택된 유저의 추이 데이터 가져오기
      if (user.userNo) {
        try {
          const trendResponse = await fetchUserDetailTrend(
            startDate,
            endDate,
            user.userNo
          )
          setSelectedTrendingUserTrendData(trendResponse.monthlyTrend || [])
          setSelectedTrendingUserForecast(trendResponse.forecast || [])
        } catch (error) {
          console.error('❌ 급상승 유저 추이 데이터 로딩 실패:', error)
          setSelectedTrendingUserTrendData(null)
        }
      }
    }
  }

  // 급상승 게시물 클릭 핸들러 (첫 클릭: 추이 변경, 두 번째 클릭: 모달 열기)
  const handleTrendingPostClick = async (post: any) => {
    // 같은 게시물을 다시 클릭한 경우 모달 열기
    if (selectedPopularPost?.postId === post.postId) {
      try {
        // API에서 게시물 상세 정보 가져오기
        const postDetailResponse = await fetchPostDetail(
          startDate,
          endDate,
          post.postId!,
          post.boardType!
        )
        
        // 게시물 추이 데이터 변환
        const trendData = postDetailResponse.monthlyTrend?.map(item => ({
          month: item.periodMonth || '',
          views: item.views || null,
          viewsPredicted: null,
          likes: item.likes || null,
          likesPredicted: null,
          comments: item.comments || null,
          commentsPredicted: null,
          bookmarks: item.bookmarks || null,
          bookmarksPredicted: null,
        })) || []
      
      // 이미지 URL 처리: API 응답의 monthlyTrend[0].img를 우선 사용, 없으면 post.img 사용
      const apiImage = postDetailResponse.monthlyTrend?.[0]?.img
      const fallbackImage = post.img
      const imageSource = apiImage || fallbackImage
      
      // 이미지 URL 처리: 상대 경로면 슬래시 확인 후 API_IMG_URL 붙이기
      const imageUrl = imageSource
        ? (imageSource.startsWith('http') 
            ? imageSource 
            : imageSource.startsWith('/')
              ? `${API_IMG_URL}${imageSource}`
              : `${API_IMG_URL}${imageSource}`)
        : '/placeholder.jpg'
      
      console.log('📸 [게시물상세-클릭] 이미지 URL 처리:', {
        imageSource: imageSource,
        finalImageUrl: imageUrl,
        API_IMG_URL: API_IMG_URL,
        startsWithHttp: imageSource?.startsWith('http'),
        startsWithSlash: imageSource?.startsWith('/')
      })
      
      // content도 API 응답에서 가져오기
      const apiContent = postDetailResponse.monthlyTrend?.[0]?.content || postDetailResponse.content
      
      const postDetail: PostDetail = {
        title: postDetailResponse.monthlyTrend?.[0]?.title || post.title,
          imageUrl: imageUrl,
          content: apiContent || post.content || '',
        author: postDetailResponse.monthlyTrend?.[0]?.userNickname || post.author,
          authorUserNo: postDetailResponse.monthlyTrend?.[0]?.userNo?.toString() || post.userNo?.toString(),
        views: postDetailResponse.monthlyTrend?.[0]?.views ?? post.views,
        comments: postDetailResponse.monthlyTrend?.[0]?.comments ?? post.comments,
        likes: postDetailResponse.monthlyTrend?.[0]?.likes ?? post.likes,
        bookmarks: postDetailResponse.monthlyTrend?.[0]?.bookmarks ?? post.bookmarks,
          language: '한국어', // API에 언어 정보가 없으면 기본값
        createdAt: postDetailResponse.monthlyTrend?.[0]?.createDate || post.createdAt,
          registeredApp: 'HT', // API에 앱 정보가 없으면 기본값
        category: post.category,
        country: post.country,
          trendData: trendData
      }
      setSelectedPostDetail(postDetail)
        setSelectedPostDetailAuthor(null)
      setIsPostDetailModalOpen(true)
      } catch (error) {
        console.error('❌ 게시물 상세 정보 로딩 실패:', error)
        // 에러 발생 시 기본 정보만 표시
        const postDetail: PostDetail = {
          title: post.title,
          imageUrl: post.img || `/placeholder.jpg`,
          content: post.content || '',
          author: post.author,
          authorUserNo: post.userNo?.toString(),
          views: post.views,
          comments: post.comments,
          likes: post.likes,
          bookmarks: post.bookmarks,
          language: '한국어',
          createdAt: post.createdAt,
          registeredApp: 'HT',
          category: post.category,
          country: post.country,
          trendData: []
        }
        setSelectedPostDetail(postDetail)
        setSelectedPostDetailAuthor(null)
        setIsPostDetailModalOpen(true)
      }
    } else {
      // 다른 게시물을 클릭한 경우 추이만 변경
      setSelectedPopularPost(post)
      // API에서 추이 데이터 가져오기
      try {
        const postDetailResponse = await fetchPostDetail(
          startDate,
          endDate,
          post.postId!,
          post.boardType!
        )
        
        // 게시물 추이 데이터 변환
        const trendData = postDetailResponse.monthlyTrend?.map(item => ({
          month: item.periodMonth || '',
          views: item.views || null,
          viewsPredicted: null,
          likes: item.likes || null,
          likesPredicted: null,
          comments: item.comments || null,
          commentsPredicted: null,
          bookmarks: item.bookmarks || null,
          bookmarksPredicted: null,
        })) || []
        
        setSelectedTrendingPostTrendData(trendData)
      } catch (error) {
        console.error('❌ 게시물 추이 데이터 로딩 실패:', error)
        setSelectedTrendingPostTrendData(null)
      }
    }
  }


  // API에서 유저 추이 데이터를 가져와서 차트 형식으로 변환하는 함수
  const convertTrendDataToChartFormat = (
    trendData: MonthlyTrendItem[] | null,
    forecast?: { date: string; predicted: number }[]
  ): Array<{
    month: string
    periodMonth?: string // 원본 periodMonth 유지 (forecast 매칭용)
    posts: number | null
    comments: number | null
    likes: number | null
    bookmarks: number | null
    chatRooms: number | null
    messages: number | null
    postsPredicted?: number | null
    commentsPredicted?: number | null
    likesPredicted?: number | null
    bookmarksPredicted?: number | null
    chatRoomsPredicted?: number | null
    messagesPredicted?: number | null
    cumulative?: number | null
    predicted?: number | null
  }> => {
    if (!trendData || trendData.length === 0) {
      return []
    }
    
    // forecast 데이터를 Map으로 변환 (periodMonth별 predicted 매핑)
    const forecastMap = new Map<string, number>()
    if (forecast && forecast.length > 0) {
      forecast.forEach((item) => {
        if (item.date && item.predicted != null) {
          // date를 periodMonth 형식(YYYY-MM)으로 정규화
          let normalizedDate = item.date.trim()
          if (normalizedDate.length >= 7) {
            normalizedDate = normalizedDate.substring(0, 7) // YYYY-MM
          }
          forecastMap.set(normalizedDate, item.predicted)
        }
      })
      console.log('📊 [커뮤니티유저] Forecast 데이터 매핑:', {
        forecastCount: forecast.length,
        forecastMapSize: forecastMap.size,
        forecastMapEntries: Array.from(forecastMap.entries()).slice(0, 5)
      })
    }
    
    // periodMonth를 기준으로 정렬 (yyyy-MM 형식)
    const sortedData = [...trendData]
      .filter(item => item.periodMonth != null)
      .sort((a, b) => {
        const dateA = a.periodMonth || ''
        const dateB = b.periodMonth || ''
        return dateA.localeCompare(dateB)
      })
    
    // 누적값 계산 및 최근 실제 데이터 비율 계산 (forecast 분배용)
    let cumulative = 0
    let recentTotal = 0
    let recentPosts = 0
    let recentComments = 0
    let recentLikes = 0
    let recentBookmarks = 0
    let recentChatRooms = 0
    let recentMessages = 0
    
    // 최근 3개월 데이터로 비율 계산 (forecast 분배용)
    const recentData = sortedData.slice(-3).filter(item => {
      const hasData = (item.countPosts ?? 0) + (item.countComments ?? 0) + (item.countLikes ?? 0) + 
                      (item.countBookmarks ?? 0) + (item.countChats ?? 0) + (item.countMessages ?? 0) > 0
      return hasData
    })
    
    if (recentData.length > 0) {
      recentData.forEach(item => {
        recentPosts += item.countPosts ?? 0
        recentComments += item.countComments ?? 0
        recentLikes += item.countLikes ?? 0
        recentBookmarks += item.countBookmarks ?? 0
        recentChatRooms += item.countChats ?? 0
        recentMessages += item.countMessages ?? 0
      })
      recentTotal = recentPosts + recentComments + recentLikes + recentBookmarks + recentChatRooms + recentMessages
    }
    
    // 비율 계산 (0으로 나누기 방지)
    const postsRatio = recentTotal > 0 ? recentPosts / recentTotal : 0
    const commentsRatio = recentTotal > 0 ? recentComments / recentTotal : 0
    const likesRatio = recentTotal > 0 ? recentLikes / recentTotal : 0
    const bookmarksRatio = recentTotal > 0 ? recentBookmarks / recentTotal : 0
    const chatRoomsRatio = recentTotal > 0 ? recentChatRooms / recentTotal : 0
    const messagesRatio = recentTotal > 0 ? recentMessages / recentTotal : 0
    
    const result = sortedData.map(item => {
      const posts = item.countPosts ?? null
      const comments = item.countComments ?? null
      const likes = item.countLikes ?? null
      const bookmarks = item.countBookmarks ?? null
      const chatRooms = item.countChats ?? null
      const messages = item.countMessages ?? null
      
      // forecast에서 예측값 가져오기
      const periodMonth = item.periodMonth || ''
      const predictedTotal = forecastMap.get(periodMonth) || null
      
      // forecast를 각 지표별로 분배
      const postsPredicted = predictedTotal != null && postsRatio > 0 ? Math.round(predictedTotal * postsRatio) : null
      const commentsPredicted = predictedTotal != null && commentsRatio > 0 ? Math.round(predictedTotal * commentsRatio) : null
      const likesPredicted = predictedTotal != null && likesRatio > 0 ? Math.round(predictedTotal * likesRatio) : null
      const bookmarksPredicted = predictedTotal != null && bookmarksRatio > 0 ? Math.round(predictedTotal * bookmarksRatio) : null
      const chatRoomsPredicted = predictedTotal != null && chatRoomsRatio > 0 ? Math.round(predictedTotal * chatRoomsRatio) : null
      const messagesPredicted = predictedTotal != null && messagesRatio > 0 ? Math.round(predictedTotal * messagesRatio) : null
      
      // 누적값 계산
      if (posts != null || comments != null || likes != null || bookmarks != null || chatRooms != null || messages != null) {
        cumulative += (posts || 0) + (comments || 0) + (likes || 0) + (bookmarks || 0) + (chatRooms || 0) + (messages || 0)
      }
      
      // periodMonth를 "yyyy-MM" 형식으로 변환 (이미 그 형식일 수 있음)
      const month = item.periodMonth || ''
      
      return {
        month,
        periodMonth: periodMonth, // 원본 periodMonth 유지
        posts,
        comments,
        likes,
        bookmarks,
        chatRooms,
        messages,
        postsPredicted,
        commentsPredicted,
        likesPredicted,
        bookmarksPredicted,
        chatRoomsPredicted,
        messagesPredicted,
        cumulative: cumulative > 0 ? cumulative : null,
        predicted: predictedTotal
      }
    })
    
    // forecast에만 있고 기존 데이터에 없는 기간 추가
    if (forecastMap.size > 0) {
      forecastMap.forEach((predicted, date) => {
        const exists = result.some(item => {
          const itemPeriod = item.periodMonth || item.month
          return itemPeriod === date
        })
        if (!exists) {
          // YYYY-MM을 X년 X월 형식으로 변환
          const [year, month] = date.split('-')
          const monthNum = parseInt(month, 10)
          
          // forecast를 각 지표별로 분배 (최근 데이터 비율 사용)
          const postsPredicted = predicted != null && postsRatio > 0 ? Math.round(predicted * postsRatio) : null
          const commentsPredicted = predicted != null && commentsRatio > 0 ? Math.round(predicted * commentsRatio) : null
          const likesPredicted = predicted != null && likesRatio > 0 ? Math.round(predicted * likesRatio) : null
          const bookmarksPredicted = predicted != null && bookmarksRatio > 0 ? Math.round(predicted * bookmarksRatio) : null
          const chatRoomsPredicted = predicted != null && chatRoomsRatio > 0 ? Math.round(predicted * chatRoomsRatio) : null
          const messagesPredicted = predicted != null && messagesRatio > 0 ? Math.round(predicted * messagesRatio) : null
          
          result.push({
            month: `${year}년 ${monthNum}월`,
            periodMonth: date,
            posts: null,
            comments: null,
            likes: null,
            bookmarks: null,
            chatRooms: null,
            messages: null,
            postsPredicted,
            commentsPredicted,
            likesPredicted,
            bookmarksPredicted,
            chatRoomsPredicted,
            messagesPredicted,
            cumulative: null,
            predicted: predicted
          })
        }
      })
      
      // 다시 정렬
      result.sort((a, b) => {
        const aPeriod = a.periodMonth || a.month
        const bPeriod = b.periodMonth || b.month
        return aPeriod.localeCompare(bPeriod)
      })
    }
    
    return result
  }
  
  // 커뮤니티 유저 선택 시 추이 데이터 가져오기
  useEffect(() => {
    const loadTrendData = async () => {
      const userNo = (selectedCommunityUser as any)?.userNo
      if (!userNo) {
        setSelectedCommunityUserTrendData(null)
        return
      }
      
      setLoadingTrendData(true)
      try {
        const trendResponse = await fetchUserDetailTrend(
          startDate,
          endDate,
          userNo
        )
        setSelectedCommunityUserTrendData(trendResponse.monthlyTrend || [])
        setSelectedCommunityUserForecast(trendResponse.forecast || [])
      } catch (error) {
        console.error('❌ 추이 데이터 로딩 실패:', error)
        setSelectedCommunityUserTrendData(null)
      } finally {
        setLoadingTrendData(false)
      }
    }
    
    loadTrendData()
  }, [selectedCommunityUser, startDate, endDate])

  // 첫 번째 커뮤니티 유저의 추이 데이터 자동 로드
  useEffect(() => {
    const loadFirstUserTrendData = async () => {
      if (filteredCommunityUsers.length === 0) {
        setFirstCommunityUserTrendData(null)
        return
      }
      
      const firstUser = filteredCommunityUsers[0]
      const userNo = (firstUser as any)?.userNo
      if (!userNo) {
        setFirstCommunityUserTrendData(null)
        return
      }
      
      try {
        const trendResponse = await fetchUserDetailTrend(
          startDate,
          endDate,
          userNo
        )
        setFirstCommunityUserTrendData(trendResponse.monthlyTrend || [])
        setFirstCommunityUserForecast(trendResponse.forecast || [])
      } catch (error) {
        console.error('❌ 첫 번째 커뮤니티 유저 추이 데이터 로딩 실패:', error)
        setFirstCommunityUserTrendData(null)
      }
    }
    
    loadFirstUserTrendData()
  }, [filteredCommunityUsers, startDate, endDate])

  // 첫 번째 채팅 유저의 추이 데이터 자동 로드
  useEffect(() => {
    const loadFirstChatUserTrendData = async () => {
      if (filteredChatUsers.length === 0) {
        setFirstChatUserTrendData(null)
        return
      }
      
      const firstUser = filteredChatUsers[0]
      const userNo = firstUser.userNo
      if (!userNo) {
        setFirstChatUserTrendData(null)
        return
      }
      
      try {
        const trendResponse = await fetchUserDetailTrend(
          startDate,
          endDate,
          userNo
        )
        setFirstChatUserTrendData(trendResponse.monthlyTrend || [])
        setFirstChatUserForecast(trendResponse.forecast || [])
      } catch (error) {
        console.error('❌ 첫 번째 채팅 유저 추이 데이터 로딩 실패:', error)
        setFirstChatUserTrendData(null)
        setFirstChatUserForecast([])
      }
    }
    
    loadFirstChatUserTrendData()
  }, [filteredChatUsers, startDate, endDate])

  // 첫 번째 급상승 유저의 추이 데이터 자동 로드
  useEffect(() => {
    const loadFirstTrendingUserTrendData = async () => {
      if (filteredTrendingUsers.length === 0) {
        setFirstTrendingUserTrendData(null)
        return
      }
      
      const firstUser = filteredTrendingUsers[0]
      const userNo = firstUser.userNo
      if (!userNo) {
        setFirstTrendingUserTrendData(null)
        return
      }
      
      try {
        const trendResponse = await fetchUserDetailTrend(
          startDate,
          endDate,
          userNo
        )
        setFirstTrendingUserTrendData(trendResponse.monthlyTrend || [])
        setFirstTrendingUserForecast(trendResponse.forecast || [])
      } catch (error) {
        console.error('❌ 첫 번째 급상승 유저 추이 데이터 로딩 실패:', error)
        setFirstTrendingUserTrendData(null)
      }
    }
    
    loadFirstTrendingUserTrendData()
  }, [filteredTrendingUsers, startDate, endDate])

  // 상위 5명 종합 유저의 추이 데이터 자동 로드
  useEffect(() => {
    const loadTop5UsersTrendData = async () => {
      if (combinedUsers.length === 0) {
        setTop5CombinedUsersTrendData(new Map())
        return
      }
      
      const top5Users = combinedUsers.slice(0, 5)
      const trendDataMap = new Map<number, MonthlyTrendItem[]>()
      
      // 병렬로 모든 유저의 추이 데이터 가져오기
      const promises = top5Users.map(async (user) => {
        const userNo = (user as any)?.userNo
        if (!userNo) return null
        
        try {
          const trendResponse = await fetchUserDetailTrend(
            startDate,
            endDate,
            userNo
          )
          return { userNo, trendData: trendResponse.monthlyTrend || [] }
        } catch (error) {
          console.error(`❌ 유저 ${userNo} 추이 데이터 로딩 실패:`, error)
          return null
        }
      })
      
      const results = await Promise.all(promises)
      results.forEach(result => {
        if (result) {
          trendDataMap.set(result.userNo, result.trendData)
        }
      })
      
      setTop5CombinedUsersTrendData(trendDataMap)
    }
    
    loadTop5UsersTrendData()
  }, [combinedUsers, startDate, endDate])

  // 채팅 유저용 추이 데이터 변환 함수
  const convertChatTrendDataToChartFormat = (
    trendData: MonthlyTrendItem[] | null,
    forecast?: { date: string; predicted: number }[]
  ): Array<{
    month: string
    chatRooms: number | null
    messages: number | null
    chatRoomsPredicted?: number | null
    messagesPredicted?: number | null
    cumulative?: number | null
    predicted?: number | null
  }> => {
    if (!trendData || trendData.length === 0) {
      return []
    }
    
    // forecast 데이터를 Map으로 변환 (periodMonth별 predicted 매핑)
    const forecastMap = new Map<string, number>()
    if (forecast && forecast.length > 0) {
      forecast.forEach((item) => {
        if (item.date && item.predicted != null) {
          // date를 periodMonth 형식(YYYY-MM)으로 정규화
          let normalizedDate = item.date.trim()
          if (normalizedDate.length >= 7) {
            normalizedDate = normalizedDate.substring(0, 7) // YYYY-MM
          }
          forecastMap.set(normalizedDate, item.predicted)
        }
      })
    }
    
    const sortedData = [...trendData]
      .filter(item => item.periodMonth != null)
      .sort((a, b) => {
        const dateA = a.periodMonth || ''
        const dateB = b.periodMonth || ''
        return dateA.localeCompare(dateB)
      })
    
    // 누적값 계산 및 최근 실제 데이터 비율 계산 (forecast 분배용)
    let cumulative = 0
    let recentTotal = 0
    let recentChatRooms = 0
    let recentMessages = 0
    
    // 최근 3개월 데이터로 비율 계산 (forecast 분배용)
    const recentData = sortedData.slice(-3).filter(item => {
      const hasData = (item.countChats ?? 0) + (item.countMessages ?? 0) > 0
      return hasData
    })
    
    if (recentData.length > 0) {
      recentData.forEach(item => {
        recentChatRooms += item.countChats ?? 0
        recentMessages += item.countMessages ?? 0
      })
      recentTotal = recentChatRooms + recentMessages
    }
    
    // 비율 계산 (0으로 나누기 방지)
    const chatRoomsRatio = recentTotal > 0 ? recentChatRooms / recentTotal : 0.5 // 기본값 50:50
    const messagesRatio = recentTotal > 0 ? recentMessages / recentTotal : 0.5 // 기본값 50:50
    
    const result = sortedData.map(item => {
      const chatRooms = item.countChats ?? null
      const messages = item.countMessages ?? null
      const month = item.periodMonth || ''
      
      // forecast에서 예측값 가져오기
      const predictedTotal = forecastMap.get(month) || null
      
      // forecast를 채팅방과 메시지로 분배
      const chatRoomsPredicted = predictedTotal != null && chatRoomsRatio > 0 ? Math.round(predictedTotal * chatRoomsRatio) : null
      const messagesPredicted = predictedTotal != null && messagesRatio > 0 ? Math.round(predictedTotal * messagesRatio) : null
      
      // 누적값 계산
      if (chatRooms != null || messages != null) {
        cumulative += (chatRooms || 0) + (messages || 0)
      }
      
      return {
        month,
        chatRooms,
        messages,
        chatRoomsPredicted,
        messagesPredicted,
        cumulative: cumulative > 0 ? cumulative : null,
        predicted: predictedTotal
      }
    })
    
    // forecast에만 있고 기존 데이터에 없는 기간 추가
    if (forecastMap.size > 0) {
      forecastMap.forEach((predicted, date) => {
        const exists = result.some(item => {
          const itemPeriod = item.month
          return itemPeriod === date || itemPeriod.includes(date.substring(0, 4)) && itemPeriod.includes(date.substring(5, 7))
        })
        if (!exists) {
          // YYYY-MM을 X년 X월 형식으로 변환
          const [year, month] = date.split('-')
          const monthNum = parseInt(month, 10)
          
          // forecast를 채팅방과 메시지로 분배
          const chatRoomsPredicted = predicted != null && chatRoomsRatio > 0 ? Math.round(predicted * chatRoomsRatio) : null
          const messagesPredicted = predicted != null && messagesRatio > 0 ? Math.round(predicted * messagesRatio) : null
          
          result.push({
            month: `${year}년 ${monthNum}월`,
            chatRooms: null,
            messages: null,
            chatRoomsPredicted,
            messagesPredicted,
            cumulative: null,
            predicted: predicted
          })
        }
      })
      
      // 다시 정렬
      result.sort((a, b) => {
        return a.month.localeCompare(b.month)
      })
    }
    
    return result
  }

  // 종합 유저용 추이 데이터 변환 함수 (커뮤니티 + 채팅 합산)
  const convertCombinedTrendDataToChartFormat = (
    trendData: MonthlyTrendItem[] | null,
    forecast?: { date: string; predicted: number }[]
  ): Array<{
    month: string
    periodMonth?: string // 원본 periodMonth 유지 (forecast 매칭용)
    posts: number | null
    comments: number | null
    likes: number | null
    bookmarks: number | null
    chatRooms: number | null
    messages: number | null
    postsPredicted?: number | null
    commentsPredicted?: number | null
    likesPredicted?: number | null
    bookmarksPredicted?: number | null
    chatRoomsPredicted?: number | null
    messagesPredicted?: number | null
    cumulative?: number | null
    predicted?: number | null
  }> => {
    if (!trendData || trendData.length === 0) {
      return []
    }
    
    // forecast 데이터를 Map으로 변환 (periodMonth별 predicted 매핑)
    const forecastMap = new Map<string, number>()
    if (forecast && forecast.length > 0) {
      forecast.forEach((item) => {
        if (item.date && item.predicted != null) {
          // date를 periodMonth 형식(YYYY-MM)으로 정규화
          let normalizedDate = item.date.trim()
          if (normalizedDate.length >= 7) {
            normalizedDate = normalizedDate.substring(0, 7) // YYYY-MM
          }
          forecastMap.set(normalizedDate, item.predicted)
        }
      })
      console.log('📊 [유저상세] Forecast 데이터 매핑:', {
        forecastCount: forecast.length,
        forecastMapSize: forecastMap.size,
        forecastMapEntries: Array.from(forecastMap.entries()).slice(0, 5)
      })
    }
    
    const sortedData = [...trendData]
      .filter(item => item.periodMonth != null)
      .sort((a, b) => {
        const dateA = a.periodMonth || ''
        const dateB = b.periodMonth || ''
        return dateA.localeCompare(dateB)
      })
    
    // 누적값 계산 및 최근 실제 데이터 비율 계산 (forecast 분배용)
    let cumulative = 0
    let recentTotal = 0
    let recentPosts = 0
    let recentComments = 0
    let recentLikes = 0
    let recentBookmarks = 0
    let recentChatRooms = 0
    let recentMessages = 0
    
    // 최근 3개월 데이터로 비율 계산 (forecast 분배용)
    const recentData = sortedData.slice(-3).filter(item => {
      const hasData = (item.countPosts ?? 0) + (item.countComments ?? 0) + (item.countLikes ?? 0) + 
                      (item.countBookmarks ?? 0) + (item.countChats ?? 0) + (item.countMessages ?? 0) > 0
      return hasData
    })
    
    if (recentData.length > 0) {
      recentData.forEach(item => {
        recentPosts += item.countPosts ?? 0
        recentComments += item.countComments ?? 0
        recentLikes += item.countLikes ?? 0
        recentBookmarks += item.countBookmarks ?? 0
        recentChatRooms += item.countChats ?? 0
        recentMessages += item.countMessages ?? 0
      })
      recentTotal = recentPosts + recentComments + recentLikes + recentBookmarks + recentChatRooms + recentMessages
    }
    
    // 비율 계산 (0으로 나누기 방지)
    const postsRatio = recentTotal > 0 ? recentPosts / recentTotal : 0
    const commentsRatio = recentTotal > 0 ? recentComments / recentTotal : 0
    const likesRatio = recentTotal > 0 ? recentLikes / recentTotal : 0
    const bookmarksRatio = recentTotal > 0 ? recentBookmarks / recentTotal : 0
    const chatRoomsRatio = recentTotal > 0 ? recentChatRooms / recentTotal : 0
    const messagesRatio = recentTotal > 0 ? recentMessages / recentTotal : 0
    
    const result = sortedData.map(item => {
      const month = item.periodMonth || ''
      const posts = item.countPosts ?? null
      const comments = item.countComments ?? null
      const likes = item.countLikes ?? null
      const bookmarks = item.countBookmarks ?? null
      const chatRooms = item.countChats ?? null
      const messages = item.countMessages ?? null
      
      // forecast에서 예측값 가져오기
      const predictedTotal = forecastMap.get(month) || null
      
      // forecast를 각 지표별로 분배
      const postsPredicted = predictedTotal != null && postsRatio > 0 ? Math.round(predictedTotal * postsRatio) : null
      const commentsPredicted = predictedTotal != null && commentsRatio > 0 ? Math.round(predictedTotal * commentsRatio) : null
      const likesPredicted = predictedTotal != null && likesRatio > 0 ? Math.round(predictedTotal * likesRatio) : null
      const bookmarksPredicted = predictedTotal != null && bookmarksRatio > 0 ? Math.round(predictedTotal * bookmarksRatio) : null
      const chatRoomsPredicted = predictedTotal != null && chatRoomsRatio > 0 ? Math.round(predictedTotal * chatRoomsRatio) : null
      const messagesPredicted = predictedTotal != null && messagesRatio > 0 ? Math.round(predictedTotal * messagesRatio) : null
      
      // 누적값 계산
      if (posts != null || comments != null || likes != null || bookmarks != null || chatRooms != null || messages != null) {
        cumulative += (posts || 0) + (comments || 0) + (likes || 0) + (bookmarks || 0) + (chatRooms || 0) + (messages || 0)
      }
      
      return {
        month,
        periodMonth: month, // 원본 periodMonth 유지
        posts,
        comments,
        likes,
        bookmarks,
        chatRooms,
        messages,
        postsPredicted,
        commentsPredicted,
        likesPredicted,
        bookmarksPredicted,
        chatRoomsPredicted,
        messagesPredicted,
        cumulative: cumulative > 0 ? cumulative : null,
        predicted: predictedTotal
      }
    })
    
    // forecast에만 있고 기존 데이터에 없는 기간 추가
    if (forecastMap.size > 0) {
      forecastMap.forEach((predicted, date) => {
        const exists = result.some(item => {
          const itemPeriod = item.periodMonth || item.month
          return itemPeriod === date
        })
        if (!exists) {
          // YYYY-MM을 X년 X월 형식으로 변환
          const [year, month] = date.split('-')
          const monthNum = parseInt(month, 10)
          
          // forecast를 각 지표별로 분배 (최근 데이터 비율 사용)
          const postsPredicted = predicted != null && postsRatio > 0 ? Math.round(predicted * postsRatio) : null
          const commentsPredicted = predicted != null && commentsRatio > 0 ? Math.round(predicted * commentsRatio) : null
          const likesPredicted = predicted != null && likesRatio > 0 ? Math.round(predicted * likesRatio) : null
          const bookmarksPredicted = predicted != null && bookmarksRatio > 0 ? Math.round(predicted * bookmarksRatio) : null
          const chatRoomsPredicted = predicted != null && chatRoomsRatio > 0 ? Math.round(predicted * chatRoomsRatio) : null
          const messagesPredicted = predicted != null && messagesRatio > 0 ? Math.round(predicted * messagesRatio) : null
          
          result.push({
            month: `${year}년 ${monthNum}월`,
            periodMonth: date,
            posts: null,
            comments: null,
            likes: null,
            bookmarks: null,
            chatRooms: null,
            messages: null,
            postsPredicted,
            commentsPredicted,
            likesPredicted,
            bookmarksPredicted,
            chatRoomsPredicted,
            messagesPredicted,
            cumulative: null,
            predicted: predicted
          })
        }
      })
      
      // 다시 정렬
      result.sort((a, b) => {
        const aPeriod = a.periodMonth || a.month
        const bPeriod = b.periodMonth || b.month
        return aPeriod.localeCompare(bPeriod)
      })
    }
    
    return result
  }

  // Top 5 유저들의 월별 개별 추이 데이터 생성 함수
  const getTop5CombinedUsersTrendData = useMemo(() => {
    if (top5CombinedUsersTrendData.size === 0) {
      return []
    }
    
    // 모든 유저의 월별 데이터를 수집
    const allMonths = new Set<string>()
    top5CombinedUsersTrendData.forEach(trendData => {
      trendData.forEach(item => {
        if (item.periodMonth) {
          allMonths.add(item.periodMonth)
        }
      })
    })
    
    const sortedMonths = Array.from(allMonths).sort()
    const top5Users = combinedUsers.slice(0, 5)
    
    return sortedMonths.map(month => {
      const result: any = { month }
      
      top5Users.forEach(user => {
        const userNo = (user as any)?.userNo
        const trendData = top5CombinedUsersTrendData.get(userNo)
        if (trendData) {
          const monthData = trendData.find(item => item.periodMonth === month)
          if (monthData) {
            const totalActivity = (monthData.countPosts || 0) + 
                                (monthData.countComments || 0) + 
                                (monthData.countLikes || 0) + 
                                (monthData.countBookmarks || 0) + 
                                (monthData.countChats || 0) + 
                                (monthData.countMessages || 0)
            result[user.name] = totalActivity > 0 ? totalActivity : null
            result[`${user.name}_predicted`] = null
          } else {
            result[user.name] = null
            result[`${user.name}_predicted`] = null
          }
        } else {
          result[user.name] = null
          result[`${user.name}_predicted`] = null
        }
      })
      
      return result
    })
  }, [top5CombinedUsersTrendData, combinedUsers])
  
  // Top 5 유저 이름 배열 (범례용)
  const top5UserNames = useMemo(() => {
    return combinedUsers.slice(0, 5).map(user => user.name)
  }, [combinedUsers])

  // 종합 유저 랭킹 전체 보기 모달용 필터링된 유저 리스트
  const filteredCombinedUsersForModal = useMemo(() => {
    const languageMap: Record<string, string> = {
      'ko': '한국어',
      'ja': '일본어',
      'zh': '중국어',
      'en': '영어',
      'hi': '인도어',
      'vi': '베트남어',
      'th': '태국어',
      'ru': '러시아어'
    }
    
    let filteredUsers = combinedUsers
    
    // 언어 필터링 (실제 API 데이터의 lang 필드 사용)
    if (filteredCombinedUserLanguage !== '전체') {
      filteredUsers = filteredUsers.filter(user => {
        const languageCode = user.lang || 'ko'
        const languageName = languageMap[languageCode] || '한국어'
        return languageName === filteredCombinedUserLanguage
      })
    }
    
    // 가입앱 필터링 (실제 API 데이터 필요 시 구현)
    if (filteredCombinedUserApp !== '전체') {
      // 실제 앱 정보는 API에서 제공되지 않으므로 필터링하지 않음
      // filteredUsers = filteredUsers.filter(user => {
      //   return signupApp === filteredCombinedUserApp
      // })
    }
    
    return filteredUsers
  }, [combinedUsers, filteredCombinedUserLanguage, filteredCombinedUserApp])

  // 페이징된 유저 데이터 로드
  useEffect(() => {
    const loadPagedUsers = async () => {
      if (!isCombinedUsersModalOpen) return
      
      setLoadingPagedUsers(true)
      try {
        const offset = currentPage * pageSize
        const response = await fetchUserRanking(startDate, endDate, 30)
        const integratedUsers = response.integratedRankList || []
        
        // 데이터 변환
        const convertedUsers = integratedUsers.map((item, index) => ({
          rank: item.integratedRank || index + 1 + offset,
          name: item.userNickname || `사용자${item.userNo}`,
          country: item.country || "기타",
          score: item.currentTotalScore || 0,
          posts: item.totalPosts || 0,
          comments: item.totalComments || 0,
          likes: item.totalLikes || 0,
          bookmarks: item.totalBookmarks || 0,
          chatRooms: item.totalChatRooms || 0,
          messages: item.totalChatMessages || 0,
          lastActivity: endDate,
          growthRate: item.growthRatePercent || 0,
          userNo: item.userNo,
          userNickname: item.userNickname,
          currentTotalScore: item.currentTotalScore,
          previousTotalScore: item.previousTotalScore,
          lang: item.lang || null,
          gender: item.gender || null,
          age: item.age || null
        }))
        
        setPagedCombinedUsers(convertedUsers)
        // 전체 개수는 첫 페이지에서만 설정 (실제로는 API에서 total count를 받아야 함)
        if (currentPage === 0) {
          setTotalUserCount(convertedUsers.length) // 임시로 현재 페이지 개수 사용
        }
      } catch (error) {
        console.error('❌ 페이징된 유저 데이터 로드 실패:', error)
        setPagedCombinedUsers([])
      } finally {
        setLoadingPagedUsers(false)
      }
    }
    
    loadPagedUsers()
  }, [isCombinedUsersModalOpen, currentPage, startDate, endDate, pageSize])

  // 종합 유저 모달이 열릴 때 첫 번째 유저 자동 선택 및 첫 페이지로 리셋
  useEffect(() => {
    if (isCombinedUsersModalOpen) {
      setCurrentPage(0)
      if (pagedCombinedUsers.length > 0 && !selectedCombinedUser) {
        setSelectedCombinedUser(pagedCombinedUsers[0])
      }
    }
  }, [isCombinedUsersModalOpen, pagedCombinedUsers, selectedCombinedUser])

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setSelectedCombinedUser(null) // 페이지 변경 시 선택 해제
  }


  // 급상승 게시물용 추이 데이터 생성 함수 (실제 API 데이터 사용)
  const getTrendingPostTrendData = (post: typeof convertedTrendingPosts[0] | null) => {
    if (!post) {
      // 선택된 게시물이 없으면 첫 번째 게시물의 추이 데이터 사용
      return firstTrendingPostTrendData || []
    }
    
    // 선택된 게시물의 추이 데이터가 있으면 사용
    if (selectedPopularPost?.postId === post.postId && selectedTrendingPostTrendData) {
      return selectedTrendingPostTrendData
    }
    
    // 첫 번째 게시물이고 선택된 게시물이 없으면 첫 번째 게시물의 추이 데이터 사용
    if (post.rank === 1 && !selectedPopularPost && firstTrendingPostTrendData) {
      return firstTrendingPostTrendData
    }
    
    // 기본 추이 데이터 (빈 배열)
    return []
  }

  // 랭킹 타입 선택 state
  type RankingType = "종합 유저 랭킹" | "커뮤니티 유저 랭킹" | "채팅 유저 랭킹" | "급상승 유저 랭킹"
  const [selectedRankingType, setSelectedRankingType] = useState<RankingType>("종합 유저 랭킹")

  return (
    <section className="space-y-4">
      {/* 섹션 제목과 필터 */}
      <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">랭킹 분석</h2>
      </div>
      
      {/* 유저 랭킹과 게시물 랭킹을 col-2로 배치 */}
      <div className="grid gap-1 lg:grid-cols-2">
        {/* 유저 랭킹 (select box로 4종류 선택) */}
        <Card className="p-4 bg-card border-border">
          <div>
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold"> 랭킹 유저 종합 지표</h2>
              {(summaryFilters.country || summaryFilters.gender || summaryFilters.lang || summaryFilters.os || summaryFilters.app) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSummaryFilters({})}
                >
                  초기화
                </Button>
              )}
            </div>
            {/* 유저 정보 카드 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-1 mb-1.5">
                  <p className="text-base text-muted-foreground font-semibold">국가별 점유율</p>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <span className="font-semibold mb-2 text-base">국가의 기타는 값이 없는 경우 입니다.</span>
                </TooltipContent>
              </UITooltip>
            </div>
                {loadingSummary ? (
                  <p className="text-xs text-muted-foreground">로딩 중...</p>
                ) : combinedCountryShareData.length > 0 ? (
                  <>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={combinedCountryShareData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={50}
                            paddingAngle={1}
                            dataKey="value"
                            onClick={(data: any, index: number) => {
                              if (data && combinedCountryShareData[index]?.countryCode) {
                                setSummaryFilters(prev => ({
                                  ...prev,
                                  country: combinedCountryShareData[index].countryCode
                                }))
                              }
                            }}
                          >
                            {combinedCountryShareData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number | undefined, name: string | undefined, props: any) => [
                              `${props.payload.name || '미지정'}: ${props.payload.percentage}%`,
                              '점유율'
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {combinedCountryShareData.slice(0, 5).map((item, index) => (
                        <div 
                          key={item.name} 
                          className="flex items-center gap-1 text-base cursor-pointer hover:opacity-70"
                          onClick={() => {
                            if (item.countryCode) {
                              setSummaryFilters(prev => ({
                                ...prev,
                                country: item.countryCode
                              }))
                            }
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">데이터 없음</p>
                )}
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-base text-muted-foreground mb-1.5 font-semibold">언어별 점유율</p>
                {loadingSummary ? (
                  <p className="text-xs text-muted-foreground">로딩 중...</p>
                ) : combinedLanguageShareData.length > 0 ? (
                  <>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={combinedLanguageShareData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={50}
                            paddingAngle={1}
                            dataKey="value"
                            onClick={(data: any, index: number) => {
                              if (data && combinedLanguageShareData[index]?.langCode) {
                                setSummaryFilters(prev => ({
                                  ...prev,
                                  lang: combinedLanguageShareData[index].langCode
                                }))
                              }
                            }}
                          >
                            {combinedLanguageShareData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number | undefined, name: string | undefined, props: any) => [
                              `${props.payload.name}: ${props.payload.percentage}% (${props.payload.value}명)`,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {combinedLanguageShareData.slice(0, 5).map((item, index) => (
                        <div 
                          key={item.name} 
                          className="flex items-center gap-1 text-base cursor-pointer hover:opacity-70"
                          onClick={() => {
                            if (item.langCode) {
                              setSummaryFilters(prev => ({
                                ...prev,
                                lang: item.langCode
                              }))
                            }
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">데이터 없음</p>
                )}
              </div>
            </div>

            {/**os, app */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-1 mb-1.5">
                  <p className="text-base text-muted-foreground font-semibold">OS별 점유율</p>
              {/* <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <span className="font-semibold mb-2 text-base">OS의 기타는 값이 없는 경우 입니다.</span>
                </TooltipContent>
              </UITooltip> */}
            </div>
                {loadingSummary ? (
                  <p className="text-xs text-muted-foreground">로딩 중...</p>
                ) : combinedOsShareData.length > 0 ? (
                  <>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={128}>
                        <PieChart>
                          <Pie
                            data={combinedOsShareData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={50}
                            paddingAngle={1}
                            dataKey="value"
                            onClick={(data: any, index: number) => {
                              if (data && combinedOsShareData[index]?.osCode) {
                                setSummaryFilters(prev => ({
                                  ...prev,
                                  os: combinedOsShareData[index].osCode
                                }))
                              }
                            }}
                          >
                            {combinedOsShareData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number | undefined, name: string | undefined, props: any) => [
                              `${props.payload.name || '미지정'}: ${props.payload.percentage}% (${props.payload.value}명)`,
                              '점유율'
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {combinedOsShareData.slice(0, 5).map((item, index) => (
                        <div 
                          key={item.name} 
                          className="flex items-center gap-1 text-base cursor-pointer hover:opacity-70"
                          onClick={() => {
                            if (item.osCode) {
                              setSummaryFilters(prev => ({
                                ...prev,
                                os: item.osCode
                              }))
                            }
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">데이터 없음</p>
                )}
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-base text-muted-foreground mb-1.5 font-semibold">App 점유율</p>
                {loadingSummary ? (
                  <p className="text-xs text-muted-foreground">로딩 중...</p>
                ) : combinedAppShareData.length > 0 ? (
                  <>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={combinedAppShareData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={50}
                            paddingAngle={1}
                            dataKey="value"
                            onClick={(data: any, index: number) => {
                              if (data && combinedAppShareData[index]?.appCode) {
                                setSummaryFilters(prev => ({
                                  ...prev,
                                  app: combinedAppShareData[index].appCode
                                }))
                              }
                            }}
                          >
                            {combinedAppShareData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number | undefined, name: string | undefined, props: any) => [
                              `${props.payload.name}: ${props.payload.percentage}%`,
                              '점유율'
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {combinedAppShareData.slice(0, 5).map((item, index) => (
                        <div 
                          key={item.name} 
                          className="flex items-center gap-1 text-base cursor-pointer hover:opacity-70"
                          onClick={() => {
                            if (item.appCode) {
                              setSummaryFilters(prev => ({
                                ...prev,
                                app: item.appCode
                              }))
                            }
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">데이터 없음</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 mb-4">
              <div className="p-2 bg-muted rounded-lg">
                {/* <p className="text-xs text-muted-foreground mb-1.5 font-semibold">성별, 나이별 점유율</p> */}
                {loadingSummary ? (
                  <p className="text-xs text-muted-foreground">로딩 중...</p>
                ) : genderShareData.length > 0 && ageGroupShareData.data.length > 0 ? (
                  <>
                    {/* 성별 점유율 막대 그래프 (남, 녀, 미지정) */}
                    <div className="mb-4">  
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-base text-muted-foreground">성별 점유율</p>
                        <UITooltip> 
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md">
                            <span className="font-semibold mb-2 text-base">성별의 미지정 값은 사용자가 성별을 지정하지 않은 사용자 입니다.</span>
                          </TooltipContent>
                        </UITooltip>
                      </div>
                      <div className="h-20">
                        <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                          <BarChart layout="vertical" data={genderShareData} stackOffset="expand">
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis type="category" dataKey="name" hide />
                            <Tooltip 
                              content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  const labels: { [key: string]: string } = {
                                    male: '남',
                                    female: '녀',
                                    unspecified: '미지정'
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
                                          <span className="text-xs text-muted-foreground">
                                            ({(entry.payload as any)[`${entry.dataKey}Value`]?.toLocaleString()}명)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar 
                              dataKey="male" 
                              stackId="gender" 
                              fill="#3b82f6" 
                              barSize={30}
                              onClick={() => setSummaryFilters(prev => ({ ...prev, gender: 'Male' }))}
                              style={{ cursor: 'pointer' }}
                            />
                            <Bar 
                              dataKey="female" 
                              stackId="gender" 
                              fill="#ef4444" 
                              barSize={30}
                              onClick={() => setSummaryFilters(prev => ({ ...prev, gender: 'Female' }))}
                              style={{ cursor: 'pointer' }}
                            />
                            <Bar 
                              dataKey="unspecified" 
                              stackId="gender" 
                              fill="#94a3b8" 
                              barSize={30}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center gap-1 text-sm">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: '#3b82f6' }} />
                          <span className="text-muted-foreground">남: {genderShareData[0].maleValue.toLocaleString()}명 ({genderShareData[0].male.toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: '#ef4444' }} />
                          <span className="text-muted-foreground">녀: {genderShareData[0].femaleValue.toLocaleString()}명 ({genderShareData[0].female.toFixed(1)}%)</span>
                        </div>
                        {genderShareData[0].unspecifiedValue > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#94a3b8' }} />
                            <span className="text-muted-foreground">미지정: {genderShareData[0].unspecifiedValue.toLocaleString()}명 ({genderShareData[0].unspecified.toFixed(1)}%)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 나잇대별 점유율 막대 그래프 */}
                    <div>
                      <p className="text-base text-muted-foreground mb-2">연령별 점유율</p>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
                          <BarChart
                            layout="vertical"
                            data={ageGroupShareData.data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              domain={[-ageGroupShareData.maxValue, ageGroupShareData.maxValue]}
                              tickFormatter={(value) => `${Math.abs(value).toLocaleString()}명`}
                              label={{ value: '인원수 (명)', position: 'insideBottom', offset: -5 }}
                              ticks={(() => {
                                const max = ageGroupShareData.maxValue
                                const step = Math.max(10, Math.ceil(max / 50) * 10) // 10의 배수로 간격 설정
                                const ticks: number[] = []
                                // 음수부터 0까지
                                for (let i = -max; i <= 0; i += step) {
                                  ticks.push(i)
                                }
                                // 0부터 양수까지 (0은 중복 제거)
                                for (let i = step; i <= max; i += step) {
                                  ticks.push(i)
                                }
                                return ticks.sort((a, b) => a - b)
                              })()}
                            />
                            <YAxis
                              type="category"
                              dataKey="age"
                              width={80}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                      <div className="text-sm font-semibold mb-2">{data.age}</div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} />
                                        <span className="text-sm text-muted-foreground">남성:</span>
                                        <span className="text-sm font-medium text-foreground">
                                          {data.malePercent.toFixed(1)}%
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          ({data.maleValue.toLocaleString()}명)
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
                                        <span className="text-sm text-muted-foreground">여성:</span>
                                        <span className="text-sm font-medium text-foreground">
                                          {data.femalePercent.toFixed(1)}%
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          ({data.femaleValue.toLocaleString()}명)
                                        </span>
                                      </div>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar
                              dataKey="male"
                              name="남성"
                              radius={[0, 4, 4, 0]}
                              onClick={(data) => {
                                setSummaryFilters(prev => ({ ...prev, gender: 'Male' }))
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {ageGroupShareData.data.map((entry: any, index: number) => (
                                <Cell
                                  key={`male-cell-${index}`}
                                  fill={entry.age === '미지정' ? 'rgba(59, 130, 246, 0.3)' : '#3b82f6'}
                                />
                              ))}
                            </Bar>
                            <Bar
                              dataKey="female"
                              name="여성"
                              radius={[4, 0, 0, 4]}
                              onClick={(data) => {
                                setSummaryFilters(prev => ({ ...prev, gender: 'Female' }))
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {ageGroupShareData.data.map((entry: any, index: number) => (
                                <Cell
                                  key={`female-cell-${index}`}
                                  fill={entry.age === '미지정' ? 'rgba(239, 68, 68, 0.3)' : '#ef4444'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: '#3b82f6' }} />
                          <span className="text-muted-foreground">남성</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: '#ef4444' }} />
                          <span className="text-muted-foreground">여성</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">데이터 없음</p>
                )}
              </div>            
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
            <div>
              <h2 className="text-lg font-bold">기간 내 유저 랭킹</h2>
            </div>
            <span className="text-sm font-medium  justify-end  text-muted-foreground">랭킹 타입:</span>
              <Select value={selectedRankingType} onValueChange={(value) => setSelectedRankingType(value as RankingType)}>
                <SelectTrigger className="w-[200px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                  <SelectItem value="종합 유저 랭킹" className="cursor-pointer hover:bg-blue-50">종합 유저 랭킹</SelectItem>
                  <SelectItem value="커뮤니티 유저 랭킹" className="cursor-pointer hover:bg-blue-50">커뮤니티 유저 랭킹</SelectItem>
                  <SelectItem value="채팅 유저 랭킹" className="cursor-pointer hover:bg-blue-50">채팅 유저 랭킹</SelectItem>
                  <SelectItem value="급상승 유저 랭킹" className="cursor-pointer hover:bg-blue-50">급상승 유저 랭킹</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedRankingType === "종합 유저 랭킹" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCombinedUsersModalOpen(true)}
            >
              전체 보기
            </Button>
            )}
          </div>
          
          {/* 종합 유저 랭킹 */}
          {selectedRankingType === "종합 유저 랭킹" && (
            <>
          {/* 통합 추이 그래프 */}
          <div className="mb-4 space-y-2">
            <h4 className="font-semibold text-sm">
              Top 5 유저 월별 총합 활동 추이
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={getTop5CombinedUsersTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => {
                      // yyyy-MM 형식이면 그대로 표시
                      if (/^\d{4}-\d{2}$/.test(value)) {
                        return value
                      }
                      return value
                    }}
                    minTickGap={60}
                    height={50}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis width={60} />
                  <Tooltip content={<CustomChartTooltip />} />
                  {top5UserNames.map((userName, index) => {
                    const userColors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6']
                    return (
                      <React.Fragment key={userName}>
                        <Line 
                          type="monotone" 
                          dataKey={userName} 
                          stroke={userColors[index]} 
                          strokeWidth={2} 
                          name={userName}
                          connectNulls
                        />
                        <Line 
                          type="monotone" 
                          dataKey={`${userName}_predicted`} 
                          stroke={userColors[index]} 
                          strokeDasharray="5 5" 
                          strokeWidth={2} 
                          name={`${userName} (예측)`}
                          strokeOpacity={0.5}
                          connectNulls
                        />
                      </React.Fragment>
                    )
                  })}
                  <Legend content={<CustomLegend />} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 유저 리스트 - 최대 5명 */}
          <div className="space-y-2">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                종합 유저 랭킹 데이터를 불러오는 중...
              </div>
            ) : combinedUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                표시할 종합 유저가 없습니다.
              </div>
            ) : (
              combinedUsers.slice(0, 5).map((user) => (
              <div
                key={user.userNo || user.name || `combined-${user.rank}`}
                onClick={() => {
                  handleUserClick(user, 'combined')
                }}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedCombinedUser && (selectedCombinedUser as any).userNo === user.userNo
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0 shrink-0">
                        {user.rank}
                      </Badge>
                    <span className="font-medium truncate">{user.name}</span>
                    </div>
                  {/* <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 whitespace-nowrap">
                      상승률: {user.growthRate.toFixed(1)}%
                    </Badge>
                    </div> */}
                    </div>
                <div className="grid grid-cols-6 gap-2 mt-2 text-xs text-muted-foreground">
                  <div>게시글 {user.posts}</div>
                  <div>댓글 {user.comments}</div>
                  <div>좋아요 {user.likes}</div>
                  <div>북마크 {user.bookmarks || 0}</div>
                  <div>채팅방 {user.chatRooms}</div>
                  <div>메시지 {user.messages}</div>
                  </div>
              </div>
              ))
            )}
          </div>
          </>
          )}

        {/* 커뮤니티 유저 랭킹 */}
          {selectedRankingType === "커뮤니티 유저 랭킹" && (
            <>
          
          {/* 통합 추이 그래프 */}
          <div className="mb-4 space-y-2">
            <h4 className="font-semibold text-sm">
              {loading ? '데이터 로딩 중...' : selectedCommunityUser 
                ? `${selectedCommunityUser.name}님의 월별 활동 추이` 
                : filteredCommunityUsers.length > 0 
                  ? `${filteredCommunityUsers[0].name}님의 월별 활동 추이`
                  : '월별 활동 추이'}
            </h4>
            <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={
                  loadingTrendData 
                    ? [] 
                    : selectedCommunityUserTrendData 
                      ? convertTrendDataToChartFormat(selectedCommunityUserTrendData, selectedCommunityUserForecast)
                      : firstCommunityUserTrendData
                        ? convertTrendDataToChartFormat(firstCommunityUserTrendData, firstCommunityUserForecast)
                        : []
                }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month" 
                              tickFormatter={(value) => {
                                // yyyy-MM 형식이면 그대로 표시
                                if (/^\d{4}-\d{2}$/.test(value)) {
                                  return value
                                }
                                return value
                              }}
                              minTickGap={60}
                              height={50}
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis width={60} />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Bar dataKey="posts" fill="#3b82f6" name="게시글" />
                            <Bar dataKey="postsPredicted" fill="#3b82f6" fillOpacity={0.3} name="게시글 (예측)" />
                            <Bar dataKey="comments" fill="#10b981" name="댓글" />
                            <Bar dataKey="commentsPredicted" fill="#10b981" fillOpacity={0.3} name="댓글 (예측)" />
                            <Bar dataKey="bookmarks" fill="#f59e0b" name="북마크" />
                            <Bar dataKey="bookmarksPredicted" fill="#f59e0b" fillOpacity={0.3} name="북마크 (예측)" />
                            <Bar dataKey="likes" fill="#ef4444" name="좋아요" />
                            <Bar dataKey="likesPredicted" fill="#ef4444" fillOpacity={0.3} name="좋아요 (예측)" />
                            <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" name="누적 추이" />
                            {(loadingTrendData 
                              ? [] 
                              : selectedCommunityUserTrendData 
                                ? convertTrendDataToChartFormat(selectedCommunityUserTrendData, selectedCommunityUserForecast)
                                : firstCommunityUserTrendData
                                  ? convertTrendDataToChartFormat(firstCommunityUserTrendData, firstCommunityUserForecast)
                                  : []
                            ).some((d: any) => d.predicted != null) && (
                              <Line 
                                type="monotone" 
                                dataKey="predicted" 
                                stroke="#ef4444" 
                                strokeWidth={2} 
                                strokeDasharray="5 5" 
                                name="예측" 
                                connectNulls 
                                dot={false}
                              />
                            )}
                            <Legend content={<CustomLegend />} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

          {/* 유저 리스트 */}
          <div className="space-y-2">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                커뮤니티 유저 랭킹 데이터를 불러오는 중...
                      </div>
            ) : filteredCommunityUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                표시할 커뮤니티 유저가 없습니다.
                      </div>
            ) : (
              filteredCommunityUsers.slice(0, 5).map((user) => (
              <div
                key={(user as any).userNo || user.name || `community-${user.rank}`}
                onClick={() => handleCommunityUserClick(user)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedCommunityUser && (selectedCommunityUser as any).userNo === (user as any).userNo
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0 shrink-0">
                      {user.rank}
                    </Badge>
                    <span className="font-medium truncate">{user.name}</span>
                      </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                      점유율: {calculateCommunityUserShare(user, filteredCommunityUsers, 5)}%
                    </Badge>
                      </div>
                      </div>
                <div className="grid grid-cols-4 gap-4 mt-2 text-xs text-muted-foreground">
                  <div>게시글 {user.posts}</div>
                  <div>댓글 {user.comments}</div>
                  <div>좋아요 {user.likes}</div>
                  <div>북마크 {user.bookmarks}</div>
                    </div>
                  </div>
              ))
            )}
          </div>
          </>
          )}

        {/* 채팅 유저 랭킹 */}
          {selectedRankingType === "채팅 유저 랭킹" && (
            <>
          
          
          {/* 통합 추이 그래프 */}
          <div className="mb-4 space-y-2">
            <h4 className="font-semibold text-sm">
              {loading ? '데이터 로딩 중...' : selectedChatUser 
                ? `${selectedChatUser.name}님의 월별 채팅 추이` 
                : filteredChatUsers.length > 0 
                  ? `${filteredChatUsers[0].name}님의 월별 채팅 추이`
                  : '월별 채팅 추이'}
            </h4>
            <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={
                  selectedChatUser && (selectedChatUser as any).userNo
                    ? (() => {
                        // 선택된 유저의 추이 데이터는 별도 state에서 관리 필요 (추후 구현)
                        // 임시로 firstChatUserTrendData 사용
                        return convertChatTrendDataToChartFormat(firstChatUserTrendData, firstChatUserForecast)
                      })()
                    : firstChatUserTrendData
                      ? convertChatTrendDataToChartFormat(firstChatUserTrendData, firstChatUserForecast)
                      : []
                }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month" 
                              tickFormatter={(value) => {
                                // yyyy-MM 형식이면 그대로 표시
                                if (/^\d{4}-\d{2}$/.test(value)) {
                                  return value
                                }
                                return value
                              }}
                              minTickGap={60}
                              height={50}
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis width={60} />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Bar dataKey="chatRooms" fill="#3b82f6" name="채팅방" />
                            <Bar dataKey="chatRoomsPredicted" fill="#3b82f6" fillOpacity={0.3} name="채팅방 (예측)" />
                            <Bar dataKey="messages" fill="#10b981" name="메시지" />
                            <Bar dataKey="messagesPredicted" fill="#10b981" fillOpacity={0.3} name="메시지 (예측)" />
                            <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" name="누적 추이" />
                            <Legend content={<CustomLegend />} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

          {/* 유저 리스트 */}
          <div className="space-y-2">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                채팅 유저 랭킹 데이터를 불러오는 중...
                      </div>
            ) : filteredChatUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                표시할 채팅 유저가 없습니다.
                      </div>
            ) : (
              filteredChatUsers.slice(0, 5).map((user) => (
              <div
                key={user.userNo || user.name || `chat-${user.rank}`}
                onClick={() => handleChatUserClick(user)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedChatUser && (selectedChatUser as any).userNo === user.userNo
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0 shrink-0">
                        {user.rank}
                      </Badge>
                    <span className="font-medium truncate">{user.name}</span>
                      </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
                      점유율: {calculateChatUserShare(user, filteredChatUsers, 5)}%
                    </Badge>
                    </div>
                  </div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-muted-foreground">
                  <div>채팅방 {user.chatRooms}개</div>
                  <div>메시지 {user.messages}개</div>
                    </div>
                  </div>
              ))
            )}
                      </div>
          </>
          )}

      {/* 급상승 유저 랭킹 */}
          {selectedRankingType === "급상승 유저 랭킹" && (
            <>

          
          {/* 통합 추이 그래프 */}
          <div className="mb-4 space-y-2">
            <h4 className="font-semibold text-sm">
              {loading ? '데이터 로딩 중...' : selectedTrendingUser 
                ? `${selectedTrendingUser.name}님의 월별 활동 추이` 
                : filteredTrendingUsers.length > 0 
                  ? `${filteredTrendingUsers[0].name}님의 월별 활동 추이`
                  : '월별 활동 추이'}
            </h4>
            <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={
                  selectedTrendingUser && selectedTrendingUserTrendData
                    ? convertCombinedTrendDataToChartFormat(selectedTrendingUserTrendData, selectedTrendingUserForecast)
                    : firstTrendingUserTrendData
                      ? convertCombinedTrendDataToChartFormat(firstTrendingUserTrendData, firstTrendingUserForecast)
                      : []
                }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month" 
                              tickFormatter={(value) => {
                                if (/^\d{4}-\d{2}$/.test(value)) {
                                  return value
                                }
                                return value
                              }}
                              minTickGap={60}
                              height={50}
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis width={60} />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Bar dataKey="posts" fill="#3b82f6" name="게시글" />
                            <Bar dataKey="postsPredicted" fill="#3b82f6" fillOpacity={0.3} name="게시글 (예측)" />
                            <Bar dataKey="comments" fill="#10b981" name="댓글" />
                            <Bar dataKey="commentsPredicted" fill="#10b981" fillOpacity={0.3} name="댓글 (예측)" />
                            <Bar dataKey="likes" fill="#ef4444" name="좋아요" />
                            <Bar dataKey="likesPredicted" fill="#ef4444" fillOpacity={0.3} name="좋아요 (예측)" />
                            <Bar dataKey="bookmarks" fill="#f59e0b" name="북마크" />
                            <Bar dataKey="bookmarksPredicted" fill="#f59e0b" fillOpacity={0.3} name="북마크 (예측)" />
                            <Bar dataKey="chatRooms" fill="#8b5cf6" name="채팅방" />
                            <Bar dataKey="chatRoomsPredicted" fill="#8b5cf6" fillOpacity={0.3} name="채팅방 (예측)" />
                            <Bar dataKey="messages" fill="#a855f7" name="메시지" />
                            <Bar dataKey="messagesPredicted" fill="#a855f7" fillOpacity={0.3} name="메시지 (예측)" />
                            <Line type="monotone" dataKey="cumulative" stroke="#ef4444" name="누적 추이" />
                            <Line 
                              type="monotone" 
                              dataKey="predicted" 
                              stroke="#ef4444" 
                              strokeWidth={2} 
                              strokeDasharray="5 5" 
                              name="예측" 
                              connectNulls 
                              dot={false}
                            />
                            <Legend content={<CustomLegend />} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                        </div>

          {/* 유저 리스트 */}
          <div className="space-y-2">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                급상승 유저 랭킹 데이터를 불러오는 중...
              </div>
            ) : filteredTrendingUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                표시할 급상승 유저가 없습니다.
              </div>
            ) : (
              filteredTrendingUsers.slice(0, 5).map((user) => (
              <div
                key={user.userNo || user.name || `trending-${user.rank}`}
                onClick={() => handleTrendingUserClick(user)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedTrendingUser && (selectedTrendingUser as any).userNo === user.userNo
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0 shrink-0">
                        {user.rank}
                      </Badge>
                    <span className="font-medium truncate">{user.name}</span>
                      </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {/* <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 whitespace-nowrap">
                      점유율: {calculateTrendingUserShare(user, filteredTrendingUsers, 5)}%
                    </Badge>
                     */}
                    </div>
                      </div>
                <div className="grid grid-cols-6 gap-2 mt-2 text-xs text-muted-foreground">
                  <div>게시글 {user.posts}</div>
                  <div>댓글 {user.comments}</div>
                  <div>좋아요 {user.likes || 0}</div>
                  <div>북마크 {user.bookmarks || 0}</div>
                  <div>채팅방 {user.chatRooms}</div>
                  <div>메시지 {user.messages}</div>
                      </div>
                      </div>
              ))
            )}
                      </div>
          </>
          )}
        </Card>
    
        {/* 종합 게시물 랭킹 */}
        <Card className="p-4 bg-card border-border">
          {/* 게시물 종합 지표 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">랭킹 게시물 종합 지표</h3>
              {(postSummaryFilters.country || postSummaryFilters.lang || postSummaryFilters.boardType || postSummaryFilters.category || postSummaryFilters.gender) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPostSummaryFilters({})}
                >
                  초기화
                </Button>
              )}
            </div>
            {/* 상단 2개: 커뮤니티 종류, 카테고리 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-1 mb-1.5">
                  <p className="text-base text-muted-foreground font-semibold">커뮤니티 종류</p>
                </div>
                {combinedPostCommunityShareData.length > 0 ? (
                  <>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={128}>
                        <PieChart>
                          <Pie
                            data={combinedPostCommunityShareData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={50}
                            paddingAngle={1}
                            dataKey="value"
                            onClick={(data: any, index: number) => {
                              if (data && combinedPostCommunityShareData[index]?.code) {
                                setPostSummaryFilters(prev => ({
                                  ...prev,
                                  boardType: combinedPostCommunityShareData[index].code
                                }))
                              }
                            }}
                          >
                            {combinedPostCommunityShareData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number | undefined, name: string | undefined, props: any) => [
                              `${props.payload.name}: ${props.payload.percentage}%`,
                              '점유율'
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {combinedPostCommunityShareData.slice(0, 5).map((item, index) => (
                        <div 
                          key={item.name} 
                          className="flex items-center gap-1 text-base cursor-pointer hover:opacity-70"
                          onClick={() => {
                            if (item.code) {
                              setPostSummaryFilters(prev => ({
                                ...prev,
                                boardType: item.code
                              }))
                            }
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">데이터 없음</p>
                )}
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-base text-muted-foreground mb-1.5 font-semibold">카테고리</p>
                {combinedPostCategoryShareData.length > 0 ? (
                  <>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={128}>
                        <PieChart>
                          <Pie
                            data={combinedPostCategoryShareData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={50}
                            paddingAngle={1}
                            dataKey="value"
                            onClick={(data: any, index: number) => {
                              if (data && combinedPostCategoryShareData[index]?.code) {
                                setPostSummaryFilters(prev => ({
                                  ...prev,
                                  category: combinedPostCategoryShareData[index].code
                                }))
                              }
                            }}
                          >
                            {combinedPostCategoryShareData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number | undefined, name: string | undefined, props: any) => [
                              `${props.payload.name}: ${props.payload.percentage}%`,
                              '점유율'
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {combinedPostCategoryShareData.slice(0, 5).map((item, index) => (
                        <div 
                          key={item.name} 
                          className="flex items-center gap-1 text-base cursor-pointer hover:opacity-70"
                          onClick={() => {
                            if (item.code) {
                              setPostSummaryFilters(prev => ({
                                ...prev,
                                category: item.code
                              }))
                            }
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">데이터 없음</p>
                )}
              </div>
            </div>
            {/* 중간 2개: 국가, 언어 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-1 mb-1.5">
                  <p className="text-base text-muted-foreground font-semibold">국가별 점유율</p>
                </div>
                {combinedPostCountryShareData.length > 0 ? (
                  <>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={combinedPostCountryShareData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={50}
                            paddingAngle={1}
                            dataKey="value"
                            onClick={(data: any, index: number) => {
                              if (data && combinedPostCountryShareData[index]?.countryCode) {
                                setPostSummaryFilters(prev => ({
                                  ...prev,
                                  country: combinedPostCountryShareData[index].countryCode
                                }))
                              }
                            }}
                          >
                            {combinedPostCountryShareData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number | undefined, name: string | undefined, props: any) => [
                              `${props.payload.name}: ${props.payload.percentage}%`,
                              '점유율'
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {combinedPostCountryShareData.slice(0, 5).map((item, index) => (
                        <div 
                          key={item.name} 
                          className="flex items-center gap-1 text-base cursor-pointer hover:opacity-70"
                          onClick={() => {
                            if (item.countryCode) {
                              setPostSummaryFilters(prev => ({
                                ...prev,
                                country: item.countryCode
                              }))
                            }
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">데이터 없음</p>
                )}
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-base text-muted-foreground mb-1.5 font-semibold">언어별 점유율</p>
                {combinedPostLanguageShareData.length > 0 ? (
                  <>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={128}>
                        <PieChart>
                          <Pie
                            data={combinedPostLanguageShareData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={50}
                            paddingAngle={1}
                            dataKey="value"
                            onClick={(data: any, index: number) => {
                              if (data && combinedPostLanguageShareData[index]?.langCode) {
                                setPostSummaryFilters(prev => ({
                                  ...prev,
                                  lang: combinedPostLanguageShareData[index].langCode
                                }))
                              }
                            }}
                          >
                            {combinedPostLanguageShareData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number | undefined, name: string | undefined, props: any) => [
                              `${props.payload.name}: ${props.payload.percentage}%`,
                              '점유율'
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {combinedPostLanguageShareData.slice(0, 5).map((item, index) => (
                        <div 
                          key={item.name} 
                          className="flex items-center gap-1 text-base cursor-pointer hover:opacity-70"
                          onClick={() => {
                            if (item.langCode) {
                              setPostSummaryFilters(prev => ({
                                ...prev,
                                lang: item.langCode
                              }))
                            }
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">데이터 없음</p>
                )}
              </div>
            </div>
            {/* 하단: 성별, 연령별 (게시물 API 데이터 사용) */}
            <div className="grid grid-cols-1 gap-2 mb-4">
              <div className="p-2 bg-muted rounded-lg">
                {loadingPostSummary ? (
                  <p className="text-xs text-muted-foreground">로딩 중...</p>
                ) : (() => {
                  const postSummaryData = postRankingSummaryData.find(item => item.type === 'Summary')
                  if (!postSummaryData) {
                    return <p className="text-xs text-muted-foreground">데이터 없음</p>
                  }
                  
                  const m10 = postSummaryData.m10 || 0
                  const m20 = postSummaryData.m20 || 0
                  const m30 = postSummaryData.m30 || 0
                  const m40 = postSummaryData.m40 || 0
                  const m50 = postSummaryData.m50 || 0
                  const male = m10 + m20 + m30 + m40 + m50
                  
                  const f10 = postSummaryData.f10 || 0
                  const f20 = postSummaryData.f20 || 0
                  const f30 = postSummaryData.f30 || 0
                  const f40 = postSummaryData.f40 || 0
                  const f50 = postSummaryData.f50 || 0
                  const female = f10 + f20 + f30 + f40 + f50
                  
                  const total = postSummaryData.total || 0
                  const unspecified = total - (male + female)
                  
                  const postGenderShareData = [{
                    name: '',
                    male: total > 0 ? (male / total) * 100 : 0,
                    female: total > 0 ? (female / total) * 100 : 0,
                    unspecified: total > 0 ? (unspecified / total) * 100 : 0,
                    maleValue: male,
                    femaleValue: female,
                    unspecifiedValue: unspecified,
                    total: total
                  }]
                  
                  const maleUnspecified = 0 // 연령대 합계로 계산하므로 미지정 없음
                  const femaleUnspecified = 0 // 연령대 합계로 계산하므로 미지정 없음
                  
                  const maxValue = Math.max(m10, m20, m30, m40, m50, maleUnspecified, f10, f20, f30, f40, f50, femaleUnspecified)
                  const maxValueWithPadding = maxValue > 0 ? Math.ceil(maxValue * 1.1 / 10) * 10 : 10
                  
                  const postAgeGroupShareData = [
                    {
                      age: '10대',
                      male: -m10,
                      female: f10,
                      maleValue: m10,
                      femaleValue: f10,
                      malePercent: total > 0 ? (m10 / total) * 100 : 0,
                      femalePercent: total > 0 ? (f10 / total) * 100 : 0
                    },
                    {
                      age: '20대',
                      male: -m20,
                      female: f20,
                      maleValue: m20,
                      femaleValue: f20,
                      malePercent: total > 0 ? (m20 / total) * 100 : 0,
                      femalePercent: total > 0 ? (f20 / total) * 100 : 0
                    },
                    {
                      age: '30대',
                      male: -m30,
                      female: f30,
                      maleValue: m30,
                      femaleValue: f30,
                      malePercent: total > 0 ? (m30 / total) * 100 : 0,
                      femalePercent: total > 0 ? (f30 / total) * 100 : 0
                    },
                    {
                      age: '40대',
                      male: -m40,
                      female: f40,
                      maleValue: m40,
                      femaleValue: f40,
                      malePercent: total > 0 ? (m40 / total) * 100 : 0,
                      femalePercent: total > 0 ? (f40 / total) * 100 : 0
                    },
                    {
                      age: '50대 이상',
                      male: -m50,
                      female: f50,
                      maleValue: m50,
                      femaleValue: f50,
                      malePercent: total > 0 ? (m50 / total) * 100 : 0,
                      femalePercent: total > 0 ? (f50 / total) * 100 : 0
                    },
                    {
                      age: '미지정',
                      male: -maleUnspecified,
                      female: femaleUnspecified,
                      maleValue: maleUnspecified,
                      femaleValue: femaleUnspecified,
                      malePercent: total > 0 ? (maleUnspecified / total) * 100 : 0,
                      femalePercent: total > 0 ? (femaleUnspecified / total) * 100 : 0
                    }
                  ]
                  
                  return postGenderShareData.length > 0 && postAgeGroupShareData.length > 0 ? (
                    <>
                      {/* 성별 점유율 막대 그래프 */}
                      <div className="mb-4">  
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-base text-muted-foreground">성별 점유율</p>
                          <UITooltip> 
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">
                              <span className="font-semibold mb-2 text-base">성별의 미지정 값은 사용자가 성별을 지정하지 않은 사용자 입니다.</span>
                            </TooltipContent>
                          </UITooltip>
                        </div>
                        <div className="h-20">
                          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={80}>
                            <BarChart layout="vertical" data={postGenderShareData} stackOffset="expand">
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis type="category" dataKey="name" hide />
                            <Tooltip 
                              content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  const labels: { [key: string]: string } = {
                                    male: '남',
                                    female: '녀',
                                    unspecified: '미지정'
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
                                          <span className="text-xs text-muted-foreground">
                                            ({(entry.payload as any)[`${entry.dataKey}Value`]?.toLocaleString()}명)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar 
                              dataKey="male" 
                              stackId="gender" 
                              fill="#3b82f6" 
                              barSize={30}
                              onClick={() => setPostSummaryFilters(prev => ({ ...prev, gender: 'Male' }))}
                              style={{ cursor: 'pointer' }}
                            />
                            <Bar 
                              dataKey="female" 
                              stackId="gender" 
                              fill="#ef4444" 
                              barSize={30}
                              onClick={() => setPostSummaryFilters(prev => ({ ...prev, gender: 'Female' }))}
                              style={{ cursor: 'pointer' }}
                            />
                            <Bar 
                              dataKey="unspecified" 
                              stackId="gender" 
                              fill="#94a3b8" 
                              barSize={30}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center gap-1 text-sm">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: '#3b82f6' }} />
                          <span className="text-muted-foreground">남: {postGenderShareData[0].maleValue.toLocaleString()}명 ({postGenderShareData[0].male.toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: '#ef4444' }} />
                          <span className="text-muted-foreground">녀: {postGenderShareData[0].femaleValue.toLocaleString()}명 ({postGenderShareData[0].female.toFixed(1)}%)</span>
                        </div>
                        {postGenderShareData[0].unspecifiedValue > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#94a3b8' }} />
                            <span className="text-muted-foreground">미지정: {postGenderShareData[0].unspecifiedValue.toLocaleString()}명 ({postGenderShareData[0].unspecified.toFixed(1)}%)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 연령별 점유율 막대 그래프 */}
                    <div>
                      <p className="text-base text-muted-foreground mb-2">연령별 점유율</p>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
                          <BarChart
                            layout="vertical"
                            data={postAgeGroupShareData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              domain={[-maxValueWithPadding, maxValueWithPadding]}
                              tickFormatter={(value) => `${Math.abs(value).toLocaleString()}명`}
                              label={{ value: '인원수 (명)', position: 'insideBottom', offset: -5 }}
                              ticks={(() => {
                                const max = maxValueWithPadding
                                const step = Math.max(10, Math.ceil(max / 50) * 10)
                                const ticks: number[] = []
                                for (let i = -max; i <= 0; i += step) {
                                  ticks.push(i)
                                }
                                for (let i = step; i <= max; i += step) {
                                  ticks.push(i)
                                }
                                return ticks.sort((a, b) => a - b)
                              })()}
                            />
                            <YAxis
                              type="category"
                              dataKey="age"
                              width={80}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                      <div className="text-sm font-semibold mb-2">{data.age}</div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} />
                                        <span className="text-sm text-muted-foreground">남성:</span>
                                        <span className="text-sm font-medium text-foreground">
                                          {data.malePercent.toFixed(1)}%
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          ({data.maleValue.toLocaleString()}명)
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
                                        <span className="text-sm text-muted-foreground">여성:</span>
                                        <span className="text-sm font-medium text-foreground">
                                          {data.femalePercent.toFixed(1)}%
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          ({data.femaleValue.toLocaleString()}명)
                                        </span>
                                      </div>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar
                              dataKey="male"
                              name="남성"
                              radius={[0, 4, 4, 0]}
                              onClick={(data) => {
                                setPostSummaryFilters(prev => ({ ...prev, gender: 'Male' }))
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {postAgeGroupShareData.map((entry: any, index: number) => (
                                <Cell
                                  key={`male-cell-${index}`}
                                  fill={entry.age === '미지정' ? 'rgba(59, 130, 246, 0.3)' : '#3b82f6'}
                                />
                              ))}
                            </Bar>
                            <Bar
                              dataKey="female"
                              name="여성"
                              radius={[4, 0, 0, 4]}
                              onClick={(data) => {
                                setPostSummaryFilters(prev => ({ ...prev, gender: 'Female' }))
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {postAgeGroupShareData.map((entry: any, index: number) => (
                                <Cell
                                  key={`female-cell-${index}`}
                                  fill={entry.age === '미지정' ? 'rgba(239, 68, 68, 0.3)' : '#ef4444'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: '#3b82f6' }} />
                          <span className="text-muted-foreground">남성</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: '#ef4444' }} />
                          <span className="text-muted-foreground">여성</span>
                        </div>
                      </div>
                    </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">데이터 없음</p>
                  )
                })()
              }
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">기간 내 게시물 랭킹</h3>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>검색 기간 내 작성한 게시물의 랭킹 목록과 상세 정보를 확인할 수 있습니다.</p>
                  <p>클릭하면 상세 정보를 확인할 수 있습니다.</p>
                </TooltipContent>
              </UITooltip>
                    </div>
          {/* 랭킹 정렬 선택 및 전체 보기 */}
          <div className="flex items-center justify-end gap-2 mb-2">
            <Select value={postSortBy} onValueChange={setPostSortBy}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalEngagement">전체 수</SelectItem>
                <SelectItem value="views">조회수순</SelectItem>
                <SelectItem value="likes">좋아요순</SelectItem>
                <SelectItem value="comments">댓글순</SelectItem>
                <SelectItem value="bookmarks">북마크순</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCombinedPostsModalOpen(true)}
            >
              전체 보기
            </Button>
          </div>
                  </div>
          
          {/* <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-2 bg-muted rounded-lg ">
              <p className="text-xs text-muted-foreground mb-1.5 font-semibold">카테고리별 점유율</p>
              {combinedPostCategoryShareData.length > 0 ? (
                <>
                  <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={combinedPostCategoryShareData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={50}
                          paddingAngle={1}
                          dataKey="value"
                        >
                          {combinedPostCategoryShareData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number | undefined, name: string | undefined, props: any) => [
                            `${props.payload.name}: ${props.payload.percentage}%`,
                            '점유율'
                          ]}
                        />
                      </PieChart>
                        </ResponsiveContainer>
                      </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {combinedPostCategoryShareData.slice(0, 7).map((item, index) => (
                      <div key={item.name} className="flex items-center gap-1 text-xs">
                        <div 
                          className="w-2 h-2 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">{item.percentage}%</span>
                        </div>
                    ))}
                        </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">데이터 없음</p>
              )}
                        </div>
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1.5 font-semibold">커뮤니티별 점유율</p>
              {combinedPostCommunityShareData.length > 0 ? (
                <>
                  <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={combinedPostCommunityShareData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={50}
                          paddingAngle={1}
                          dataKey="value"
                        >
                          {combinedPostCommunityShareData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div 
                                  style={{ 
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                    minWidth: '220px',
                                    width: '220px'
                                  }}
                                >
                                  <div 
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      width: '100%',
                                      position: 'relative'
                                    }}
                                  >
                                    <span 
                                      style={{ 
                                        fontSize: '14px',
                                        color: 'hsl(var(--muted-foreground))',
                                        position: 'absolute',
                                        left: '0'
                                      }}
                                    >
                                      {data.name}
                                    </span>
                                    <span 
                                      style={{ 
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: 'hsl(var(--foreground))',
                                        position: 'absolute',
                                        right: '0',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {data.percentage}%
                                    </span>
                        </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {combinedPostCommunityShareData.slice(0, 5).map((item, index) => (
                      <div key={item.name} className="flex items-center gap-1 text-xs">
                        <div 
                          className="w-2 h-2 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">데이터 없음</p>
              )}
                      </div>
                    </div>
                     */}
          

          {/* 게시물 그리드 */}
          <div className="grid grid-cols-1 gap-2">
            {combinedPosts.slice(0, 5).map((post, index) => (
              <div
                key={`${post.title}-${post.author}-${index}`}
                onClick={() => {
                  // 게시물 상세 정보 생성
                  const foundUser = filteredCommunityUsers.find(u => u.name === post.author) ||
                                  filteredChatUsers.find(u => u.name === post.author) ||
                                  filteredTrendingUsers.find(u => u.name === post.author) ||
                                  combinedUsers.find(u => u.name === post.author)
                  
                  const postDetail: PostDetail = {
                    title: post.title,
                    imageUrl: post.img ? (post.img.startsWith('http') ? post.img : `${API_IMG_URL}${post.img.replace(/^\/+/, '')}`) : '/placeholder.jpg',
                    content: post.content || '',
                    author: post.author,
                    authorUserNo: foundUser ? (foundUser as any).userNo?.toString() : post.userNo?.toString(),
                    views: post.views,
                    comments: post.comments,
                    likes: post.likes,
                    bookmarks: post.bookmarks,
                    language: (foundUser as any)?.lang ? ((foundUser as any).lang === 'ko' ? '한국어' : (foundUser as any).lang) : '한국어',
                    createdAt: post.createdAt,
                    registeredApp: 'HT', // API에서 제공되지 않음
                    category: post.category,
                    country: post.country,
                    trendData: post.trendData || []
                  }
                  setSelectedPostDetail(postDetail)
                  setSelectedPostDetailAuthor(null)  // 모달 열 때 유저 정보 초기화
                  setIsPostDetailModalOpen(true)
                }}
                className="p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0 shrink-0">
                        {post.rank}
                      </Badge>
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      <span className="text-xs text-muted-foreground truncate">{post.author}</span>
                  </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 flex-wrap justify-end">
                    <Badge variant="outline" className="hidden md:flex text-xs bg-indigo-50 text-indigo-700 border-indigo-200 whitespace-nowrap">
                      점유율: {calculateCombinedPostShare(post, combinedPosts, 5)}%
                    </Badge>
                    {post.trendScore && (
                      <span className="text-red-500 font-semibold whitespace-nowrap">급상승 {post.trendScore}%</span>
                    )}
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {post.category}
                      </Badge>
                    </div>
                      </div>
                <div className="grid grid-cols-4 gap-4 mt-2 text-xs text-muted-foreground">
                  <div>총 조회수 {post.views.toLocaleString()}</div>
                  <div>좋아요 {post.likes}</div>
                  <div>댓글 {post.comments}</div>
                  <div>북마크 {post.bookmarks}</div>
                    </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 종합 유저 상세 모달 */}
      <Dialog open={isCombinedUsersModalOpen} onOpenChange={(open) => {
        setIsCombinedUsersModalOpen(open)
        if (!open) {
          // 모달이 닫힐 때 필터 및 페이징 초기화
          setFilteredCombinedUserLanguage('전체')
          setFilteredCombinedUserApp('전체')
          setSelectedCombinedUser(null)
          setCurrentPage(0)
        }
      }}>
        <DialogContent className="!max-w-[90vw] !w-[90vw] sm:!max-w-[85vw] max-h-[85vh] h-[75vh] flex flex-col overflow-hidden" style={{ width: '90vw', maxWidth: '95vw' }}>
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-bold">종합 유저 랭킹 전체 보기</DialogTitle>
            <DialogDescription>종합 유저 랭킹 목록과 상세 정보를 확인할 수 있습니다.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 flex flex-col mt-4 min-h-0 overflow-hidden">
            {/* 유저 리스트와 상세 정보 - 좌우 배치 */}
            <div className="flex-1 grid grid-cols-[1fr_50%] gap-4 min-h-0 overflow-hidden">
              {/* 유저 리스트 */}
              <div className="flex flex-col min-w-0 min-h-0">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <h3 className="text-lg font-semibold">유저 리스트</h3>
                </div>
                {loadingPagedUsers ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">로딩 중...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                      {pagedCombinedUsers.map((user) => (
                    <div
                      key={user.userNo || user.name || `combined-modal-${user.rank}`}
                      onClick={() => setSelectedCombinedUser(user)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all flex-shrink-0 ${
                        selectedCombinedUser && (selectedCombinedUser as any).userNo === user.userNo
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center p-0 shrink-0">
                            {user.rank}
                          </Badge>
                          <span className="text-base font-medium truncate">{user.name}</span>
                          <span className="text-base text-muted-foreground shrink-0">({user.country})</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 shrink-0">
                          상승률: {user.growthRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-6 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 truncate">
                          <MessageSquare className="h-3 w-3 text-blue-500 shrink-0" />
                          <span className="text-base">게시글 {user.posts}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <MessageCircle className="h-3 w-3 text-green-500 shrink-0" />
                          <span className="text-base">댓글 {user.comments}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <Heart className="h-3 w-3 text-red-500 shrink-0" />
                          <span className="text-base">좋아요 {user.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <Bookmark className="h-3 w-3 text-orange-500 shrink-0" />
                          <span className="text-base">북마크 {user.bookmarks || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <Users className="h-3 w-3 text-purple-500 shrink-0" />
                          <span className="text-base">채팅방 {user.chatRooms}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <MessageSquare className="h-3 w-3 text-indigo-500 shrink-0" />
                          <span className="text-base">메세지 {user.messages}</span>
                        </div>
                      </div>
                    </div>
                      ))}
                    </div>
                    {/* 페이징 컨트롤 */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0 || loadingPagedUsers}
                      >
                        이전
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        페이지 {currentPage + 1} ({(currentPage * pageSize) + 1}-{Math.min((currentPage + 1) * pageSize, totalUserCount)} / {totalUserCount > 0 ? totalUserCount : '?'})
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={pagedCombinedUsers.length < pageSize || loadingPagedUsers}
                      >
                        다음
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* 선택된 유저 상세 정보 */}
              <div className="flex flex-col min-w-0 min-h-0">
                <h3 className="text-lg font-semibold mb-4 flex-shrink-0">상세 정보</h3>
                <div className="flex-1 overflow-y-auto min-h-0">
                  {selectedCombinedUserDetail ? (
                      <div className="space-y-6 pb-4">
                        {/* 기본 정보 - 1-2행 */}
                        <div className="grid grid-cols-6 gap-3">
                          <div className="col-span-1">
                            {selectedCombinedUserDetail.imageUrl ? (
                              <img 
                                src={selectedCombinedUserDetail.imageUrl.startsWith('http') 
                                  ? selectedCombinedUserDetail.imageUrl 
                                  : `${API_IMG_URL}${selectedCombinedUserDetail.imageUrl.replace(/^\/+/, '')}`} 
                                alt={selectedCombinedUserDetail.nickname}
                                className="w-full h-full object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-full h-24 bg-muted rounded-lg border flex items-center justify-center text-muted-foreground text-xs">
                                이미지 없음
                              </div>
                            )}
                          </div>
                          <div className="col-span-5 grid grid-cols-5 gap-2 text-sm">
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">아이디</p>
                              <p className="text-sm font-bold truncate" title={selectedCombinedUserDetail.id}>{selectedCombinedUserDetail.id}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">이메일</p>
                              <p className="text-sm font-bold truncate" title={selectedCombinedUserDetail.email}>{selectedCombinedUserDetail.email}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">닉네임</p>
                              <p className="text-sm font-bold truncate" title={selectedCombinedUserDetail.nickname}>{selectedCombinedUserDetail.nickname}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">언어</p>
                              <p className="text-sm font-bold">{selectedCombinedUserDetail.language}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">성별</p>
                              <p className="text-sm font-bold">{selectedCombinedUserDetail.gender}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">국가</p>
                              <p className="text-sm font-bold">{selectedCombinedUserDetail.country}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">가입 앱</p>
                              <p className="text-sm font-bold">{selectedCombinedUserDetail.signupApp}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">가입경로</p>
                              <p className="text-sm font-bold truncate" title={selectedCombinedUserDetail.signupPath}>{selectedCombinedUserDetail.signupPath}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">OS 정보</p>
                              <p className="text-sm font-bold truncate" title={selectedCombinedUserDetail.osInfo}>{selectedCombinedUserDetail.osInfo}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">가입 일자</p>
                              <p className="text-sm font-bold">{formatDateToYYYYMMDD(selectedCombinedUserDetail.signupDate)}</p>
                            </div>
                          </div>
                        </div>

                        {/* 커뮤니티 활동 지표 */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 지표</h3>
                          <div className="grid grid-cols-6 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                <p className="text-sm text-muted-foreground">게시글 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedUserDetail.posts}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="h-4 w-4 text-green-500" />
                                <p className="text-sm text-muted-foreground">댓글 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedUserDetail.comments}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                <p className="text-sm text-muted-foreground">좋아요 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedUserDetail.likes}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Bookmark className="h-4 w-4 text-purple-500" />
                                <p className="text-sm text-muted-foreground">북마크 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedUserDetail.bookmarks}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-indigo-500" />
                                <p className="text-sm text-muted-foreground">채팅방 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedUserDetail.chatRooms}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-navy-500" />
                                <p className="text-sm text-muted-foreground">메세지 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedUserDetail.messages || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* 커뮤니티 활동 추이 */}
                        {selectedCombinedUserTrendData && selectedCombinedUserTrendData.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 추이 (월별)</h3>
                            <div className="h-80 min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                                  <ComposedChart 
                                    data={selectedCombinedUserTrendData}
                                  >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month"
                              minTickGap={60}
                              height={50}
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis width={60} />
                                    <Tooltip />
                                    <Legend content={<CustomLegend />} />
                                    <Bar dataKey="posts" fill="#3b82f6" name="게시글" />
                                    <Bar dataKey="postsPredicted" fill="#3b82f6" fillOpacity={0.3} name="게시글 (예측)" />
                                    <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} name="댓글" />
                                    <Line type="monotone" dataKey="commentsPredicted" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} name="댓글 (예측)" />
                                    <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} name="좋아요" />
                                    <Line type="monotone" dataKey="likesPredicted" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} name="좋아요 (예측)" />
                                    <Line type="monotone" dataKey="bookmarks" stroke="#f59e0b" strokeWidth={2} name="북마크" />
                                    <Line type="monotone" dataKey="bookmarksPredicted" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} name="북마크 (예측)" />
                                    <Line type="monotone" dataKey="chatRooms" stroke="#8b5cf6" strokeWidth={2} name="채팅방" />
                                    <Line type="monotone" dataKey="chatRoomsPredicted" stroke="#8b5cf6" strokeDasharray="5 5" strokeWidth={2} name="채팅방 (예측)" />
                                    <Line type="monotone" dataKey="messages" stroke="#1e3a8a" strokeWidth={2} name="메시지" />
                                    <Line type="monotone" dataKey="messagesPredicted" stroke="#1e3a8a" strokeDasharray="5 5" strokeWidth={2} name="메시지 (예측)" />
                                    {selectedCombinedUserTrendData?.some(d => d.predicted != null) && (
                                      <Line 
                                        type="monotone" 
                                        dataKey="predicted" 
                                        stroke="#ef4444" 
                                        strokeWidth={2} 
                                        strokeDasharray="5 5" 
                                        name="예측" 
                                        connectNulls 
                                        dot={false}
                                      />
                                    )}
                                  </ComposedChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 bg-muted rounded-lg border-2 border-dashed text-center">
                          <p className="text-muted-foreground">유저를 선택하면 상세 정보가 표시됩니다</p>
                        </div>
                      )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

        {/* 종합 게시물 랭킹 전체보기 모달 */}
        <Dialog open={isCombinedPostsModalOpen} onOpenChange={(open) => {
          setIsCombinedPostsModalOpen(open)
          if (!open) {
            setSelectedCombinedPost(null)
            setSelectedCombinedPostAuthor(null)
          }
        }}>
          <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] h-[85vh] flex flex-col overflow-hidden" style={{ width: '95vw', maxWidth: '95vw' }}>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-xl font-bold">기간별 게시물 랭킹 전체 보기</DialogTitle>
              <DialogDescription>검색 기간 내 작성한 게시물의 랭킹 목록과 상세 정보를 확인할 수 있습니다.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 flex flex-col mt-4 min-h-0 overflow-hidden">
              
              {/* 상단: 게시물 리스트와 상세 정보 */}
              <div className="flex-1 grid grid-cols-[1fr_30%_35%] gap-4 min-h-0 overflow-hidden">
                {/* 좌측: 게시물 리스트 */}
                <div className="flex flex-col min-w-0 min-h-0">
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <h3 className="text-lg font-semibold">게시물 리스트</h3>
                    <Select value={postSortBy} onValueChange={setPostSortBy}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="totalEngagement">전체 수</SelectItem>
                        <SelectItem value="views">조회수순</SelectItem>
                        <SelectItem value="likes">좋아요순</SelectItem>
                        <SelectItem value="comments">댓글순</SelectItem>
                        <SelectItem value="bookmarks">북마크순</SelectItem>
                      </SelectContent>
                    </Select>
          </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                    {combinedPosts.map((post, index) => {
                      // 이미지 URL 처리: 상대 경로면 API_IMG_URL 붙이고, 절대 경로면 그대로 사용
                      const imageUrl = post.img 
                        ? (post.img.startsWith('http') ? post.img : `${API_IMG_URL}${post.img.replace(/^\/+/, '')}`)
                        : '/placeholder.jpg'
                      
                      const foundUser = filteredCommunityUsers.find(u => u.name === post.author) ||
                                      filteredChatUsers.find(u => u.name === post.author) ||
                                      filteredTrendingUsers.find(u => u.name === post.author) ||
                                      combinedUsers.find(u => u.name === post.author)
                      
                      const languageMap: Record<string, string> = {
                        'ko': '한국어',
                        'ja': '일본어',
                        'zh': '중국어',
                        'en': '영어',
                        'hi': '인도어',
                        'vi': '베트남어',
                        'th': '태국어',
                        'ru': '러시아어'
                      }
                      
                      const postDetail: PostDetail = {
                        title: post.title,
                        imageUrl: imageUrl,
                        content: post.content || '',
                        author: post.author,
                        authorUserNo: foundUser ? (foundUser as any).userNo?.toString() : post.userNo?.toString(),
                        views: post.views,
                        comments: post.comments,
                        likes: post.likes,
                        bookmarks: post.bookmarks,
                        language: foundUser && (foundUser as any).lang ? (languageMap[(foundUser as any).lang] || '한국어') : '한국어',
                        createdAt: post.createdAt,
                        registeredApp: 'HT', // API에서 제공되지 않음
                        category: post.category,
                        country: post.country,
                        trendData: []
                      }
                      
                      return (
                        <div
                          key={`${post.title}-${post.author}-${index}`}
                          onClick={async () => {
                            // flushSync를 사용하여 즉시 상태 업데이트 (동기적으로 렌더링)
                            flushSync(() => {
                              setIsLoadingPostAuthor(true)
                              setSelectedCombinedPost(postDetail)
                            })
                            
                            // API에서 게시물 상세 정보 가져오기
                            if (post.postId && post.boardType) {
                              try {
                                const postDetailResponse = await fetchPostDetail(
                                  startDate,
                                  endDate,
                                  post.postId,
                                  post.boardType
                                )
                                
                                if (postDetailResponse.monthlyTrend && postDetailResponse.monthlyTrend.length > 0) {
                                  const postData = postDetailResponse.monthlyTrend[0]
                                  const updatedPostDetail: PostDetail = {
                                    ...postDetail,
                                    imageUrl: postData.img 
                                      ? (postData.img.startsWith('http') ? postData.img : `${API_IMG_URL}${postData.img}`)
                                      : postDetail.imageUrl,
                                    content: postData.content || postDetail.content,
                                    title: postData.title || postDetail.title,
                                    views: postData.views || postDetail.views,
                                    comments: postData.comments || postDetail.comments,
                                    likes: postData.likes || postDetail.likes,
                                    bookmarks: postData.bookmarks || postDetail.bookmarks,
                                    createdAt: postData.createDate || postDetail.createdAt,
                                  }
                                  setSelectedCombinedPost(updatedPostDetail)
                                  
                                  // 작성자 정보 로드
                                  await loadPostAuthorDetail(updatedPostDetail, 'combinedPost')
                                } else {
                                  // API 응답이 없으면 기본 정보로 작성자만 로드
                                  await loadPostAuthorDetail(postDetail, 'combinedPost')
                                }
                              } catch (error) {
                                console.error('❌ 게시물 상세 정보 로딩 실패:', error)
                                // 에러 발생 시 기본 정보로 작성자만 로드
                                await loadPostAuthorDetail(postDetail, 'combinedPost')
                              }
                            } else {
                              // postId나 boardType이 없으면 작성자만 로드
                              await loadPostAuthorDetail(postDetail, 'combinedPost')
                            }
                          }}
                          className={`p-3 border rounded-lg cursor-pointer transition-all flex-shrink-0 ${
                            selectedCombinedPost?.title === post.title 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center p-0 shrink-0">
                        {post.rank}
                      </Badge>
                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  {post.boardType && (() => {
                                    const getBoardTypeColor = (boardType: number) => {
                                      switch (boardType) {
                                        case 1: // 정품제품리뷰
                                          return 'bg-blue-100 text-blue-700 border-blue-300'
                                        case 2: // 정품 Q&A
                                          return 'bg-green-100 text-green-700 border-green-300'
                                        case 3: // 정품판별팁
                                          return 'bg-purple-100 text-purple-700 border-purple-300'
                                        case 4: // 정품인증거래
                                          return 'bg-orange-100 text-orange-700 border-orange-300'
                                        default:
                                          return 'bg-gray-100 text-gray-700 border-gray-300'
                                      }
                                    }
                                    return (
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBoardTypeColor(post.boardType)} whitespace-nowrap`}>
                                        {getBoardTypeName(post.boardType)}
                                      </span>
                                    )
                                  })()}
                                  <p className="text-sm font-medium truncate">{post.title}</p>
                        </div>
                                <span className="text-xs text-muted-foreground truncate">{post.author}</span>
                      </div>
                    </div>
                            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                                점유율: {calculateCombinedPostShare(post, combinedPosts, combinedPosts.length)}%
                              </Badge>
                              {post.trendScore && (
                                <span className="text-red-500 font-semibold text-xs whitespace-nowrap">급상승 {post.trendScore}%</span>
                              )}
                              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {post.category}
                      </Badge>
                  </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                            <div>조회수 {post.views.toLocaleString()}</div>
                            <div>좋아요 {post.likes}</div>
                            <div>댓글 {post.comments}</div>
                            <div>북마크 {post.bookmarks}</div>
                          </div>
                        </div>
                      )
                    })}
                      </div>
                    </div>
                    
                {/* 중앙: 게시물 상세 정보 */}
                <div className="flex flex-col min-w-0 min-h-0 border-l pl-4">
                  <h3 className="text-lg font-semibold mb-4 flex-shrink-0">게시물 상세 정보</h3>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {selectedCombinedPost ? (
                      isLoadingPostAuthor ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm text-muted-foreground">게시물 정보를 불러오는 중...</p>
                          </div>
                        </div>
                      ) : (
                      <div className="space-y-4 pb-4">
                        {/* 제목 */}
                        <div>
                          <h2 className="text-xl font-bold mb-2">{selectedCombinedPost.title}</h2>
                        </div>
                        
                        {/* 사진 및 내용 */}
                        <div className="space-y-3">
                          <div className="w-full h-[300px] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                            <img
                              src={
                                selectedCombinedPost.imageUrl && !selectedCombinedPost.imageUrl.includes('placeholder')
                                ? (selectedCombinedPost.imageUrl.startsWith('http') 
                                    ? selectedCombinedPost.imageUrl 
                                      : `${API_IMG_URL}${selectedCombinedPost.imageUrl.replace(/^\/+/, '')}`)
                                  : '/placeholder.jpg'
                              }
                              alt={selectedCombinedPost.title}
                              className="w-full h-full object-contain"
                              style={{ maxWidth: '100%', maxHeight: '100%' }}
                              onError={(e) => {
                                // 이미지 로드 실패 시 placeholder 표시
                                const target = e.target as HTMLImageElement
                                console.error('❌ [이미지로드실패] 종합게시물 이미지:', {
                                  attemptedUrl: target.src,
                                  postTitle: selectedCombinedPost?.title || 'N/A',
                                  imageUrl: selectedCombinedPost?.imageUrl || 'N/A',
                                  API_IMG_URL: API_IMG_URL
                                })
                                target.src = '/placeholder.jpg'
                              }}
                              onLoad={(e) => {
                                console.log('✅ [이미지로드성공] 종합게시물 이미지:', {
                                  loadedUrl: (e.target as HTMLImageElement).src
                                })
                              }}
                            />
                          </div>
                          {selectedCombinedPost.content && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{selectedCombinedPost.content}</p>
                          </div>
                          )}
                        </div>

                        {/* 게시물 정보 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">작성자</p>
                            <p className="text-sm font-bold">{selectedCombinedPost.author}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">조회수</p>
                            <p className="text-sm font-bold">{selectedCombinedPost.views.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">댓글수</p>
                            <p className="text-sm font-bold">{selectedCombinedPost.comments.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">좋아요수</p>
                            <p className="text-sm font-bold">{selectedCombinedPost.likes.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">북마크수</p>
                            <p className="text-sm font-bold">{selectedCombinedPost.bookmarks.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">언어</p>
                            <p className="text-sm font-bold">{selectedCombinedPost.language}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">등록일</p>
                            <p className="text-sm font-bold">{selectedCombinedPost.createdAt}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">등록 앱</p>
                            <p className="text-sm font-bold">{selectedCombinedPost.registeredApp}</p>
                          </div>
                        </div>
                      </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>게시물을 선택하면 상세 정보가 표시됩니다.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 우측: 작성자 상세 정보 */}
                <div className="flex flex-col min-w-0 min-h-0 border-l pl-4">
                  <h3 className="text-lg font-semibold mb-4 flex-shrink-0">작성자 상세 정보</h3>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {isLoadingPostAuthor ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">작성자 정보를 불러오는 중...</p>
                        </div>
                      </div>
                    ) : selectedCombinedPostAuthor ? (
                      <div className="space-y-6 pb-4">
                        {/* 기본 정보 */}
                        <div className="grid grid-cols-6 gap-3">
                          <div className="col-span-1">
                            {selectedCombinedPostAuthor.imageUrl && selectedCombinedPostAuthor.imageUrl.trim() !== '' ? (
                              <img 
                                src={
                                  selectedCombinedPostAuthor.imageUrl.startsWith('http')
                                    ? selectedCombinedPostAuthor.imageUrl
                                    : `${API_IMG_URL}${selectedCombinedPostAuthor.imageUrl.replace(/^\/+/, '')}`
                                }
                                alt={selectedCombinedPostAuthor.nickname}
                                className="w-full h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  // 이미지 로드 실패 시 placeholder 표시
                                  const target = e.target as HTMLImageElement
                                  target.src = '/placeholder.jpg'
                                }}
                              />
                            ) : (
                              <div className="w-full h-24 bg-muted rounded-lg border flex items-center justify-center text-muted-foreground text-xs">
                                이미지 없음
                              </div>
                            )}
                          </div>
                          <div className="col-span-5 grid grid-cols-5 gap-2 text-sm">
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">아이디</p>
                              <p className="text-sm font-bold truncate">{selectedCombinedPostAuthor.id}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">이메일</p>
                              <p className="text-sm font-bold truncate">{selectedCombinedPostAuthor.email}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">닉네임</p>
                              <p className="text-sm font-bold truncate">{selectedCombinedPostAuthor.nickname}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">언어</p>
                              <p className="text-sm font-bold">{selectedCombinedPostAuthor.language}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">성별</p>
                              <p className="text-sm font-bold">{selectedCombinedPostAuthor.gender}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">국가</p>
                              <p className="text-sm font-bold">{selectedCombinedPostAuthor.country}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">가입 앱</p>
                              <p className="text-sm font-bold">{selectedCombinedPostAuthor.signupApp}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">가입경로</p>
                              <p className="text-sm font-bold truncate">{selectedCombinedPostAuthor.signupPath}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">OS 정보</p>
                              <p className="text-sm font-bold truncate">{selectedCombinedPostAuthor.osInfo}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">가입 일자</p>
                              <p className="text-sm font-bold">{formatDateToYYYYMMDD(selectedCombinedPostAuthor.signupDate)}</p>
                            </div>
                          </div>
                        </div>

                        {/* 커뮤니티 활동 지표 */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 지표</h3>
                          <div className="grid grid-cols-6 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4" style={{ color: '#3b82f6' }} />
                                <p className="text-base text-muted-foreground">게시글 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedPostAuthor.posts || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="h-4 w-4" style={{ color: '#10b981' }} />
                                <p className="text-base text-muted-foreground">댓글 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedPostAuthor.comments || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-4 w-4" style={{ color: '#ef4444' }} />
                                <p className="text-base text-muted-foreground">좋아요 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedPostAuthor.likes || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Bookmark className="h-4 w-4" style={{ color: '#f59e0b' }} />
                                <p className="text-base text-muted-foreground">북마크 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedPostAuthor.bookmarks || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4" style={{ color: '#8b5cf6' }} />
                                <p className="text-base text-muted-foreground">채팅방 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedPostAuthor.chatRooms || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4" style={{ color: '#1e3a8a' }} />
                                <p className="text-base text-muted-foreground">메시지 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedPostAuthor.messages || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* 커뮤니티 활동 추이 */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 추이 (월별)</h3>
                          <div className="h-80 min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                              <ComposedChart 
                                data={selectedCombinedPostAuthorTrendData || []}
                              >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month"
                              minTickGap={60}
                              height={50}
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis width={60} />
                            <Tooltip />
                            <Legend content={<CustomLegend />} wrapperStyle={{ fontSize: '16px' }} />
                                <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} name="게시글" />
                                <Line type="monotone" dataKey="postsPredicted" stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="게시글 (예측)" />
                                <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} name="댓글" />
                                <Line type="monotone" dataKey="commentsPredicted" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="댓글 (예측)" />
                                <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} name="좋아요" />
                                <Line type="monotone" dataKey="likesPredicted" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="좋아요 (예측)" />
                                <Line type="monotone" dataKey="bookmarks" stroke="#f59e0b" strokeWidth={2} name="북마크" />
                                <Line type="monotone" dataKey="bookmarksPredicted" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="북마크 (예측)" />
                                <Line type="monotone" dataKey="chatRooms" stroke="#8b5cf6" strokeWidth={2} name="채팅방" />
                                <Line type="monotone" dataKey="chatRoomsPredicted" stroke="#8b5cf6" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="채팅방 (예측)" />
                                <Line type="monotone" dataKey="messages" stroke="#1e3a8a" strokeWidth={2} name="메시지" />
                                <Line type="monotone" dataKey="messagesPredicted" stroke="#1e3a8a" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="메시지 (예측)" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>작성자를 클릭하면 상세 정보가 표시됩니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 게시물 상세 모달 */}
        <Dialog open={isPostDetailModalOpen} onOpenChange={setIsPostDetailModalOpen}>
          <DialogContent className="!max-w-[90vw] !w-[90vw] sm:!max-w-[85vw] max-h-[85vh] h-[75vh] flex flex-col overflow-hidden" style={{ width: '90vw', maxWidth: '95vw' }}>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-xl font-bold">게시물 상세 정보</DialogTitle>
              <DialogDescription>게시물의 상세 정보와 추이를 확인할 수 있습니다.</DialogDescription>
            </DialogHeader>
            {selectedPostDetail && (
              <div className="flex-1 grid grid-cols-[60%_40%] gap-4 min-h-0 overflow-hidden">
                {/* 게시물 상세 정보 */}
                <div className="flex flex-col overflow-y-auto min-h-0 space-y-4 pr-2">
                  {/* 제목 */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedPostDetail.title}</h2>
                  </div>
                  
                  {/* 사진 및 내용 */}
                  <div className="space-y-3">
                    <div className="w-full h-[400px] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                      <img
                        src={
                          selectedPostDetail.imageUrl && !selectedPostDetail.imageUrl.includes('placeholder')
                          ? (selectedPostDetail.imageUrl.startsWith('http') 
                              ? selectedPostDetail.imageUrl 
                                : selectedPostDetail.imageUrl.startsWith('/')
                                  ? `${API_IMG_URL}${selectedPostDetail.imageUrl}`
                              : `${API_IMG_URL}${selectedPostDetail.imageUrl}`)
                            : '/placeholder.jpg'
                        }
                        alt={selectedPostDetail.title}
                        className="w-full h-full object-contain"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        onError={(e) => {
                          // 이미지 로드 실패 시 placeholder 표시
                          const target = e.target as HTMLImageElement
                          console.error('❌ [이미지로드실패] 게시물 이미지:', {
                            attemptedUrl: target.src,
                            postTitle: selectedPostDetail?.title || 'N/A',
                            imageUrl: selectedPostDetail?.imageUrl || 'N/A',
                            API_IMG_URL: API_IMG_URL,
                            startsWithHttp: selectedPostDetail?.imageUrl?.startsWith('http'),
                            startsWithSlash: selectedPostDetail?.imageUrl?.startsWith('/')
                          })
                          target.src = '/placeholder.jpg'
                        }}
                        onLoad={(e) => {
                          console.log('✅ [이미지로드성공] 게시물 이미지:', {
                            loadedUrl: (e.target as HTMLImageElement).src,
                            naturalWidth: (e.target as HTMLImageElement).naturalWidth,
                            naturalHeight: (e.target as HTMLImageElement).naturalHeight
                          })
                        }}
                      />
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedPostDetail.content}</p>
                    </div>
                  </div>

                  {/* 게시물 정보 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">작성자</p>
                      <p className="text-sm font-bold">{selectedPostDetail.author}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">조회수</p>
                      <p className="text-sm font-bold">{selectedPostDetail.views.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">댓글수</p>
                      <p className="text-sm font-bold">{selectedPostDetail.comments.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">좋아요수</p>
                      <p className="text-sm font-bold">{selectedPostDetail.likes.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">북마크수</p>
                      <p className="text-sm font-bold">{selectedPostDetail.bookmarks.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">언어</p>
                      <p className="text-sm font-bold">{selectedPostDetail.language}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">등록일</p>
                      <p className="text-sm font-bold">{selectedPostDetail.createdAt}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">등록 앱</p>
                      <p className="text-sm font-bold">{selectedPostDetail.registeredApp}</p>
                    </div>
                  </div>
                </div>

                {/* 우측 유저 상세 모달 (작성자 클릭 시 표시) */}
                {selectedPostDetailAuthor ? (
                  <div className="flex flex-col overflow-y-auto min-h-0 border-l pl-4">
                    <div className="flex-shrink-0 mb-4">
                      <h3 className="text-lg font-bold">유저 상세 정보</h3>
                    </div>
                    <div className="space-y-6 pb-4">
                      {/* 기본 정보 */}
                      <div className="grid grid-cols-6 gap-3">
                        <div className="col-span-1">
                          {selectedPostDetailAuthor.imageUrl && selectedPostDetailAuthor.imageUrl.trim() !== '' ? (
                            <img 
                              src={
                                selectedPostDetailAuthor.imageUrl.startsWith('http')
                                  ? selectedPostDetailAuthor.imageUrl
                                  : `${API_IMG_URL}${selectedPostDetailAuthor.imageUrl.replace(/^\/+/, '')}`
                              }
                              alt={selectedPostDetailAuthor.nickname}
                              className="w-full h-24 object-cover rounded-lg border"
                              onError={(e) => {
                                // 이미지 로드 실패 시 placeholder 표시
                                const target = e.target as HTMLImageElement
                                target.src = '/placeholder.jpg'
                              }}
                            />
                          ) : (
                            <div className="w-full h-24 bg-muted rounded-lg border flex items-center justify-center text-muted-foreground text-xs">
                              이미지 없음
                            </div>
                          )}
                        </div>
                        <div className="col-span-5 grid grid-cols-5 gap-2 text-sm">
                          <div className="p-2 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">아이디</p>
                            <p className="text-sm font-bold truncate">{selectedPostDetailAuthor.id}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">이메일</p>
                            <p className="text-sm font-bold truncate">{selectedPostDetailAuthor.email}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">닉네임</p>
                            <p className="text-sm font-bold truncate">{selectedPostDetailAuthor.nickname}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">언어</p>
                            <p className="text-sm font-bold">{selectedPostDetailAuthor.language}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">성별</p>
                            <p className="text-sm font-bold">{selectedPostDetailAuthor.gender}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">국가</p>
                            <p className="text-sm font-bold">{selectedPostDetailAuthor.country}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">가입 앱</p>
                            <p className="text-sm font-bold">{selectedPostDetailAuthor.signupApp}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">가입경로</p>
                            <p className="text-sm font-bold truncate">{selectedPostDetailAuthor.signupPath}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">OS 정보</p>
                            <p className="text-sm font-bold truncate">{selectedPostDetailAuthor.osInfo}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">가입 일자</p>
                            <p className="text-sm font-bold">{formatDateToYYYYMMDD(selectedPostDetailAuthor.signupDate)}</p>
                          </div>
                        </div>
                      </div>

                      {/* 커뮤니티 활동 지표 */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 지표</h3>
                        <div className="grid grid-cols-6 gap-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4" style={{ color: '#3b82f6' }} />
                              <p className="text-base text-muted-foreground">게시글 수</p>
                        </div>
                            <p className="text-2xl font-bold">{selectedPostDetailAuthor.posts || 0}</p>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle className="h-4 w-4" style={{ color: '#10b981' }} />
                              <p className="text-base text-muted-foreground">댓글 수</p>
                        </div>
                            <p className="text-2xl font-bold">{selectedPostDetailAuthor.comments || 0}</p>
                        </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="h-4 w-4" style={{ color: '#ef4444' }} />
                              <p className="text-base text-muted-foreground">좋아요 수</p>
                        </div>
                            <p className="text-2xl font-bold">{selectedPostDetailAuthor.likes || 0}</p>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Bookmark className="h-4 w-4" style={{ color: '#f59e0b' }} />
                              <p className="text-base text-muted-foreground">북마크 수</p>
                            </div>
                            <p className="text-2xl font-bold">{selectedPostDetailAuthor.bookmarks || 0}</p>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4" style={{ color: '#8b5cf6' }} />
                              <p className="text-base text-muted-foreground">채팅방 수</p>
                            </div>
                            <p className="text-2xl font-bold">{selectedPostDetailAuthor.chatRooms || 0}</p>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4" style={{ color: '#1e3a8a' }} />
                              <p className="text-base text-muted-foreground">메시지 수</p>
                            </div>
                            <p className="text-2xl font-bold">{selectedPostDetailAuthor.messages || 0}</p>
                          </div>
                      </div>
                    </div>
                    
                      {/* 커뮤니티 활동 추이 */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 추이 (월별)</h3>
                        <div className="h-80 min-h-[320px]">
                          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                            <ComposedChart 
                              data={selectedPostDetailAuthorTrendData || []}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="month"
                                minTickGap={60}
                                height={50}
                                tick={{ fontSize: 11 }}
                              />
                              <YAxis width={60} />
                              <Tooltip />
                              <Legend content={<CustomLegend />} wrapperStyle={{ fontSize: '16px' }} />
                              <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} name="게시글" />
                              <Line type="monotone" dataKey="postsPredicted" stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="게시글 (예측)" />
                              <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} name="댓글" />
                              <Line type="monotone" dataKey="commentsPredicted" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="댓글 (예측)" />
                              <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} name="좋아요" />
                              <Line type="monotone" dataKey="likesPredicted" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="좋아요 (예측)" />
                              <Line type="monotone" dataKey="bookmarks" stroke="#f59e0b" strokeWidth={2} name="북마크" />
                              <Line type="monotone" dataKey="bookmarksPredicted" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="북마크 (예측)" />
                              <Line type="monotone" dataKey="chatRooms" stroke="#8b5cf6" strokeWidth={2} name="채팅방" />
                              <Line type="monotone" dataKey="chatRoomsPredicted" stroke="#8b5cf6" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="채팅방 (예측)" />
                              <Line type="monotone" dataKey="messages" stroke="#1e3a8a" strokeWidth={2} name="메시지" />
                              <Line type="monotone" dataKey="messagesPredicted" stroke="#1e3a8a" strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="메시지 (예측)" />
                            </ComposedChart>
                          </ResponsiveContainer>
                    </div>
                  </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col overflow-y-auto min-h-0 border-l pl-4">
                    <div className="flex-shrink-0 mb-4">
                      <h3 className="text-lg font-bold">유저 상세 정보</h3>
                      <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                          <TooltipContent className="max-w-md">
                            <span className="font-semibold mb-2 text-base">유저의 상세 정보는 유저 가입일 이후의 값이 표시됩니다.</span>
                      </TooltipContent>
                    </UITooltip>
                    </div>
                    <div className="p-8 bg-muted rounded-lg border-2 border-dashed text-center">
                      <p className="text-muted-foreground">작성자를 클릭하면 상세 정보가 표시됩니다</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 인기 게시물 랭킹 */}
          
        {/* 급상승 게시물 전체보기 모달 */}
        <Dialog open={isTrendingPostsModalOpen} onOpenChange={(open) => {
          setIsTrendingPostsModalOpen(open)
          if (!open) {
            setSelectedTrendingPostInModal(null)
            setSelectedTrendingPostAuthorInModal(null)
          }
        }}>
          <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] h-[85vh] flex flex-col overflow-hidden" style={{ width: '95vw', maxWidth: '95vw' }}>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-xl font-bold">급상승 게시물 랭킹 전체 보기</DialogTitle>
              <DialogDescription>급상승 게시물 랭킹 목록과 상세 정보를 확인할 수 있습니다.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 flex flex-col mt-4 min-h-0 overflow-hidden">
              
              {/* 상단: 게시물 리스트와 상세 정보 */}
              <div className="flex-1 grid grid-cols-[1fr_30%_35%] gap-4 min-h-0 overflow-hidden">
                {/* 좌측: 게시물 리스트 */}
                <div className="flex flex-col min-w-0 min-h-0">
                  <h3 className="text-lg font-semibold mb-3 flex-shrink-0">게시물 리스트</h3>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                    {convertedTrendingPosts.map((post, index) => {
                      const getPostLanguage = (author: string): string => {
                        const nameLower = author.toLowerCase()
                        if (nameLower.includes('김') || nameLower.includes('이') || nameLower.includes('박') || nameLower.includes('최')) return '한국어'
                        if (nameLower.includes('tanaka') || nameLower.includes('yamada') || nameLower.includes('suzuki')) return '일본어'
                        if (nameLower.includes('wang') || nameLower.includes('li') || nameLower.includes('zhang')) return '중국어'
                        if (nameLower.includes('john') || nameLower.includes('mary') || nameLower.includes('smith')) return '영어'
                        if (nameLower.includes('kumar') || nameLower.includes('singh') || nameLower.includes('patel')) return '인도어'
                        if (nameLower.includes('nguyen') || nameLower.includes('tran') || nameLower.includes('le')) return '베트남어'
                        if (nameLower.includes('somsak') || nameLower.includes('woraphan')) return '태국어'
                        if (nameLower.includes('ivan') || nameLower.includes('petrov') || nameLower.includes('sidorov')) return '러시아어'
                        return '한국어'
                      }
                      const getRegisteredApp = (author: string): string => {
                        const user = filteredCommunityUsers.find(u => u.name === author) ||
                                    filteredChatUsers.find(u => u.name === author) ||
                                    filteredTrendingUsers.find(u => u.name === author) ||
                                    combinedUsers.find(u => u.name === author)
                        return user ? 'HT' : 'COP'
                      }
                      const getUserNo = (author: string): string | undefined => {
                        const user = filteredCommunityUsers.find(u => u.name === author) ||
                                    filteredChatUsers.find(u => u.name === author) ||
                                    filteredTrendingUsers.find(u => u.name === author) ||
                                    combinedUsers.find(u => u.name === author)
                        return user ? `user${user.rank.toString().padStart(3, '0')}` : undefined
                      }
                      
                      const handlePostClickInModal = async () => {
                        setSelectedTrendingPostInModal(null)
                        setSelectedTrendingPostAuthorInModal(null)
                        
                        try {
                          // API에서 게시물 상세 정보 가져오기
                          const postDetailResponse = await fetchPostDetail(
                            startDate,
                            endDate,
                            post.postId!,
                            post.boardType!
                          )
                          
                          // 게시물 추이 데이터 변환
                          const trendData = postDetailResponse.monthlyTrend?.map(item => ({
                            month: item.periodMonth || '',
                            views: item.views || null,
                            viewsPredicted: null,
                            likes: item.likes || null,
                            likesPredicted: null,
                            comments: item.comments || null,
                            commentsPredicted: null,
                            bookmarks: item.bookmarks || null,
                            bookmarksPredicted: null,
                          })) || []
                        
                        // 이미지 URL 처리: API 응답의 monthlyTrend[0].img를 우선 사용
                        const apiImage = postDetailResponse.monthlyTrend?.[0]?.img
                        const fallbackImage = postDetailResponse.img && postDetailResponse.img.length > 0 
                              ? postDetailResponse.img[0] 
                          : post.img
                        const imageSource = apiImage || fallbackImage
                        
                        const imageUrl = imageSource
                          ? (imageSource.startsWith('http') ? imageSource : `${API_IMG_URL}${imageSource.replace(/^\/+/, '')}`)
                          : '/placeholder.jpg'
                        
                        console.log('📸 [급상승게시물] 이미지 URL 처리:', {
                          apiImage: apiImage,
                          fallbackImage: fallbackImage,
                          imageSource: imageSource,
                          finalImageUrl: imageUrl,
                          API_IMG_URL: API_IMG_URL
                        })
                        
                        // content도 API 응답에서 가져오기
                        const apiContent = postDetailResponse.monthlyTrend?.[0]?.content || postDetailResponse.content
                        
                        const postDetail: PostDetail = {
                          title: postDetailResponse.monthlyTrend?.[0]?.title || post.title,
                          imageUrl: imageUrl,
                          content: apiContent || post.content || '',
                          author: postDetailResponse.monthlyTrend?.[0]?.userNickname || post.author,
                          authorUserNo: postDetailResponse.monthlyTrend?.[0]?.userNo?.toString() || (post.userNo ? post.userNo.toString() : undefined),
                          views: postDetailResponse.monthlyTrend?.[0]?.views ?? post.views,
                          comments: postDetailResponse.monthlyTrend?.[0]?.comments ?? post.comments,
                          likes: postDetailResponse.monthlyTrend?.[0]?.likes ?? post.likes,
                          bookmarks: postDetailResponse.monthlyTrend?.[0]?.bookmarks ?? post.bookmarks,
                          language: '한국어', // API에서 제공되지 않음
                          createdAt: postDetailResponse.monthlyTrend?.[0]?.createDate || post.createdAt,
                          registeredApp: 'HT', // API에서 제공되지 않음
                          category: post.category,
                          country: post.country,
                          trendData: trendData
                        }
                        setSelectedTrendingPostInModal(postDetail)
                        } catch (error) {
                          console.error('❌ 게시물 상세 정보 로딩 실패:', error)
                          // 이미지 URL 처리: 상대 경로면 API_IMG_URL 붙이고, 절대 경로면 그대로 사용
                          const imageUrl = post.img 
                            ? (post.img.startsWith('http') ? post.img : `${API_IMG_URL}${post.img.replace(/^\/+/, '')}`)
                            : '/placeholder.jpg'
                          
                          const postDetail: PostDetail = {
                            title: post.title,
                            imageUrl: imageUrl,
                            content: post.content || '',
                            author: post.author,
                            authorUserNo: post.userNo ? post.userNo.toString() : undefined,
                            views: post.views,
                            comments: post.comments,
                            likes: post.likes,
                            bookmarks: post.bookmarks,
                            language: '한국어', // API에서 제공되지 않음
                            createdAt: post.createdAt,
                            registeredApp: 'HT', // API에서 제공되지 않음
                            category: post.category,
                            country: post.country,
                            trendData: []
                          }
                          setSelectedTrendingPostInModal(postDetail)
                        }
                      }
                      
                      return (
                        <div
                          key={`${post.postId}-${post.title}-${index}`}
                          onClick={handlePostClickInModal}
                          className={`p-3 border rounded-lg cursor-pointer transition-all flex-shrink-0 ${
                            selectedTrendingPostInModal?.title === post.title 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center p-0 shrink-0">
                        {post.rank}
                      </Badge>
                              <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                                <span className="text-xs text-muted-foreground truncate">{post.author}</span>
                          </div>
                      </div>
                            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                {post.category}
                              </Badge>
                    </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                            <div>조회수 {post.views.toLocaleString()}</div>
                            <div>좋아요 {post.likes}</div>
                            <div>댓글 {post.comments}</div>
                            <div>북마크 {post.bookmarks}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* 중앙: 게시물 상세 정보 */}
                <div className="flex flex-col min-w-0 min-h-0 border-l pl-4">
                  <h3 className="text-lg font-semibold mb-4 flex-shrink-0">게시물 상세 정보</h3>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {selectedTrendingPostInModal ? (
                      <div className="space-y-4 pb-4">
                        {/* 제목 */}
                        <div>
                          <h2 className="text-xl font-bold mb-2">{selectedTrendingPostInModal.title}</h2>
                    </div>
                        
                        {/* 사진 및 내용 */}
                        <div className="space-y-3">
                          <div className="w-full h-[300px] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                            <img
                              src={
                                selectedTrendingPostInModal.imageUrl && !selectedTrendingPostInModal.imageUrl.includes('placeholder')
                                ? (selectedTrendingPostInModal.imageUrl.startsWith('http') 
                                    ? selectedTrendingPostInModal.imageUrl 
                                      : `${API_IMG_URL}${selectedTrendingPostInModal.imageUrl.replace(/^\/+/, '')}`)
                                  : '/placeholder.jpg'
                              }
                              alt={selectedTrendingPostInModal.title}
                              className="w-full h-full object-contain"
                              style={{ maxWidth: '100%', maxHeight: '100%' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                console.error('❌ [이미지로드실패] 급상승게시물 이미지:', {
                                  attemptedUrl: target.src,
                                  postTitle: selectedTrendingPostInModal?.title || 'N/A',
                                  imageUrl: selectedTrendingPostInModal?.imageUrl || 'N/A',
                                  API_IMG_URL: API_IMG_URL
                                })
                                target.src = '/placeholder.jpg'
                              }}
                              onLoad={(e) => {
                                console.log('✅ [이미지로드성공] 급상승게시물 이미지:', {
                                  loadedUrl: (e.target as HTMLImageElement).src
                                })
                              }}
                            />
                  </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{selectedTrendingPostInModal.content}</p>
                      </div>
                    </div>
                    
                        {/* 게시물 정보 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">작성자</p>
                            <button
                              onClick={async () => {
                                // post.userNo를 직접 사용하거나 authorUserNo에서 추출
                                let userNo: number | undefined
                                
                                // 먼저 post 객체에서 userNo를 찾기
                                const clickedPost = convertedTrendingPosts.find(p => p.title === selectedTrendingPostInModal.title)
                                if (clickedPost && clickedPost.userNo) {
                                  userNo = clickedPost.userNo
                                } else if (selectedTrendingPostInModal.authorUserNo) {
                                  // authorUserNo가 문자열인 경우 숫자로 변환 시도
                                  const parsedUserNo = parseInt(selectedTrendingPostInModal.authorUserNo, 10)
                                  if (!isNaN(parsedUserNo)) {
                                    userNo = parsedUserNo
                                  } else {
                                    // authorUserNo가 "user001" 형식인 경우
                                    const user = filteredCommunityUsers.find(u => u.name === selectedTrendingPostInModal.author) ||
                                                filteredChatUsers.find(u => u.name === selectedTrendingPostInModal.author) ||
                                                filteredTrendingUsers.find(u => u.name === selectedTrendingPostInModal.author) ||
                                                combinedUsers.find(u => u.name === selectedTrendingPostInModal.author)
                                    if (user && (user as any).userNo) {
                                      userNo = (user as any).userNo
                                    }
                                  }
                                }
                                
                                if (userNo) {
                                  try {
                                    // 유저 상세 정보는 유저의 가입일자부터 현재까지 API를 조회합니다.
                                    // 1단계: 먼저 기본 날짜로 API를 호출하여 가입일자(joinDate)를 가져옴
                                    const initialResponse = await fetchUserDetailTrend(
                                      startDate,
                                      endDate,
                                      userNo
                                    )
                                    
                                    if (!initialResponse.userDetail) {
                                      console.error('❌ 게시물 작성자 상세 정보: userDetail이 없습니다.')
                                      return
                                    }
                                    
                                    // 2단계: 가입일자를 startDate로, 현재 날짜를 endDate로 설정
                                    const userJoinDate = initialResponse.userDetail.joinDate
                                    const currentDateStr = getTodayDateString()
                                    
                                    // 가입일자를 YYYY-MM-DD 형식으로 변환
                                    let userStartDateStr: string
                                    if (userJoinDate) {
                                      try {
                                        const joinDateObj = new Date(userJoinDate)
                                        const year = joinDateObj.getFullYear()
                                        const month = String(joinDateObj.getMonth() + 1).padStart(2, '0')
                                        const day = String(joinDateObj.getDate()).padStart(2, '0')
                                        userStartDateStr = `${year}-${month}-${day}`
                                      } catch (error) {
                                        console.warn('⚠️ 가입일자 파싱 실패, 기본 startDate 사용:', userJoinDate)
                                        userStartDateStr = startDate
                                      }
                                    } else {
                                      console.warn('⚠️ 가입일자가 없어 기본 startDate 사용')
                                      userStartDateStr = startDate
                                    }
                                    
                                    // 3단계: 가입일부터 현재까지의 데이터로 다시 API 호출
                                    const trendResponse = await fetchUserDetailTrend(
                                      userStartDateStr,
                                      currentDateStr,
                                      userNo
                                    )
                                    
                                    if (trendResponse.userDetail) {
                                      const apiUserDetail = trendResponse.userDetail
                                      
                                      // user 정보 찾기
                                      const foundUser = filteredCommunityUsers.find(u => (u as any).userNo === userNo) ||
                                                       filteredChatUsers.find(u => (u as any).userNo === userNo) ||
                                                       filteredTrendingUsers.find(u => (u as any).userNo === userNo) ||
                                                       combinedUsers.find(u => (u as any).userNo === userNo)
                                      
                                      // 유저 이미지 URL 처리
                                      const userImageUrl = apiUserDetail.img
                                        ? (apiUserDetail.img.startsWith('http')
                                            ? apiUserDetail.img
                                            : `${API_IMG_URL}${apiUserDetail.img.replace(/^\/+/, '')}`)
                                        : ''
                                      
                                      const enrichedUserDetail: UserDetail = {
                                        id: apiUserDetail.id,
                                        nickname: apiUserDetail.nickName,
                                        signupDate: apiUserDetail.joinDate,
                                        email: apiUserDetail.email || '',
                                        language: apiUserDetail.lang || '',
                                        gender: getGenderLabel(apiUserDetail.userGender),
                                        country: apiUserDetail.userCountry || (foundUser as any)?.country || '미지정',
                                        signupApp: apiUserDetail.joinApp ? getAppTypeLabel(Number(apiUserDetail.joinApp)) : '',
                                        osInfo: getOsTypeLabel(apiUserDetail.userOs),
                                        img: apiUserDetail.img,
                                        imageUrl: userImageUrl,
                                        posts: (foundUser as any)?.posts || apiUserDetail.countPosts || 0,
                                        comments: (foundUser as any)?.comments || apiUserDetail.countComments || 0,
                                        likes: (foundUser as any)?.likes || apiUserDetail.countLikes || 0,
                                        bookmarks: (foundUser as any)?.bookmarks || apiUserDetail.countBookmarks || 0,
                                        chatRooms: (foundUser as any)?.chatRooms || apiUserDetail.countChats || 0,
                                        messages: apiUserDetail.countMessages || 0,
                                      }
                                      setSelectedTrendingPostAuthorInModal(enrichedUserDetail)
                                    }
                                  } catch (error) {
                                    console.error('❌ 게시물 작성자 상세 정보 로딩 실패:', error)
                                  }
                                }
                              }}
                              className="text-sm font-bold hover:text-primary hover:underline"
                            >
                              {selectedTrendingPostInModal.author}
                            </button>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">조회수</p>
                            <p className="text-sm font-bold">{selectedTrendingPostInModal.views.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">댓글수</p>
                            <p className="text-sm font-bold">{selectedTrendingPostInModal.comments.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">좋아요수</p>
                            <p className="text-sm font-bold">{selectedTrendingPostInModal.likes.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">북마크수</p>
                            <p className="text-sm font-bold">{selectedTrendingPostInModal.bookmarks.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">언어</p>
                            <p className="text-sm font-bold">{selectedTrendingPostInModal.language}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">등록일</p>
                            <p className="text-sm font-bold">{selectedTrendingPostInModal.createdAt}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">등록 앱</p>
                            <p className="text-sm font-bold">{selectedTrendingPostInModal.registeredApp}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>게시물을 선택하면 상세 정보가 표시됩니다.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 우측: 작성자 상세 정보 */}
                <div className="flex flex-col min-w-0 min-h-0 border-l pl-4">
                  <h3 className="text-lg font-semibold mb-4 flex-shrink-0">작성자 상세 정보</h3>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {selectedTrendingPostAuthorInModal ? (
                      <div className="space-y-6 pb-4">
                        {/* 기본 정보 */}
                        <div className="grid grid-cols-6 gap-3">
                          <div className="col-span-1">
                            {selectedTrendingPostAuthorInModal.imageUrl && selectedTrendingPostAuthorInModal.imageUrl.trim() !== '' ? (
                              <img 
                                src={
                                  selectedTrendingPostAuthorInModal.imageUrl.startsWith('http')
                                    ? selectedTrendingPostAuthorInModal.imageUrl
                                    : `${API_IMG_URL}${selectedTrendingPostAuthorInModal.imageUrl.replace(/^\/+/, '')}`
                                }
                                alt={selectedTrendingPostAuthorInModal.nickname}
                                className="w-full h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  // 이미지 로드 실패 시 placeholder 표시
                                  const target = e.target as HTMLImageElement
                                  target.src = '/placeholder.jpg'
                                }}
                              />
                            ) : (
                              <div className="w-full h-24 bg-muted rounded-lg border flex items-center justify-center text-muted-foreground text-xs">
                                이미지 없음
                              </div>
                            )}
                          </div>
                          <div className="col-span-5 grid grid-cols-5 gap-2 text-sm">
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">아이디</p>
                              <p className="text-sm font-bold truncate">{selectedTrendingPostAuthorInModal.id}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">이메일</p>
                              <p className="text-sm font-bold truncate">{selectedTrendingPostAuthorInModal.email}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">닉네임</p>
                              <p className="text-sm font-bold truncate">{selectedTrendingPostAuthorInModal.nickname}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">언어</p>
                              <p className="text-sm font-bold">{selectedTrendingPostAuthorInModal.language}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">성별</p>
                              <p className="text-sm font-bold">{selectedTrendingPostAuthorInModal.gender}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">국가</p>
                              <p className="text-sm font-bold">{selectedTrendingPostAuthorInModal.country}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">가입 앱</p>
                              <p className="text-sm font-bold">{selectedTrendingPostAuthorInModal.signupApp}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">가입경로</p>
                              <p className="text-sm font-bold truncate">{selectedTrendingPostAuthorInModal.signupPath}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">OS 정보</p>
                              <p className="text-sm font-bold truncate">{selectedTrendingPostAuthorInModal.osInfo}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">가입 일자</p>
                              <p className="text-sm font-bold">{formatDateToYYYYMMDD(selectedTrendingPostAuthorInModal.signupDate)}</p>
                            </div>
                          </div>
                        </div>

                        {/* 커뮤니티 활동 지표 */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 지표</h3>
                          <div className="grid grid-cols-5 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                <p className="text-sm text-muted-foreground">게시글 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedTrendingPostAuthorInModal.posts || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="h-4 w-4 text-green-500" />
                                <p className="text-sm text-muted-foreground">댓글 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedTrendingPostAuthorInModal.comments || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                <p className="text-sm text-muted-foreground">좋아요 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedTrendingPostAuthorInModal.likes || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Bookmark className="h-4 w-4 text-purple-500" />
                                <p className="text-sm text-muted-foreground">북마크 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedTrendingPostAuthorInModal.bookmarks || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-indigo-500" />
                                <p className="text-sm text-muted-foreground">채팅방 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedTrendingPostAuthorInModal.chatRooms || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* 커뮤니티 활동 추이 */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 추이 (월별)</h3>
                          <div className="h-80 min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                              <ComposedChart 
                                data={selectedTrendingPostAuthorInModal ? convertTrendDataToChartFormat([]) : []}
                              >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month"
                              minTickGap={60}
                              height={50}
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis width={60} />
                                <Tooltip />
                                <Legend content={<CustomLegend />} />
                                <Bar dataKey="posts" fill="#3b82f6" name="게시글" />
                                <Bar dataKey="postsPredicted" fill="#3b82f6" fillOpacity={0.3} name="게시글 (예측)" />
                                <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} name="댓글" />
                                <Line type="monotone" dataKey="commentsPredicted" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} name="댓글 (예측)" />
                                <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} name="좋아요" />
                                <Line type="monotone" dataKey="likesPredicted" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} name="좋아요 (예측)" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>작성자를 클릭하면 상세 정보가 표시됩니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 통합 유저 상세 모달 */}
        <UserDetailModal
          open={isUserDetailModalOpen}
          onOpenChange={setIsUserDetailModalOpen}
          userDetail={selectedUserDetail}
          trendData={selectedUserTrendData || undefined}
        />

        {/* 작성자 상세 모달 */}
        <Dialog open={isAuthorModalOpen} onOpenChange={setIsAuthorModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">유저 상세 정보</DialogTitle>
              <DialogDescription>유저의 상세 정보와 활동 추이를 확인할 수 있습니다.</DialogDescription>
            </DialogHeader>
            {selectedPostAuthor && (
              <div className="space-y-6 mt-4">
                {/* 유저 기본 정보 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-lg text-muted-foreground mb-1">유저명</p>
                    <p className="text-xl font-bold">{selectedPostAuthor.name}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-lg text-muted-foreground mb-1">국가</p>
                    <p className="text-xl font-bold">{selectedPostAuthor.country || "미지정"}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <p className="text-sm text-muted-foreground">가입일자</p>
                    </div>
                    <p className="text-lg font-bold">
                      {selectedPostAuthor.lastActivity || selectedPostAuthor.lastChat || "정보 없음"}
                    </p>
                  </div>
                  
                </div>

                {/* 활동 통계 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 통계</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <p className="text-sm text-muted-foreground">총 게시글</p>
                      </div>
                      <p className="text-2xl font-bold">{selectedPostAuthor.posts || 0}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-muted-foreground">총 댓글</p>
                        </div>
                      <p className="text-2xl font-bold">{selectedPostAuthor.comments || 0}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-muted-foreground">총 좋아요</p>
                      </div>
                      <p className="text-2xl font-bold">{selectedPostAuthor.likes || 0}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                          <Bookmark className="h-4 w-4 text-purple-500" />
                        <p className="text-sm text-muted-foreground">총 북마크</p>
                        </div>
                      <p className="text-2xl font-bold">{selectedPostAuthor.bookmarks || 0}</p>
                        </div>
                      </div>
                    </div>
                    
            

                {/* 커뮤니티 활동 추이 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 추이</h3>
                  <div className="h-80 min-h-[320px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                      <ComposedChart 
                        data={selectedPostAuthor ? convertTrendDataToChartFormat([]) : []}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month"
                          minTickGap={60}
                          height={50}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis width={60} />
                        <Tooltip />
                        <Legend content={<CustomLegend />} />
                        <Bar dataKey="posts" fill="#3b82f6" name="게시글" />
                        <Bar dataKey="postsPredicted" fill="#3b82f6" fillOpacity={0.3} name="게시글 (예측)" />
                        <Bar dataKey="comments" fill="#10b981" name="댓글" />
                        <Bar dataKey="commentsPredicted" fill="#10b981" fillOpacity={0.3} name="댓글 (예측)" />
                        <Bar dataKey="likes" fill="#ef4444" name="좋아요" />
                        <Bar dataKey="likesPredicted" fill="#ef4444" fillOpacity={0.3} name="좋아요 (예측)" />
                        <Bar dataKey="bookmarks" fill="#8b5cf6" name="북마크" />
                        <Bar dataKey="bookmarksPredicted" fill="#8b5cf6" fillOpacity={0.3} name="북마크 (예측)" />
                      </ComposedChart>
                    </ResponsiveContainer>
                    </div>
                  </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      {/* 커스텀 유저 검색과 새로운 박스 */}
      <div className="grid gap-1 lg:grid-cols-2">
        {/* 커스텀 유저 검색 */}
        <div>
          <CustomUserSearch />
        </div>
        
        {/* 새로운 박스 (추후 내용 추가 예정) */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <p className="text-muted-foreground">새로운 내용이 들어갈 예정입니다</p>
          </div>
        </Card>
      </div>

    </section>
  )
}

