"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, ChevronDown, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWebSocketContext } from "@/contexts/WebSocketContext"
import { MESSAGE_TYPES } from "@/config/websocket.config"

interface RealtimeEvent {
  id: number
  message: string
  timestamp: Date
  type: 'post' | 'chat' | 'scan' | 'login'
}

interface RealtimeIndicatorProps {
  onToggle?: (isOpen: boolean) => void
}

export function RealtimeIndicator({ onToggle }: RealtimeIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [newCount, setNewCount] = useState(0)
  
  // WebSocket 연결 상태 가져오기
  const { isConnected, registerHandler } = useWebSocketContext()

  // WebSocket 메시지 핸들러 등록
  useEffect(() => {
    // 커뮤니티 타입을 한글로 변환하는 헬퍼 함수
    const getCommunityTypeName = (type: string): string => {
      switch (type) {
        case 'TradeEntity':
          return '정품 인증 거래'
        case 'CommDebateEntity':
          return 'Q&A'
        case 'CommProductReviewEntity':
          return '제품리뷰'
        case 'CommInfoEntity':
          return '판별팁'
        default:
          return '커뮤니티'
      }
    }

    // 커뮤니티 모니터 메시지 처리
    const unsubscribeCommunity = registerHandler('COMMUNITY', (data: any) => {
      const communityType = getCommunityTypeName(data.type)
      const appKind = data.app_kind || 'HT'
      const nickname = data.user_nickname || data.user_no || '사용자'
      const title = data.title || '새 게시글'

      const newEvent: RealtimeEvent = {
        id: Date.now() + Math.random(),
        message: `[${appKind}] ${nickname}님이 <${communityType}> 커뮤니티에 "${title}" 게시글을 작성했습니다.`,
        timestamp: new Date(data.create_date || new Date()),
        type: 'post'
      }
      setEvents(prev => [newEvent, ...prev.slice(0, 19)])
      if (!isOpen) {
        setNewCount(prev => prev + 1)
      }
    })

    // 채팅 모니터 메시지 처리
    const unsubscribeChat = registerHandler('CHAT', (data: any) => {
      const newEvent: RealtimeEvent = {
        id: Date.now() + Math.random(),
        message: data.userId 
          ? `${data.userId}님이 채팅 메시지를 보냈습니다.`
          : `새로운 채팅 메시지가 도착했습니다.`,
        timestamp: new Date(),
        type: 'chat'
      }
      setEvents(prev => [newEvent, ...prev.slice(0, 19)])
      if (!isOpen) {
        setNewCount(prev => prev + 1)
      }
    })

    // 거래 채팅 모니터 메시지 처리
    const unsubscribeTradeChat = registerHandler('TRADE_CHAT', (data: any) => {
      const newEvent: RealtimeEvent = {
        id: Date.now() + Math.random(),
        message: data.userId 
          ? `${data.userId}님이 거래 채팅을 시작했습니다.`
          : `새로운 거래 채팅이 시작되었습니다.`,
        timestamp: new Date(),
        type: 'chat'
      }
      setEvents(prev => [newEvent, ...prev.slice(0, 19)])
      if (!isOpen) {
        setNewCount(prev => prev + 1)
      }
    })

    // 실행 모니터 메시지 처리
    const unsubscribeExe = registerHandler('EXE', (data: any) => {
      const newEvent: RealtimeEvent = {
        id: Date.now() + Math.random(),
        message: data.userId 
          ? `${data.userId}님이 앱을 실행했습니다.`
          : `앱 실행 활동이 업데이트되었습니다.`,
        timestamp: new Date(),
        type: 'login'
      }
      setEvents(prev => [newEvent, ...prev.slice(0, 19)])
      if (!isOpen) {
        setNewCount(prev => prev + 1)
      }
    })

    // 스캔 모니터 메시지 처리
    const unsubscribeScan = registerHandler('SCAN', (data: any) => {
      const newEvent: RealtimeEvent = {
        id: Date.now() + Math.random(),
        message: data.userId 
          ? `${data.userId}님이 제품을 스캔했습니다.`
          : `제품 스캔 활동이 업데이트되었습니다.`,
        timestamp: new Date(),
        type: 'scan'
      }
      setEvents(prev => [newEvent, ...prev.slice(0, 19)])
      if (!isOpen) {
        setNewCount(prev => prev + 1)
      }
    })

    return () => {
      unsubscribeCommunity()
      unsubscribeChat()
      unsubscribeTradeChat()
      unsubscribeExe()
      unsubscribeScan()
    }
  }, [registerHandler, isOpen])

  // 실시간 이벤트 생성 (모의 데이터 - WebSocket이 연결되지 않았을 때만)
  useEffect(() => {
    // WebSocket이 연결되어 있으면 모의 데이터 생성하지 않음
    if (isConnected) {
      return
    }

    const eventTemplates = [
      "홍길동님이 <정품 인증 거래> 커뮤니티에 게시글을 작성했습니다.",
      "이영희님이 김철수님과 채팅을 시작했습니다.",
      "박민수님이 제품을 스캔했습니다.",
      "최지영님이 <Q&A> 커뮤니티에 질문을 올렸습니다.",
      "정수현님이 인증거래를 완료했습니다.",
      "김철수님이 <제품리뷰> 커뮤니티에 리뷰를 작성했습니다.",
      "이영희님이 가품을 신고했습니다.",
      "박민수님이 <판별팁> 커뮤니티에 팁을 공유했습니다.",
      "최지영님이 정품 인증을 요청했습니다.",
      "정수현님이 채팅방을 개설했습니다."
    ]

    const eventTypes: RealtimeEvent['type'][] = ['post', 'chat', 'scan', 'login']

    const generateEvent = (): RealtimeEvent => ({
      id: Date.now() + Math.random(),
      message: eventTemplates[Math.floor(Math.random() * eventTemplates.length)],
      timestamp: new Date(),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)]
    })

    // 초기 이벤트 생성
    const initialEvents = Array.from({ length: 5 }, generateEvent)
    setEvents(initialEvents)
    setNewCount(3)

    // 실시간 이벤트 추가
    const interval = setInterval(() => {
      const newEvent = generateEvent()
      setEvents(prev => [newEvent, ...prev.slice(0, 19)]) // 최대 20개 유지
      setNewCount(prev => prev + 1)
    }, 3000 + Math.random() * 2000) // 3-5초 간격

    return () => clearInterval(interval)
  }, [isConnected])

  const handleToggle = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    onToggle?.(newIsOpen)
    if (!newIsOpen) {
      setNewCount(0) // 열 때 NEW 카운트 리셋
    }
  }

  const getEventIcon = (type: RealtimeEvent['type']) => {
    switch (type) {
      case 'post':
        return '📝'
      case 'chat':
        return '💬'
      case 'scan':
        return '📱'
      case 'login':
        return '👤'
      default:
        return '📝'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className={cn(
          "relative flex items-center gap-2 transition-all duration-200",
          isOpen && "bg-primary text-primary-foreground",
          // WebSocket 연결 상태에 따라 색상 변경
          isConnected 
            ? "border-green-500 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 dark:border-green-600" 
            : "border-red-500 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 dark:border-red-600"
        )}
      >
        <Activity className={cn(
          "h-4 w-4",
          isConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400 animate-pulse"
        )} />
        <span>실시간 지표</span>
        {newCount > 0 && (
          <Badge 
            variant={isConnected ? "default" : "destructive"} 
            className={cn(
              "ml-1 h-5 w-5 rounded-full p-0 text-xs",
              isConnected && "bg-green-600 hover:bg-green-700"
            )}
          >
            {newCount > 9 ? '9+' : newCount}
          </Badge>
        )}
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {/* 실시간 패널 - 우측 고정 */}
      {isOpen && (
        <div className="fixed right-0 top-16 w-[25%] h-[calc(100vh-4rem)] bg-background border-l border-border shadow-lg z-40 md:block hidden overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">실시간 활동</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  LIVE
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false)
                    onToggle?.(false)
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="h-[calc(100%-4rem)] overflow-y-auto">
            <div className="p-3 space-y-3">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-md transition-colors",
                    index === 0 && "bg-primary/5 border border-primary/20"
                  )}
                >
                  <span className="text-lg mt-0.5">{getEventIcon(event.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      {event.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 모바일 하단 고정 패널 */}
      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">실시간 활동</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  LIVE
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false)
                    onToggle?.(false)
                  }}
                  className="h-6 w-6 p-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            <div className="p-3 space-y-3">
              {events.slice(0, 5).map((event, index) => (
                <div
                  key={event.id}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-md transition-colors",
                    index === 0 && "bg-primary/5 border border-primary/20"
                  )}
                >
                  <span className="text-lg mt-0.5">{getEventIcon(event.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      {event.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
