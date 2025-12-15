'use client'

import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useMessageHandler } from '@/hooks/useMessageHandler'
import { WebSocketMessage } from '@/types/websocket'
import { MESSAGE_TYPES } from '@/config/websocket.config'

interface WebSocketContextValue {
  // 연결 상태
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  isConnected: boolean
  isConnecting: boolean
  reconnectAttempts: number
  
  // 메시지
  lastMessage: WebSocketMessage | null
  
  // 메서드
  connect: () => void
  disconnect: () => void
  sendMessage: (message: any) => boolean
  
  // 메시지 핸들러
  handleMessage: (message: WebSocketMessage) => Promise<void>
  registerHandler: (type: keyof typeof MESSAGE_TYPES, handler: (data: any) => void) => () => void
  registerHandlers: (handlers: Record<string, (data: any) => void>) => () => void
  registerDefaultHandlers: () => () => void
  
  // 유틸리티
  getMessageLog: () => WebSocketMessage[]
  clearMessageLog: () => void
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined)

interface WebSocketProviderProps {
  children: ReactNode
  autoConnect?: boolean
  enableDefaultHandlers?: boolean
}

/**
 * WebSocket Context Provider
 * 전역 WebSocket 상태와 메시지 처리를 제공합니다.
 */
export function WebSocketProvider({ 
  children, 
  autoConnect = true,
  enableDefaultHandlers = true 
}: WebSocketProviderProps) {
  const webSocket = useWebSocket()
  const messageHandler = useMessageHandler()

  // 기본 핸들러 등록
  useEffect(() => {
    if (enableDefaultHandlers) {
      const cleanup = messageHandler.registerDefaultHandlers()
      return cleanup
    }
  }, [enableDefaultHandlers, messageHandler])

  // 메시지 자동 처리
  useEffect(() => {
    if (webSocket.lastMessage) {
      messageHandler.handleMessage(webSocket.lastMessage)
    }
  }, [webSocket.lastMessage, messageHandler])

  // 자동 연결
  useEffect(() => {
    if (autoConnect && webSocket.status === 'disconnected') {
      webSocket.connect()
    }
  }, [autoConnect, webSocket])

  const contextValue: WebSocketContextValue = {
    // 연결 상태
    status: webSocket.status,
    isConnected: webSocket.isConnected,
    isConnecting: webSocket.isConnecting,
    reconnectAttempts: webSocket.reconnectAttempts,
    
    // 메시지
    lastMessage: webSocket.lastMessage,
    
    // 메서드
    connect: webSocket.connect,
    disconnect: webSocket.disconnect,
    sendMessage: webSocket.sendMessage,
    
    // 메시지 핸들러
    handleMessage: messageHandler.handleMessage,
    registerHandler: messageHandler.registerHandler,
    registerHandlers: messageHandler.registerHandlers,
    registerDefaultHandlers: messageHandler.registerDefaultHandlers,
    
    // 유틸리티
    getMessageLog: messageHandler.getMessageLog,
    clearMessageLog: messageHandler.clearMessageLog,
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

/**
 * WebSocket Context를 사용하는 Hook
 */
export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  
  if (context === undefined) {
    throw new Error('useWebSocketContext는 WebSocketProvider 내부에서만 사용할 수 있습니다')
  }
  
  return context
}

