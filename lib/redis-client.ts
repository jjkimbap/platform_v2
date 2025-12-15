/**
 * Redis 클라이언트 설정 및 관리
 * 
 * Redis pub/sub을 통해 이벤트를 구독하고 WebSocket으로 전달합니다.
 */

import { MESSAGE_TYPES } from '@/config/websocket.config'
import { WebSocketMessage } from '@/types/websocket'

// Redis 클라이언트 타입 (동적 import를 위해)
let Redis: any = null
let redisClient: any = null
let redisSubscriber: any = null

/**
 * Redis 클라이언트 초기화
 */
export async function initRedisClient() {
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드에서는 Redis를 직접 사용할 수 없음
    return null
  }

  try {
    if (!Redis) {
      const redisModule = await import('redis')
      Redis = redisModule.default || redisModule
    }

    // Redis 연결 설정
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    
    redisClient = Redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error('❌ Redis 재연결 실패: 최대 시도 횟수 초과')
            return new Error('Redis 재연결 실패')
          }
          return Math.min(retries * 100, 3000)
        }
      }
    })

    redisSubscriber = redisClient.duplicate()

    // 에러 핸들링
    redisClient.on('error', (err: Error) => {
      console.error('❌ Redis 클라이언트 에러:', err)
    })

    redisSubscriber.on('error', (err: Error) => {
      console.error('❌ Redis 구독자 에러:', err)
    })

    // 연결 성공
    redisClient.on('connect', () => {
      console.log('✅ Redis 클라이언트 연결 성공')
    })

    redisSubscriber.on('connect', () => {
      console.log('✅ Redis 구독자 연결 성공')
    })

    await redisClient.connect()
    await redisSubscriber.connect()

    return { redisClient, redisSubscriber }
  } catch (error) {
    console.error('❌ Redis 초기화 실패:', error)
    return null
  }
}

/**
 * Redis 채널 구독
 * 
 * @param channel Redis 채널 이름
 * @param messageHandler 메시지 수신 시 호출할 핸들러
 */
export async function subscribeRedisChannel(
  channel: string,
  messageHandler: (message: WebSocketMessage) => void
) {
  if (!redisSubscriber) {
    const initResult = await initRedisClient()
    if (!initResult) {
      console.error('❌ Redis 구독자 초기화 실패')
      return null
    }
  }

  try {
    await redisSubscriber.subscribe(channel, (message: string) => {
      try {
        const parsedMessage = JSON.parse(message)
        
        // WebSocket 메시지 형식으로 변환
        const wsMessage: WebSocketMessage = {
          type: parsedMessage.type || channel,
          data: parsedMessage.data || parsedMessage,
          timestamp: Date.now()
        }

        messageHandler(wsMessage)
      } catch (error) {
        console.error('❌ Redis 메시지 파싱 실패:', error, message)
      }
    })

    console.log(`✅ Redis 채널 구독 시작: ${channel}`)
    return () => {
      redisSubscriber?.unsubscribe(channel)
      console.log(`🔌 Redis 채널 구독 해제: ${channel}`)
    }
  } catch (error) {
    console.error(`❌ Redis 채널 구독 실패 (${channel}):`, error)
    return null
  }
}

/**
 * 모든 모니터 채널 구독
 */
export async function subscribeAllMonitorChannels(
  messageHandler: (message: WebSocketMessage) => void
) {
  const channels = [
    MESSAGE_TYPES.COMMUNITY,
    MESSAGE_TYPES.CHAT,
    MESSAGE_TYPES.TRADE_CHAT,
    MESSAGE_TYPES.EXE,
    MESSAGE_TYPES.SCAN,
    MESSAGE_TYPES.FAKE_SCAN,
  ]

  const unsubscribers: (() => void)[] = []

  for (const channel of channels) {
    const unsubscribe = await subscribeRedisChannel(channel, messageHandler)
    if (unsubscribe) {
      unsubscribers.push(unsubscribe)
    }
  }

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe())
  }
}

/**
 * Redis 클라이언트 종료
 */
export async function closeRedisClient() {
  try {
    if (redisSubscriber) {
      await redisSubscriber.quit()
      redisSubscriber = null
    }
    if (redisClient) {
      await redisClient.quit()
      redisClient = null
    }
    console.log('✅ Redis 클라이언트 종료 완료')
  } catch (error) {
    console.error('❌ Redis 클라이언트 종료 실패:', error)
  }
}

/**
 * Redis 연결 상태 확인
 */
export function isRedisConnected(): boolean {
  return redisClient?.isReady === true && redisSubscriber?.isReady === true
}

