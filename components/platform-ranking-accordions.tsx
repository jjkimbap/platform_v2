"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip, PieChart, Pie, Cell, BarChart } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { getUserDetailFromUserNo, getCommunityUserTrendData } from "@/lib/platform-user-utils"

// 게시물 상세 정보 타입 정의
interface PostDetail {
  title: string
  imageUrl?: string
  content: string
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

// 채팅 유저 랭킹 데이터
const chatUsers = [
  { rank: 1, name: "김철수", country: "한국", score: 96.8, chatRooms: 15, messages: 50, lastChat: "2025-01-15" },
  { rank: 2, name: "이영희", country: "한국", score: 93.5, chatRooms: 12, messages: 80, lastChat: "2025-01-15" },
  { rank: 3, name: "박민수", country: "일본", score: 90.2, chatRooms: 10, messages: 20, lastChat: "2025-01-14" },
  { rank: 4, name: "최지영", country: "미국", score: 87.1, chatRooms: 8, messages: 10, lastChat: "2025-01-14" },
  { rank: 5, name: "정수현", country: "한국", score: 84.6, chatRooms: 2, messages: 8, lastChat: "2025-01-13" },
  { rank: 6, name: "강민호", country: "일본", score: 82.3, chatRooms: 7, messages: 65, lastChat: "2025-01-13" },
  { rank: 7, name: "윤서연", country: "중국", score: 80.1, chatRooms: 6, messages: 58, lastChat: "2025-01-12" },
  { rank: 8, name: "임동현", country: "한국", score: 78.0, chatRooms: 5, messages: 52, lastChat: "2025-01-12" },
  { rank: 9, name: "조은지", country: "일본", score: 75.8, chatRooms: 5, messages: 48, lastChat: "2025-01-11" },
  { rank: 10, name: "송준호", country: "미국", score: 73.7, chatRooms: 4, messages: 42, lastChat: "2025-01-11" },
  { rank: 11, name: "한지우", country: "한국", score: 71.5, chatRooms: 4, messages: 38, lastChat: "2025-01-10" },
  { rank: 12, name: "백승현", country: "중국", score: 69.4, chatRooms: 3, messages: 35, lastChat: "2025-01-10" },
  { rank: 13, name: "신유진", country: "한국", score: 67.2, chatRooms: 3, messages: 32, lastChat: "2025-01-09" },
  { rank: 14, name: "오태영", country: "일본", score: 65.1, chatRooms: 3, messages: 28, lastChat: "2025-01-09" },
  { rank: 15, name: "장미래", country: "베트남", score: 63.0, chatRooms: 2, messages: 25, lastChat: "2025-01-08" },
  { rank: 16, name: "권도윤", country: "한국", score: 60.9, chatRooms: 2, messages: 22, lastChat: "2025-01-08" },
  { rank: 17, name: "남궁민", country: "일본", score: 58.7, chatRooms: 2, messages: 20, lastChat: "2025-01-07" },
  { rank: 18, name: "서하늘", country: "미국", score: 56.6, chatRooms: 1, messages: 18, lastChat: "2025-01-07" },
  { rank: 19, name: "황지훈", country: "중국", score: 54.5, chatRooms: 1, messages: 15, lastChat: "2025-01-06" },
  { rank: 20, name: "고은별", country: "한국", score: 52.4, chatRooms: 1, messages: 12, lastChat: "2025-01-06" },
]

// 급상승 유저 랭킹 데이터
const trendingUsers = [
  { 
    rank: 1, 
    name: "김민지", 
    posts: 120, 
    comments: 450, 
    chatRooms: 80, 
    messages: 1560,
    trendScore: 95.2,
    lastActivity: "2025-01-15",
    trendData: [
      { date: "7월", posts: 18, comments: 65, chatRooms: 12, messages: 280, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "8월", posts: 22, comments: 75, chatRooms: 15, messages: 310, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "9월", posts: 28, comments: 95, chatRooms: 18, messages: 360, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "10월", posts: 35, comments: 125, chatRooms: 22, messages: 420, postsPredicted: 35, commentsPredicted: 125, chatRoomsPredicted: 22, messagesPredicted: 420 },
      { date: "11월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 42, commentsPredicted: 150, chatRoomsPredicted: 26, messagesPredicted: 480 },
      { date: "12월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 48, commentsPredicted: 170, chatRoomsPredicted: 30, messagesPredicted: 520 },
      { date: "1월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 52, commentsPredicted: 185, chatRoomsPredicted: 33, messagesPredicted: 550 }
    ]
  },
  { 
    rank: 2, 
    name: "박서준", 
    posts: 80, 
    comments: 380, 
    chatRooms: 120, 
    messages: 2030,
    trendScore: 88.7,
    lastActivity: "2025-01-15",
    trendData: [
      { date: "7월", posts: 12, comments: 55, chatRooms: 18, messages: 320, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "8월", posts: 15, comments: 68, chatRooms: 22, messages: 380, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "9월", posts: 19, comments: 82, chatRooms: 28, messages: 450, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "10월", posts: 24, comments: 105, chatRooms: 35, messages: 520, postsPredicted: 24, commentsPredicted: 105, chatRoomsPredicted: 35, messagesPredicted: 520 },
      { date: "11월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 28, commentsPredicted: 125, chatRoomsPredicted: 40, messagesPredicted: 580 },
      { date: "12월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 32, commentsPredicted: 140, chatRoomsPredicted: 45, messagesPredicted: 630 },
      { date: "1월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 35, commentsPredicted: 150, chatRoomsPredicted: 48, messagesPredicted: 670 }
    ]
  },
  { 
    rank: 3, 
    name: "이하늘", 
    posts: 150, 
    comments: 520, 
    chatRooms: 60, 
    messages: 890,
    trendScore: 82.1,
    lastActivity: "2025-01-14",
    trendData: [
      { date: "7월", posts: 25, comments: 85, chatRooms: 10, messages: 140, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "8월", posts: 30, comments: 102, chatRooms: 12, messages: 165, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "9월", posts: 38, comments: 128, chatRooms: 15, messages: 195, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "10월", posts: 45, comments: 155, chatRooms: 18, messages: 230, postsPredicted: 45, commentsPredicted: 155, chatRoomsPredicted: 18, messagesPredicted: 230 },
      { date: "11월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 52, commentsPredicted: 180, chatRoomsPredicted: 20, messagesPredicted: 260 },
      { date: "12월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 58, commentsPredicted: 200, chatRoomsPredicted: 22, messagesPredicted: 285 },
      { date: "1월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 63, commentsPredicted: 215, chatRoomsPredicted: 24, messagesPredicted: 305 }
    ]
  },
  { 
    rank: 4, 
    name: "최지훈", 
    posts: 60, 
    comments: 290, 
    chatRooms: 150, 
    messages: 2340,
    trendScore: 76.5,
    lastActivity: "2025-01-14",
    trendData: [
      { date: "7월", posts: 10, comments: 45, chatRooms: 22, messages: 380, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "8월", posts: 12, comments: 55, chatRooms: 28, messages: 450, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "9월", posts: 15, comments: 68, chatRooms: 35, messages: 520, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "10월", posts: 18, comments: 82, chatRooms: 42, messages: 590, postsPredicted: 18, commentsPredicted: 82, chatRoomsPredicted: 42, messagesPredicted: 590 },
      { date: "11월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 21, commentsPredicted: 95, chatRoomsPredicted: 48, messagesPredicted: 650 },
      { date: "12월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 24, commentsPredicted: 105, chatRoomsPredicted: 53, messagesPredicted: 700 },
      { date: "1월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 26, commentsPredicted: 115, chatRoomsPredicted: 57, messagesPredicted: 740 }
    ]
  },
  { 
    rank: 5, 
    name: "정유나", 
    posts: 100, 
    comments: 410, 
    chatRooms: 90, 
    messages: 1270,
    trendScore: 71.3,
    lastActivity: "2025-01-13",
    trendData: [
      { date: "7월", posts: 16, comments: 62, chatRooms: 14, messages: 195, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "8월", posts: 19, comments: 74, chatRooms: 17, messages: 230, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "9월", posts: 24, comments: 92, chatRooms: 21, messages: 280, postsPredicted: null, commentsPredicted: null, chatRoomsPredicted: null, messagesPredicted: null },
      { date: "10월", posts: 28, comments: 108, chatRooms: 25, messages: 325, postsPredicted: 28, commentsPredicted: 108, chatRoomsPredicted: 25, messagesPredicted: 325 },
      { date: "11월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 32, commentsPredicted: 125, chatRoomsPredicted: 28, messagesPredicted: 365 },
      { date: "12월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 36, commentsPredicted: 138, chatRoomsPredicted: 31, messagesPredicted: 400 },
      { date: "1월", posts: null, comments: null, chatRooms: null, messages: null, postsPredicted: 39, commentsPredicted: 148, chatRoomsPredicted: 33, messagesPredicted: 430 }
    ]
  }
]

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
const trendingPosts = [
  { 
    rank: 1, 
    title: "새로운 기능 업데이트! 놓치지 마세요", 
    author: "박민수", 
    country: "일본",
    category: "공지사항",
    views: 8500, 
    likes: 3, 
    comments: 89, 
    bookmarks: 32,
    createdAt: "2025-01-15",
    trendScore: 95.2,
    trendData: postTrendData
  },
  { 
    rank: 2, 
    title: "이벤트 참여하고 선물 받아가세요", 
    author: "최지영", 
    country: "미국",
    category: "이벤트",
    views: 7200, 
    likes: 2, 
    comments: 67, 
    bookmarks: 28,
    createdAt: "2025-01-14",
    trendScore: 88.7,
    trendData: postTrendData.map(d => ({
      ...d,
      views: d.views ? Math.round(d.views * 0.85) : null,
      viewsPredicted: d.viewsPredicted ? Math.round(d.viewsPredicted * 0.85) : null,
      likes: d.likes ? Math.round(d.likes * 0.8) : null,
      likesPredicted: d.likesPredicted ? Math.round(d.likesPredicted * 0.8) : null,
      comments: d.comments ? Math.round(d.comments * 0.75) : null,
      commentsPredicted: d.commentsPredicted ? Math.round(d.commentsPredicted * 0.75) : null,
      bookmarks: d.bookmarks ? Math.round(d.bookmarks * 0.8) : null,
      bookmarksPredicted: d.bookmarksPredicted ? Math.round(d.bookmarksPredicted * 0.8) : null
    }))
  },
  { 
    rank: 3, 
    title: "사용법 궁금한 분들 여기로!", 
    author: "정수진", 
    country: "한국",
    category: "정품리뷰",
    views: 6800, 
    likes: 1, 
    comments: 45, 
    bookmarks: 19,
    createdAt: "2025-01-13",
    trendScore: 82.1,
    trendData: postTrendData.map(d => ({
      ...d,
      views: d.views ? Math.round(d.views * 0.7) : null,
      viewsPredicted: d.viewsPredicted ? Math.round(d.viewsPredicted * 0.7) : null,
      likes: d.likes ? Math.round(d.likes * 0.6) : null,
      likesPredicted: d.likesPredicted ? Math.round(d.likesPredicted * 0.6) : null,
      comments: d.comments ? Math.round(d.comments * 0.5) : null,
      commentsPredicted: d.commentsPredicted ? Math.round(d.commentsPredicted * 0.5) : null,
      bookmarks: d.bookmarks ? Math.round(d.bookmarks * 0.6) : null,
      bookmarksPredicted: d.bookmarksPredicted ? Math.round(d.bookmarksPredicted * 0.6) : null
    }))
  },
  { 
    rank: 4, 
    title: "할인 정보 공유합니다", 
    author: "강동훈", 
    country: "중국",
    category: "판별팁",
    views: 5900, 
    likes: 4, 
    comments: 38, 
    bookmarks: 25,
    createdAt: "2025-01-12",
    trendScore: 76.5,
    trendData: postTrendData.map(d => ({
      ...d,
      views: d.views ? Math.round(d.views * 0.6) : null,
      viewsPredicted: d.viewsPredicted ? Math.round(d.viewsPredicted * 0.6) : null,
      likes: d.likes ? Math.round(d.likes * 0.65) : null,
      likesPredicted: d.likesPredicted ? Math.round(d.likesPredicted * 0.65) : null,
      comments: d.comments ? Math.round(d.comments * 0.45) : null,
      commentsPredicted: d.commentsPredicted ? Math.round(d.commentsPredicted * 0.45) : null,
      bookmarks: d.bookmarks ? Math.round(d.bookmarks * 0.7) : null,
      bookmarksPredicted: d.bookmarksPredicted ? Math.round(d.bookmarksPredicted * 0.7) : null
    }))
  },
  { 
    rank: 5, 
    title: "문제 해결 방법 알려드려요", 
    author: "윤서연", 
    country: "중국",
    category: "정품리뷰",
    views: 5200, 
    likes: 2, 
    comments: 29, 
    bookmarks: 16,
    createdAt: "2025-01-11",
    trendScore: 71.3,
    trendData: postTrendData.map(d => ({
      ...d,
      views: d.views ? Math.round(d.views * 0.5) : null,
      viewsPredicted: d.viewsPredicted ? Math.round(d.viewsPredicted * 0.5) : null,
      likes: d.likes ? Math.round(d.likes * 0.5) : null,
      likesPredicted: d.likesPredicted ? Math.round(d.likesPredicted * 0.5) : null,
      comments: d.comments ? Math.round(d.comments * 0.35) : null,
      commentsPredicted: d.commentsPredicted ? Math.round(d.commentsPredicted * 0.35) : null,
      bookmarks: d.bookmarks ? Math.round(d.bookmarks * 0.5) : null,
      bookmarksPredicted: d.bookmarksPredicted ? Math.round(d.bookmarksPredicted * 0.5) : null
    }))
  }
]

// 인기 게시물 데이터
const popularPosts = [
  { 
    rank: 1, 
    title: "이 제품 정     말 좋네요! 추천합니다 정말 너돈더ㅗㄴ던다ㅓㄴ아ㅣㅓㄹ민아럼;ㄴ아럼;ㄴ이ㅏㅓㄹ밍나ㅓㄹㅁ;ㅏㅣㅓ  ", 
    author: "김철수", 
    country: "한국",
    category: "제품리뷰",
    views: 12500, 
    likes: 1, 
    comments: 120, 
    bookmarks: 45,
    createdAt: "2025-01-10"
  },
  { 
    rank: 2, 
    title: "품질이 기대 이상입니다 정말 만족해요", 
    author: "이영희", 
    country: "한국",
    category: "제품리뷰",
    views: 10200, 
    likes: 7, 
    comments: 95, 
    bookmarks: 38,
    createdAt: "2025-01-11"
  },
  { 
    rank: 3, 
    title: "가격 대비 만족도 높아요 추천합니다", 
    author: "박민수", 
    country: "일본",
    category: "Q&A",
    views: 9800, 
    likes: 6, 
    comments: 88, 
    bookmarks: 32,
    createdAt: "2025-01-12"
  },
  { 
    rank: 4, 
    title: "배송도 빠르고 포장도 깔끔해요 완전 만족", 
    author: "최지영", 
    country: "미국",
    category: "제품리뷰",
    views: 8900, 
    likes: 10, 
    comments: 75, 
    bookmarks: 28,
    createdAt: "2025-01-13"
  },
  { 
    rank: 5, 
    title: "다음에도 주문할 예정입니다 정말 좋아요", 
    author: "정수현", 
    country: "한국",
    category: "인증거래",
    views: 8200, 
    likes: 10, 
    comments: 65, 
    bookmarks: 25,
    createdAt: "2025-01-14"
  },
  { 
    rank: 6, 
    title: "정품 인증이 확실해서 신뢰가 갑니다", 
    author: "강민호",
    country: "일본",
    category: "인증거래",
    views: 7800, 
    likes: 9, 
    comments: 58, 
    bookmarks: 22,
    createdAt: "2025-01-13"
  },
  { 
    rank: 7, 
    title: "상품 상태가 정말 깨끗하네요 감사합니다", 
    author: "윤서연",
    country: "중국",
    category: "제품리뷰",
    views: 7300, 
    likes: 8, 
    comments: 52, 
    bookmarks: 20,
    createdAt: "2025-01-12"
  },
  { 
    rank: 8, 
    title: "친절한 판매자분 덕분에 좋은 거래였어요", 
    author: "임동현",
    country: "한국",
    category: "판별팁",
    views: 6900, 
    likes: 7, 
    comments: 48, 
    bookmarks: 18,
    createdAt: "2025-01-11"
  },
  { 
    rank: 9, 
    title: "사진보다 실물이 더 예쁘네요 만족", 
    author: "조은지",
    country: "일본",
    category: "제품리뷰",
    views: 6500, 
    likes: 7, 
    comments: 42, 
    bookmarks: 16,
    createdAt: "2025-01-10"
  },
  { 
    rank: 10, 
    title: "이 가격에 이 퀄리티라니 대만족입니다", 
    author: "송준호",
    country: "미국",
    category: "Q&A",
    views: 6100, 
    likes: 6, 
    comments: 38, 
    bookmarks: 15,
    createdAt: "2025-01-09"
  },
  { 
    rank: 11, 
    title: "재구매 의사 100% 있습니다 강추", 
    author: "한지우",
    country: "한국",
    category: "제품리뷰",
    views: 5800, 
    likes: 5, 
    comments: 35, 
    bookmarks: 14,
    createdAt: "2025-01-08"
  },
  { 
    rank: 12, 
    title: "포장이 정말 튼튼해서 안심이에요", 
    author: "백승현",
    country: "중국",
    category: "판별팁",
    views: 5400, 
    likes: 5, 
    comments: 32, 
    bookmarks: 13,
    createdAt: "2025-01-07"
  },
  { 
    rank: 13, 
    title: "상세 설명대로 정확한 제품 감사합니다", 
    author: "신유진",
    country: "한국",
    category: "Q&A",
    views: 5100, 
    likes: 4, 
    comments: 28, 
    bookmarks: 12,
    createdAt: "2025-01-06"
  },
  { 
    rank: 14, 
    title: "가성비 최고 제품이네요 추천드려요", 
    author: "오태영",
    country: "일본",
    category: "제품리뷰",
    views: 4800, 
    likes: 4, 
    comments: 25, 
    bookmarks: 11,
    createdAt: "2025-01-05"
  },
  { 
    rank: 15, 
    title: "배송 추적이 잘 되어서 편리했어요", 
    author: "장미래",
    country: "베트남",
    category: "인증거래",
    views: 4500, 
    likes: 3, 
    comments: 22, 
    bookmarks: 10,
    createdAt: "2025-01-04"
  },
  { 
    rank: 16, 
    title: "이 브랜드 제품 진짜 믿을 만해요", 
    author: "권도윤",
    country: "한국",
    category: "판별팁",
    views: 4200, 
    likes: 3, 
    comments: 20, 
    bookmarks: 9,
    createdAt: "2025-01-03"
  },
  { 
    rank: 17, 
    title: "사용감이 정말 좋아요 만족스럽습니다", 
    author: "남궁민",
    country: "일본",
    category: "제품리뷰",
    views: 3900, 
    likes: 2, 
    comments: 18, 
    bookmarks: 8,
    createdAt: "2025-01-02"
  },
  { 
    rank: 18, 
    title: "정품 판별법 공유해주셔서 감사합니다", 
    author: "서하늘",
    country: "미국",
    category: "판별팁",
    views: 3600, 
    likes: 2, 
    comments: 16, 
    bookmarks: 7,
    createdAt: "2025-01-01"
  },
  { 
    rank: 19, 
    title: "구매 전 Q&A 답변 정말 친절하셨어요", 
    author: "황지훈",
    country: "중국",
    category: "Q&A",
    views: 3300, 
    likes: 1, 
    comments: 14, 
    bookmarks: 6,
    createdAt: "2024-12-31"
  },
  { 
    rank: 20, 
    title: "신뢰할 수 있는 판매자 또 거래하고 싶어요", 
    author: "고은별",
    country: "한국",
    category: "인증거래",
    views: 3000, 
    likes: 1, 
    comments: 12, 
    bookmarks: 5,
    createdAt: "2024-12-30"
  },
]

// 월별 활동 추이 데이터
const monthlyActivityData = [
  { month: "7월", posts: 25, comments: 80, likes: 200, bookmarks: 15, cumulative: 320, predicted: null, postsPredicted: null, commentsPredicted: null, likesPredicted: null, bookmarksPredicted: null },
  { month: "8월", posts: 32, comments: 95, likes: 250, bookmarks: 18, cumulative: 395, predicted: null, postsPredicted: null, commentsPredicted: null, likesPredicted: null, bookmarksPredicted: null },
  { month: "9월", posts: 28, comments: 88, likes: 220, bookmarks: 16, cumulative: 352, predicted: null, postsPredicted: null, commentsPredicted: null, likesPredicted: null, bookmarksPredicted: null },
  { month: "10월", posts: 35, comments: 110, likes: 280, bookmarks: 22, cumulative: 447, predicted: null, postsPredicted: null, commentsPredicted: null, likesPredicted: null, bookmarksPredicted: null },
  { month: "11월", posts: 38, comments: 120, likes: 320, bookmarks: 25, cumulative: 503, predicted: null, postsPredicted: null, commentsPredicted: null, likesPredicted: null, bookmarksPredicted: null },
  { month: "12월", posts: 42, comments: 135, likes: 350, bookmarks: 28, cumulative: 555, predicted: 555, postsPredicted: 42, commentsPredicted: 135, likesPredicted: 350, bookmarksPredicted: 28 },
  { month: "1월", posts: null, comments: null, likes: null, bookmarks: null, cumulative: null, predicted: 580, postsPredicted: 45, commentsPredicted: 150, likesPredicted: 380, bookmarksPredicted: 32 },
  { month: "2월", posts: null, comments: null, likes: null, bookmarks: null, cumulative: null, predicted: 610, postsPredicted: 48, commentsPredicted: 165, likesPredicted: 400, bookmarksPredicted: 35 },
]

// 월별 채팅 추이 데이터 (예측치 포함)
const monthlyChatData = [
  { month: "7월", chatRooms: 8, messages: 200, chatRoomsPredicted: null, messagesPredicted: null },
  { month: "8월", chatRooms: 10, messages: 280, chatRoomsPredicted: null, messagesPredicted: null },
  { month: "9월", chatRooms: 9, messages: 250, chatRoomsPredicted: null, messagesPredicted: null },
  { month: "10월", chatRooms: 12, messages: 320, chatRoomsPredicted: null, messagesPredicted: null },
  { month: "11월", chatRooms: 14, messages: 380, chatRoomsPredicted: null, messagesPredicted: null },
  { month: "12월", chatRooms: 15, messages: 420, chatRoomsPredicted: 15, messagesPredicted: 420 },
  { month: "1월", chatRooms: null, messages: null, chatRoomsPredicted: 17, messagesPredicted: 480 },
  { month: "2월", chatRooms: null, messages: null, chatRoomsPredicted: 19, messagesPredicted: 520 },
  { month: "3월", chatRooms: null, messages: null, chatRoomsPredicted: 21, messagesPredicted: 580 },
]


export function PlatformRankingAccordions({ 
  selectedCountry = "전체"
}: { selectedCountry?: string }) {

  // 필터 상태
  const [selectedCommunity, setSelectedCommunity] = useState<string>("전체")
  const [selectedCategory, setSelectedCategory] = useState<string>("전체")

  // 커뮤니티 유저 점유율 계산 (게시물 + 댓글 + 좋아요 + 북마크)
  const calculateCommunityUserShare = (user: typeof communityUsers[0], users: typeof communityUsers, limit: number) => {
    const userTotal = user.posts + user.comments + user.likes + user.bookmarks
    const allTotal = users.slice(0, limit).reduce((sum, u) => sum + u.posts + u.comments + u.likes + u.bookmarks, 0)
    return allTotal > 0 ? ((userTotal / allTotal) * 100).toFixed(1) : "0.0"
  }

  // 채팅 유저 점유율 계산 (채팅방 + 메시지)
  const calculateChatUserShare = (user: typeof chatUsers[0], users: typeof chatUsers, limit: number) => {
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

  // 필터링 - 커뮤니티와 카테고리 기준으로 필터링
  const filteredCommunityUsers = useMemo(() => {
    return communityUsers.filter(user => {
      const matchCommunity = selectedCommunity === "전체" || user.communityType === selectedCommunity
      const matchCategory = selectedCategory === "전체" || user.productCategory === selectedCategory
      return matchCommunity && matchCategory
    })
  }, [selectedCommunity, selectedCategory])

  // 필터링 - 급상승 게시물 (게시물은 category 필드 사용)
  const filteredTrendingPosts = useMemo(() => {
    return trendingPosts.filter(post => {
      // 커뮤니티 타입 매핑: category -> communityType
      const communityTypeMap: Record<string, string> = {
        "제품리뷰": "제품리뷰",
        "정품리뷰": "제품리뷰",
        "판별팁": "판별팁",
        "인증거래": "인증거래",
        "Q&A": "Q&A",
      }
      const postCommunityType = communityTypeMap[post.category] || post.category
      const matchCommunity = selectedCommunity === "전체" || postCommunityType === selectedCommunity
      // 게시물에는 productCategory가 없으므로 일단 통과 (나중에 추가 가능)
      const matchCategory = selectedCategory === "전체" || true
      return matchCommunity && matchCategory
    })
  }, [selectedCommunity, selectedCategory])

  // 필터링 - 채팅 유저 (채팅 유저는 communityType/productCategory가 없으므로 일단 통과)
  const filteredChatUsers = useMemo(() => {
    // 채팅 유저는 필터링 대상이 아니므로 그대로 반환
    return chatUsers
  }, [])

  // 필터링 - 급상승 유저 (유저는 communityType/productCategory가 없으므로 일단 통과)
  const filteredTrendingUsers = useMemo(() => {
    // 급상승 유저는 필터링 대상이 아니므로 그대로 반환
    return trendingUsers
  }, [])

  // 필터링 - 인기 게시물
  const filteredPopularPosts = useMemo(() => {
    return popularPosts.filter(post => {
      // 커뮤니티 타입 매핑
      const communityTypeMap: Record<string, string> = {
        "제품리뷰": "제품리뷰",
        "정품리뷰": "제품리뷰",
        "판별팁": "판별팁",
        "인증거래": "인증거래",
        "Q&A": "Q&A",
      }
      const postCommunityType = communityTypeMap[post.category] || post.category
      const matchCommunity = selectedCommunity === "전체" || postCommunityType === selectedCommunity
      const matchCategory = selectedCategory === "전체" || true
      return matchCommunity && matchCategory
    })
  }, [selectedCommunity, selectedCategory])

  // 종합 유저 랭킹 데이터
  // 백엔드에서 이미 상위 50% 유저 중 상승률 30% 이상인 유저를 필터링해서 가져옴
  // 프론트엔드에서는 단순히 데이터를 받아서 표시만 함
  const combinedUsers = useMemo(() => {
    // TODO: 백엔드 API 호출로 대체
    // const response = await fetch('/api/combined-users?growthRateMin=30')
    // return await response.json()
    
    // 현재는 mock 데이터로 합산 (실제로는 백엔드에서 필터링된 데이터를 받아옴)
    const userMap = new Map<string, {
      name: string
      country: string
      posts: number
      comments: number
      likes: number
      bookmarks: number
      chatRooms: number
      messages: number
      lastActivity: string
      growthRate: number
      previousPosts?: number
      previousComments?: number
      previousLikes?: number
      previousChatRooms?: number
      previousMessages?: number
    }>()

    // 커뮤니티 유저 데이터 합산
    filteredCommunityUsers.forEach(user => {
      const key = user.name
      if (userMap.has(key)) {
        const existing = userMap.get(key)!
        existing.posts += user.posts
        existing.comments += user.comments
        existing.likes += user.likes
        existing.bookmarks += user.bookmarks
      } else {
        userMap.set(key, {
          name: user.name,
          country: user.country || "기타",
          posts: user.posts,
          comments: user.comments,
          likes: user.likes,
          bookmarks: user.bookmarks,
          chatRooms: 0,
          messages: 0,
          lastActivity: user.lastActivity,
          growthRate: 0 // 백엔드에서 계산된 값
        })
      }
    })

    // 채팅 유저 데이터 합산
    filteredChatUsers.forEach(user => {
      const key = user.name
      if (userMap.has(key)) {
        const existing = userMap.get(key)!
        existing.chatRooms += user.chatRooms
        existing.messages += user.messages
      } else {
        userMap.set(key, {
          name: user.name,
          country: user.country || "기타",
          posts: 0,
          comments: 0,
          likes: 0,
          bookmarks: 0,
          chatRooms: user.chatRooms,
          messages: user.messages,
          lastActivity: user.lastChat,
          growthRate: 0 // 백엔드에서 계산된 값
        })
      }
    })

    // 백엔드에서 이미 필터링된 데이터라고 가정하고 반환
    // 실제로는 상승률이 계산되어 있고, 상위 50% 중 30% 이상인 유저만 포함됨
    return Array.from(userMap.values())
      .map((user, index) => ({
        rank: index + 1,
        ...user,
        // Mock: 상승률 30% 이상으로 가정 (실제로는 백엔드에서 계산된 값)
        growthRate: 30 + Math.random() * 70 // 30~100% 범위의 랜덤 값
      }))
      .filter(user => user.growthRate >= 30) // 백엔드에서 이미 필터링되어 있지만, 추가 확인
      .sort((a, b) => {
        // 활동량 기준 정렬 (게시글수, 댓글수, 좋아요수, 채팅방수, 메시지수 합산)
        const aTotal = a.posts + a.comments + a.likes + a.chatRooms + a.messages
        const bTotal = b.posts + b.comments + b.likes + b.chatRooms + b.messages
        return bTotal - aTotal
      })
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }))
      }, [filteredCommunityUsers, filteredChatUsers])

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
      '제품리뷰': 0,
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

  // 종합 게시물 랭킹 생성 (인기 게시물 + 급상승 게시물)
  const combinedPosts = useMemo(() => {
    const postMap = new Map<string, {
      title: string
      author: string
      country: string
      category: string
      views: number
      likes: number
      comments: number
      bookmarks: number
      totalEngagement: number
      createdAt: string
      trendScore?: number
      trendData?: any
    }>()

    // 인기 게시물 데이터 합산
    filteredPopularPosts.forEach(post => {
      const key = `${post.title}-${post.author}`
      const engagement = post.views + post.likes + post.comments + post.bookmarks
      if (!postMap.has(key)) {
        postMap.set(key, {
          title: post.title,
          author: post.author,
          country: post.country || "기타",
          category: post.category,
          views: post.views,
          likes: post.likes,
          comments: post.comments,
          bookmarks: post.bookmarks,
          totalEngagement: engagement,
          createdAt: post.createdAt,
          trendData: postTrendData
        })
      } else {
        const existing = postMap.get(key)!
        existing.views = Math.max(existing.views, post.views)
        existing.likes += post.likes
        existing.comments += post.comments
        existing.bookmarks += post.bookmarks
        existing.totalEngagement = existing.views + existing.likes + existing.comments + existing.bookmarks
      }
    })

    // 급상승 게시물 데이터 합산
    filteredTrendingPosts.forEach(post => {
      const key = `${post.title}-${post.author}`
      const engagement = post.views + post.likes + post.comments + post.bookmarks
      if (postMap.has(key)) {
        const existing = postMap.get(key)!
        existing.views = Math.max(existing.views, post.views)
        existing.likes += post.likes
        existing.comments += post.comments
        existing.bookmarks += post.bookmarks
        existing.totalEngagement = existing.views + existing.likes + existing.comments + existing.bookmarks
        existing.trendScore = post.trendScore
        existing.trendData = post.trendData
      } else {
        postMap.set(key, {
          title: post.title,
          author: post.author,
          country: post.country || "기타",
          category: post.category,
          views: post.views,
          likes: post.likes,
          comments: post.comments,
          bookmarks: post.bookmarks,
          totalEngagement: engagement,
          createdAt: post.createdAt,
          trendScore: post.trendScore,
          trendData: post.trendData
        })
      }
    })

    return Array.from(postMap.values())
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .map((post, index) => ({
        rank: index + 1,
        ...post
      }))
  }, [filteredTrendingPosts, filteredPopularPosts])

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
        ...chatUsers.map(u => ({ 
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
          messages: u.messages, 
          trendData: u.trendData 
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
  const [selectedChatUser, setSelectedChatUser] = useState<typeof chatUsers[0] | null>(null)
  const [selectedTrendingUser, setSelectedTrendingUser] = useState<typeof filteredTrendingUsers[0] | null>(null)
  const [selectedPopularPost, setSelectedPopularPost] = useState<typeof filteredPopularPosts[0] | null>(null)
  const [selectedPostAuthor, setSelectedPostAuthor] = useState<any | null>(null)  // 작성자 상세 모달용
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false)
  const [isCombinedUsersModalOpen, setIsCombinedUsersModalOpen] = useState(false)  // 종합 유저 상세 모달용
  const [selectedCombinedUser, setSelectedCombinedUser] = useState<any | null>(null)  // 선택된 종합 유저
  const [filteredCombinedUserLanguage, setFilteredCombinedUserLanguage] = useState<string>('전체')  // 종합 유저 필터: 언어
  const [filteredCombinedUserApp, setFilteredCombinedUserApp] = useState<string>('전체')  // 종합 유저 필터: 가입앱
  // 종합 유저 모달에서 선택된 유저의 상세 정보 state
  const [selectedCombinedUserDetail, setSelectedCombinedUserDetail] = useState<UserDetail | null>(null)
  const [selectedCombinedUserTrendData, setSelectedCombinedUserTrendData] = useState<ReturnType<typeof getCommunityUserTrendData> | null>(null)

  // 종합 유저 선택 시 상세 정보 가져오기
  useEffect(() => {
    if (selectedCombinedUser) {
      getUserDetailFromUserNo(selectedCombinedUser.id || selectedCombinedUser.name).then(userDetail => {
        if (userDetail) {
          const enrichedUserDetail: UserDetail = {
            ...userDetail,
            posts: selectedCombinedUser.posts || userDetail.posts,
            comments: selectedCombinedUser.comments || userDetail.comments,
            likes: selectedCombinedUser.likes || userDetail.likes,
            bookmarks: selectedCombinedUser.bookmarks || userDetail.bookmarks,
            chatRooms: selectedCombinedUser.chatRooms || userDetail.chatRooms,
            country: selectedCombinedUser.country || userDetail.country,
          }
          setSelectedCombinedUserDetail(enrichedUserDetail)
          const trendData = getCommunityUserTrendData(enrichedUserDetail)
          setSelectedCombinedUserTrendData(trendData)
        }
      })
    } else {
      setSelectedCombinedUserDetail(null)
      setSelectedCombinedUserTrendData(null)
    }
  }, [selectedCombinedUser])
  
  // 통합 유저 상세 모달용 state
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false)
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetail | null>(null)
  const [selectedUserTrendData, setSelectedUserTrendData] = useState<ReturnType<typeof getCommunityUserTrendData> | null>(null)

  // 게시물 상세 모달용 state
  const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false)
  const [selectedPostDetail, setSelectedPostDetail] = useState<PostDetail | null>(null)
  const [selectedPostDetailAuthor, setSelectedPostDetailAuthor] = useState<UserDetail | null>(null)  // 게시물 상세 모달 내 유저 정보
  
  // 종합 게시물 랭킹 전체보기 모달용 state
  const [isCombinedPostsModalOpen, setIsCombinedPostsModalOpen] = useState(false)
  const [selectedCombinedPost, setSelectedCombinedPost] = useState<PostDetail | null>(null)
  const [selectedCombinedPostAuthor, setSelectedCombinedPostAuthor] = useState<UserDetail | null>(null)

  // 유저 클릭 핸들러
  const handleUserClick = async (user: any, source: 'community' | 'chat' | 'trending' | 'combined') => {
    // user_no를 통해 유저 상세 정보 가져오기
    const userDetail = await getUserDetailFromUserNo(user.id || user.name)
    if (userDetail) {
      // 랭킹 데이터의 활동 정보를 반영
      const enrichedUserDetail: UserDetail = {
        ...userDetail,
        posts: user.posts || userDetail.posts,
        comments: user.comments || userDetail.comments,
        likes: user.likes || userDetail.likes,
        bookmarks: user.bookmarks || userDetail.bookmarks,
        chatRooms: user.chatRooms || userDetail.chatRooms,
        country: user.country || userDetail.country,
      }
      setSelectedUserDetail(enrichedUserDetail)
      // 추이 데이터 생성
      const trendData = getCommunityUserTrendData(enrichedUserDetail)
      setSelectedUserTrendData(trendData)
      setIsUserDetailModalOpen(true)
    }
  }

  // 커뮤니티 유저 클릭 핸들러 (첫 클릭: 추이 변경, 두 번째 클릭: 모달 열기)
  const handleCommunityUserClick = async (user: typeof filteredCommunityUsers[0]) => {
    // 같은 유저를 다시 클릭한 경우 모달 열기
    if (selectedCommunityUser?.rank === user.rank) {
      await handleUserClick(user, 'community')
    } else {
      // 다른 유저를 클릭한 경우 추이만 변경
      setSelectedCommunityUser(user)
    }
  }

  // 채팅 유저 클릭 핸들러 (첫 클릭: 추이 변경, 두 번째 클릭: 모달 열기)
  const handleChatUserClick = async (user: typeof chatUsers[0]) => {
    // 같은 유저를 다시 클릭한 경우 모달 열기
    if (selectedChatUser?.rank === user.rank) {
      await handleUserClick(user, 'chat')
    } else {
      // 다른 유저를 클릭한 경우 추이만 변경
      setSelectedChatUser(user)
    }
  }

  // 급상승 유저 클릭 핸들러 (첫 클릭: 추이 변경, 두 번째 클릭: 모달 열기)
  const handleTrendingUserClick = async (user: typeof filteredTrendingUsers[0]) => {
    // 같은 유저를 다시 클릭한 경우 모달 열기
    if (selectedTrendingUser?.rank === user.rank) {
      await handleUserClick(user, 'trending')
    } else {
      // 다른 유저를 클릭한 경우 추이만 변경
      setSelectedTrendingUser(user)
    }
  }

  // 인기 게시물 클릭 핸들러 (첫 클릭: 추이 변경, 두 번째 클릭: 모달 열기)
  const handlePopularPostClick = (post: typeof popularPosts[0]) => {
    // 같은 게시물을 다시 클릭한 경우 모달 열기
    if (selectedPopularPost?.rank === post.rank) {
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
                    chatUsers.find(u => u.name === author) ||
                    filteredTrendingUsers.find(u => u.name === author) ||
                    combinedUsers.find(u => u.name === author)
        return user ? 'HT' : 'COP'
      }
      const getUserNo = (author: string): string | undefined => {
        // Mock: 작성자 이름 기반으로 user_no 추론
        const user = filteredCommunityUsers.find(u => u.name === author) ||
                    chatUsers.find(u => u.name === author) ||
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
      setSelectedPostDetail(postDetail)
      setSelectedPostDetailAuthor(null)  // 모달 열 때 유저 정보 초기화
      setIsPostDetailModalOpen(true)
    } else {
      // 다른 게시물을 클릭한 경우 추이만 변경
      setSelectedPopularPost(post)
    }
  }

  // 커뮤니티 유저용 추이 데이터 생성 함수 (any 타입 허용)
  const getCommunityUserTrendData = (user: any) => {
    const totalActivity = (user.posts || 0) + (user.comments || 0) + (user.likes || 0) + (user.bookmarks || 0)
    const baseMultiplier = totalActivity > 0 ? totalActivity / 100 : 0.5
    return monthlyActivityData.map(item => {
      // cumulative와 predicted는 null 체크를 명확하게 하고, 값이 있을 때만 계산
      const cumulativeValue = item.cumulative != null ? Math.round((item.cumulative || 0) * baseMultiplier) : null
      const predictedValue = item.predicted != null ? Math.round((item.predicted || 0) * baseMultiplier) : null
      
      return {
        ...item,
        month: item.month, // month 필드 명시적으로 유지
        posts: item.posts != null ? Math.round((item.posts || 0) * baseMultiplier) : null,
        comments: item.comments != null ? Math.round((item.comments || 0) * baseMultiplier) : null,
        likes: item.likes != null ? Math.round((item.likes || 0) * baseMultiplier) : null,
        bookmarks: item.bookmarks != null ? Math.round((item.bookmarks || 0) * baseMultiplier) : null,
        postsPredicted: item.postsPredicted != null ? Math.round((item.postsPredicted || 0) * baseMultiplier) : null,
        commentsPredicted: item.commentsPredicted != null ? Math.round((item.commentsPredicted || 0) * baseMultiplier) : null,
        likesPredicted: item.likesPredicted != null ? Math.round((item.likesPredicted || 0) * baseMultiplier) : null,
        bookmarksPredicted: item.bookmarksPredicted != null ? Math.round((item.bookmarksPredicted || 0) * baseMultiplier) : null,
        cumulative: cumulativeValue,
        predicted: predictedValue,
      }
    })
  }

  // 채팅 유저용 추이 데이터 생성 함수
  const getChatUserTrendData = (user: typeof chatUsers[0]) => {
    const baseMultiplier = (user.chatRooms + user.messages) / 100
    return monthlyChatData.map(item => ({
      ...item,
      chatRooms: item.chatRooms ? Math.round((item.chatRooms || 0) * baseMultiplier) : null,
      messages: item.messages ? Math.round((item.messages || 0) * baseMultiplier) : null,
      chatRoomsPredicted: item.chatRoomsPredicted ? Math.round((item.chatRoomsPredicted || 0) * baseMultiplier) : null,
      messagesPredicted: item.messagesPredicted ? Math.round((item.messagesPredicted || 0) * baseMultiplier) : null,
    }))
  }

  // 종합 유저용 추이 데이터 생성 함수 (커뮤니티 + 채팅 합산)
  const getCombinedUserTrendData = (user: any) => {
    // 커뮤니티 활동량
    const communityActivity = (user.posts || 0) + (user.comments || 0) + (user.likes || 0) + (user.bookmarks || 0)
    // 채팅 활동량
    const chatActivity = (user.chatRooms || 0) + (user.messages || 0)
    // 총 활동량
    const totalActivity = communityActivity + chatActivity
    const baseMultiplier = totalActivity > 0 ? totalActivity / 100 : 0.5
    
    // monthlyActivityData와 monthlyChatData를 합산
    return monthlyActivityData.map((item, index) => {
      const chatItem = monthlyChatData[index] || { chatRooms: null, messages: null, chatRoomsPredicted: null, messagesPredicted: null }
      
      return {
        ...item,
        month: item.month,
        // 커뮤니티 활동
        posts: item.posts != null ? Math.round((item.posts || 0) * baseMultiplier) : null,
        comments: item.comments != null ? Math.round((item.comments || 0) * baseMultiplier) : null,
        likes: item.likes != null ? Math.round((item.likes || 0) * baseMultiplier) : null,
        bookmarks: item.bookmarks != null ? Math.round((item.bookmarks || 0) * baseMultiplier) : null,
        postsPredicted: item.postsPredicted != null ? Math.round((item.postsPredicted || 0) * baseMultiplier) : null,
        commentsPredicted: item.commentsPredicted != null ? Math.round((item.commentsPredicted || 0) * baseMultiplier) : null,
        likesPredicted: item.likesPredicted != null ? Math.round((item.likesPredicted || 0) * baseMultiplier) : null,
        bookmarksPredicted: item.bookmarksPredicted != null ? Math.round((item.bookmarksPredicted || 0) * baseMultiplier) : null,
        // 채팅 활동
        chatRooms: chatItem.chatRooms != null ? Math.round((chatItem.chatRooms || 0) * baseMultiplier) : null,
        messages: chatItem.messages != null ? Math.round((chatItem.messages || 0) * baseMultiplier) : null,
        chatRoomsPredicted: chatItem.chatRoomsPredicted != null ? Math.round((chatItem.chatRoomsPredicted || 0) * baseMultiplier) : null,
        messagesPredicted: chatItem.messagesPredicted != null ? Math.round((chatItem.messagesPredicted || 0) * baseMultiplier) : null,
      }
    })
  }

  // Top 5 유저들의 월별 개별 추이 데이터 생성 함수 (유저별로 시리즈 분리)
  const getTop5CombinedUsersTrendData = useMemo(() => {
    const top5Users = combinedUsers.slice(0, 5)
    const userColors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'] // Top 5 유저별 색상
    
    // monthlyActivityData를 기반으로 각 월별로 top5 유저들의 데이터 생성
    return monthlyActivityData.map((item, index) => {
      const chatItem = monthlyChatData[index] || { chatRooms: null, messages: null, chatRoomsPredicted: null, messagesPredicted: null }
      
      const result: any = {
        month: item.month,
      }
      
      // 각 유저별로 총 활동량 계산 (커뮤니티 + 채팅)
      top5Users.forEach((user, userIndex) => {
        const userData = getCombinedUserTrendData(user)[index]
        // 각 유저의 총 활동량 = 게시글 + 댓글 + 좋아요 + 북마크 + 채팅방 + 메시지
        const totalActivity = (userData.posts || 0) + (userData.comments || 0) + (userData.likes || 0) + 
                             (userData.bookmarks || 0) + (userData.chatRooms || 0) + (userData.messages || 0)
        const totalActivityPredicted = (userData.postsPredicted || 0) + (userData.commentsPredicted || 0) + 
                                      (userData.likesPredicted || 0) + (userData.bookmarksPredicted || 0) + 
                                      (userData.chatRoomsPredicted || 0) + (userData.messagesPredicted || 0)
        
        result[user.name] = totalActivity || null
        result[`${user.name}_predicted`] = totalActivityPredicted || null
      })
      
      return result
    })
  }, [combinedUsers])
  
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
                  <XAxis dataKey="month" />
                  <YAxis />
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
            {combinedUsers.slice(0, 5).map((user) => (
              <div
                key={user.rank}
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
            ))}
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
                        key={user.rank}
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
          </div>
          
          {/* 통합 추이 그래프 */}
          <div className="mb-4 space-y-2">
            <h4 className="font-semibold text-sm">
              {selectedCommunityUser 
                ? `${selectedCommunityUser.name}님의 월별 활동 추이` 
                : filteredCommunityUsers.length > 0 
                  ? `${filteredCommunityUsers[0].name}님의 월별 활동 추이`
                  : '월별 활동 추이'}
            </h4>
            <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={
                  selectedCommunityUser 
                    ? getCommunityUserTrendData(selectedCommunityUser) 
                    : filteredCommunityUsers.length > 0 
                      ? getCommunityUserTrendData(filteredCommunityUsers[0])
                      : monthlyActivityData
                }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Bar dataKey="posts" fill="#3b82f6" name="게시글" />
                            <Bar dataKey="postsPredicted" fill="#3b82f6" fillOpacity={0.3} name="게시글 (예측)" />
                            <Bar dataKey="comments" fill="#10b981" name="댓글" />
                            <Bar dataKey="commentsPredicted" fill="#10b981" fillOpacity={0.3} name="댓글 (예측)" />
                            <Bar dataKey="bookmarks" fill="#f59e0b" name="북마크" />
                            <Bar dataKey="bookmarksPredicted" fill="#f59e0b" fillOpacity={0.3} name="북마크 (예측)" />
                            <Bar dataKey="likes" fill="#ef4444" name="좋아요" />
                            <Bar dataKey="likesPredicted" fill="#ef4444" fillOpacity={0.3} name="좋아요 (예측)" />
                            <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" name="누적 추이" />
                            <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeDasharray="5 5" name="예상 추이" />
                            <Legend content={<CustomLegend />} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

          {/* 유저 리스트 */}
          <div className="space-y-2">
            {filteredCommunityUsers.slice(0, 5).map((user) => (
              <div
                key={user.rank}
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
            ))}
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
              {selectedChatUser 
                ? `${selectedChatUser.name}님의 월별 채팅 추이` 
                : chatUsers.length > 0 
                  ? `${chatUsers[0].name}님의 월별 채팅 추이`
                  : '월별 채팅 추이'}
            </h4>
            <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={
                  selectedChatUser 
                    ? getChatUserTrendData(selectedChatUser) 
                    : chatUsers.length > 0 
                      ? getChatUserTrendData(chatUsers[0])
                      : monthlyChatData
                }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Bar dataKey="chatRooms" fill="#3b82f6" name="채팅방" />
                            <Bar dataKey="chatRoomsPredicted" fill="#3b82f6" fillOpacity={0.3} name="채팅방 (예측)" />
                            <Line type="monotone" dataKey="messages" stroke="#10b981" name="메시지" />
                            <Line type="monotone" dataKey="messagesPredicted" stroke="#10b981" strokeDasharray="5 5" name="메시지 (예측)" />
                            <Legend content={<CustomLegend />} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

          {/* 유저 리스트 */}
          <div className="space-y-2">
            {chatUsers.slice(0, 5).map((user) => (
              <div
                key={user.rank}
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
                      점유율: {calculateChatUserShare(user, chatUsers, 5)}%
                    </Badge>
                      </div>
                      </div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-muted-foreground">
                  <div>채팅방 {user.chatRooms}개</div>
                  <div>메시지 {user.messages}개</div>
                    </div>
                  </div>
            ))}
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
              {selectedTrendingUser 
                ? `${selectedTrendingUser.name}님의 월별 활동 추이` 
                : filteredTrendingUsers.length > 0 
                  ? `${filteredTrendingUsers[0].name}님의 월별 활동 추이`
                  : '월별 활동 추이'}
            </h4>
            <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={
                  selectedTrendingUser?.trendData || 
                  (filteredTrendingUsers.length > 0 ? filteredTrendingUsers[0].trendData : [])
                }>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="posts" stroke="#3b82f6" name="게시글" />
                            <Line type="monotone" dataKey="postsPredicted" stroke="#3b82f6" strokeDasharray="5 5" name="게시글 (예측)" />
                            <Line type="monotone" dataKey="comments" stroke="#10b981" name="댓글" />
                            <Line type="monotone" dataKey="commentsPredicted" stroke="#10b981" strokeDasharray="5 5" name="댓글 (예측)" />
                            <Line type="monotone" dataKey="chatRooms" stroke="#f59e0b" name="채팅방" />
                            <Line type="monotone" dataKey="chatRoomsPredicted" stroke="#f59e0b" strokeDasharray="5 5" name="채팅방 (예측)" />
                            <Line type="monotone" dataKey="messages" stroke="#8b5cf6" name="메시지" />
                            <Line type="monotone" dataKey="messagesPredicted" stroke="#8b5cf6" strokeDasharray="5 5" name="메시지 (예측)" />
                            <Legend content={<CustomLegend />} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                        </div>

          {/* 유저 리스트 */}
          <div className="space-y-2">
            {filteredTrendingUsers.slice(0, 5).map((user) => (
              <div
                key={user.rank}
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
                    <span className="text-red-500 font-semibold whitespace-nowrap">급상승 {getTrendingUserScore(user).toFixed(1)}%</span>
                        </div>
                        </div>
                <div className="grid grid-cols-4 gap-4 mt-2 text-xs text-muted-foreground">
                  <div>게시글 {user.posts}</div>
                  <div>댓글 {user.comments}</div>
                  <div>채팅방 {user.chatRooms}</div>
                  <div>메시지 {user.messages}</div>
                      </div>
                    </div>
            ))}
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
          
          {/* 카테고리별/언어별 요약 지표 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
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
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1.5 font-semibold">랭킹 게시글 언어별 점유율</p>
              {combinedPostLanguageShareData.length > 0 ? (
                <>
                  <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={combinedPostLanguageShareData}
                          cx="50%"
                          cy="50%"
                          innerRadius={15}
                          outerRadius={30}
                          paddingAngle={1}
                          dataKey="value"
                        >
                          {combinedPostLanguageShareData.map((entry, index) => (
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
                    {combinedPostLanguageShareData.slice(0, 5).map((item, index) => (
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
            {combinedPosts.slice(0, 5).map((post) => (
              <div
                key={post.rank}
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
                                chatUsers.find(u => u.name === author) ||
                                filteredTrendingUsers.find(u => u.name === author) ||
                                combinedUsers.find(u => u.name === author)
                    return user ? 'HT' : 'COP'
                  }
                  const getUserNo = (author: string): string | undefined => {
                    // Mock: 작성자 이름 기반으로 user_no 추론
                    const user = filteredCommunityUsers.find(u => u.name === author) ||
                                chatUsers.find(u => u.name === author) ||
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
            </DialogHeader>
            <div className="flex-1 flex flex-col mt-4 min-h-0 overflow-hidden">
              
              {/* 상단: 게시물 리스트와 상세 정보 */}
              <div className="flex-1 grid grid-cols-[1fr_30%_35%] gap-4 min-h-0 overflow-hidden">
                {/* 좌측: 게시물 리스트 */}
                <div className="flex flex-col min-w-0 min-h-0">
                  <h3 className="text-lg font-semibold mb-3 flex-shrink-0">게시물 리스트</h3>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                    {combinedPosts.map((post) => {
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
                                    chatUsers.find(u => u.name === author) ||
                                    filteredTrendingUsers.find(u => u.name === author) ||
                                    combinedUsers.find(u => u.name === author)
                        return user ? 'HT' : 'COP'
                      }
                      const getUserNo = (author: string): string | undefined => {
                        const user = filteredCommunityUsers.find(u => u.name === author) ||
                                    chatUsers.find(u => u.name === author) ||
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
                          key={post.rank}
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
                          {selectedCombinedPost.imageUrl && (
                            <div className="w-full max-h-[300px] rounded-lg overflow-hidden border">
                              <img
                                src={selectedCombinedPost.imageUrl}
                                alt={selectedCombinedPost.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
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
                                              chatUsers.find(u => u.name === selectedCombinedPost.author) ||
                                              filteredTrendingUsers.find(u => u.name === selectedCombinedPost.author) ||
                                              combinedUsers.find(u => u.name === selectedCombinedPost.author)
                                  if (user) {
                                    const userDetail = await getUserDetailFromUserNo((user as any).id || user.name)
                                    if (userDetail) {
                                      const enrichedUserDetail: UserDetail = {
                                        ...userDetail,
                                        posts: (user as any).posts || userDetail.posts || 0,
                                        comments: (user as any).comments || userDetail.comments || 0,
                                        likes: (user as any).likes || userDetail.likes || 0,
                                        bookmarks: (user as any).bookmarks || userDetail.bookmarks || 0,
                                        chatRooms: (user as any).chatRooms || userDetail.chatRooms || 0,
                                        country: (user as any).country || userDetail.country || '미지정',
                                      }
                                      setSelectedCombinedPostAuthor(enrichedUserDetail)
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
                              <p className="text-sm font-bold">{selectedCombinedPostAuthor.signupDate}</p>
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
                                data={getCommunityUserTrendData(selectedCombinedPostAuthor)}
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
                    {selectedPostDetail.imageUrl && (
                      <div className="w-full max-h-[400px] rounded-lg overflow-hidden border">
                        <img
                          src={selectedPostDetail.imageUrl}
                          alt={selectedPostDetail.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
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
                                        chatUsers.find(u => u.name === selectedPostDetail.author) ||
                                        filteredTrendingUsers.find(u => u.name === selectedPostDetail.author) ||
                                        combinedUsers.find(u => u.name === selectedPostDetail.author)
                            if (user) {
                              const userDetail = await getUserDetailFromUserNo((user as any).id || user.name)
                              if (userDetail) {
                                const enrichedUserDetail: UserDetail = {
                                  ...userDetail,
                                  posts: (user as any).posts || userDetail.posts || 0,
                                  comments: (user as any).comments || userDetail.comments || 0,
                                  likes: (user as any).likes || userDetail.likes || 0,
                                  bookmarks: (user as any).bookmarks || userDetail.bookmarks || 0,
                                  chatRooms: (user as any).chatRooms || userDetail.chatRooms || 0,
                                  country: (user as any).country || userDetail.country || '미지정',
                                }
                                setSelectedPostDetailAuthor(enrichedUserDetail)
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
                            <p className="text-sm font-bold">{selectedPostDetailAuthor.signupDate}</p>
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
                              data={getCommunityUserTrendData(selectedPostDetailAuthor)}
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
            <h3 className="font-semibold text-foreground">인기 게시물 랭킹</h3>
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
            {filteredPopularPosts.slice(0, 5).map((post) => (
              <div
                key={post.rank}
                onClick={() => handlePopularPostClick(post)}
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
                        data={getCommunityUserTrendData(selectedPostAuthor)}
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
            {filteredTrendingPosts.slice(0, 5).map((post) => (
              <AccordionItem key={post.rank} value={`trending-${post.rank}`}>
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

