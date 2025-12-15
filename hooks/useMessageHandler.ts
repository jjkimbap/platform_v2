'use client'

import { useCallback, useRef, useEffect } from 'react'
import { MESSAGE_TYPES } from '@/config/websocket.config'
import { MessageHandler, MessageHandlerMap, WebSocketMessage } from '@/types/websocket'

/**
 * WebSocket 메시지를 타입별로 처리하는 Hook
 */
export function useMessageHandler() {
  const handlersRef = useRef<MessageHandlerMap>({})
  const messageLogRef = useRef<WebSocketMessage[]>([])
  const maxLogSize = 100 // 최대 로그 크기

  /**
   * 메시지 타입별 핸들러 등록
   */
  const registerHandler = useCallback((
    type: keyof typeof MESSAGE_TYPES,
    handler: MessageHandler
  ) => {
    handlersRef.current[MESSAGE_TYPES[type]] = handler
    
    // cleanup 함수 반환
    return () => {
      delete handlersRef.current[MESSAGE_TYPES[type]]
    }
  }, [])

  /**
   * 여러 핸들러를 한 번에 등록
   */
  const registerHandlers = useCallback((handlers: MessageHandlerMap) => {
    handlersRef.current = { ...handlersRef.current, ...handlers }
    
    // cleanup 함수 반환
    return () => {
      Object.keys(handlers).forEach(key => {
        delete handlersRef.current[key as keyof MessageHandlerMap]
      })
    }
  }, [])

  /**
   * 메시지 처리
   */
  const handleMessage = useCallback(async (message: WebSocketMessage) => {
    if (!message || !message.type) {
      console.warn('⚠️ 잘못된 메시지 형식:', message)
      return
    }

    // 개발 환경에서 메시지 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('📨 WebSocket 메시지 수신:', message.type, message.data)
      
      // 메시지 로그에 추가
      messageLogRef.current.push(message)
      if (messageLogRef.current.length > maxLogSize) {
        messageLogRef.current.shift()
      }
    }

    // 타입별 핸들러 실행
    const handler = handlersRef.current[message.type]
    if (handler) {
      try {
        await handler(message.data)
      } catch (error) {
        console.error(`❌ 메시지 핸들러 실행 실패 (${message.type}):`, error)
      }
    } else {
      console.warn(`⚠️ 등록되지 않은 메시지 타입: ${message.type}`)
    }
  }, [])

  /**
   * 커뮤니티 모니터 메시지 처리
   */
  const handleCommunityMonitor = useCallback((data: any) => {
    console.log('📝 커뮤니티 업데이트:', data)
    // 여기에 커뮤니티 데이터 업데이트 로직 추가
    // 예: 상태 업데이트, 캐시 갱신 등
  }, [])

  /**
   * 채팅 모니터 메시지 처리
   */
  const handleChatMonitor = useCallback((data: any) => {
    console.log('💬 채팅 업데이트:', data)
    // 여기에 채팅 데이터 업데이트 로직 추가
  }, [])

  /**
   * 거래 채팅 모니터 메시지 처리
   */
  const handleTradeChatMonitor = useCallback((data: any) => {
    console.log('💰 거래 채팅 업데이트:', data)
    // 여기에 거래 채팅 데이터 업데이트 로직 추가
  }, [])

  /**
   * 실행 모니터 메시지 처리
   */
  const handleExeMonitor = useCallback((data: any) => {
    console.log('▶️ 실행 모니터 업데이트:', data)
    // 여기에 실행 데이터 업데이트 로직 추가
  }, [])

  /**
   * 스캔 모니터 메시지 처리
   */
  const handleScanMonitor = useCallback((data: any) => {
    console.log('🔍 스캔 모니터 업데이트:', data)
    // 여기에 스캔 데이터 업데이트 로직 추가
  }, [])

  /**
   * 기본 핸들러 등록 (선택사항)
   */
  const registerDefaultHandlers = useCallback(() => {
    return registerHandlers({
      [MESSAGE_TYPES.COMMUNITY]: handleCommunityMonitor,
      [MESSAGE_TYPES.CHAT]: handleChatMonitor,
      [MESSAGE_TYPES.TRADE_CHAT]: handleTradeChatMonitor,
      [MESSAGE_TYPES.EXE]: handleExeMonitor,
      [MESSAGE_TYPES.SCAN]: handleScanMonitor,
    })
  }, [
    registerHandlers,
    handleCommunityMonitor,
    handleChatMonitor,
    handleTradeChatMonitor,
    handleExeMonitor,
    handleScanMonitor,
  ])

  /**
   * 메시지 로그 조회
   */
  const getMessageLog = useCallback(() => {
    return [...messageLogRef.current]
  }, [])

  /**
   * 메시지 로그 초기화
   */
  const clearMessageLog = useCallback(() => {
    messageLogRef.current = []
  }, [])

  return {
    handleMessage,
    registerHandler,
    registerHandlers,
    registerDefaultHandlers,
    handleCommunityMonitor,
    handleChatMonitor,
    handleTradeChatMonitor,
    handleExeMonitor,
    handleScanMonitor,
    getMessageLog,
    clearMessageLog,
  }
}

