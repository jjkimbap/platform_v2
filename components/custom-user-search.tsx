"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { format } from "date-fns"
import { TrendingUp, TrendingDown, Users, Activity, AlertTriangle, MessageSquare, MessageCircle, Heart, Bookmark } from "lucide-react"

// Mock 사용자 데이터 (실사용 시 API 연동)
interface User {
  id: string
  name: string
  country: string
  app: 'HT' | 'COP' | 'Global'
  language: string
  joinDate: string
  isMember: boolean
  posts: number
  comments: number
  likes: number
  bookmarks: number
  chatRooms: number
  chatMessages: number
  lastActivity: string
  trend: 'up' | 'down' | 'stable'
  volatility: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const mockUsers: User[] = [
  { id: 'u001', name: '홍길동', country: '한국', app: 'HT', language: 'ko', joinDate: '2025-01-05', isMember: true, posts: 45, comments: 120, likes: 32, bookmarks: 28, chatRooms: 5, chatMessages: 150, lastActivity: '2025-01-15', trend: 'up', volatility: 15.2 },
  { id: 'u002', name: '이영희', country: '일본', app: 'COP', language: 'ja', joinDate: '2025-01-03', isMember: true, posts: 38, comments: 95, likes: 25, bookmarks: 22, chatRooms: 8, chatMessages: 180, lastActivity: '2025-01-15', trend: 'up', volatility: 12.5 },
  { id: 'u003', name: '박민수', country: '미국', app: 'Global', language: 'en', joinDate: '2024-12-28', isMember: true, posts: 32, comments: 88, likes: 18, bookmarks: 19, chatRooms: 3, chatMessages: 45, lastActivity: '2025-01-14', trend: 'stable', volatility: 8.3 },
  { id: 'u004', name: '최지영', country: '한국', app: 'Global', language: 'ko', joinDate: '2024-12-30', isMember: true, posts: 28, comments: 75, likes: 15, bookmarks: 16, chatRooms: 6, chatMessages: 120, lastActivity: '2025-01-14', trend: 'down', volatility: 20.1 },
  { id: 'u005', name: '정수현', country: '일본', app: 'HT', language: 'ja', joinDate: '2025-01-10', isMember: true, posts: 25, comments: 65, likes: 12, bookmarks: 14, chatRooms: 4, chatMessages: 80, lastActivity: '2025-01-13', trend: 'up', volatility: 18.7 },
  { id: 'u006', name: '강민호', country: '기타', app: 'COP', language: 'vi', joinDate: '2024-12-20', isMember: true, posts: 22, comments: 58, likes: 10, bookmarks: 12, chatRooms: 2, chatMessages: 35, lastActivity: '2025-01-13', trend: 'up', volatility: 22.3 },
  { id: 'u007', name: '임동현', country: '미국', app: 'HT', language: 'en', joinDate: '2025-01-08', isMember: true, posts: 18, comments: 48, likes: 8, bookmarks: 10, chatRooms: 1, chatMessages: 20, lastActivity: '2025-01-12', trend: 'stable', volatility: 10.5 },
  { id: 'u008', name: '윤서연', country: '한국', app: 'COP', language: 'ko', joinDate: '2024-11-15', isMember: true, posts: 16, comments: 42, likes: 6, bookmarks: 9, chatRooms: 0, chatMessages: 0, lastActivity: '2025-01-11', trend: 'down', volatility: 25.8 },
  { id: 'u009', name: '조은지', country: '일본', app: 'Global', language: 'ja', joinDate: '2025-01-01', isMember: true, posts: 10, comments: 30, likes: 5, bookmarks: 8, chatRooms: 1, chatMessages: 15, lastActivity: '2025-01-10', trend: 'up', volatility: 14.2 },
  { id: 'u010', name: '송준호', country: '한국', app: 'HT', language: 'ko', joinDate: '2024-10-20', isMember: true, posts: 5, comments: 12, likes: 2, bookmarks: 3, chatRooms: 0, chatMessages: 0, lastActivity: '2025-01-09', trend: 'down', volatility: 30.5 },
  { id: 'u011', name: '한지우', country: '중국', app: 'COP', language: 'zh', joinDate: '2024-12-10', isMember: true, posts: 55, comments: 180, likes: 45, bookmarks: 35, chatRooms: 12, chatMessages: 250, lastActivity: '2025-01-15', trend: 'up', volatility: 12.8 },
  { id: 'u012', name: '백승현', country: '베트남', app: 'Global', language: 'vi', joinDate: '2024-11-25', isMember: true, posts: 0, comments: 0, likes: 0, bookmarks: 0, chatRooms: 0, chatMessages: 0, lastActivity: '2024-11-25', trend: 'stable', volatility: 0 },
  { id: 'u013', name: '신유진', country: '한국', app: 'HT', language: 'ko', joinDate: '2024-09-15', isMember: true, posts: 0, comments: 0, likes: 0, bookmarks: 0, chatRooms: 0, chatMessages: 0, lastActivity: '2024-09-20', trend: 'stable', volatility: 0 },
  { id: 'u014', name: '강민호', country: '기타', app: 'COP', language: 'vi', joinDate: '2024-12-20', isMember: true, posts: 22, comments: 58, likes: 10, bookmarks: 12, chatRooms: 2, chatMessages: 35, lastActivity: '2025-01-13', trend: 'up', volatility: 22.3 },
  { id: 'u015', name: '임동현', country: '미국', app: 'HT', language: 'en', joinDate: '2025-01-08', isMember: true, posts: 18, comments: 48, likes: 8, bookmarks: 10, chatRooms: 1, chatMessages: 20, lastActivity: '2025-01-12', trend: 'stable', volatility: 10.5 },
  { id: 'u016', name: '윤서연', country: '한국', app: 'COP', language: 'ko', joinDate: '2024-11-15', isMember: true, posts: 16, comments: 42, likes: 6, bookmarks: 9, chatRooms: 0, chatMessages: 0, lastActivity: '2025-01-11', trend: 'down', volatility: 25.8 },
  { id: 'u017', name: '조은지', country: '일본', app: 'Global', language: 'ja', joinDate: '2025-01-01', isMember: true, posts: 10, comments: 30, likes: 5, bookmarks: 8, chatRooms: 1, chatMessages: 15, lastActivity: '2025-01-10', trend: 'up', volatility: 14.2 },
  { id: 'u018', name: '송준호', country: '한국', app: 'HT', language: 'ko', joinDate: '2024-10-20', isMember: true, posts: 5, comments: 12, likes: 2, bookmarks: 3, chatRooms: 0, chatMessages: 0, lastActivity: '2025-01-09', trend: 'down', volatility: 30.5 },
  { id: 'u019', name: '한지우', country: '중국', app: 'COP', language: 'zh', joinDate: '2024-12-10', isMember: true, posts: 55, comments: 180, likes: 45, bookmarks: 35, chatRooms: 12, chatMessages: 250, lastActivity: '2025-01-15', trend: 'up', volatility: 12.8 },
  { id: 'u020', name: '백승현', country: '베트남', app: 'Global', language: 'vi', joinDate: '2024-11-25', isMember: true, posts: 0, comments: 0, likes: 0, bookmarks: 0, chatRooms: 0, chatMessages: 0, lastActivity: '2024-11-25', trend: 'stable', volatility: 0 },
  { id: 'u021', name: '신유진', country: '한국', app: 'HT', language: 'ko', joinDate: '2024-09-15', isMember: true, posts: 0, comments: 0, likes: 0, bookmarks: 0, chatRooms: 0, chatMessages: 0, lastActivity: '2024-09-20', trend: 'stable', volatility: 0 },
]

export function CustomUserSearch() {
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState<Date>(new Date())
  
  // 필터 상태
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [period, setPeriod] = useState<'7일' | '30일' | '90일' | '커스텀'>('7일')
  const [userGroup, setUserGroup] = useState<'전체' | '신규' | '활성' | '상위유저' | '유령유저'>('전체')
  const [activityType, setActivityType] = useState<'게시글' | '댓글' | '채팅방'>('게시글')
  
  // 정렬 방식
  const [sortOrder, setSortOrder] = useState<'많은순' | '적은순' | '급상승' | '급하락'>('많은순')
  
  // 언어 목록 및 매핑
  const languageOptions = [
    { label: '한국어', value: 'ko' },
    { label: '중국어', value: 'zh' },
    { label: '베트남어', value: 'vi' },
    { label: '태국어', value: 'th' },
    { label: '영어', value: 'en' },
    { label: '인도어', value: 'hi' },
    { label: '러시아어', value: 'ru' },
  ]

  // 언어 다중 선택 핸들러
  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    )
  }

  // 기간 변경 핸들러
  const handlePeriodChange = (value: string) => {
    setPeriod(value as typeof period)
    const now = new Date()
    if (value === '7일') {
      setStartDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
      setEndDate(now)
    } else if (value === '30일') {
      setStartDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
      setEndDate(now)
    } else if (value === '90일') {
      setStartDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000))
      setEndDate(now)
    }
  }

  // 필터링된 사용자 계산 (회원만)
  const filteredUsers = useMemo(() => {
    let filtered = mockUsers.filter(u => u.isMember) // 회원만 필터링

    // 언어 필터
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter(u => selectedLanguages.includes(u.language))
    }

    // 사용자 그룹 필터
    if (userGroup === '신규') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(u => new Date(u.joinDate) > thirtyDaysAgo)
    } else if (userGroup === '활성') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(u => new Date(u.lastActivity) > sevenDaysAgo)
    } else if (userGroup === '상위유저') {
      // 상위 20% 유저 (활동이 많은 유저)
      const totalActivity = filtered.map(u => u.posts + u.comments + u.likes + u.bookmarks + u.chatRooms + u.chatMessages)
      const sortedActivities = [...totalActivity].sort((a, b) => b - a)
      const top20PercentIndex = Math.floor(sortedActivities.length * 0.2)
      const threshold = sortedActivities[top20PercentIndex] || 0
      filtered = filtered.filter(u => {
        const userActivity = u.posts + u.comments + u.likes + u.bookmarks + u.chatRooms + u.chatMessages
        return userActivity >= threshold
      })
    } else if (userGroup === '유령유저') {
      // 활동이 없는 유령 유저
      filtered = filtered.filter(u => 
        u.posts === 0 && u.comments === 0 && u.likes === 0 && u.bookmarks === 0 && u.chatRooms === 0 && u.chatMessages === 0
      )
    }

    // 정렬 (선택된 유형 기준으로 정렬)
    filtered.sort((a, b) => {
      // 유형에 따른 값 추출
      let valueA: number
      let valueB: number
      
      if (activityType === '게시글') {
        valueA = a.posts
        valueB = b.posts
      } else if (activityType === '댓글') {
        valueA = a.comments
        valueB = b.comments
      } else { // 채팅방
        valueA = a.chatRooms
        valueB = b.chatRooms
      }

      if (sortOrder === '많은순') {
        return valueB - valueA
      } else if (sortOrder === '적은순') {
        return valueA - valueB
      } else if (sortOrder === '급상승') {
        if (a.trend === 'up' && b.trend !== 'up') return -1
        if (b.trend === 'up' && a.trend !== 'up') return 1
        return b.volatility - a.volatility
      } else if (sortOrder === '급하락') {
        if (a.trend === 'down' && b.trend !== 'down') return -1
        if (b.trend === 'down' && a.trend !== 'down') return 1
        return b.volatility - a.volatility
      }

      return 0
    })

    return filtered
  }, [selectedLanguages, period, userGroup, activityType, sortOrder])

  // 지표 계산
  const metrics = useMemo(() => {
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
  }, [filteredUsers])

  // 언어별 점유율 계산
  const languageShareData = useMemo(() => {
    const languageMap = new Map<string, number>()
    filteredUsers.forEach(u => {
      const total = u.posts + u.comments + u.likes + u.bookmarks + u.chatRooms + u.chatMessages
      const current = languageMap.get(u.language) || 0
      languageMap.set(u.language, current + total)
    })
    
    // 언어 코드를 언어명으로 변환
    const languageCodeToName: Record<string, string> = {
      'ko': '한국어',
      'zh': '중국어',
      'vi': '베트남어',
      'th': '태국어',
      'en': '영어',
      'hi': '인도어',
      'ru': '러시아어',
    }
    
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

  // 앱별 점유율 계산
  const appShareData = useMemo(() => {
    const appMap = new Map<string, number>()
    filteredUsers.forEach(u => {
      const total = u.posts + u.comments + u.likes + u.bookmarks + u.chatRooms + u.chatMessages
      const current = appMap.get(u.app) || 0
      appMap.set(u.app, current + total)
    })
    
    const total = Array.from(appMap.values()).reduce((sum, val) => sum + val, 0)
    return ['HT', 'COP', 'Global'].map(app => {
      const value = appMap.get(app) || 0
      return {
        name: app,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0'
      }
    }).filter(item => item.value > 0)
  }, [filteredUsers])

  return (
    <Card className="p-3 bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 border-2 border-dashed border-primary/30 shadow-xl backdrop-blur-sm transition-all flex flex-col h-full">
      <div className="space-y-2 flex-1 flex flex-col min-h-0">
        <h3 className="text-3xl font-bold text-foreground">커스텀 유저 검색</h3>

        {/* 필터 패널 - 컴팩트 */}
        <div className="space-y-2 p-2 bg-muted rounded-lg text-xs">
          {/* 한 행: 기간, 언어, 사용자 그룹, 유형, 정렬 방식 */}
          <div className="grid grid-cols-5 gap-1.5">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground">📅 기간</label>
              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7일">최근 7일</SelectItem>
                  <SelectItem value="30일">최근 30일</SelectItem>
                  <SelectItem value="90일">최근 90일</SelectItem>
                  <SelectItem value="커스텀">커스텀</SelectItem>
                </SelectContent>
              </Select>
              {period === '커스텀' && (
                <div className="grid grid-cols-2 gap-0.5 mt-0.5">
                  <input
                    type="date"
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    className="w-full text-[10px] px-1 py-0.5 border rounded"
                  />
                  <input
                    type="date"
                    value={format(endDate, 'yyyy-MM-dd')}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="w-full text-[10px] px-1 py-0.5 border rounded"
                  />
                </div>
              )}
            </div>

            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground">🌍 언어</label>
              <Select value={selectedLanguages.length > 0 ? selectedLanguages[0] : "전체"} onValueChange={(v) => {
                if (v === "전체") {
                  setSelectedLanguages([])
                } else if (!selectedLanguages.includes(v)) {
                  setSelectedLanguages([...selectedLanguages, v])
                }
              }}>
                <SelectTrigger className="h-7 text-xs">
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

            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground">📊 사용자 그룹</label>
              <Select value={userGroup} onValueChange={(v) => setUserGroup(v as typeof userGroup)}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="신규">신규 회원 (최근 30일 가입 유저)</SelectItem>
                  <SelectItem value="활성">활성 유저 </SelectItem>
                  <SelectItem value="상위유저">상위 유저 (활동 상위 20%)</SelectItem>
                  <SelectItem value="유령유저">커뮤니티 활동 없는 유저</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground">📈 유형</label>
              <Select value={activityType} onValueChange={(v) => setActivityType(v as typeof activityType)}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="게시글">게시글</SelectItem>
                  <SelectItem value="댓글">댓글</SelectItem>
                  <SelectItem value="채팅방">채팅방</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground">🔀 정렬 방식</label>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="많은순">많은순</SelectItem>
                  <SelectItem value="적은순">적은순</SelectItem>
                  <SelectItem value="급상승">급상승</SelectItem>
                  <SelectItem value="급하락">급하락</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 지표 카드 - 컴팩트 */}
        <div className="grid grid-cols-7 gap-1.5">
          
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground mb-0.5">
              <MessageSquare className="w-3 h-3" />
              게시글
            </div>
            <div className="text-base font-bold">{metrics.totalPosts}</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground mb-0.5">
              <MessageCircle className="w-3 h-3" />
              댓글
            </div>
            <div className="text-base font-bold">{metrics.totalComments}</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground mb-0.5">
              <Heart className="w-3 h-3" />
              좋아요
            </div>
            <div className="text-base font-bold">{metrics.totalLikes}</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground mb-0.5">
              <Bookmark className="w-3 h-3" />
              북마크
            </div>
            <div className="text-base font-bold">{metrics.totalBookmarks}</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-[10px] text-muted-foreground mb-0.5">채팅방</div>
            <div className="text-base font-bold">{metrics.totalChatRooms}</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-[10px] text-muted-foreground mb-0.5">메시지</div>
            <div className="text-base font-bold">{metrics.totalChatMessages}</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
          <div className="text-[10px] text-muted-foreground mb-0.5">지난 7일 대비</div>
            <div className="text-base font-bold">
              {metrics.wowChange > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              {Math.abs(metrics.wowChange)}%
            </div>
          </div>
        </div>

        {/* 추가 지표 카드 */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground mb-0.5">
              상위 20% 유저
            </div>
            <div className="text-base font-bold">{metrics.topUsers}명</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground mb-0.5">
              <AlertTriangle className="w-3 h-3" />
              커뮤니티 활동 없는 유저
            </div>
            <div className="text-base font-bold">{metrics.ghostUsers}명</div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-[10px] text-muted-foreground mb-0.5">총 활동 수</div>
            <div className="text-base font-bold">{metrics.totalPosts + metrics.totalComments + metrics.totalLikes + metrics.totalBookmarks + metrics.totalChatRooms + metrics.totalChatMessages}</div>
          </div>
        </div>

        {/* 언어별/앱별 점유율 - 컴팩트 */}
        <div className="grid grid-cols-2 gap-2">
          {/* 언어별 점유율 */}
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs font-semibold mb-1">언어별 점유율</p>
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
                    <div key={item.name} className="flex items-center gap-0.5 text-[10px]">
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
              <p className="text-[10px] text-muted-foreground">데이터 없음</p>
            )}
          </div>

          {/* 앱별 점유율 */}
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs font-semibold mb-1">앱별 점유율</p>
            {appShareData.length > 0 ? (
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appShareData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={40} />
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
              <p className="text-[10px] text-muted-foreground">데이터 없음</p>
            )}
          </div>
        </div>

        {/* 필터링된 유저 랭킹 그리드 - 컴팩트 */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between flex-shrink-0 mb-1">
            <h4 className="text-xs font-semibold">유저 랭킹</h4>
            <Badge variant="secondary" className="text-[10px]">{filteredUsers.length}명</Badge>
          </div>
          
          {/* 헤더 */}
          <div className="grid grid-cols-9 gap-1 text-[10px] font-semibold text-foreground flex-shrink-0 mb-1">
            <div className="px-1 py-0.5 bg-muted rounded text-center">순위</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">유저명</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">게시글</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">댓글</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">좋아요</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">북마크</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">채팅방</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">메시지</div>
            <div className="px-1 py-0.5 bg-muted rounded text-center">국가</div>
          </div>
          
          {/* 바디 (내용이 많을 경우 스크롤) */}
          <div className="flex-1 overflow-y-auto min-h-0 max-h-[450px]">
            <div className="space-y-0.5">
              {filteredUsers.map((u, idx) => (
                <div key={u.id} className="grid grid-cols-9 gap-1 text-xs items-center border rounded px-1 py-0.5 bg-card">
                  <div className="text-center">{idx + 1}</div>
                  <div className="truncate text-center" title={u.name}>{u.name}</div>
                  <div className="text-center font-medium">{u.posts}</div>
                  <div className="text-center font-medium">{u.comments}</div>
                  <div className="text-center font-medium">{u.likes}</div>
                  <div className="text-center font-medium">{u.bookmarks}</div>
                  <div className="text-center font-medium">{u.chatRooms}</div>
                  <div className="text-center font-medium">{u.chatMessages}</div>
                  <div className="text-center text-[10px]">{u.country}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
