"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserDetailContent } from "./user-detail-content"

/**
 * 유저 상세 정보 타입 정의 (기존 호환성 유지)
 */
export interface UserDetail {
  id: string
  img?: string
  email?: string
  nickname: string
  language?: string
  gender?: string
  country?: string
  imageUrl?: string
  signupApp?: string
  signupPath?: string
  osInfo?: string
  signupDate: string
  // 활동 지표
  posts: number
  comments: number
  likes: number
  bookmarks: number
  chatRooms: number
  messages?: number
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
    chatRooms?: number | null
    chatRoomsPredicted?: number | null
    messages?: number | null
    messagesPredicted?: number | null
  }>
}

/**
 * 유저 상세 정보 모달 컴포넌트
 */
export const UserDetailModal = React.memo(({ open, onOpenChange, userDetail, trendData }: UserDetailModalProps) => {
  if (!userDetail) return null
  
  // 디버깅용 로그
  React.useEffect(() => {
    if (open) {
      console.log('🔍 [UserDetailModal] 모달 열림:', {
        hasUserDetail: !!userDetail,
        hasTrendData: !!trendData,
        trendDataLength: trendData?.length || 0,
        trendData: trendData
      })
    }
  }, [open, userDetail, trendData])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[90vw] !w-[90vw] sm:!max-w-[85vw] max-h-[85vh] h-[75vh] flex flex-col" style={{ width: '90vw', maxWidth: '95vw' }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">유저 상세 정보</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto mt-4">
          <UserDetailContent userDetail={userDetail} trendData={trendData} />
        </div>
      </DialogContent>
    </Dialog>
  )
})

UserDetailModal.displayName = "UserDetailModal"

