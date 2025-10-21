"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { TrendChart } from "@/components/trend-chart"
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChevronDown, ChevronUp, Users, MessageCircle, TrendingUp, Award, Calendar, MessageSquare, Heart, Bookmark, Eye } from "lucide-react"

// 커뮤니티 유저 랭킹 데이터
const communityUsers = [
  { rank: 1, name: "홍길동", score: 98.5, posts: 45, comments: 120, likes: 3, bookmarks: 28, lastActivity: "2025-01-15" },
  { rank: 2, name: "이영희", score: 95.2, posts: 38, comments: 95, likes: 2, bookmarks: 22, lastActivity: "2025-01-15" },
  { rank: 3, name: "박민수", score: 92.8, posts: 32, comments: 88, likes: 10, bookmarks: 19, lastActivity: "2025-01-14" },
  { rank: 4, name: "최지영", score: 89.1, posts: 28, comments: 75, likes: 2, bookmarks: 16, lastActivity: "2025-01-14" },
  { rank: 5, name: "정수현", score: 86.7, posts: 25, comments: 65, likes: 9, bookmarks: 14, lastActivity: "2025-01-13" },
]

// 채팅 유저 랭킹 데이터
const chatUsers = [
  { rank: 1, name: "김철수", score: 96.8, chatRooms: 15, messages: 50, lastChat: "2025-01-15" },
  { rank: 2, name: "이영희", score: 93.5, chatRooms: 12, messages: 80, lastChat: "2025-01-15" },
  { rank: 3, name: "박민수", score: 90.2, chatRooms: 10, messages: 20, lastChat: "2025-01-14" },
  { rank: 4, name: "최지영", score: 87.1, chatRooms: 8, messages: 10, lastChat: "2025-01-14" },
  { rank: 5, name: "정수현", score: 84.6, chatRooms: 2, messages: 8, lastChat: "2025-01-13" },
]

// 인기 게시물 데이터
const popularPosts = [
  { 
    rank: 1, 
    title: "이 제품 정     말 좋네요! 추천합니다 정말 너돈더ㅗㄴ던다ㅓㄴ아ㅣㅓㄹ민아럼;ㄴ아럼;ㄴ이ㅏㅓㄹ밍나ㅓㄹㅁ;ㅏㅣㅓ  ", 
    author: "김철수", 
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
    category: "인증거래",
    views: 8200, 
    likes: 10, 
    comments: 65, 
    bookmarks: 25,
    createdAt: "2025-01-14"
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

export function RankingAccordions() {
  return (
    <section className="space-y-4">
      
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 커뮤니티 유저 랭킹 */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">커뮤니티 유저 랭킹</h3>
          </div>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="community-1">
            {communityUsers.map((user) => (
              <AccordionItem key={user.rank} value={`community-${user.rank}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                        {user.rank}
                      </Badge>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{user.score}점</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
 
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">월별 활동 추이</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={monthlyActivityData}>
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
                            <Legend />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span>게시글 {user.posts}개</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-green-500" />
                        <span>댓글 {user.comments}개</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>좋아요 {user.likes}개</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4 text-orange-500" />
                        <span>북마크 {user.bookmarks}개</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span>최근 활동: {user.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* 채팅 유저 랭킹 */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">채팅 유저 랭킹</h3>
          </div>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="chat-1">
            {chatUsers.map((user) => (
              <AccordionItem key={user.rank} value={`chat-${user.rank}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                        {user.rank}
                      </Badge>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{user.score}점</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">월별 채팅 추이</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={monthlyChatData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Bar dataKey="chatRooms" fill="#3b82f6" name="채팅방" />
                            <Bar dataKey="chatRoomsPredicted" fill="#3b82f6" fillOpacity={0.3} name="채팅방 (예측)" />
                            <Line type="monotone" dataKey="messages" stroke="#10b981" name="메시지" />
                            <Line type="monotone" dataKey="messagesPredicted" stroke="#10b981" strokeDasharray="5 5" name="메시지 (예측)" />
                            <Legend />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span>채팅방 {user.chatRooms}개</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <span>메시지 {user.messages}개</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span>최근 채팅: {user.lastChat}</span>
                      </div>
                    </div>
                    
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* 인기 게시물 랭킹 */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">인기 게시물 랭킹</h3>
          </div>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="post-1">
            {popularPosts.map((post) => (
              <AccordionItem key={post.rank} value={`post-${post.rank}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0 shrink-0">
                        {post.rank}
                      </Badge>
                      <span className="font-medium text-sm truncate max-w-[200px]" title={post.title}>{post.title}</span>
                      
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0 ml-2"><Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">작성자: {post.author}</span>
                        <span className="text-muted-foreground">조회수: {post.views.toLocaleString()}</span>
                        
                      </div>
                      
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">게시물 추이</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={postTrendData}>
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
                            <Legend />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {/* <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span>조회 {post.views.toLocaleString()}</span>
                        </div> */}
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </section>
  )
}
