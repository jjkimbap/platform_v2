/**
 * Redis 연결 상태 확인 API
 */

import { NextResponse } from 'next/server'
import { createClient } from 'redis'

/**
 * Redis 연결 상태 확인
 */
export async function GET() {
  if (typeof window !== 'undefined') {
    return NextResponse.json(
      { error: '서버 사이드에서만 사용 가능합니다.' },
      { status: 403 }
    )
  }

  const REDIS_URL = process.env.REDIS_URL || 'redis://52.77.138.41:6379'
  
  let redisClient: any = null
  let isConnected = false
  let error: string | null = null

  try {
    // Redis 클라이언트 생성
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000, // 5초 타임아웃
      }
    })

    // 에러 핸들링
    redisClient.on('error', (err: Error) => {
      error = err.message
      console.error('❌ Redis 에러:', err)
    })

    // 연결 시도
    await redisClient.connect()
    
    // PING 테스트
    const pong = await redisClient.ping()
    isConnected = pong === 'PONG'

    // 연결 종료
    await redisClient.quit()

    return NextResponse.json({
      connected: isConnected,
      url: REDIS_URL,
      message: isConnected ? 'Redis 연결 성공' : 'Redis 연결 실패',
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
    console.error('❌ Redis 연결 실패:', err)

    if (redisClient) {
      try {
        await redisClient.quit()
      } catch {
        // 무시
      }
    }

    return NextResponse.json({
      connected: false,
      url: REDIS_URL,
      error: error,
      message: 'Redis 연결 실패',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

