"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { format } from "date-fns"
import { TrendingUp, TrendingDown, Users, Activity, AlertTriangle, MessageSquare, MessageCircle, Heart, Bookmark, Search } from "lucide-react"
import { UserDetailModal, UserDetail } from "@/components/platform/common/user-detail-modal"
import { fetchUserDetailTrend, formatDateForAPI, getTodayDateString, fetchCustomUserStatistics, fetchCustomUserList, getJoinTypeCode, getJoinTypeLabel, getLanguageCode } from "@/lib/api"
import { getAppTypeLabel, getOsTypeLabel, getGenderLabel, APP_TYPE_MAP } from "@/lib/type-mappings"

// Mock 사용자 데이터 (실사용 시 API 연동)
interface User {
  id: string
  name: string
  country: string
  app: 'HT' | 'COP' | 'Global'
  language: string
  joinDate: string
  signupPath?: string // 가입 경로 추가
  posts: number
  comments: number
  likes: number
  bookmarks: number
  chatRooms: number
  chatMessages: number
  lastActivity: string
  trend: 'up' | 'down' | 'stable'
  volatility: number
  isMember?: boolean // 선택적 필드로 유지 (mockUsers 호환성)
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const mockUsers: User[] = [
  { id: 'u001', name: '홍길동', country: '한국', app: 'HT', language: 'ko', joinDate: '2025-01-05', signupPath: '이메일', posts: 45, comments: 120, likes: 32, bookmarks: 28, chatRooms: 5, chatMessages: 150, lastActivity: '2025-01-15', trend: 'up', volatility: 15.2 },
  { id: 'u002', name: '이영희', country: '일본', app: 'COP', language: 'ja', joinDate: '2025-01-03', signupPath: '구글', isMember: true, posts: 38, comments: 95, likes: 25, bookmarks: 22, chatRooms: 8, chatMessages: 180, lastActivity: '2025-01-15', trend: 'up', volatility: 12.5 },
  { id: 'u003', name: '박민수', country: '미국', app: 'Global', language: 'en', joinDate: '2024-12-28', signupPath: '네이버', isMember: true, posts: 32, comments: 88, likes: 18, bookmarks: 19, chatRooms: 3, chatMessages: 45, lastActivity: '2025-01-14', trend: 'stable', volatility: 8.3 },
  { id: 'u004', name: '최지영', country: '한국', app: 'Global', language: 'ko', joinDate: '2024-12-30', signupPath: '카카오', isMember: true, posts: 28, comments: 75, likes: 15, bookmarks: 16, chatRooms: 6, chatMessages: 120, lastActivity: '2025-01-14', trend: 'down', volatility: 20.1 },
  { id: 'u005', name: '정수현', country: '일본', app: 'HT', language: 'ja', joinDate: '2025-01-10', signupPath: '페이스북', isMember: true, posts: 25, comments: 65, likes: 12, bookmarks: 14, chatRooms: 4, chatMessages: 80, lastActivity: '2025-01-13', trend: 'up', volatility: 18.7 },
  { id: 'u006', name: '강민호', country: '기타', app: 'COP', language: 'vi', joinDate: '2024-12-20', signupPath: '애플', isMember: true, posts: 22, comments: 58, likes: 10, bookmarks: 12, chatRooms: 2, chatMessages: 35, lastActivity: '2025-01-13', trend: 'up', volatility: 22.3 },
  { id: 'u007', name: '임동현', country: '미국', app: 'HT', language: 'en', joinDate: '2025-01-08', signupPath: '위팟', isMember: true, posts: 18, comments: 48, likes: 8, bookmarks: 10, chatRooms: 1, chatMessages: 20, lastActivity: '2025-01-12', trend: 'stable', volatility: 10.5 },
  { id: 'u008', name: '윤서연', country: '한국', app: 'COP', language: 'ko', joinDate: '2024-11-15', signupPath: '라인', isMember: true, posts: 16, comments: 42, likes: 6, bookmarks: 9, chatRooms: 0, chatMessages: 0, lastActivity: '2025-01-11', trend: 'down', volatility: 25.8 },
  { id: 'u009', name: '조은지', country: '일본', app: 'Global', language: 'ja', joinDate: '2025-01-01', signupPath: '이메일', isMember: true, posts: 10, comments: 30, likes: 5, bookmarks: 8, chatRooms: 1, chatMessages: 15, lastActivity: '2025-01-10', trend: 'up', volatility: 14.2 },
  { id: 'u010', name: '송준호', country: '한국', app: 'HT', language: 'ko', joinDate: '2024-10-20', signupPath: '구글', isMember: true, posts: 5, comments: 12, likes: 2, bookmarks: 3, chatRooms: 0, chatMessages: 0, lastActivity: '2025-01-09', trend: 'down', volatility: 30.5 },
  { id: 'u011', name: '한지우', country: '중국', app: 'COP', language: 'zh', joinDate: '2024-12-10', signupPath: '네이버', isMember: true, posts: 55, comments: 180, likes: 45, bookmarks: 35, chatRooms: 12, chatMessages: 250, lastActivity: '2025-01-15', trend: 'up', volatility: 12.8 },
  { id: 'u012', name: '백승현', country: '베트남', app: 'Global', language: 'vi', joinDate: '2024-11-25', signupPath: '카카오', isMember: true, posts: 0, comments: 0, likes: 0, bookmarks: 0, chatRooms: 0, chatMessages: 0, lastActivity: '2024-11-25', trend: 'stable', volatility: 0 },
  { id: 'u013', name: '신유진', country: '한국', app: 'HT', language: 'ko', joinDate: '2024-09-15', signupPath: '페이스북', isMember: true, posts: 0, comments: 0, likes: 0, bookmarks: 0, chatRooms: 0, chatMessages: 0, lastActivity: '2024-09-20', trend: 'stable', volatility: 0 },
  { id: 'u014', name: '강민호', country: '기타', app: 'COP', language: 'vi', joinDate: '2024-12-20', signupPath: '애플', isMember: true, posts: 22, comments: 58, likes: 10, bookmarks: 12, chatRooms: 2, chatMessages: 35, lastActivity: '2025-01-13', trend: 'up', volatility: 22.3 },
  { id: 'u015', name: '임동현', country: '미국', app: 'HT', language: 'en', joinDate: '2025-01-08', signupPath: '위팟', isMember: true, posts: 18, comments: 48, likes: 8, bookmarks: 10, chatRooms: 1, chatMessages: 20, lastActivity: '2025-01-12', trend: 'stable', volatility: 10.5 },
  { id: 'u016', name: '윤서연', country: '한국', app: 'COP', language: 'ko', joinDate: '2024-11-15', signupPath: '라인', isMember: true, posts: 16, comments: 42, likes: 6, bookmarks: 9, chatRooms: 0, chatMessages: 0, lastActivity: '2025-01-11', trend: 'down', volatility: 25.8 },
  { id: 'u017', name: '조은지', country: '일본', app: 'Global', language: 'ja', joinDate: '2025-01-01', signupPath: '이메일', isMember: true, posts: 10, comments: 30, likes: 5, bookmarks: 8, chatRooms: 1, chatMessages: 15, lastActivity: '2025-01-10', trend: 'up', volatility: 14.2 },
  { id: 'u018', name: '송준호', country: '한국', app: 'HT', language: 'ko', joinDate: '2024-10-20', signupPath: '구글', isMember: true, posts: 5, comments: 12, likes: 2, bookmarks: 3, chatRooms: 0, chatMessages: 0, lastActivity: '2025-01-09', trend: 'down', volatility: 30.5 },
  { id: 'u019', name: '한지우', country: '중국', app: 'COP', language: 'zh', joinDate: '2024-12-10', signupPath: '네이버', isMember: true, posts: 55, comments: 180, likes: 45, bookmarks: 35, chatRooms: 12, chatMessages: 250, lastActivity: '2025-01-15', trend: 'up', volatility: 12.8 },
  { id: 'u020', name: '백승현', country: '베트남', app: 'Global', language: 'vi', joinDate: '2024-11-25', signupPath: '카카오', isMember: true, posts: 0, comments: 0, likes: 0, bookmarks: 0, chatRooms: 0, chatMessages: 0, lastActivity: '2024-11-25', trend: 'stable', volatility: 0 },
  { id: 'u021', name: '신유진', country: '한국', app: 'HT', language: 'ko', joinDate: '2024-09-15', signupPath: '페이스북', isMember: true, posts: 0, comments: 0, likes: 0, bookmarks: 0, chatRooms: 0, chatMessages: 0, lastActivity: '2024-09-20', trend: 'stable', volatility: 0 },
]

export function CustomUserSearch() {
  // 사용자 그룹 정의
  const [joinDateStart, setJoinDateStart] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 기본값: 최근 30일
  const [joinDateEnd, setJoinDateEnd] = useState<Date | null>(null) // null이면 현재까지
  const [selectedSignupPath, setSelectedSignupPath] = useState<string>('전체')
  
  // 활동 지표 정의
  const [activityDateMode, setActivityDateMode] = useState<'동일하게' | '직접설정'>('직접설정') // 기본값: 직접설정 (날짜 입력 필드 표시)
  const [activityDateStart, setActivityDateStart] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 기본값: 최근 30일
  const [activityDateEnd, setActivityDateEnd] = useState<Date | null>(new Date()) // 기본값: 현재 날짜
  const [activityMetric, setActivityMetric] = useState<'활동'|'유령'>('활동')
  
  // 유저 랭킹 정렬 옵션
  const [userRankingSort, setUserRankingSort] = useState<'전체' | '게시글' | '댓글' | '좋아요' | '북마크' | '채팅방'>('전체')
  
  // 필터 상태 (기존 유지 - 언어 등)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  
  // 검색 상태
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  
  // API 응답 데이터 상태
  const [apiUserList, setApiUserList] = useState<User[]>([])
  const [apiStatistics, setApiStatistics] = useState<any>(null)
  
  // 유저 상세 모달 관련 state
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false)
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetail | null>(null)
  const [selectedUserTrendData, setSelectedUserTrendData] = useState<Array<{
    month: string
    posts: number | null
    postsPredicted?: number | null
    comments: number | null
    commentsPredicted?: number | null
    likes: number | null
    likesPredicted?: number | null
    bookmarks?: number | null
    bookmarksPredicted?: number | null
    chatRooms?: number | null
    chatRoomsPredicted?: number | null
    messages?: number | null
    messagesPredicted?: number | null
  }> | null>(null)
  
  // 유저 클릭 핸들러
  const handleUserClick = async (user: User) => {
    try {
      // userNo 추출 (API 응답에서 직접 가져오거나, id에서 추출)
      let userNo: number | undefined = (user as any).userNo
      
      // userNo가 없으면 id에서 추출 시도
      if (!userNo) {
        // id 형식: "user-76570" 또는 "u001"
        const idMatch = user.id.match(/(\d+)$/)
        if (idMatch) {
          userNo = parseInt(idMatch[1], 10)
        } else {
          // "u001" 형식 처리
          const uMatch = user.id.match(/u(\d+)/)
          if (uMatch) {
            userNo = parseInt(uMatch[1], 10)
          }
        }
      }
      
      if (!userNo || isNaN(userNo)) {
        console.error('userNo를 찾을 수 없습니다:', user)
        return
      }
      
      // 먼저 기본 날짜로 API를 호출하여 joinDate를 가져옴
      // 활동 지표 정의의 조회 날짜를 사용
      let activityStartDate: Date
      let activityEndDate: Date
      
      if (activityDateMode === '동일하게') {
        // 사용자 그룹 조회기간과 동일하게
        activityStartDate = joinDateStart
        activityEndDate = joinDateEnd || new Date() // 종료일이 없으면 현재 날짜
      } else {
        // 직접 설정
        activityStartDate = activityDateStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        activityEndDate = activityDateEnd || new Date() // 종료일이 없으면 현재 날짜
      }
      
      const startDateStr = formatDateForAPI(activityStartDate)
      const endDateStr = formatDateForAPI(activityEndDate)
      const initialResponse = await fetchUserDetailTrend(startDateStr, endDateStr, userNo)
      
      if (!initialResponse.userDetail) {
        console.error('❌ [유저상세] userDetail이 없습니다. 응답:', initialResponse)
        return
      }
      
      // joinDate를 startDate로, 현재 날짜를 endDate로 설정
      const userJoinDate = initialResponse.userDetail.joinDate
      const currentDateStr = getTodayDateString()
      
      // joinDate를 YYYY-MM-DD 형식으로 변환
      let userStartDateStr: string
      if (userJoinDate) {
        try {
          const joinDateObj = new Date(userJoinDate)
          const year = joinDateObj.getFullYear()
          const month = String(joinDateObj.getMonth() + 1).padStart(2, '0')
          const day = String(joinDateObj.getDate()).padStart(2, '0')
          userStartDateStr = `${year}-${month}-${day}`
        } catch (error) {
          console.warn('⚠️ [유저상세] joinDate 파싱 실패, 기본 startDate 사용:', userJoinDate)
          userStartDateStr = startDateStr
        }
      } else {
        console.warn('⚠️ [유저상세] joinDate가 없어 기본 startDate 사용')
        userStartDateStr = startDateStr
      }
      
      console.log('🔍 [유저상세] API 호출 시작:', { 
        userNo, 
        userStartDateStr, 
        currentDateStr,
        joinDate: userJoinDate
      })
      
      // joinDate부터 현재 날짜까지의 데이터로 다시 API 호출
      const response = await fetchUserDetailTrend(userStartDateStr, currentDateStr, userNo)
      
      if (response.userDetail) {
        const apiUserDetail = response.userDetail
        // API 응답의 userDetail을 UserDetail 형식으로 변환
        const enrichedUserDetail: UserDetail = {
          id: apiUserDetail.id,
          nickname: apiUserDetail.nickName,
          signupDate: apiUserDetail.joinDate,
          email: apiUserDetail.email || apiUserDetail.id,
          language: apiUserDetail.lang || '',
          gender: getGenderLabel(apiUserDetail.userGender),
          country: apiUserDetail.userCountry || '',
          signupApp: apiUserDetail.joinApp ? getAppTypeLabel(Number(apiUserDetail.joinApp)) : '',
          osInfo: getOsTypeLabel(apiUserDetail.userOs),
          img: apiUserDetail.img,
          posts: apiUserDetail.countPosts || 0,
          comments: apiUserDetail.countComments || 0,
          likes: apiUserDetail.countLikes || 0,
          bookmarks: apiUserDetail.countBookmarks || 0,
          chatRooms: apiUserDetail.countChats || 0,
          messages: apiUserDetail.countMessages || 0,
        }
        setSelectedUserDetail(enrichedUserDetail)
        
        // forecast 데이터를 Map으로 변환 (periodMonth별 predicted 매핑)
        const forecastMap = new Map<string, number>()
        if (response.forecast && response.forecast.length > 0) {
          response.forecast.forEach((item) => {
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
        
        // monthlyTrend 데이터를 차트 형식으로 변환
        if (response.monthlyTrend && response.monthlyTrend.length > 0) {
          const chartData = response.monthlyTrend
            .map((item, index) => {
              // periodMonth가 null이거나 빈 문자열인 경우 스킵
              if (!item.periodMonth || item.periodMonth === '') {
                return null
              }
              
              try {
                const periodMonth = item.periodMonth
                const [year, month] = periodMonth.split('-')
                if (!year || !month) {
                  return null
                }
                
                // forecast에서 예측값 가져오기
                const predictedTotal = forecastMap.get(periodMonth) || null
                
                return {
                  month: `${year}년 ${parseInt(month)}월`,
                  periodMonth: periodMonth, // 원본 periodMonth 유지 (forecast 매칭용)
                  posts: item.countPosts ?? 0,
                  postsPredicted: null,
                  comments: item.countComments ?? item.countryComments ?? 0,
                  commentsPredicted: null,
                  likes: item.countLikes ?? 0,
                  likesPredicted: null,
                  bookmarks: item.countBookmarks ?? 0,
                  bookmarksPredicted: null,
                  chatRooms: item.countChats ?? 0,
                  chatRoomsPredicted: null,
                  messages: item.countMessages ?? 0,
                  messagesPredicted: null,
                  cumulative: null,
                  predicted: predictedTotal,
                }
              } catch (error) {
                return null
              }
            })
            .filter(item => item !== null) // null 항목 제거
          
          // forecast에만 있고 기존 데이터에 없는 기간 추가
          forecastMap.forEach((predicted, date) => {
            const exists = chartData.some(item => {
              const itemPeriod = (item as any).periodMonth || ''
              return itemPeriod === date
            })
            if (!exists) {
              // YYYY-MM을 X년 X월 형식으로 변환
              const [year, month] = date.split('-')
              const monthNum = parseInt(month, 10)
              chartData.push({
                month: `${year}년 ${monthNum}월`,
                periodMonth: date,
                posts: 0,
                postsPredicted: null,
                comments: 0,
                commentsPredicted: null,
                likes: 0,
                likesPredicted: null,
                bookmarks: 0,
                bookmarksPredicted: null,
                chatRooms: 0,
                chatRoomsPredicted: null,
                messages: 0,
                messagesPredicted: null,
                cumulative: null,
                predicted: predicted,
              } as any)
            }
          })
          
          // 다시 정렬
          chartData.sort((a, b) => {
            const aPeriod = (a as any).periodMonth || a.month
            const bPeriod = (b as any).periodMonth || b.month
            return aPeriod.localeCompare(bPeriod)
          })
          
          setSelectedUserTrendData(chartData)
        } else {
          setSelectedUserTrendData([])
        }
        
        setIsUserDetailModalOpen(true)
      }
    } catch (error) {
      console.error('유저 상세 정보를 가져오는 중 오류 발생:', error)
    }
  }
  const languageOptions = [
    { label: '한국어', value: 'ko' },
    { label: '중국어', value: 'zh' },
    { label: '베트남어', value: 'vi' },
    { label: '태국어', value: 'th' },
    { label: '영어', value: 'en' },
    { label: '인도어', value: 'hi' },
    { label: '러시아어', value: 'ru' },
  ]

  // 언어 코드를 언어명으로 변환하는 매핑
  const languageCodeToName: Record<string, string> = {
    'ko': '한국어',
    'zh': '중국어',
    'cn': '중국어',
    'vi': '베트남어',
    'th': '태국어',
    'en': '영어',
    'hi': '인도어',
    'ru': '러시아어',
    'ja': '일본어',
    'jp': '일본어',
  }

  // 언어 다중 선택 핸들러
  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    )
  }

  // 가입 경로 옵션
  const signupPathOptions = [
    { label: '전체', value: '전체' },
    { label: '이메일', value: '이메일' },
    { label: '구글', value: '구글' },
    { label: '네이버', value: '네이버' },
    { label: '카카오', value: '카카오' },
    { label: '페이스북', value: '페이스북' },
    { label: '애플', value: '애플' },
    { label: '위팟', value: '위팟' },
    { label: '라인', value: '라인' },
  ]

  // 필수값 검증
  const validateRequiredFields = (): boolean => {
    setSearchError(null)
    
    // 가입기간 필수 체크
    if (!joinDateStart) {
      setSearchError('⚠️ 가입기간 시작일을 입력해주세요. (필수 항목)')
      return false
    }
    
    // 조회 날짜 필수 체크 (체크박스가 체크되지 않았을 때만)
    if (activityDateMode === '직접설정') {
      if (!activityDateStart) {
        setSearchError('⚠️ 조회 시작일을 입력해주세요. (필수 항목)')
        return false
      }
      if (!activityDateEnd) {
        setSearchError('⚠️ 조회 종료일을 입력해주세요. (필수 항목)')
        return false
      }
      if (activityDateStart > activityDateEnd) {
        setSearchError('조회 시작일이 종료일보다 늦을 수 없습니다.')
        return false
      }
    }
    
    // 가입기간 종료일이 시작일보다 늦어야 함
    if (joinDateEnd && joinDateStart > joinDateEnd) {
      setSearchError('가입 시작일이 종료일보다 늦을 수 없습니다.')
      return false
    }
    
    return true
  }

  // 검색 API 호출
  const handleSearch = async () => {
    if (!validateRequiredFields()) {
      return
    }
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      // 종료일이 없으면 현재 날짜로 자동 설정
      const effectiveJoinDateEnd = joinDateEnd || new Date()
      
      // 활동 조회 날짜 계산 (필수) - 항상 사용자 가입기간과 동일하게 설정
      let activityStartDate: Date
      let activityEndDate: Date
      
      // 사용자 가입기간과 동일하게 설정
      activityStartDate = joinDateStart
      activityEndDate = effectiveJoinDateEnd
      
      // 활동 기간 state도 동기화 (UI 업데이트)
      setActivityDateStart(joinDateStart)
      setActivityDateEnd(effectiveJoinDateEnd)
      
      // API 호출 파라미터 구성
      const baseParams: {
        activity_start_date: string
        activity_end_date: string
        start_join_filter_date: string
        end_join_filter_date?: string
        join_types?: number
        user_lang?: string
      } = {
        activity_start_date: formatDateForAPI(activityStartDate),
        activity_end_date: formatDateForAPI(activityEndDate),
        start_join_filter_date: formatDateForAPI(joinDateStart),
        end_join_filter_date: formatDateForAPI(effectiveJoinDateEnd),
      }
      
      // 가입 경로 매핑 (필수 아님)
      if (selectedSignupPath !== '전체') {
        const joinTypeCode = getJoinTypeCode(selectedSignupPath)
        if (joinTypeCode !== null) {
          baseParams.join_types = joinTypeCode
        }
      }
      
      // 언어 매핑 (필수 아님, 첫 번째 선택된 언어만 사용)
      if (selectedLanguages.length > 0) {
        const languageCode = getLanguageCode(selectedLanguages[0])
        if (languageCode) {
          baseParams.user_lang = languageCode
        }
      }
      
      console.log('🔍 [커스텀 유저 검색] API 호출 파라미터:', baseParams)
      
      // 두 API 동시 호출
      const [statisticsResponse, userListResponse] = await Promise.all([
        fetchCustomUserStatistics(baseParams),
        fetchCustomUserList({ ...baseParams })
      ])
      
      console.log('✅ [커스텀 유저 검색] 통계 응답:', statisticsResponse)
      console.log('✅ [커스텀 유저 검색] 유저 리스트 응답:', userListResponse)
      
      // 통계 데이터 저장
      setApiStatistics(statisticsResponse)
      
      // 유저 리스트 데이터 변환 및 저장
      if (userListResponse.userList && Array.isArray(userListResponse.userList)) {
        const convertedUsers: User[] = userListResponse.userList.map((item) => {
          // signupDate를 YYYY-MM-DD 형식으로 변환
          let joinDateStr = ''
          if (item.signupDate) {
            try {
              const date = new Date(item.signupDate)
              joinDateStr = date.toISOString().split('T')[0]
            } catch (e) {
              joinDateStr = new Date().toISOString().split('T')[0]
            }
          } else {
            joinDateStr = new Date().toISOString().split('T')[0]
          }
          
          // joinApp을 앱 타입으로 변환
          let appValue: 'HT' | 'COP' | 'Global' = 'HT'
          if (item.joinApp !== undefined) {
            const appType = APP_TYPE_MAP[item.joinApp] || 'HT'
            if (appType === 'HT') {
              appValue = 'HT'
            } else if (appType === 'COP') {
              appValue = 'COP'
            } else {
              appValue = 'Global'
            }
          }
          
          return {
            id: `user-${item.userNo}`,
            name: item.userNickname || '이름 없음',
            country: '기타', // API 응답에 없음
            app: appValue,
            language: item.userLang || selectedLanguages[0] || 'ko',
            joinDate: joinDateStr,
            signupPath: getJoinTypeLabel(item.signupType),
            posts: item.totalPosts || 0,
            comments: item.totalComments || 0,
            likes: item.totalLikes || 0,
            bookmarks: item.totalBookmarks || 0,
            chatRooms: item.totalChats || 0,
            chatMessages: 0, // API 응답에 없음
            lastActivity: joinDateStr, // API 응답에 없음, signupDate 사용
            trend: 'stable' as const,
            volatility: 0,
            // API 응답의 추가 필드 저장 (필요시 사용)
            userNo: item.userNo,
            userRank: item.userRank,
            totalActivityScore: item.totalActivityScore,
            userLang: item.userLang,
            joinApp: item.joinApp,
          } as User & { userNo?: number; userRank?: number; totalActivityScore?: number; userLang?: string; joinApp?: number }
        })
        setApiUserList(convertedUsers)
      } else {
        setApiUserList([])
      }
      
    } catch (error) {
      console.error('검색 중 오류 발생:', error)
      setSearchError('검색 중 오류가 발생했습니다. 다시 시도해주세요.')
      setApiUserList([])
      setApiStatistics(null)
    } finally {
      setIsSearching(false)
    }
  }

  // 필터링된 사용자 계산 (API 데이터 우선 사용)
  const filteredUsers = useMemo(() => {
    // API에서 가져온 데이터가 있으면 사용, 없으면 mockUsers 사용
    const sourceUsers = apiUserList
    let filtered = sourceUsers

    // 언어 필터
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter(u => selectedLanguages.includes(u.language))
    }

    // 사용자 그룹 정의 필터
    // 1. 가입기간 필터 (필수)
    if (joinDateStart) {
      // 종료일이 없으면 현재 날짜로 자동 설정
      const effectiveJoinDateEnd = joinDateEnd || new Date()
      filtered = filtered.filter(u => {
        const userJoinDate = new Date(u.joinDate)
        return userJoinDate >= joinDateStart && userJoinDate <= effectiveJoinDateEnd
      })
    }

    // 2. 가입 경로 필터
    if (selectedSignupPath !== '전체') {
      filtered = filtered.filter(u => u.signupPath === selectedSignupPath)
    }

    // 3. 활동 지표에 따른 필터링
    filtered = filtered.filter(u => {
      const activityScore = (u as any).totalActivityScore
      
      // totalActivityScore가 없는 경우 (기존 mock 데이터)는 모두 포함
      if (activityScore === undefined) {
        return true
      }
      
      // 활동 지표에 따라 필터링
      if (activityMetric === '활동') {
        // 활동: totalActivityScore가 0이 아닌 유저만
        return activityScore !== 0
      } else if (activityMetric === '유령') {
        // 유령: totalActivityScore가 0인 유저만
        return activityScore === 0
      }
      
      return true
    })

    // 정렬: API 데이터가 있으면 userRank 기준, 없으면 선택된 정렬 기준으로 정렬
    filtered.sort((a, b) => {
      // API 데이터인 경우 userRank로 정렬 (오름차순) - 하지만 정렬 옵션이 선택되면 무시
      const aRank = (a as any).userRank
      const bRank = (b as any).userRank
      
      // 정렬 옵션에 따라 정렬
      let valueA: number
      let valueB: number
      
      switch (userRankingSort) {
        case '전체':
          // 모든 지표의 합으로 정렬
          valueA = a.posts + a.comments + a.likes + a.bookmarks + a.chatRooms
          valueB = b.posts + b.comments + b.likes + b.bookmarks + b.chatRooms
          break
        case '게시글':
          valueA = a.posts
          valueB = b.posts
          break
        case '댓글':
          valueA = a.comments
          valueB = b.comments
          break
        case '좋아요':
          valueA = a.likes
          valueB = b.likes
          break
        case '북마크':
          valueA = a.bookmarks
          valueB = b.bookmarks
          break
        case '채팅방':
          valueA = a.chatRooms
          valueB = b.chatRooms
          break
        default:
          // 모든 지표의 합으로 정렬
          valueA = a.posts + a.comments + a.likes + a.bookmarks + a.chatRooms
          valueB = b.posts + b.comments + b.likes + b.bookmarks + b.chatRooms
      }
      
      // 높은 순으로 정렬
      return valueB - valueA
    })

    return filtered
  }, [apiUserList, selectedLanguages, joinDateStart, joinDateEnd, selectedSignupPath, activityMetric, activityDateMode, activityDateStart, activityDateEnd, userRankingSort])

  // 지표 계산 (API 통계 데이터 우선 사용)
  const metrics = useMemo(() => {
    // API 통계 데이터가 있으면 우선 사용
    if (apiStatistics?.statistics) {
      const stats = apiStatistics.statistics
      
      // totalActivityScore가 0인 유저 수 계산 (ghostUsers)
      const ghostUsersCount = apiUserList.filter((u: any) => {
        const activityScore = u.totalActivityScore
        return activityScore !== undefined && activityScore === 0
      }).length
      
      return {
        totalUsers: stats.totalUsers || 0,
        totalPosts: stats.totalPosts || 0,
        totalComments: stats.totalComments || 0,
        totalLikes: stats.totalLikes || 0,
        totalBookmarks: stats.totalBookmarks || 0,
        totalChatRooms: stats.totalChats || 0, // API는 totalChats로 응답
        totalChatMessages: 0, // API 응답에 없음
        wowChange: 0, // API 응답에 없음
        topUsers: 0, // API 응답에 없음
        ghostUsers: ghostUsersCount,
      }
    }
    
    // API 데이터가 없으면 기존 로직 사용
    const totalUsers = filteredUsers.length
    const totalPosts = filteredUsers.reduce((sum, u) => sum + u.posts, 0)
    const totalComments = filteredUsers.reduce((sum, u) => sum + u.comments, 0)
    const totalLikes = filteredUsers.reduce((sum, u) => sum + u.likes, 0)
    const totalBookmarks = filteredUsers.reduce((sum, u) => sum + u.bookmarks, 0)
    const totalChatRooms = filteredUsers.reduce((sum, u) => sum + u.chatRooms, 0)
    const totalChatMessages = filteredUsers.reduce((sum, u) => sum + u.chatMessages, 0)
    const wowChange = 12.5 // Mock data
    const topUsers = filteredUsers.filter(u => {
      const activity = u.posts + u.comments + u.likes + u.bookmarks + u.chatRooms + u.chatMessages
      const sortedActivities = filteredUsers.map(u => u.posts + u.comments + u.likes + u.bookmarks + u.chatRooms + u.chatMessages).sort((a, b) => b - a)
      const threshold = sortedActivities[Math.floor(sortedActivities.length * 0.2)] || 0
      return activity >= threshold
    }).length
    const ghostUsers = filteredUsers.filter(u => 
      u.posts === 0 && u.comments === 0 && u.likes === 0 && u.bookmarks === 0 && u.chatRooms === 0 && u.chatMessages === 0
    ).length

    return { totalUsers, totalPosts, totalComments, totalLikes, totalBookmarks, totalChatRooms, totalChatMessages, wowChange, topUsers, ghostUsers }
  }, [apiStatistics, apiUserList, filteredUsers])

  // 언어별 점유율 계산 (API의 userLang 사용)
  const languageShareData = useMemo(() => {
    const languageMap = new Map<string, number>()
    filteredUsers.forEach(u => {
      // API 데이터인 경우 userLang 사용, 없으면 language 사용
      const lang = (u as any).userLang || u.language
      const total = u.posts + u.comments + u.likes + u.bookmarks + u.chatRooms + u.chatMessages
      const current = languageMap.get(lang) || 0
      languageMap.set(lang, current + total)
    })
    
    const total = Array.from(languageMap.values()).reduce((sum, val) => sum + val, 0)
    return Array.from(languageMap.entries())
      .map(([code, value]) => ({
        name: languageCodeToName[code] || code,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [filteredUsers])

  // 앱별 점유율 계산 (API의 joinApp 사용)
  const appShareData = useMemo(() => {
    const appMap = new Map<string, number>()
    filteredUsers.forEach(u => {
      // API 데이터인 경우 joinApp 사용하여 앱 타입 가져오기
      let appName: string = u.app
      if ((u as any).joinApp !== undefined) {
        appName = APP_TYPE_MAP[(u as any).joinApp] || u.app
      }
      
      const total = u.posts + u.comments + u.likes + u.bookmarks + u.chatRooms + u.chatMessages
      const current = appMap.get(appName) || 0
      appMap.set(appName, current + total)
    })
    
    const total = Array.from(appMap.values()).reduce((sum, val) => sum + val, 0)
    
    // 모든 앱 타입을 포함하여 정렬
    return Array.from(appMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.value - a.value)
      .filter(item => item.value > 0)
  }, [filteredUsers])

  return (
    <Card className="p-3 bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 border-2 border-dashed border-primary/30 shadow-xl backdrop-blur-sm transition-all flex flex-col h-full">
      <div className="space-y-2 flex-1 flex flex-col min-h-0">
        <h3 className="text-4xl font-bold text-foreground">커스텀 유저 검색</h3>

        {/* 필터 패널 - 사용자 그룹 정의와 활동 지표 정의로 분리 (좌우 2열) */}
        <div className="space-y-2 p-2 bg-muted rounded-lg text-sm">
          <div className="grid grid-cols-2 gap-4">
            {/* 좌측: 사용자 그룹 정의 */}
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-foreground">사용자 가입 기간 정의</h4>
              <div className="space-y-1.5">
                {/* 가입기간 (필수) */}
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold text-foreground">
                    가입기간 <span className="text-red-500">*</span>
                    <span className="text-xs text-muted-foreground ml-1">(필수)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="space-y-0.5">
                      <input
                        type="date"
                        value={joinDateStart ? format(joinDateStart, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            setJoinDateStart(new Date(e.target.value))
                            setSearchError(null) // 입력 시 에러 메시지 제거
                          } else {
                            setJoinDateStart(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 기본값으로 복원
                          }
                        }}
                        className={`w-full text-xl px-1 py-0.5 border rounded ${
                          !joinDateStart ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                        placeholder="시작일 (필수)"
                      />
                      {!joinDateStart && (
                        <p className="text-[10px] text-red-500">시작일을 입력해주세요</p>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <input
                        type="date"
                        value={joinDateEnd ? format(joinDateEnd, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => setJoinDateEnd(e.target.value ? new Date(e.target.value) : null)}
                        className="w-full text-xl px-1 py-0.5 border rounded border-gray-300"
                        placeholder="종료일 (선택)"
                      />
                    </div>
                  </div>
                </div>

                {/* 가입 경로, 언어 필터, 활동 지표 선택 - 3열 그리드 */}
                <div className="grid grid-cols-3 gap-4">
                  {/* 가입 경로 */}
                  <div className="space-y-0.5">
                    <label className="text-sm font-semibold text-foreground">가입 경로</label>
                    <Select value={selectedSignupPath} onValueChange={setSelectedSignupPath}>
                      <SelectTrigger className="h-7 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {signupPathOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 언어 필터 */}
                  <div className="space-y-0.5">
                    <label className="text-sm font-semibold text-foreground">사용자 설정 언어</label>
                    <Select value={selectedLanguages.length > 0 ? selectedLanguages[0] : "전체"} onValueChange={(v) => {
                      if (v === "전체") {
                        setSelectedLanguages([])
                      } else if (!selectedLanguages.includes(v)) {
                        setSelectedLanguages([...selectedLanguages, v])
                      }
                    }}>
                      <SelectTrigger className="h-7 text-sm">
                        <SelectValue placeholder={selectedLanguages.length > 0 ? `${selectedLanguages.length}개 선택됨` : "언어 선택"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="전체">전체</SelectItem>
                        {languageOptions.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 활동 지표 선택 */}
                  <div className="space-y-0.5">
                    <label className="text-sm font-semibold text-foreground">활동 지표</label>
                    <Select value={activityMetric} onValueChange={(v) => setActivityMetric(v as typeof activityMetric)}>
                      <SelectTrigger className="h-7 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="활동">활동 많은 순</SelectItem>
                        <SelectItem value="유령">유령 회원</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: 활동 지표 정의 */}
            <div className="space-y-1.5">
              {/* <h4 className="text-base font-bold text-foreground">활동 기간 정의</h4> */}
              <div className="space-y-1.5">
                {/* 조회 날짜 (필수) */}
                {/* <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-foreground">
                      조회 날짜 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        id="same-as-user-group"
                        checked={activityDateMode === '동일하게'}
                        className="border-gray-300 bg-gray-100 data-[state=checked]:bg-gray-300 data-[state=checked]:border-gray-400"
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setActivityDateMode('동일하게')
                            // 사용자 그룹과 동일하게 설정
                            setActivityDateStart(joinDateStart)
                            setActivityDateEnd(joinDateEnd || new Date())
                            setSearchError(null) // 체크 시 에러 메시지 제거
                          } else {
                            setActivityDateMode('직접설정')
                            // 기본값으로 복원
                            if (!activityDateStart) {
                              setActivityDateStart(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                            }
                            if (!activityDateEnd) {
                              setActivityDateEnd(new Date())
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor="same-as-user-group"
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        사용자 그룹 조회기간과 동일하게
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="space-y-0.5">
                      <input
                        type="date"
                        value={activityDateStart ? format(activityDateStart, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            setActivityDateStart(new Date(e.target.value))
                            setSearchError(null) // 입력 시 에러 메시지 제거
                          } else {
                            setActivityDateStart(null)
                          }
                        }}
                        disabled={activityDateMode === '동일하게'}
                        className={`w-full text-xl px-1 py-0.5 border rounded ${
                          !activityDateStart && activityDateMode === '직접설정' ? 'border-red-500' : 'border-gray-300'
                        } ${activityDateMode === '동일하게' ? 'bg-muted cursor-not-allowed' : ''}`}
                        required={activityDateMode === '직접설정'}
                      />
                      {!activityDateStart && activityDateMode === '직접설정' && (
                        <p className="text-[10px] text-red-500">시작일을 입력해주세요</p>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <input
                        type="date"
                        value={activityDateEnd ? format(activityDateEnd, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => {
                          if (e.target.value) {
                            setActivityDateEnd(new Date(e.target.value))
                            setSearchError(null) // 입력 시 에러 메시지 제거
                          } else {
                            setActivityDateEnd(new Date()) // 기본값으로 현재 날짜
                          }
                        }}
                        disabled={activityDateMode === '동일하게'}
                        className={`w-full text-xl px-1 py-0.5 border rounded ${
                          !activityDateEnd && activityDateMode === '직접설정' ? 'border-red-500' : 'border-gray-300'
                        } ${activityDateMode === '동일하게' ? 'bg-muted cursor-not-allowed' : ''}`}
                        required={activityDateMode === '직접설정'}
                      />
                      {!activityDateEnd && activityDateMode === '직접설정' && (
                        <p className="text-[10px] text-red-500">종료일을 입력해주세요</p>
                      )}
                    </div>
                  </div>
                </div> */}

                
              </div>
            </div>
          </div>
          
          {/* 검색 버튼 및 에러 메시지 */}
          <div className="flex flex-col gap-2 pt-2 border-t">
            {searchError && (
              <div className="flex items-center gap-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
            <div className="flex items-center justify-end">
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !joinDateStart}
                className="h-7 text-sm px-4"
                size="sm"
              >
                <Search className="w-3 h-3 mr-1" />
                {isSearching ? '검색 중...' : '검색'}
              </Button>
            </div>
            {!joinDateStart && (
              <p className="text-xs text-muted-foreground text-right">
                가입기간 시작일을 입력하면 검색할 수 있습니다.
              </p>
            )}
          </div>
        </div>

        {/* 지표 카드 - 컴팩트 */}
        <div className="grid grid-cols-5 gap-1.5">
          
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground mb-0.5">
              <MessageSquare className="w-3 h-3" />
              게시글
            </div>
            <div className="text-lg font-bold">{metrics.totalPosts.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">활동기간 정의 지표</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground mb-0.5">
              <MessageCircle className="w-3 h-3" />
              댓글
            </div>
            <div className="text-lg font-bold">{metrics.totalComments.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">활동기간 정의 지표</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground mb-0.5">
              <Heart className="w-3 h-3" />
              좋아요
            </div>
            <div className="text-lg font-bold">{metrics.totalLikes.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">활동기간 정의 지표</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground mb-0.5">
              <Bookmark className="w-3 h-3" />
              북마크
            </div>
            <div className="text-lg font-bold">{metrics.totalBookmarks.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">활동기간 정의 지표</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-0.5">채팅방</div>
            <div className="text-lg font-bold">{metrics.totalChatRooms.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">활동기간 정의 지표</p>
          </div>
          
        </div>

        {/* 추가 지표 카드 */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground mb-0.5">
              사용자 그룹 유저 수
            </div>
            <div className="text-lg font-bold">{metrics.totalUsers.toLocaleString()} 명</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">사용자 가입기간 정의에 의한 수</p>
          </div>
          {/* <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground mb-0.5">
              <AlertTriangle className="w-3 h-3" />
              커뮤니티 활동 없는 유저
            </div>
            <div className="text-lg font-bold">{metrics.ghostUsers.toLocaleString()} 명</div>
          </div> */}
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-1.5">사용자 그룹 내 활동 지표 유저 수</div>
            <div className="text-lg font-bold">{filteredUsers.length.toLocaleString()}</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-0.5">총 활동 수</div>
            <div className="text-lg font-bold">{metrics.totalPosts + metrics.totalComments + metrics.totalLikes + metrics.totalBookmarks + metrics.totalChatRooms + metrics.totalChatMessages}</div>
          </div>
        </div>

        {/* 언어별/앱별 점유율 - 컴팩트 */}
        <div className="grid grid-cols-2 gap-2">
          {/* 언어별 점유율 */}
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-1">언어별 점유율</p>
            {languageShareData.length > 0 ? (
              <>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={15}
                        outerRadius={40}
                        paddingAngle={1}
                        dataKey="value"
                      >
                        {languageShareData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${value}회 (${props.payload.percentage}%)`,
                          '활동 수'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {languageShareData.slice(0, 3).map((item, index) => (
                    <div key={item.name} className="flex items-center gap-0.5 text-xs">
                      <div 
                        className="w-1.5 h-1.5 rounded" 
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

          {/* 앱별 점유율 */}
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-1">앱별 점유율</p>
            {appShareData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appShareData} layout="vertical" margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={50}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        `${value}회 (${props.payload.percentage}%)`,
                        '활동 수'
                      ]}
                    />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {appShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">데이터 없음</p>
            )}
          </div>
        </div>

        {/* 필터링된 유저 랭킹 그리드 - 컴팩트 */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between flex-shrink-0 mb-1">
            <h4 className="text-sm font-semibold">유저 랭킹</h4>
            <Select 
              value={userRankingSort} 
              onValueChange={(v) => setUserRankingSort(v as typeof userRankingSort)}
            >
              <SelectTrigger className="h-7 text-xs w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                <SelectItem value="게시글">게시글 순</SelectItem>
                <SelectItem value="댓글">댓글 순</SelectItem>
                <SelectItem value="좋아요">좋아요 순</SelectItem>
                <SelectItem value="북마크">북마크 순</SelectItem>
                <SelectItem value="채팅방">채팅방 순</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* 헤더 */}
          <div className="grid grid-cols-9 gap-1 text-xs font-semibold text-foreground flex-shrink-0 mb-1">
            <div className="px-1 py-0.5 bg-muted rounded text-center">순위</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">유저명</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">게시글</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">댓글</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">좋아요</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">북마크</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">채팅방</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">언어</div>
          </div>
          
          {/* 바디 (내용이 많을 경우 스크롤) */}
          <div className="overflow-y-auto min-h-0" style={{ maxHeight: '280px' }}>
            <div className="space-y-0.5">
              {filteredUsers.map((u, idx) => {
                // 순위는 항상 idx + 1로 표시
                const rank = idx + 1
                return (
                  <div 
                    key={u.id} 
                    onClick={() => handleUserClick(u)}
                    className="grid grid-cols-9 gap-1 text-sm items-center border rounded px-1 py-0.5 bg-card cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="text-center">{rank}</div>
                    <div className="truncate text-center font-medium hover:text-primary" title={u.name}>{u.name}</div>
                    <div className="text-center font-medium">{u.posts}</div>
                    <div className="text-center font-medium">{u.comments}</div>
                    <div className="text-center font-medium">{u.likes}</div>
                    <div className="text-center font-medium">{u.bookmarks}</div>
                    <div className="text-center font-medium">{u.chatRooms}</div>
                    <div className="text-center text-xs">{languageCodeToName[u.language] || u.language}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* 유저 상세 정보 모달 */}
        <UserDetailModal
          open={isUserDetailModalOpen}
          onOpenChange={setIsUserDetailModalOpen}
          userDetail={selectedUserDetail}
          trendData={selectedUserTrendData || undefined}
        />
      </div>
    </Card>
  )
}
