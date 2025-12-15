'use client'

import { useEffect, useState } from 'react'
import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * WebSocket 및 Redis 연결 상태를 표시하는 컴포넌트
 */
export function WebSocketConnectionStatus() {
  const { 
    status, 
    isConnected, 
    isConnecting, 
    reconnectAttempts,
    lastMessage,
    getMessageLog 
  } = useWebSocketContext()

  const [messageCount, setMessageCount] = useState(0)
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null)

  // 메시지 수 및 마지막 메시지 시간 업데이트
  useEffect(() => {
    if (lastMessage) {
      setMessageCount(prev => prev + 1)
      setLastMessageTime(new Date())
    }
  }, [lastMessage])

  // 메시지 로그에서 총 개수 가져오기
  useEffect(() => {
    const log = getMessageLog()
    setMessageCount(log.length)
    if (log.length > 0) {
      setLastMessageTime(new Date(log[0].timestamp || Date.now()))
    }
  }, [getMessageLog])

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle2,
          text: '연결됨',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        }
      case 'connecting':
        return {
          icon: Loader2,
          text: '연결 중...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        }
      case 'error':
        return {
          icon: XCircle,
          text: '연결 오류',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        }
      default:
        return {
          icon: WifiOff,
          text: '연결 안됨',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          연결 상태
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* WebSocket 연결 상태 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">WebSocket</span>
            <Badge 
              variant={isConnected ? 'default' : 'destructive'}
              className={cn(
                'flex items-center gap-1',
                isConnected && 'bg-green-600'
              )}
            >
              <Icon 
                className={cn(
                  'h-3 w-3',
                  config.color,
                  isConnecting && 'animate-spin'
                )} 
              />
              {config.text}
            </Badge>
          </div>
          
          {isConnecting && (
            <p className="text-xs text-muted-foreground">
              연결 중... ({reconnectAttempts}번째 시도)
            </p>
          )}
          
          {!isConnected && reconnectAttempts > 0 && (
            <p className="text-xs text-muted-foreground">
              재연결 시도: {reconnectAttempts}회
            </p>
          )}
        </div>

        {/* 메시지 통계 */}
        {isConnected && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">수신 메시지</span>
              <Badge variant="secondary">{messageCount}개</Badge>
            </div>
            
            {lastMessageTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">마지막 메시지</span>
                <span className="text-xs text-muted-foreground">
                  {lastMessageTime.toLocaleTimeString('ko-KR')}
                </span>
              </div>
            )}

            {lastMessage && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                <div className="font-medium mb-1">최근 메시지:</div>
                <div className="text-muted-foreground">
                  타입: <span className="font-mono">{lastMessage.type}</span>
                </div>
                <div className="text-muted-foreground mt-1">
                  {JSON.stringify(lastMessage.data).substring(0, 100)}
                  {JSON.stringify(lastMessage.data).length > 100 ? '...' : ''}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 연결 정보 */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>엔드포인트: {process.env.NEXT_PUBLIC_WS_ENDPOINT || '설정되지 않음'}</div>
            <div>상태: {status}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

