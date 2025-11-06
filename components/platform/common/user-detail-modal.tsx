"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { MessageSquare, MessageCircle, Heart, Bookmark, Users } from "lucide-react"
import { CustomLegend } from "@/components/platform/common/custom-legend"

/**
 * 유저 상세 정보 타입 정의
 */
export interface UserDetail {
  id: string
  email: string
  nickname: string
  language: string
  gender: string
  country: string
  imageUrl?: string
  signupApp: string
  signupPath: string
  osInfo: string
  signupDate: string
  // 활동 지표
  posts: number
  comments: number
  likes: number
  bookmarks: number
  chatRooms: number
}

interface UserDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userDetail: UserDetail | null
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
  }>
}

/**
 * 유저 상세 정보 모달 컴포넌트
 */
export const UserDetailModal = React.memo(({ open, onOpenChange, userDetail, trendData }: UserDetailModalProps) => {
  if (!userDetail) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[90vw] !w-[90vw] sm:!max-w-[85vw] max-h-[85vh] h-[75vh] flex flex-col" style={{ width: '90vw', maxWidth: '95vw' }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">유저 상세 정보</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-6 mt-4">
          {/* 기본 정보 - 1-2행 */}
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-1">
              {userDetail.imageUrl ? (
                <img 
                  src={userDetail.imageUrl} 
                  alt={userDetail.nickname}
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
                <p className="text-sm font-bold truncate">{userDetail.id}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">이메일</p>
                <p className="text-sm font-bold truncate">{userDetail.email}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">닉네임</p>
                <p className="text-sm font-bold truncate">{userDetail.nickname}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">언어</p>
                <p className="text-sm font-bold">{userDetail.language}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">성별</p>
                <p className="text-sm font-bold">{userDetail.gender}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">국가</p>
                <p className="text-sm font-bold">{userDetail.country}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">가입 앱</p>
                <p className="text-sm font-bold">{userDetail.signupApp}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">가입경로</p>
                <p className="text-sm font-bold truncate">{userDetail.signupPath}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">OS 정보</p>
                <p className="text-sm font-bold truncate">{userDetail.osInfo}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">가입 일자</p>
                <p className="text-sm font-bold">{userDetail.signupDate}</p>
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
                    <Tooltip />
                    <Legend content={<CustomLegend />} />
                    <Bar dataKey="posts" fill="#3b82f6" name="게시글" />
                    {trendData.some(d => d.postsPredicted != null) && (
                      <Bar dataKey="postsPredicted" fill="#3b82f6" fillOpacity={0.3} name="게시글 (예측)" />
                    )}
                    <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} name="댓글" />
                    {trendData.some(d => d.commentsPredicted != null) && (
                      <Line type="monotone" dataKey="commentsPredicted" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} name="댓글 (예측)" />
                    )}
                    <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} name="좋아요" />
                    {trendData.some(d => d.likesPredicted != null) && (
                      <Line type="monotone" dataKey="likesPredicted" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} name="좋아요 (예측)" />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
})

UserDetailModal.displayName = "UserDetailModal"

