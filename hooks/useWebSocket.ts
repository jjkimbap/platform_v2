'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { WEBSOCKET_CONFIG, ConnectionStatus } from '@/config/websocket.config'
import { WebSocketMessage } from '@/types/websocket'

// SockJS 타입 정의 (동적 import를 위해)
let SockJS: any = null

/**
 * WebSocket 연결을 관리하는 Custom Hook
 */
export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  
  const socketRef = useRef<any>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messageQueueRef = useRef<WebSocketMessage[]>([])
  const isMountedRef = useRef(true)

  /**
   * SockJS 동적 로드
   */
  const loadSockJS = useCallback(async () => {
    if (typeof window === 'undefined') return null
    
    if (!SockJS) {
      try {
        // SockJS를 동적으로 import
        const sockjsModule = await import('sockjs-client')
        SockJS = sockjsModule.default || sockjsModule
      } catch (error) {
        console.error('❌ SockJS 로드 실패:', error)
        return null
      }
    }
    return SockJS
  }, [])

  /**
   * WebSocket 연결
   */
  const connect = useCallback(async () => {
    if (socketRef.current?.readyState === 1) {
      // 이미 연결되어 있음
      return
    }

    try {
      const SockJSClass = await loadSockJS()
      if (!SockJSClass) {
        throw new Error('SockJS를 로드할 수 없습니다')
      }

      setStatus('connecting')
      
      console.log('🔌 WebSocket 연결 시도:', {
        endpoint: WEBSOCKET_CONFIG.ENDPOINT,
        reconnectAttempts,
        maxAttempts: WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS
      })

      // SockJS 연결 생성
      // CORS 오류 해결을 위해 withCredentials를 false로 명시적으로 설정
      // 서버에서 Access-Control-Allow-Credentials 헤더를 설정하지 않거나 false로 설정해야 함
      const socket = new SockJSClass(WEBSOCKET_CONFIG.ENDPOINT, null, {
        // credentials 사용 안 함 (서버에서 빈 문자열로 설정되는 문제 해결)
        withCredentials: false
      })
      socketRef.current = socket
      
      console.log('📡 SockJS 인스턴스 생성 완료:', {
        readyState: socket.readyState,
        url: socket.url || WEBSOCKET_CONFIG.ENDPOINT,
        protocol: socket.protocol || 'N/A',
        readyStateNames: {
          0: 'CONNECTING',
          1: 'OPEN',
          2: 'CLOSING',
          3: 'CLOSED'
        }
      })
      
      // 연결 상태 모니터링 (디버깅용)
      const stateCheckInterval = setInterval(() => {
        if (!socketRef.current) {
          clearInterval(stateCheckInterval)
          return
        }
        
        const currentState = socketRef.current.readyState
        if (currentState === 1) {
          // 연결 성공 시 모니터링 중지
          clearInterval(stateCheckInterval)
        } else if (currentState === 3) {
          // 연결 실패 시 모니터링 중지
          clearInterval(stateCheckInterval)
          console.warn('⚠️ SockJS 연결 실패 - readyState: CLOSED (3)')
        }
      }, 500)

      // 연결 성공
      socket.onopen = () => {
        if (!isMountedRef.current) return
        
        console.log('✅ WebSocket 연결 성공', {
          endpoint: WEBSOCKET_CONFIG.ENDPOINT,
          readyState: socket.readyState,
          protocol: socket.protocol
        })
        setStatus('connected')
        setReconnectAttempts(0)

        // 큐에 쌓인 메시지 처리
        if (messageQueueRef.current.length > 0) {
          console.log(`📦 큐에 쌓인 메시지 ${messageQueueRef.current.length}개 처리`)
          messageQueueRef.current.forEach(msg => {
            setLastMessage(msg)
          })
          messageQueueRef.current = []
        }
      }

      // 메시지 수신
      socket.onmessage = (event: MessageEvent) => {
        if (!isMountedRef.current) return

        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          message.timestamp = Date.now()

          // ✅ 연결 상태와 관계없이 메시지 처리
          // 연결이 끊어지는 순간에도 메시지를 받을 수 있으므로 항상 처리
          setLastMessage(message)
          
          // 연결이 끊어진 상태면 큐에도 추가 (재연결 후 중복 처리 방지)
          if (socket.readyState !== 1) {
            console.warn('⚠️ 연결이 끊어진 상태에서 메시지 수신, 큐에 추가:', message.type)
            messageQueueRef.current.push(message)
          }
        } catch (error) {
          console.error('❌ 메시지 파싱 실패:', error, event.data)
        }
      }

      // 연결 종료
      socket.onclose = (event: CloseEvent) => {
        if (!isMountedRef.current) return

        console.log('⚠️ WebSocket 연결 종료:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          endpoint: WEBSOCKET_CONFIG.ENDPOINT
        })
        setStatus('disconnected')
        socketRef.current = null

        // 정상 종료가 아니면 재연결 시도
        if (event.code !== 1000 && reconnectAttempts < WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
          console.log(`🔄 재연결 시도 예정 (현재 시도: ${reconnectAttempts + 1}/${WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS})`)
          scheduleReconnect()
        } else if (reconnectAttempts >= WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
          console.error('❌ 최대 재연결 시도 횟수 초과')
        }
      }

      // 에러 처리
      socket.onerror = (error: Event) => {
        if (!isMountedRef.current) return

        console.error('❌ WebSocket 에러:', {
          error,
          type: error.type,
          target: error.target,
          endpoint: WEBSOCKET_CONFIG.ENDPOINT,
          readyState: socket.readyState
        })
        setStatus('error')
      }

    } catch (error) {
      console.error('❌ WebSocket 연결 실패:', error)
      setStatus('error')
      
      if (reconnectAttempts < WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
        scheduleReconnect()
      }
    }
  }, [loadSockJS, reconnectAttempts])

  /**
   * 재연결 스케줄링 (Exponential Backoff)
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    const delay = Math.min(
      WEBSOCKET_CONFIG.INITIAL_RECONNECT_DELAY * 
      Math.pow(WEBSOCKET_CONFIG.BACKOFF_MULTIPLIER, reconnectAttempts),
      WEBSOCKET_CONFIG.MAX_RECONNECT_DELAY
    )

    console.log(`🔄 ${delay / 1000}초 후 재연결 시도... (${reconnectAttempts + 1}/${WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS})`)

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setReconnectAttempts(prev => prev + 1)
        connect()
      }
    }, delay)
  }, [connect, reconnectAttempts])

  /**
   * WebSocket 연결 해제
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.close(1000, '정상 종료')
      socketRef.current = null
    }

    setStatus('disconnected')
    setReconnectAttempts(0)
    messageQueueRef.current = []
  }, [])

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback((message: any) => {
    if (socketRef.current?.readyState === 1) {
      socketRef.current.send(JSON.stringify(message))
      return true
    } else {
      console.warn('⚠️ WebSocket이 연결되지 않아 메시지를 전송할 수 없습니다')
      return false
    }
  }, [])

  // 컴포넌트 마운트 시 연결
  useEffect(() => {
    isMountedRef.current = true
    connect()

    return () => {
      isMountedRef.current = false
      disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 재연결 시도가 변경되면 재연결
  useEffect(() => {
    if (reconnectAttempts > 0 && status === 'disconnected') {
      scheduleReconnect()
    }
  }, [reconnectAttempts, status, scheduleReconnect])

  return {
    status,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    lastMessage,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage,
  }
}

