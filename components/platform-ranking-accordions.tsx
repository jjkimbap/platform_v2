"use client"

import React, { useState, useMemo, useEffect } from "react"
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
import { fetchUserRanking, formatDateForAPI, getTodayDateString, type UserRankingItem, fetchUserDetailTrend, type MonthlyTrendItem, fetchPostRanking, fetchPostDetail, type PostRankingItem, type PostDetailResponse, API_IMG_URL } from "@/lib/api"
import { getAppTypeLabel, getOsTypeLabel, getGenderLabel } from "@/lib/type-mappings"
import { useDateRange } from "@/hooks/use-date-range"

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

// 커뮤니티 유저 랭킹 데이터
const communityUsers = [
  { rank: 1, name: "홍길동", country: "한국", score: 98.5, posts: 45, comments: 120, likes: 3, bookmarks: 28, lastActivity: "2025-01-15", communityType: "제품리뷰", productCategory: "패션" },
  { rank: 2, name: "이영희", country: "한국", score: 95.2, posts: 38, comments: 95, likes: 2, bookmarks: 22, lastActivity: "2025-01-15", communityType: "Q&A", productCategory: "뷰티-화장품" },
  { rank: 3, name: "박민수", country: "일본", score: 92.8, posts: 32, comments: 88, likes: 10, bookmarks: 19, lastActivity: "2025-01-14", communityType: "판별팁", productCategory: "가전제품" },
  { rank: 4, name: "최지영", country: "미국", score: 89.1, posts: 28, comments: 75, likes: 2, bookmarks: 16, lastActivity: "2025-01-14", communityType: "인증거래", productCategory: "식품" },
  { rank: 5, name: "정수현", country: "한국", score: 86.7, posts: 25, comments: 65, likes: 9, bookmarks: 14, lastActivity: "2025-01-13", communityType: "제품리뷰", productCategory: "리빙" },
  { rank: 6, name: "강민호", country: "일본", score: 84.3, posts: 22, comments: 58, likes: 8, bookmarks: 12, lastActivity: "2025-01-13", communityType: "제품리뷰", productCategory: "아동" },
  { rank: 7, name: "윤서연", country: "중국", score: 81.9, posts: 20, comments: 52, likes: 7, bookmarks: 11, lastActivity: "2025-01-12", communityType: "판별팁", productCategory: "생활용품" },
  { rank: 8, name: "임동현", country: "한국", score: 79.5, posts: 18, comments: 48, likes: 6, bookmarks: 10, lastActivity: "2025-01-12", communityType: "인증거래", productCategory: "건강" },
  { rank: 9, name: "조은지", country: "일본", score: 77.2, posts: 16, comments: 42, likes: 5, bookmarks: 9, lastActivity: "2025-01-11", communityType: "Q&A", productCategory: "기타" },
  { rank: 10, name: "송준호", country: "미국", score: 75.0, posts: 15, comments: 38, likes: 5, bookmarks: 8, lastActivity: "2025-01-11", communityType: "제품리뷰", productCategory: "패션" },
  { rank: 11, name: "한지우", country: "한국", score: 72.8, posts: 14, comments: 35, likes: 4, bookmarks: 7, lastActivity: "2025-01-10", communityType: "제품리뷰", productCategory: "뷰티-화장품" },
  { rank: 12, name: "백승현", country: "중국", score: 70.5, posts: 13, comments: 32, likes: 4, bookmarks: 7, lastActivity: "2025-01-10", communityType: "판별팁", productCategory: "가전제품" },
  { rank: 13, name: "신유진", country: "한국", score: 68.3, posts: 12, comments: 28, likes: 3, bookmarks: 6, lastActivity: "2025-01-09", communityType: "인증거래", productCategory: "식품" },
  { rank: 14, name: "오태영", country: "일본", score: 66.1, posts: 11, comments: 25, likes: 3, bookmarks: 6, lastActivity: "2025-01-09", communityType: "Q&A", productCategory: "리빙" },
  { rank: 15, name: "장미래", country: "베트남", score: 64.0, posts: 10, comments: 22, likes: 2, bookmarks: 5, lastActivity: "2025-01-08", communityType: "제품리뷰", productCategory: "아동" },
  { rank: 16, name: "권도윤", country: "한국", score: 61.9, posts: 9, comments: 20, likes: 2, bookmarks: 5, lastActivity: "2025-01-08", communityType: "판별팁", productCategory: "생활용품" },
  { rank: 17, name: "남궁민", country: "일본", score: 59.7, posts: 8, comments: 18, likes: 2, bookmarks: 4, lastActivity: "2025-01-07", communityType: "인증거래", productCategory: "건강" },
  { rank: 18, name: "서하늘", country: "미국", score: 57.6, posts: 7, comments: 16, likes: 1, bookmarks: 4, lastActivity: "2025-01-07", communityType: "Q&A", productCategory: "기타" },
  { rank: 19, name: "황지훈", country: "중국", score: 55.5, posts: 6, comments: 14, likes: 1, bookmarks: 3, lastActivity: "2025-01-06", communityType: "제품리뷰", productCategory: "패션" },
  { rank: 20, name: "고은별", country: "한국", score: 53.4, posts: 5, comments: 12, likes: 1, bookmarks: 3, lastActivity: "2025-01-06", communityType: "판별팁", productCategory: "뷰티-화장품" },
]

// 데모 데이터 삭제됨 - API에서 데이터를 가져옵니다

// 게시물 추이 데이터 (예측치 포함)
const postTrendData = [
  { month: "7월", views: 500, likes: 580, comments: 88, bookmarks: 25, viewsPredicted: null, likesPredicted: null, commentsPredicted: null, bookmarksPredicted: null },
  { month: "8월", views: 200, likes: 650, comments: 95, bookmarks: 28, viewsPredicted: null, likesPredicted: null, commentsPredicted: null, bookmarksPredicted: null },
  { month: "9월", views: 800, likes: 620, comments: 90, bookmarks: 26, viewsPredicted: null, likesPredicted: null, commentsPredicted: null, bookmarksPredicted: null },
  { month: "10월", views: 1200, likes: 720, comments: 110, bookmarks: 32, viewsPredicted: null, likesPredicted: null, commentsPredicted: null, bookmarksPredicted: null },
  { month: "11월", views: 1200, likes: 780, comments: 120, bookmarks: 35, viewsPredicted: null, likesPredicted: null, commentsPredicted: null, bookmarksPredicted: null },
  { month: "12월", views: 1500, likes: 850, comments: 135, bookmarks: 40, viewsPredicted: 1500, likesPredicted: 850, commentsPredicted: 135, bookmarksPredicted: 40 },
  { month: "1월", views: null, likes: null, comments: null, bookmarks: null, viewsPredicted: 1800, likesPredicted: 920, commentsPredicted: 150, bookmarksPredicted: 45 },
  { month: "2월", views: null, likes: null, comments: null, bookmarks: null, viewsPredicted: 1200, likesPredicted: 1000, commentsPredicted: 165, bookmarksPredicted: 50 },
  { month: "3월", views: null, likes: null, comments: null, bookmarks: null, viewsPredicted: 1800, likesPredicted: 1100, commentsPredicted: 180, bookmarksPredicted: 55 },
]

// 급상승 게시물 데이터
// Mock 데이터 제거 - API에서 가져옴
// 게시물 랭킹 데이터는 postRankingData state에서 관리

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

// 카테고리 번호를 이름으로 변환
const getCategoryName = (category?: number): string => {
  const categoryMap: Record<number, string> = {
    1: '제품리뷰',
    2: '정품리뷰',
    3: '판별팁',
    4: '인증거래',
    5: 'Q&A',
  }
  return category ? (categoryMap[category] || '기타') : '기타'
}

// Mock 데이터 제거 - API에서 가져옴
const popularPosts: any[] = []
const trendingPosts: any[] = []


export function PlatformRankingAccordions({ 
  selectedCountry = "전체"
}: { selectedCountry?: string }) {

  // 필터 상태
  const [selectedCommunity, setSelectedCommunity] = useState<string>("전체")
  const [selectedCategory, setSelectedCategory] = useState<string>("전체")
  
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

  // 커뮤니티 유저 점유율 계산 (게시물 + 댓글 + 좋아요 + 북마크)
  const calculateCommunityUserShare = (user: typeof communityUsers[0], users: typeof communityUsers, limit: number) => {
    const userTotal = user.posts + user.comments + user.likes + user.bookmarks
    const allTotal = users.slice(0, limit).reduce((sum, u) => sum + u.posts + u.comments + u.likes + u.bookmarks, 0)
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
      // API 데이터가 없을 때는 기본 데이터 사용 (fallback)
      return communityUsers
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
      country: "한국", // API에 국가 정보가 없으면 기본값
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

  // 종합 유저 언어별 점유율 계산 (일본어, 한국어, 중국어, 영어, 인도어, 베트남어, 태국어, 러시아어)
  const combinedLanguageShareData = useMemo(() => {
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
    
    // 유저 이름 기반 언어 매핑 (getUserDetailFromRankingUser 로직과 동일)
    const getUserLanguage = (name: string) => {
      const mockDetails: Record<string, string> = {
        '홍길동': 'ko',
        '이영희': 'ko',
        '박민수': 'ja',
        '최지영': 'en',
        '정수현': 'ko',
        '김철수': 'ko',
        '김민지': 'ko',
      }
      return mockDetails[name] || 'ko'
    }
    
    const languageCounts: Record<string, number> = {
      '한국어': 0,
      '일본어': 0,
      '중국어': 0,
      '영어': 0,
      '인도어': 0,
      '베트남어': 0,
      '태국어': 0,
      '러시아어': 0
    }
    
    combinedUsers.forEach(user => {
      // 유저의 언어 정보 가져오기
      const languageCode = getUserLanguage(user.name)
      const languageName = languageMap[languageCode] || '한국어'
      
      // 활동량 계산: 게시글수, 댓글수, 좋아요수, 채팅방수, 메시지수 합산
      const userActivity = user.posts + user.comments + user.likes + user.chatRooms + user.messages
      languageCounts[languageName] = (languageCounts[languageName] || 0) + userActivity
    })
    
    const total = Object.values(languageCounts).reduce((sum, val) => sum + val, 0)
    return Object.entries(languageCounts)
      .filter(([_, value]) => value > 0) // 값이 있는 언어만 표시
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
  }, [combinedUsers])

  // 종합 유저 앱별 점유율 계산
  const combinedAppShareData = useMemo(() => {
    const appCounts: Record<string, number> = {}
    combinedUsers.forEach(user => {
      // 유저의 앱 정보 가져오기 (getUserDetailFromRankingUser를 통해)
      // getUserDetailFromRankingUser는 함수이므로 실제로는 mock 데이터에서 앱 정보를 가져와야 함
      // 일단 사용자 이름 기반으로 앱을 추정하거나, 실제 데이터 구조에 맞게 수정 필요
      const getMockApp = (name: string) => {
        const mockApps: Record<string, string> = {
          '홍길동': 'HT',
          '이영희': 'COP',
          '박민수': 'Global',
          '최지영': 'HT',
          '정수현': 'COP',
          '김철수': 'HT',
          '김민지': 'Global',
        }
        return mockApps[name] || 'HT'
      }
      const app = getMockApp(user.name)
      const userActivity = user.posts + user.comments + user.likes + user.chatRooms + user.messages
      appCounts[app] = (appCounts[app] || 0) + userActivity
    })
    const total = Object.values(appCounts).reduce((sum, val) => sum + val, 0)
    return Object.entries(appCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
  }, [combinedUsers])

  // 종합 유저 커뮤니티별 활동 점유율 계산 (인증거래, 제품리뷰, 판별팁, Q&A)
  const combinedCommunityActivityShareData = useMemo(() => {
    // 각 유저의 게시물 카테고리별 활동량 계산
    // 실제로는 백엔드에서 각 유저의 카테고리별 게시물/댓글/좋아요/북마크 데이터를 가져와야 함
    // 현재는 mock 데이터로 각 유저의 전체 활동을 카테고리별로 분배
    const categoryCounts: Record<string, number> = {
      '인증거래': 0,
      '정품리뷰': 0,
      '판별팁': 0,
      'Q&A': 0
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
    return filteredPosts
      .sort((a: any, b: any) => b.totalEngagement - a.totalEngagement)
      .map((post: any, index: number) => ({
        ...post,
        rank: index + 1
      }))
  }, [filteredPosts])

  // 종합 게시물 국가별 점유율 계산
  const combinedPostCountryShareData = useMemo(() => {
    const countryCounts: Record<string, number> = {}
    combinedPosts.forEach(post => {
      const country = post.country || "기타"
      countryCounts[country] = (countryCounts[country] || 0) + post.totalEngagement
    })
    const total = Object.values(countryCounts).reduce((sum, val) => sum + val, 0)
    return Object.entries(countryCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // 상위 5개 국가만 표시
  }, [combinedPosts])

  // 종합 게시물 국가 수
  const combinedPostUniqueCountries = useMemo(() => {
    return new Set(combinedPosts.map(p => p.country || "기타")).size
  }, [combinedPosts])

  // 종합 게시물 카테고리별 점유율 계산
  const combinedPostCategoryShareData = useMemo(() => {
    const categoryCounts: Record<string, number> = {}
    combinedPosts.forEach(post => {
      const category = post.category || "기타"
      categoryCounts[category] = (categoryCounts[category] || 0) + post.totalEngagement
    })
    const total = Object.values(categoryCounts).reduce((sum, val) => sum + val, 0)
    return Object.entries(categoryCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
  }, [combinedPosts])

  // 종합 게시물 언어별 점유율 계산
  const combinedPostLanguageShareData = useMemo(() => {
    const languageCounts: Record<string, number> = {}
    
    // 게시물 작성자 이름을 기반으로 언어 추론 (mock)
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
      return '한국어' // 기본값
    }
    
    combinedPosts.forEach(post => {
      const language = getPostLanguage(post.author)
      languageCounts[language] = (languageCounts[language] || 0) + post.totalEngagement
    })
    const total = Object.values(languageCounts).reduce((sum, val) => sum + val, 0)
    return Object.entries(languageCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // 상위 8개 언어만 표시
  }, [combinedPosts])

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
  const [firstChatUserTrendData, setFirstChatUserTrendData] = useState<MonthlyTrendItem[] | null>(null)
  const [firstTrendingUserTrendData, setFirstTrendingUserTrendData] = useState<MonthlyTrendItem[] | null>(null)
  const [top5CombinedUsersTrendData, setTop5CombinedUsersTrendData] = useState<Map<number, MonthlyTrendItem[]>>(new Map())
  const [loadingTrendData, setLoadingTrendData] = useState(false)
  const [selectedPopularPost, setSelectedPopularPost] = useState<typeof filteredPopularPosts[0] | null>(null)
  const [selectedPostAuthor, setSelectedPostAuthor] = useState<any | null>(null)  // 작성자 상세 모달용
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false)
  const [isCombinedUsersModalOpen, setIsCombinedUsersModalOpen] = useState(false)  // 종합 유저 상세 모달용
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
              imageUrl: apiUserDetail.img,
              posts: selectedCombinedUser.posts || apiUserDetail.countPosts || 0,
              comments: selectedCombinedUser.comments || apiUserDetail.countComments || 0,
              likes: selectedCombinedUser.likes || apiUserDetail.countLikes || 0,
              bookmarks: selectedCombinedUser.bookmarks || apiUserDetail.countBookmarks || 0,
              chatRooms: selectedCombinedUser.chatRooms || apiUserDetail.countChats || 0,
              messages: apiUserDetail.countChatMessages || 0,
            }
            setSelectedCombinedUserDetail(enrichedUserDetail)
            // 가입일부터 현재까지의 월별 추이 데이터 변환
            const trendData = convertTrendDataToChartFormat(trendResponse.monthlyTrend || [])
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
  
  // 종합 게시물 랭킹 전체보기 모달용 state
  const [isCombinedPostsModalOpen, setIsCombinedPostsModalOpen] = useState(false)
  const [selectedCombinedPost, setSelectedCombinedPost] = useState<PostDetail | null>(null)
  const [selectedCombinedPostAuthor, setSelectedCombinedPostAuthor] = useState<UserDetail | null>(null)

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
          imageUrl: apiUserDetail.img,
          posts: user.posts || apiUserDetail.countPosts || 0,
          comments: user.comments || apiUserDetail.countComments || 0,
          likes: user.likes || apiUserDetail.countLikes || 0,
          bookmarks: user.bookmarks || apiUserDetail.countBookmarks || 0,
          chatRooms: user.chatRooms || apiUserDetail.countChats || 0,
          messages: apiUserDetail.countChatMessages || 0,
        }
        setSelectedUserDetail(enrichedUserDetail)
        // 가입일부터 현재까지의 월별 추이 데이터 변환
        const trendData = convertCombinedTrendDataToChartFormat(trendResponse.monthlyTrend || [])
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
    // 같은 유저를 다시 클릭한 경우 모달 열기
    if (selectedCommunityUser?.rank === user.rank) {
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
            imageUrl: apiUserDetail.img,
            posts: user.posts || apiUserDetail.countPosts || 0,
            comments: user.comments || apiUserDetail.countComments || 0,
            likes: user.likes || apiUserDetail.countLikes || 0,
            bookmarks: user.bookmarks || apiUserDetail.countBookmarks || 0,
            chatRooms: 0,
            messages: apiUserDetail.countChatMessages || 0,
          }
          setSelectedUserDetail(enrichedUserDetail)
          // 가입일부터 현재까지의 월별 추이 데이터 변환
          const trendData = convertTrendDataToChartFormat(trendResponse.monthlyTrend || [])
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
    // 같은 유저를 다시 클릭한 경우 모달 열기
    if (selectedChatUser?.rank === user.rank) {
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
            imageUrl: apiUserDetail.img,
            posts: 0,
            comments: 0,
            likes: 0,
            bookmarks: 0,
            chatRooms: user.chatRooms || apiUserDetail.countChats || 0,
            messages: user.messages || apiUserDetail.countChatMessages || 0,
          }
          setSelectedUserDetail(enrichedUserDetail)
          // 가입일부터 현재까지의 월별 추이 데이터 변환
          const trendData = convertChatTrendDataToChartFormat(trendResponse.monthlyTrend || [])
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
    // 같은 유저를 다시 클릭한 경우 모달 열기
    if (selectedTrendingUser?.rank === user.rank) {
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
            imageUrl: apiUserDetail.img,
            posts: user.posts || apiUserDetail.countPosts || 0,
            comments: user.comments || apiUserDetail.countComments || 0,
            likes: 0,
            bookmarks: 0,
            chatRooms: user.chatRooms || apiUserDetail.countChats || 0,
            messages: user.messages || apiUserDetail.countChatMessages || 0,
          }
          setSelectedUserDetail(enrichedUserDetail)
          // 가입일부터 현재까지의 월별 추이 데이터 변환
          const trendData = convertCombinedTrendDataToChartFormat(trendResponse.monthlyTrend || [])
          setSelectedUserTrendData(trendData)
          setIsUserDetailModalOpen(true)
        }
      } catch (error) {
        console.error('❌ 급상승 유저 상세 정보 로딩 실패:', error)
      }
    } else {
      // 다른 유저를 클릭한 경우 추이만 변경
      setSelectedTrendingUser(user)
    }
  }

  // 게시물 클릭 핸들러 (첫 클릭: 추이 변경, 두 번째 클릭: 모달 열기)
  const handlePostClick = async (post: typeof filteredPosts[0]) => {
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
          language: '한국어', // API에 언어 정보가 없으면 기본값
        createdAt: post.createdAt,
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
    }
  }

  // API에서 유저 추이 데이터를 가져와서 차트 형식으로 변환하는 함수
  const convertTrendDataToChartFormat = (trendData: MonthlyTrendItem[] | null): Array<{
    month: string
    posts: number | null
    comments: number | null
    likes: number | null
    bookmarks: number | null
    postsPredicted?: number | null
    commentsPredicted?: number | null
    likesPredicted?: number | null
    bookmarksPredicted?: number | null
    cumulative?: number | null
    predicted?: number | null
  }> => {
    if (!trendData || trendData.length === 0) {
      return []
    }
    
    // periodMonth를 기준으로 정렬 (yyyy-MM 형식)
    const sortedData = [...trendData]
      .filter(item => item.periodMonth != null)
      .sort((a, b) => {
        const dateA = a.periodMonth || ''
        const dateB = b.periodMonth || ''
        return dateA.localeCompare(dateB)
      })
    
    // 누적값 계산
    let cumulative = 0
    
    return sortedData.map(item => {
      const posts = item.countPosts ?? null
      const comments = item.countComments ?? null
      const likes = item.countLikes ?? null
      const bookmarks = item.countBookmarks ?? null
      
      // 누적값 계산
      if (posts != null || comments != null || likes != null || bookmarks != null) {
        cumulative += (posts || 0) + (comments || 0) + (likes || 0) + (bookmarks || 0)
      }
      
      // periodMonth를 "yyyy-MM" 형식으로 변환 (이미 그 형식일 수 있음)
      const month = item.periodMonth || ''
      
      return {
        month,
        posts,
        comments,
        likes,
        bookmarks,
        postsPredicted: null,
        commentsPredicted: null,
        likesPredicted: null,
        bookmarksPredicted: null,
        cumulative: cumulative > 0 ? cumulative : null,
        predicted: null
      }
    })
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
      } catch (error) {
        console.error('❌ 첫 번째 채팅 유저 추이 데이터 로딩 실패:', error)
        setFirstChatUserTrendData(null)
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
  const convertChatTrendDataToChartFormat = (trendData: MonthlyTrendItem[] | null): Array<{
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
    
    const sortedData = [...trendData]
      .filter(item => item.periodMonth != null)
      .sort((a, b) => {
        const dateA = a.periodMonth || ''
        const dateB = b.periodMonth || ''
        return dateA.localeCompare(dateB)
      })
    
    // 누적값 계산
    let cumulative = 0
    
    return sortedData.map(item => {
      const chatRooms = item.countChats ?? null
      const messages = item.countMessages ?? null
      const month = item.periodMonth || ''
      
      // 누적값 계산
      if (chatRooms != null || messages != null) {
        cumulative += (chatRooms || 0) + (messages || 0)
      }
      
      return {
        month,
        chatRooms,
        messages,
        chatRoomsPredicted: null,
        messagesPredicted: null,
        cumulative: cumulative > 0 ? cumulative : null,
        predicted: null
      }
    })
  }

  // 종합 유저용 추이 데이터 변환 함수 (커뮤니티 + 채팅 합산)
  const convertCombinedTrendDataToChartFormat = (trendData: MonthlyTrendItem[] | null): Array<{
    month: string
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
    
    const sortedData = [...trendData]
      .filter(item => item.periodMonth != null)
      .sort((a, b) => {
        const dateA = a.periodMonth || ''
        const dateB = b.periodMonth || ''
        return dateA.localeCompare(dateB)
      })
    
    // 누적값 계산
    let cumulative = 0
    
    return sortedData.map(item => {
      const month = item.periodMonth || ''
      const posts = item.countPosts ?? null
      const comments = item.countComments ?? null
      const likes = item.countLikes ?? null
      const bookmarks = item.countBookmarks ?? null
      const chatRooms = item.countChats ?? null
      const messages = item.countMessages ?? null
      
      // 누적값 계산
      if (posts != null || comments != null || likes != null || bookmarks != null || chatRooms != null || messages != null) {
        cumulative += (posts || 0) + (comments || 0) + (likes || 0) + (bookmarks || 0) + (chatRooms || 0) + (messages || 0)
      }
      
      return {
        month,
        posts,
        comments,
        likes,
        bookmarks,
        chatRooms,
        messages,
        postsPredicted: null,
        commentsPredicted: null,
        likesPredicted: null,
        bookmarksPredicted: null,
        chatRoomsPredicted: null,
        messagesPredicted: null,
        cumulative: cumulative > 0 ? cumulative : null,
        predicted: null
      }
    })
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
    const getUserLanguage = (name: string) => {
      const mockDetails: Record<string, string> = {
        '홍길동': 'ko',
        '이영희': 'ko',
        '박민수': 'ja',
        '최지영': 'en',
        '정수현': 'ko',
        '김철수': 'ko',
        '김민지': 'ko',
      }
      return mockDetails[name] || 'ko'
    }
    
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
    
    const getUserSignupApp = (user: any) => {
      // Mock: 사용자 이름 기반으로 앱 추론
      const mockApps: Record<string, string> = {
        '홍길동': 'HT',
        '이영희': 'COP',
        '박민수': 'Global',
        '최지영': 'HT',
        '정수현': 'COP',
        '김철수': 'HT',
        '김민지': 'Global',
      }
      return mockApps[user.name] || 'HT'
    }
    
    let filteredUsers = combinedUsers
    
    // 언어 필터링
    if (filteredCombinedUserLanguage !== '전체') {
      filteredUsers = filteredUsers.filter(user => {
        const languageCode = getUserLanguage(user.name)
        const languageName = languageMap[languageCode] || '한국어'
        return languageName === filteredCombinedUserLanguage
      })
    }
    
    // 가입앱 필터링
    if (filteredCombinedUserApp !== '전체') {
      filteredUsers = filteredUsers.filter(user => {
        const signupApp = getUserSignupApp(user)
        return signupApp === filteredCombinedUserApp
      })
    }
    
    return filteredUsers
  }, [combinedUsers, filteredCombinedUserLanguage, filteredCombinedUserApp])

  // 게시물용 추이 데이터 생성 함수
  const getPostTrendData = (post: typeof filteredPopularPosts[0]) => {
    const baseMultiplier = (post.views + post.likes + post.comments + post.bookmarks) / 1000
    return postTrendData.map(item => ({
      ...item,
      views: item.views ? Math.round((item.views || 0) * baseMultiplier) : null,
      viewsPredicted: item.viewsPredicted ? Math.round((item.viewsPredicted || 0) * baseMultiplier) : null,
      likes: item.likes ? Math.round((item.likes || 0) * baseMultiplier) : null,
      likesPredicted: item.likesPredicted ? Math.round((item.likesPredicted || 0) * baseMultiplier) : null,
      comments: item.comments ? Math.round((item.comments || 0) * baseMultiplier) : null,
      commentsPredicted: item.commentsPredicted ? Math.round((item.commentsPredicted || 0) * baseMultiplier) : null,
      bookmarks: item.bookmarks ? Math.round((item.bookmarks || 0) * baseMultiplier) : null,
      bookmarksPredicted: item.bookmarksPredicted ? Math.round((item.bookmarksPredicted || 0) * baseMultiplier) : null,
    }))
  }

  return (
    <section className="space-y-4">
      {/* 섹션 제목과 필터 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">랭킹 분석</h2>
        <div className="flex items-center gap-3">
          <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="커뮤니티" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              <SelectItem value="제품리뷰">제품리뷰</SelectItem>
              <SelectItem value="판별팁">판별팁</SelectItem>
              <SelectItem value="인증거래">인증거래</SelectItem>
              <SelectItem value="Q&A">Q&A</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              <SelectItem value="뷰티-화장품">뷰티-화장품</SelectItem>
              <SelectItem value="패션">패션</SelectItem>
              <SelectItem value="아동">아동</SelectItem>
              <SelectItem value="식품">식품</SelectItem>
              <SelectItem value="리빙">리빙</SelectItem>
              <SelectItem value="가전제품">가전제품</SelectItem>
              <SelectItem value="생활용품">생활용품</SelectItem>
              <SelectItem value="건강">건강</SelectItem>
              <SelectItem value="기타">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-1 lg:grid-cols-4">
        {/* 종합 유저 랭킹 */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">종합 유저 랭킹</h3>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>선택 기간 내 커뮤니티와 채팅 활동이 활발한 유저 입니다</p>
                </TooltipContent>
              </UITooltip>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCombinedUsersModalOpen(true)}
            >
              전체 보기
            </Button>
          </div>
          
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
                  />
                  <YAxis />
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
                  selectedCombinedUser?.rank === user.rank 
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
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 whitespace-nowrap">
                      상승률: {user.growthRate.toFixed(1)}%
                    </Badge>
                    </div>
                  </div>
                <div className="grid grid-cols-5 gap-2 mt-2 text-xs text-muted-foreground">
                  <div>게시글 {user.posts}</div>
                  <div>댓글 {user.comments}</div>
                  <div>좋아요 {user.likes}</div>
                  <div>채팅방 {user.chatRooms}</div>
                  <div>메시지 {user.messages}</div>
                </div>
              </div>
              ))
            )}
          </div>
        </Card>

        {/* 종합 유저 상세 모달 */}
        <Dialog open={isCombinedUsersModalOpen} onOpenChange={(open) => {
          setIsCombinedUsersModalOpen(open)
          if (!open) {
            // 모달이 닫힐 때 필터 초기화
            setFilteredCombinedUserLanguage('전체')
            setFilteredCombinedUserApp('전체')
            setSelectedCombinedUser(null)
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
                    <div className="flex items-center gap-2">
                      {/* 언어 필터 */}
                      <Select value={filteredCombinedUserLanguage} onValueChange={setFilteredCombinedUserLanguage}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="전체">전체</SelectItem>
                          <SelectItem value="한국어">한국어</SelectItem>
                          <SelectItem value="중국어">중국어</SelectItem>
                          <SelectItem value="베트남어">베트남어</SelectItem>
                          <SelectItem value="일본어">일본어</SelectItem>
                          <SelectItem value="태국어">태국어</SelectItem>
                          <SelectItem value="영어">영어</SelectItem>
                          <SelectItem value="인도어">인도어</SelectItem>
                          <SelectItem value="러시아어">러시아어</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* 가입앱 필터 */}
                      <Select value={filteredCombinedUserApp} onValueChange={setFilteredCombinedUserApp}>
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="전체">전체</SelectItem>
                          <SelectItem value="HT">HT</SelectItem>
                          <SelectItem value="COP">COP</SelectItem>
                          <SelectItem value="Global">Global</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                    {filteredCombinedUsersForModal.map((user) => (
                      <div
                        key={user.userNo || user.name || `combined-modal-${user.rank}`}
                        onClick={() => setSelectedCombinedUser(user)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all flex-shrink-0 ${
                          selectedCombinedUser?.rank === user.rank 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center p-0 shrink-0">
                              {user.rank}
                            </Badge>
                            <span className="font-medium truncate">{user.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">({user.country})</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 shrink-0">
                            상승률: {user.growthRate.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1 truncate">
                            <MessageSquare className="h-3 w-3 text-blue-500 shrink-0" />
                            <span>게시글 {user.posts}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <MessageCircle className="h-3 w-3 text-green-500 shrink-0" />
                            <span>댓글 {user.comments}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <Heart className="h-3 w-3 text-red-500 shrink-0" />
                            <span>좋아요 {user.likes}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <Users className="h-3 w-3 text-purple-500 shrink-0" />
                            <span>채팅방 {user.chatRooms}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <MessageSquare className="h-3 w-3 text-indigo-500 shrink-0" />
                            <span>메시지 {user.messages}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                                  src={selectedCombinedUserDetail.imageUrl} 
                                  alt={selectedCombinedUserDetail.nickname}
                                  className="w-full h-24 object-cover rounded-lg border"
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
                                <p className="text-sm font-bold truncate">{selectedCombinedUserDetail.id}</p>
                              </div>
                              <div className="p-2 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">이메일</p>
                                <p className="text-sm font-bold truncate">{selectedCombinedUserDetail.email}</p>
                              </div>
                              <div className="p-2 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">닉네임</p>
                                <p className="text-sm font-bold truncate">{selectedCombinedUserDetail.nickname}</p>
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
                                <p className="text-sm font-bold truncate">{selectedCombinedUserDetail.signupPath}</p>
                              </div>
                              <div className="p-2 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">OS 정보</p>
                                <p className="text-sm font-bold truncate">{selectedCombinedUserDetail.osInfo}</p>
                              </div>
                              <div className="p-2 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">가입 일자</p>
                                <p className="text-sm font-bold">{selectedCombinedUserDetail.signupDate}</p>
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
                            </div>
                          </div>

                          {/* 커뮤니티 활동 추이 */}
                          {selectedCombinedUserTrendData && selectedCombinedUserTrendData.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 추이 (월별)</h3>
                              <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                                  <ComposedChart 
                                    data={selectedCombinedUserTrendData}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
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

        {/* 커뮤니티 유저 랭킹 */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">커뮤니티 유저 랭킹</h3>
            {loading && <span className="text-xs text-muted-foreground">(로딩 중...)</span>}
          </div>
          
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
                      ? convertTrendDataToChartFormat(selectedCommunityUserTrendData)
                      : firstCommunityUserTrendData
                        ? convertTrendDataToChartFormat(firstCommunityUserTrendData)
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
                            />
                            <YAxis />
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
                  selectedCommunityUser?.rank === user.rank 
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
        </Card>

        {/* 채팅 유저 랭킹 */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">채팅 유저 랭킹</h3>
          </div>
          
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
                        return convertChatTrendDataToChartFormat(firstChatUserTrendData)
                      })()
                    : firstChatUserTrendData
                      ? convertChatTrendDataToChartFormat(firstChatUserTrendData)
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
                            />
                            <YAxis />
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
                  selectedChatUser?.rank === user.rank 
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
        </Card>

      {/* 급상승 유저 랭킹 */}
      <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-foreground">급상승 활동 유저 랭킹</h3>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>커뮤니티와 채팅 활동 상위 30% 유저 중 상승률 30% 이상 유저 입니다</p>
                </TooltipContent>
              </UITooltip>
          </div>
          
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
                  selectedTrendingUser && selectedTrendingUser.userNo
                    ? (() => {
                        // 선택된 유저의 추이 데이터는 별도 state에서 관리 필요 (추후 구현)
                        return convertCombinedTrendDataToChartFormat(firstTrendingUserTrendData)
                      })()
                    : firstTrendingUserTrendData
                      ? convertCombinedTrendDataToChartFormat(firstTrendingUserTrendData)
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
                            />
                            <YAxis />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Bar dataKey="posts" fill="#3b82f6" name="게시글" />
                            <Bar dataKey="postsPredicted" fill="#3b82f6" fillOpacity={0.3} name="게시글 (예측)" />
                            <Bar dataKey="comments" fill="#10b981" name="댓글" />
                            <Bar dataKey="commentsPredicted" fill="#10b981" fillOpacity={0.3} name="댓글 (예측)" />
                            <Bar dataKey="chatRooms" fill="#f59e0b" name="채팅방" />
                            <Bar dataKey="chatRoomsPredicted" fill="#f59e0b" fillOpacity={0.3} name="채팅방 (예측)" />
                            <Bar dataKey="messages" fill="#8b5cf6" name="메시지" />
                            <Bar dataKey="messagesPredicted" fill="#8b5cf6" fillOpacity={0.3} name="메시지 (예측)" />
                            <Line type="monotone" dataKey="cumulative" stroke="#ef4444" name="누적 추이" />
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
                  selectedTrendingUser?.rank === user.rank 
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
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 whitespace-nowrap">
                      점유율: {calculateTrendingUserShare(user, filteredTrendingUsers, 5)}%
                    </Badge>
                    
                        </div>
                        </div>
                <div className="grid grid-cols-4 gap-4 mt-2 text-xs text-muted-foreground">
                  <div>게시글 {user.posts}</div>
                  <div>댓글 {user.comments}</div>
                  <div>채팅방 {user.chatRooms}</div>
                  <div>메시지 {user.messages}</div>
                      </div>
                    </div>
              ))
            )}
                      </div>
        </Card>

        {/* 종합 게시물 랭킹 */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">종합 게시물 랭킹</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCombinedPostsModalOpen(true)}
            >
              전체 보기
            </Button>
          </div>
          
          {/* 카테고리별 요약 지표 */}
          <div className="grid grid-cols-1 gap-2 mb-4">
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1.5 font-semibold">랭킹 게시글 카테고리별 점유율</p>
              {combinedPostCategoryShareData.length > 0 ? (
                <>
                  <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={combinedPostCategoryShareData}
                          cx="50%"
                          cy="50%"
                          innerRadius={15}
                          outerRadius={30}
                          paddingAngle={1}
                          dataKey="value"
                        >
                          {combinedPostCategoryShareData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => [
                            `${props.payload.name}: ${props.payload.percentage}%`,
                            '점유율'
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {combinedPostCategoryShareData.slice(0, 5).map((item, index) => (
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
          
          {/* 게시물 그리드 */}
          <div className="grid grid-cols-1 gap-2">
            {combinedPosts.slice(0, 5).map((post, index) => (
              <div
                key={`${post.title}-${post.author}-${index}`}
                onClick={() => {
                  // 게시물 상세 정보 생성 (Mock 데이터, 실제로는 API에서 가져와야 함)
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
                    // Mock: 작성자 이름 기반으로 앱 추론
                    const user = filteredCommunityUsers.find(u => u.name === author) ||
                                filteredChatUsers.find(u => u.name === author) ||
                                filteredTrendingUsers.find(u => u.name === author) ||
                                combinedUsers.find(u => u.name === author)
                    return user ? 'HT' : 'COP'
                  }
                  const getUserNo = (author: string): string | undefined => {
                    // Mock: 작성자 이름 기반으로 user_no 추론
                    const user = filteredCommunityUsers.find(u => u.name === author) ||
                                filteredChatUsers.find(u => u.name === author) ||
                                filteredTrendingUsers.find(u => u.name === author) ||
                                combinedUsers.find(u => u.name === author)
                    return user ? `user${user.rank.toString().padStart(3, '0')}` : undefined
                  }
                  const getPostTrendData = () => {
                    const baseMultiplier = (post.views + post.likes + post.comments + post.bookmarks) / 1000
                    return postTrendData.map(item => ({
                      ...item,
                      views: item.views ? Math.round((item.views || 0) * baseMultiplier) : null,
                      viewsPredicted: item.viewsPredicted ? Math.round((item.viewsPredicted || 0) * baseMultiplier) : null,
                      likes: item.likes ? Math.round((item.likes || 0) * baseMultiplier) : null,
                      likesPredicted: item.likesPredicted ? Math.round((item.likesPredicted || 0) * baseMultiplier) : null,
                      comments: item.comments ? Math.round((item.comments || 0) * baseMultiplier) : null,
                      commentsPredicted: item.commentsPredicted ? Math.round((item.commentsPredicted || 0) * baseMultiplier) : null,
                      bookmarks: item.bookmarks ? Math.round((item.bookmarks || 0) * baseMultiplier) : null,
                      bookmarksPredicted: item.bookmarksPredicted ? Math.round((item.bookmarksPredicted || 0) * baseMultiplier) : null,
                    }))
                  }
                  
                  const postDetail: PostDetail = {
                    title: post.title,
                    imageUrl: `/placeholder.jpg`, // Mock 이미지
                    content: `${post.content}`,
                    author: post.author,
                    authorUserNo: getUserNo(post.author),
                    views: post.views,
                    comments: post.comments,
                    likes: post.likes,
                    bookmarks: post.bookmarks,
                    language: getPostLanguage(post.author),
                    createdAt: post.createdAt,
                    registeredApp: getRegisteredApp(post.author),
                    category: post.category,
                    country: post.country,
                    trendData: post.trendData || getPostTrendData()
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
                  <div>조회수 {post.views.toLocaleString()}</div>
                  <div>좋아요 {post.likes}</div>
                  <div>댓글 {post.comments}</div>
                  <div>북마크 {post.bookmarks}</div>
                    </div>
              </div>
            ))}
          </div>
        </Card>

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
              <DialogTitle className="text-xl font-bold">종합 게시물 랭킹 전체 보기</DialogTitle>
              <DialogDescription>종합 게시물 랭킹 목록과 상세 정보를 확인할 수 있습니다.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 flex flex-col mt-4 min-h-0 overflow-hidden">
              
              {/* 상단: 게시물 리스트와 상세 정보 */}
              <div className="flex-1 grid grid-cols-[1fr_30%_35%] gap-4 min-h-0 overflow-hidden">
                {/* 좌측: 게시물 리스트 */}
                <div className="flex flex-col min-w-0 min-h-0">
                  <h3 className="text-lg font-semibold mb-3 flex-shrink-0">게시물 리스트</h3>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                    {combinedPosts.map((post, index) => {
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
                      const getPostTrendData = () => {
                        const baseMultiplier = (post.views + post.likes + post.comments + post.bookmarks) / 1000
                        return postTrendData.map(item => ({
                          ...item,
                          views: item.views ? Math.round((item.views || 0) * baseMultiplier) : null,
                          viewsPredicted: item.viewsPredicted ? Math.round((item.viewsPredicted || 0) * baseMultiplier) : null,
                          likes: item.likes ? Math.round((item.likes || 0) * baseMultiplier) : null,
                          likesPredicted: item.likesPredicted ? Math.round((item.likesPredicted || 0) * baseMultiplier) : null,
                          comments: item.comments ? Math.round((item.comments || 0) * baseMultiplier) : null,
                          commentsPredicted: item.commentsPredicted ? Math.round((item.commentsPredicted || 0) * baseMultiplier) : null,
                          bookmarks: item.bookmarks ? Math.round((item.bookmarks || 0) * baseMultiplier) : null,
                          bookmarksPredicted: item.bookmarksPredicted ? Math.round((item.bookmarksPredicted || 0) * baseMultiplier) : null,
                        }))
                      }
                      
                      const postDetail: PostDetail = {
                        title: post.title,
                        imageUrl: `/placeholder.jpg`,
                        content: `${post.title}에 대한 상세 내용입니다. 실제로는 API에서 가져와야 합니다.`,
                        author: post.author,
                        authorUserNo: getUserNo(post.author),
                        views: post.views,
                        comments: post.comments,
                        likes: post.likes,
                        bookmarks: post.bookmarks,
                        language: getPostLanguage(post.author),
                        createdAt: post.createdAt,
                        registeredApp: getRegisteredApp(post.author),
                        category: post.category,
                        country: post.country,
                        trendData: getPostTrendData()
                      }
                      
                      return (
                        <div
                          key={`${post.title}-${post.author}-${index}`}
                          onClick={() => {
                            setSelectedCombinedPost(postDetail)
                            setSelectedCombinedPostAuthor(null)  // 게시물 선택 시 유저 정보 초기화
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
                                <p className="text-sm font-medium truncate">{post.title}</p>
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
                      <div className="space-y-4 pb-4">
                        {/* 제목 */}
                        <div>
                          <h2 className="text-xl font-bold mb-2">{selectedCombinedPost.title}</h2>
                        </div>
                        
                        {/* 사진 및 내용 */}
                        <div className="space-y-3">
                          <div className="w-full max-h-[300px] rounded-lg overflow-hidden border">
                            <img
                              src={selectedCombinedPost.imageUrl && !selectedCombinedPost.imageUrl.includes('placeholder')
                                ? (selectedCombinedPost.imageUrl.startsWith('http') 
                                    ? selectedCombinedPost.imageUrl 
                                    : `${API_IMG_URL}${selectedCombinedPost.imageUrl}`)
                                : '/placeholder.jpg'}
                              alt={selectedCombinedPost.title}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // 이미지 로드 실패 시 placeholder 표시
                                const target = e.target as HTMLImageElement
                                target.src = '/placeholder.jpg'
                              }}
                            />
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{selectedCombinedPost.content}</p>
                          </div>
                        </div>

                        {/* 게시물 정보 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">작성자</p>
                            <button
                              onClick={async () => {
                                if (selectedCombinedPost.authorUserNo) {
                                  const user = filteredCommunityUsers.find(u => u.name === selectedCombinedPost.author) ||
                                              filteredChatUsers.find(u => u.name === selectedCombinedPost.author) ||
                                              filteredTrendingUsers.find(u => u.name === selectedCombinedPost.author) ||
                                              combinedUsers.find(u => u.name === selectedCombinedPost.author)
                                  if (user && (user as any).userNo) {
                                    try {
                                      const userNo = (user as any).userNo
                                      
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
                                        const enrichedUserDetail: UserDetail = {
                                          id: apiUserDetail.id,
                                          nickname: apiUserDetail.nickName,
                                          signupDate: apiUserDetail.joinDate,
                                          email: apiUserDetail.email || '',
                                          language: apiUserDetail.lang || '',
                                          gender: getGenderLabel(apiUserDetail.userGender),
                                          country: apiUserDetail.userCountry || (user as any).country || '미지정',
                                          signupApp: apiUserDetail.joinApp ? getAppTypeLabel(Number(apiUserDetail.joinApp)) : '',
                                          osInfo: getOsTypeLabel(apiUserDetail.userOs),
                                          img: apiUserDetail.img,
                                          imageUrl: apiUserDetail.img,
                                          posts: (user as any).posts || apiUserDetail.countPosts || 0,
                                          comments: (user as any).comments || apiUserDetail.countComments || 0,
                                          likes: (user as any).likes || apiUserDetail.countLikes || 0,
                                          bookmarks: (user as any).bookmarks || apiUserDetail.countBookmarks || 0,
                                          chatRooms: (user as any).chatRooms || apiUserDetail.countChats || 0,
                                          messages: apiUserDetail.countChatMessages || 0,
                                        }
                                        setSelectedCombinedPostAuthor(enrichedUserDetail)
                                      }
                                    } catch (error) {
                                      console.error('❌ 게시물 작성자 상세 정보 로딩 실패:', error)
                                    }
                                  }
                                }
                              }}
                              className="text-sm font-bold hover:text-primary hover:underline"
                            >
                              {selectedCombinedPost.author}
                            </button>
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
                    {selectedCombinedPostAuthor ? (
                      <div className="space-y-6 pb-4">
                        {/* 기본 정보 */}
                        <div className="grid grid-cols-6 gap-3">
                          <div className="col-span-1">
                            {selectedCombinedPostAuthor.imageUrl ? (
                              <img 
                                src={selectedCombinedPostAuthor.imageUrl} 
                                alt={selectedCombinedPostAuthor.nickname}
                                className="w-full h-24 object-cover rounded-lg border"
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
                          <div className="grid grid-cols-5 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                <p className="text-sm text-muted-foreground">게시글 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedPostAuthor.posts || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="h-4 w-4 text-green-500" />
                                <p className="text-sm text-muted-foreground">댓글 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedPostAuthor.comments || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                <p className="text-sm text-muted-foreground">좋아요 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedPostAuthor.likes || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Bookmark className="h-4 w-4 text-purple-500" />
                                <p className="text-sm text-muted-foreground">북마크 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedPostAuthor.bookmarks || 0}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-indigo-500" />
                                <p className="text-sm text-muted-foreground">채팅방 수</p>
                              </div>
                              <p className="text-2xl font-bold">{selectedCombinedPostAuthor.chatRooms || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* 커뮤니티 활동 추이 */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 추이 (월별)</h3>
                          <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart 
                                data={selectedCombinedPostAuthor ? convertTrendDataToChartFormat([]) : []}
                              >
                            <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                            <YAxis />
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
                    <div className="w-full max-h-[400px] rounded-lg overflow-hidden border">
                      <img
                        src={selectedPostDetail.imageUrl && !selectedPostDetail.imageUrl.includes('placeholder')
                          ? (selectedPostDetail.imageUrl.startsWith('http') 
                              ? selectedPostDetail.imageUrl 
                              : `${API_IMG_URL}${selectedPostDetail.imageUrl}`)
                          : '/placeholder.jpg'}
                        alt={selectedPostDetail.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // 이미지 로드 실패 시 placeholder 표시
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.jpg'
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
                      <button
                        onClick={async () => {
                          if (selectedPostDetail.authorUserNo) {
                            const user = filteredCommunityUsers.find(u => u.name === selectedPostDetail.author) ||
                                        filteredChatUsers.find(u => u.name === selectedPostDetail.author) ||
                                        filteredTrendingUsers.find(u => u.name === selectedPostDetail.author) ||
                                        combinedUsers.find(u => u.name === selectedPostDetail.author)
                            if (user && (user as any).userNo) {
                              try {
                                const userNo = (user as any).userNo
                                
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
                                  const enrichedUserDetail: UserDetail = {
                                    id: apiUserDetail.id,
                                    nickname: apiUserDetail.nickName,
                                    signupDate: apiUserDetail.joinDate,
                                    email: apiUserDetail.email || '',
                                    language: apiUserDetail.lang || '',
                                    gender: getGenderLabel(apiUserDetail.userGender),
                                    country: apiUserDetail.userCountry || (user as any).country || '미지정',
                                    signupApp: apiUserDetail.joinApp ? getAppTypeLabel(Number(apiUserDetail.joinApp)) : '',
                                    osInfo: getOsTypeLabel(apiUserDetail.userOs),
                                    img: apiUserDetail.img,
                                    imageUrl: apiUserDetail.img,
                                    posts: (user as any).posts || apiUserDetail.countPosts || 0,
                                    comments: (user as any).comments || apiUserDetail.countComments || 0,
                                    likes: (user as any).likes || apiUserDetail.countLikes || 0,
                                    bookmarks: (user as any).bookmarks || apiUserDetail.countBookmarks || 0,
                                    chatRooms: (user as any).chatRooms || apiUserDetail.countChats || 0,
                                    messages: apiUserDetail.countChatMessages || 0,
                                  }
                                  setSelectedPostDetailAuthor(enrichedUserDetail)
                                }
                              } catch (error) {
                                console.error('❌ 게시물 작성자 상세 정보 로딩 실패:', error)
                              }
                            }
                          }
                        }}
                        className="text-sm font-bold hover:text-primary hover:underline"
                      >
                        {selectedPostDetail.author}
                      </button>
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
                          {selectedPostDetailAuthor.imageUrl ? (
                            <img 
                              src={selectedPostDetailAuthor.imageUrl} 
                              alt={selectedPostDetailAuthor.nickname}
                              className="w-full h-24 object-cover rounded-lg border"
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
                        <div className="grid grid-cols-5 gap-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                              <p className="text-sm text-muted-foreground">게시글 수</p>
                        </div>
                            <p className="text-2xl font-bold">{selectedPostDetailAuthor.posts || 0}</p>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-4 w-4 text-green-500" />
                              <p className="text-sm text-muted-foreground">댓글 수</p>
                        </div>
                            <p className="text-2xl font-bold">{selectedPostDetailAuthor.comments || 0}</p>
                        </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="h-4 w-4 text-red-500" />
                              <p className="text-sm text-muted-foreground">좋아요 수</p>
                        </div>
                            <p className="text-2xl font-bold">{selectedPostDetailAuthor.likes || 0}</p>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Bookmark className="h-4 w-4 text-purple-500" />
                              <p className="text-sm text-muted-foreground">북마크 수</p>
                            </div>
                            <p className="text-2xl font-bold">{selectedPostDetailAuthor.bookmarks || 0}</p>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-indigo-500" />
                              <p className="text-sm text-muted-foreground">채팅방 수</p>
                            </div>
                            <p className="text-2xl font-bold">{selectedPostDetailAuthor.chatRooms || 0}</p>
                          </div>
                      </div>
                    </div>
                    
                      {/* 커뮤니티 활동 추이 */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 추이 (월별)</h3>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart 
                              data={selectedPostDetailAuthor ? convertTrendDataToChartFormat([]) : []}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
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
                  </div>
                ) : (
                  <div className="flex flex-col overflow-y-auto min-h-0 border-l pl-4">
                    <div className="flex-shrink-0 mb-4">
                      <h3 className="text-lg font-bold">유저 상세 정보</h3>
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
        <div className="lg:col-span-1">
          <Card className="p-4 bg-card border-border h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground"> 게시물 랭킹</h3>
          </div>
          
          {/* 통합 추이 그래프 */}
          <div className="mb-4 space-y-2">
            <h4 className="font-semibold text-sm">
              {selectedPopularPost 
                ? `${selectedPopularPost.title} - 게시물 추이` 
                : popularPosts.length > 0 
                  ? `${popularPosts[0].title} - 게시물 추이`
                  : '게시물 추이'}
            </h4>
            <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={
                  selectedPopularPost 
                    ? getPostTrendData(selectedPopularPost) 
                    : filteredPopularPosts.length > 0 
                      ? getPostTrendData(filteredPopularPosts[0])
                      : postTrendData
                }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Bar dataKey="likes" fill="#ef4444" name="좋아요" />
                            <Bar dataKey="likesPredicted" fill="#ef4444" fillOpacity={0.3} name="좋아요 (예측)" />
                            <Bar dataKey="comments" fill="#10b981" name="댓글" />
                            <Bar dataKey="commentsPredicted" fill="#10b981" fillOpacity={0.3} name="댓글 (예측)" />
                            <Bar dataKey="bookmarks" fill="#8b5cf6" name="북마크" />
                            <Bar dataKey="bookmarksPredicted" fill="#8b5cf6" fillOpacity={0.3} name="북마크 (예측)" />
                            <Line type="monotone" dataKey="views" stroke="#3b82f6" name="조회수" />
                            <Line type="monotone" dataKey="viewsPredicted" stroke="#3b82f6" strokeDasharray="5 5" name="조회수 (예측)" />
                            <Legend content={<CustomLegend />} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                        </div>

          {/* 게시물 리스트 */}
          <div className="grid grid-cols-1 gap-2">
            {filteredPopularPosts.slice(0, 5).map((post, index) => (
              <div
                key={`${post.title}-${post.author}-${index}`}
                onClick={() => handlePostClick(post)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedPopularPost?.rank === post.rank 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
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
                    <Badge variant="outline" className="hidden md:flex text-xs bg-purple-50 text-purple-700 border-purple-200 whitespace-nowrap">
                      점유율: {calculatePostShare(post, filteredPopularPosts, 5)}%
                    </Badge>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {post.category}
                      </Badge>
                      </div>
                    </div>
                <div className="grid grid-cols-4 gap-4 mt-2 text-xs text-muted-foreground">
                  <div>조회수 {post.views.toLocaleString()}</div>
                  <div>좋아요 {post.likes}</div>
                  <div>댓글 {post.comments}</div>
                  <div>북마크 {post.bookmarks}</div>
                  </div>
              </div>
            ))}
          </div>
        </Card>
        </div>

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
                    <p className="text-sm text-muted-foreground mb-1">유저명</p>
                    <p className="text-lg font-bold">{selectedPostAuthor.name}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">국가</p>
                    <p className="text-lg font-bold">{selectedPostAuthor.country || "미지정"}</p>
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
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart 
                        data={selectedPostAuthor ? convertTrendDataToChartFormat([]) : []}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
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

        {/* 급상승 게시물 랭킹 */}
        {/* <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-foreground">급상승 게시물</h3>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {filteredTrendingPosts.slice(0, 5).map((post, index) => (
              <AccordionItem key={post.postId || `${post.title}-${post.author}-${index}`} value={`trending-${post.rank || index}`}>
                <AccordionTrigger className="hover:no-underline overflow-hidden">
                  <div className="flex items-center justify-between w-full pr-4 gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0 shrink-0">
                        {post.rank}
                      </Badge>
                      <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        <span className="text-xs text-muted-foreground truncate">{post.author}</span>
                          </div>
                      </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <Badge variant="outline" className="hidden md:flex text-xs bg-purple-50 text-purple-700 border-purple-200 whitespace-nowrap">
                        {calculatePostShare(post, filteredTrendingPosts, 5)}%
                      </Badge>
                      <span className="text-red-500 font-semibold whitespace-nowrap">급상승 {post.trendScore}%</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">조회수: {post.views.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">게시물 추이</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={post.trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Bar dataKey="likes" fill="#ef4444" name="좋아요" />
                            <Bar dataKey="likesPredicted" fill="#ef4444" fillOpacity={0.3} name="좋아요 (예측)" />
                            <Bar dataKey="comments" fill="#10b981" name="댓글" />
                            <Bar dataKey="commentsPredicted" fill="#10b981" fillOpacity={0.3} name="댓글 (예측)" />
                            <Bar dataKey="bookmarks" fill="#8b5cf6" name="북마크" />
                            <Bar dataKey="bookmarksPredicted" fill="#8b5cf6" fillOpacity={0.3} name="북마크 (예측)" />
                            <Line type="monotone" dataKey="views" stroke="#3b82f6" name="조회수" />
                            <Line type="monotone" dataKey="viewsPredicted" stroke="#3b82f6" strokeDasharray="5 5" name="조회수 (예측)" />
                            <Legend content={<CustomLegend />} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>좋아요 {post.likes}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-green-500" />
                          <span>댓글 {post.comments}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bookmark className="h-4 w-4 text-purple-500" />
                          <span>북마크 {post.bookmarks}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      작성일: {post.createdAt}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card> */}

        {/* 커스텀 유저 검색 */}
        <div className="lg:col-span-2">
          <CustomUserSearch />
        </div>
      </div>

    </section>
  )
}

