'use client'

import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, XCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { WEBSOCKET_CONFIG } from '@/config/websocket.config'

export function WebSocketDebug() {
  const { 
    status, 
    isConnected, 
    isConnecting, 
    reconnectAttempts,
    connect,
    disconnect,
    lastMessage 
  } = useWebSocketContext()

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'connecting':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-blue-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          WebSocket 연결 상태
          {getStatusIcon()}
        </CardTitle>
        <CardDescription>
          WebSocket 연결 디버깅 정보
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 연결 상태 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="font-medium">상태:</span>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {status}
            </Badge>
          </div>
        </div>

        {/* 엔드포인트 정보 */}
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">엔드포인트:</span>
            <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
              {WEBSOCKET_CONFIG.ENDPOINT}
            </code>
          </div>
        </div>

        {/* 재연결 시도 */}
        {reconnectAttempts > 0 && (
          <div className="text-sm text-yellow-600">
            재연결 시도: {reconnectAttempts}/{WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS}
          </div>
        )}

        {/* 마지막 메시지 */}
        {lastMessage && (
          <div className="space-y-2">
            <div className="text-sm font-medium">마지막 메시지:</div>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(lastMessage, null, 2)}
            </pre>
          </div>
        )}

        {/* 연결/해제 버튼 */}
        <div className="flex gap-2">
          <Button
            onClick={connect}
            disabled={isConnecting || isConnected}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            연결
          </Button>
          <Button
            onClick={disconnect}
            disabled={!isConnected && !isConnecting}
            size="sm"
            variant="outline"
          >
            <XCircle className="h-4 w-4 mr-2" />
            연결 해제
          </Button>
        </div>

        {/* 디버깅 정보 */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• 연결 중: {isConnecting ? '예' : '아니오'}</div>
          <div>• 연결됨: {isConnected ? '예' : '아니오'}</div>
          <div>• 최대 재연결 시도: {WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS}</div>
        </div>
      </CardContent>
    </Card>
  )
}

