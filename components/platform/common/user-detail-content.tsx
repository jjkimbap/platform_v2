"use client"

import React from "react"
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { MessageSquare, MessageCircle, Heart, Bookmark, Users } from "lucide-react"
import { CustomLegend } from "@/components/platform/common/custom-legend"
import { getAppTypeLabel, getOsTypeLabel, getGenderLabel } from "@/lib/type-mappings"
import { UserDetail } from "./user-detail-modal"

/**
 * 차트 색상 상수 정의
 * 한 곳에서 색상을 관리하여 일관성 유지
 */
const CHART_COLORS = {
  posts: '#3b82f6',      // 파란색
  comments: '#10b981',   // 초록색
  likes: '#ef4444',      // 빨간색
  bookmarks: '#f59e0b',  // 주황색
  chatRooms: '#8b5cf6',  // 보라색
  messages: '#06b6d4',   // 청록색
} as const

interface UserDetailContentProps {
  userDetail: UserDetail
  trendData?: Array<{
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
  }>
}

/**
 * 유저 상세 정보 콘텐츠 컴포넌트
 * 모달이나 다른 컨테이너에서 재사용 가능
 */
export const UserDetailContent = React.memo(({ userDetail, trendData }: UserDetailContentProps) => {
  // 이미지 URL 처리 (img 또는 imageUrl 필드 지원)
  const imageUrl = userDetail.img || userDetail.imageUrl
  const displayImageUrl = imageUrl 
    ? (imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_IMG_URL || ''}${imageUrl}`)
    : null

  return (
    <div className="space-y-6">
      {/* 기본 정보 - 1-2행 */}
      <div className="grid grid-cols-6 gap-3">
        <div className="col-span-1">
          {displayImageUrl ? (
            <img 
              src={displayImageUrl} 
              alt={userDetail.nickname}
              className="w-full h-24 object-contain rounded-lg border bg-muted"
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
            <p className="text-sm font-bold truncate">{userDetail.id}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">이메일</p>
            <p className="text-sm font-bold truncate">{userDetail.email || '-'}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">닉네임</p>
            <p className="text-sm font-bold truncate">{userDetail.nickname}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">언어</p>
            <p className="text-sm font-bold">{userDetail.language || '-'}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">성별</p>
            <p className="text-sm font-bold">{getGenderLabel(userDetail.gender)}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">국가</p>
            <p className="text-sm font-bold">{userDetail.country || '-'}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">가입 앱</p>
            <p className="text-sm font-bold">
              {userDetail.signupApp 
                ? (typeof userDetail.signupApp === 'number' 
                    ? getAppTypeLabel(userDetail.signupApp) 
                    : (userDetail.signupApp.match(/^\d+$/) 
                        ? getAppTypeLabel(Number(userDetail.signupApp)) 
                        : userDetail.signupApp))
                : '-'}
            </p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">가입경로</p>
            <p className="text-sm font-bold truncate">{userDetail.signupPath || '-'}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">OS 정보</p>
            <p className="text-sm font-bold truncate">{getOsTypeLabel(userDetail.osInfo)}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">가입 일자</p>
            <p className="text-sm font-bold">
              {userDetail.signupDate ? new Date(userDetail.signupDate).toLocaleDateString('ko-KR') : '-'}
            </p>
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
            <p className="text-2xl font-bold">{userDetail.posts}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">댓글 수</p>
            </div>
            <p className="text-2xl font-bold">{userDetail.comments}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-500" />
              <p className="text-sm text-muted-foreground">좋아요 수</p>
            </div>
            <p className="text-2xl font-bold">{userDetail.likes}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="h-4 w-4 text-purple-500" />
              <p className="text-sm text-muted-foreground">북마크 수</p>
            </div>
            <p className="text-2xl font-bold">{userDetail.bookmarks}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-indigo-500" />
              <p className="text-sm text-muted-foreground">채팅방 수</p>
            </div>
            <p className="text-2xl font-bold">{userDetail.chatRooms}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-orange-500" />
              <p className="text-sm text-muted-foreground">메시지 수</p>
            </div>
            <p className="text-2xl font-bold">{userDetail.messages || 0}</p>
          </div>
        </div>
      </div>

      {/* 커뮤니티 활동 추이 */}
      {trendData && trendData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">커뮤니티 활동 추이 (월별)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                          <p className="font-semibold mb-2 text-sm">{label}</p>
                          <div className="space-y-1">
                            {payload.map((entry, index) => {
                              if (entry.value === null || entry.value === undefined) return null
                              const value = typeof entry.value === 'number' ? entry.value : 0
                              return (
                                <div key={index} className="flex items-center justify-between gap-4 text-xs">
                                  <span className="flex items-center gap-2">
                                    <span 
                                      className="w-3 h-3 rounded" 
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-muted-foreground">{entry.name}</span>
                                  </span>
                                  <span className="font-medium">{value.toLocaleString()}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend content={<CustomLegend />} />
                <Line type="monotone" dataKey="posts" stroke={CHART_COLORS.posts} strokeWidth={2} name="게시글" />
                {trendData.some(d => d.postsPredicted != null) && (
                  <Line type="monotone" dataKey="postsPredicted" stroke={CHART_COLORS.posts} strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="게시글 (예측)" />
                )}
                <Line type="monotone" dataKey="comments" stroke={CHART_COLORS.comments} strokeWidth={2} name="댓글" />
                {trendData.some(d => d.commentsPredicted != null) && (
                  <Line type="monotone" dataKey="commentsPredicted" stroke={CHART_COLORS.comments} strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="댓글 (예측)" />
                )}
                <Line type="monotone" dataKey="likes" stroke={CHART_COLORS.likes} strokeWidth={2} name="좋아요" />
                {trendData.some(d => d.likesPredicted != null) && (
                  <Line type="monotone" dataKey="likesPredicted" stroke={CHART_COLORS.likes} strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="좋아요 (예측)" />
                )}
                <Line type="monotone" dataKey="bookmarks" stroke={CHART_COLORS.bookmarks} strokeWidth={2} name="북마크" />
                {trendData.some(d => d.bookmarksPredicted != null) && (
                  <Line type="monotone" dataKey="bookmarksPredicted" stroke={CHART_COLORS.bookmarks} strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="북마크 (예측)" />
                )}
                <Line type="monotone" dataKey="chatRooms" stroke={CHART_COLORS.chatRooms} strokeWidth={2} name="채팅방" />
                {trendData.some(d => d.chatRoomsPredicted != null) && (
                  <Line type="monotone" dataKey="chatRoomsPredicted" stroke={CHART_COLORS.chatRooms} strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="채팅방 (예측)" />
                )}
                <Line type="monotone" dataKey="messages" stroke={CHART_COLORS.messages} strokeWidth={2} name="메시지" />
                {trendData.some(d => d.messagesPredicted != null) && (
                  <Line type="monotone" dataKey="messagesPredicted" stroke={CHART_COLORS.messages} strokeDasharray="5 5" strokeWidth={2} strokeOpacity={0.3} name="메시지 (예측)" />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
})

UserDetailContent.displayName = "UserDetailContent"


