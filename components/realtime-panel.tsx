"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Activity } from "lucide-react"

interface RealtimeEvent {
  id: string
  message: string
  timestamp: Date
  type: 'post' | 'chat' | 'scan' | 'execution'
}

const mockEvents: Omit<RealtimeEvent, 'timestamp'>[] = [
  { id: "1", message: "홍길동님이 <정품 인증 거래> 커뮤니티에 게시글을 작성했습니다.", type: "post" },
  { id: "2", message: "이영희님이 김철수님과 채팅을 시작했습니다.", type: "chat" },
  { id: "3", message: "박민수님이 제품을 스캔했습니다.", type: "scan" },
  { id: "4", message: "최지영님이 앱을 실행했습니다.", type: "execution" },
  { id: "5", message: "정수현님이 <Q&A> 커뮤니티에 질문을 올렸습니다.", type: "post" },
  { id: "6", message: "한동민님이 채팅방을 개설했습니다.", type: "chat" },
  { id: "7", message: "송미영님이 제품을 스캔했습니다.", type: "scan" },
  { id: "8", message: "강태현님이 앱을 실행했습니다.", type: "execution" },
  { id: "9", message: "김철수님이 <제품리뷰> 커뮤니티에 리뷰를 작성했습니다.", type: "post" },
  { id: "10", message: "이영희님이 채팅방에 참여했습니다.", type: "chat" },
]

interface RealtimePanelProps {
  onToggle?: (isOpen: boolean) => void
}

export function RealtimePanel({ onToggle }: RealtimePanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    // 초기 이벤트 로드
    const initialEvents = mockEvents.slice(0, 5).map(event => ({
      ...event,
      timestamp: new Date(Date.now() - Math.random() * 300000) // 최근 5분 내
    }))
    setEvents(initialEvents)
    setNewCount(3) // 새로운 이벤트 3개

    // 새로운 이벤트 시뮬레이션
    const interval = setInterval(() => {
      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)]
      const newEvent: RealtimeEvent = {
        ...randomEvent,
        timestamp: new Date()
      }
      
      setEvents(prev => [newEvent, ...prev.slice(0, 9)]) // 최대 10개 유지
      setNewCount(prev => prev + 1)
    }, 5000) // 5초마다 새 이벤트

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝'
      case 'chat': return '💬'
      case 'scan': return '📱'
      case 'execution': return '▶️'
      default: return '📢'
    }
  }

  return (
    <div className="relative">
      {/* 실시간 보기 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const newIsOpen = !isOpen
          setIsOpen(newIsOpen)
          onToggle?.(newIsOpen)
        }}
        className="relative flex items-center gap-2"
      >
        <Activity className="h-4 w-4 animate-pulse" />
        실시간 보기
        {newCount > 0 && (
          <Badge variant="destructive" className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {newCount > 9 ? '9+' : newCount}
          </Badge>
        )}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {/* 실시간 패널 */}
      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-hidden z-50 bg-card border-border shadow-lg">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">실시간 활동</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">LIVE</span>
              </div>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            <div className="p-4 space-y-3">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="text-lg">{getEventIcon(event.type)}</div>
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
          
          <div className="p-3 border-t border-border bg-muted/20">
            <p className="text-xs text-center text-muted-foreground">
              자동으로 최신 활동이 업데이트됩니다
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
