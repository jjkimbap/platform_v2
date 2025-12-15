'use client'

/**
 * WebSocket 사용 예시 컴포넌트
 * 
 * 이 파일은 WebSocket 시스템 사용법을 보여주는 예시입니다.
 * 실제 사용 시에는 이 컴포넌트를 참고하여 구현하세요.
 */

import { useEffect } from 'react'
import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { MESSAGE_TYPES } from '@/config/websocket.config'
import { WebSocketStatusIndicator } from './websocket-status-indicator'

export function WebSocketExample() {
  const { 
    isConnected, 
    lastMessage, 
    registerHandler,
    getMessageLog 
  } = useWebSocketContext()

  // 커뮤니티 모니터 메시지 구독
  useEffect(() => {
    const unsubscribe = registerHandler('COMMUNITY', (data) => {
      console.log('📝 커뮤니티 업데이트 수신:', data)
      // 여기에 커뮤니티 데이터 업데이트 로직 추가
      // 예: 상태 업데이트, 캐시 갱신 등
    })

    return unsubscribe
  }, [registerHandler])

  // 채팅 모니터 메시지 구독
  useEffect(() => {
    const unsubscribe = registerHandler('CHAT', (data) => {
      console.log('💬 채팅 업데이트 수신:', data)
      // 여기에 채팅 데이터 업데이트 로직 추가
    })

    return unsubscribe
  }, [registerHandler])

  // 실행 모니터 메시지 구독
  useEffect(() => {
    const unsubscribe = registerHandler('EXE', (data) => {
      console.log('▶️ 실행 모니터 업데이트 수신:', data)
      // 여기에 실행 데이터 업데이트 로직 추가
    })

    return unsubscribe
  }, [registerHandler])

  // 스캔 모니터 메시지 구독
  useEffect(() => {
    const unsubscribe = registerHandler('SCAN', (data) => {
      console.log('🔍 스캔 모니터 업데이트 수신:', data)
      // 여기에 스캔 데이터 업데이트 로직 추가
    })

    return unsubscribe
  }, [registerHandler])

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">WebSocket 예시</h2>
        <WebSocketStatusIndicator />
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm text-muted-foreground">
            연결 상태: {isConnected ? '✅ 연결됨' : '❌ 연결 안됨'}
          </p>
        </div>

        {lastMessage && (
          <div className="p-4 border rounded-lg">
            <p className="text-sm font-semibold mb-2">최근 메시지:</p>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
              {JSON.stringify(lastMessage, null, 2)}
            </pre>
          </div>
        )}

        <div className="p-4 border rounded-lg">
          <p className="text-sm font-semibold mb-2">
            메시지 로그 ({getMessageLog().length}개):
          </p>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {getMessageLog().slice(-10).reverse().map((msg, index) => (
              <div key={index} className="text-xs p-2 bg-muted rounded">
                <span className="font-medium">{msg.type}:</span>{' '}
                {JSON.stringify(msg.data).substring(0, 100)}...
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook을 직접 사용하는 예시 (Context 없이)
 */
export function WebSocketDirectExample() {
  const { useWebSocket } = require('@/hooks/useWebSocket')
  const { useMessageHandler } = require('@/hooks/useMessageHandler')

  const { isConnected, lastMessage } = useWebSocket()
  const { handleMessage, registerHandler } = useMessageHandler()

  useEffect(() => {
    if (lastMessage) {
      handleMessage(lastMessage)
    }
  }, [lastMessage, handleMessage])

  useEffect(() => {
    const unsubscribe = registerHandler('COMMUNITY', (data) => {
      console.log('커뮤니티 업데이트:', data)
    })

    return unsubscribe
  }, [registerHandler])

  return (
    <div>
      <p>상태: {isConnected ? 'ONLINE' : 'OFFLINE'}</p>
    </div>
  )
}

