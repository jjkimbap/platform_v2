/**
 * WebSocket API Route
 * 
 * 이 파일은 Next.js API Route로, Redis pub/sub 이벤트를 WebSocket으로 전달합니다.
 * 
 * 주의: Next.js는 기본적으로 WebSocket 서버를 지원하지 않으므로,
 * 별도의 WebSocket 서버가 필요합니다. 이 파일은 참고용입니다.
 * 
 * 실제 구현은 외부 WebSocket 서버(예: Node.js + Socket.io 또는 SockJS 서버)에서
 * Redis를 구독하고 클라이언트에 브로드캐스트해야 합니다.
 */

import { NextRequest, NextResponse } from 'next/server'
import { MESSAGE_TYPES } from '@/config/websocket.config'
import { WebSocketMessage } from '@/types/websocket'

/**
 * Redis pub/sub 이벤트를 WebSocket 메시지로 변환
 */
export function convertRedisEventToWebSocketMessage(
  channel: string,
  data: any
): WebSocketMessage {
  return {
    type: channel as any,
    data: data,
    timestamp: Date.now()
  }
}

/**
 * GET 요청: WebSocket 연결 정보 반환
 */
export async function GET(request: NextRequest) {
  // Next.js는 WebSocket 서버를 직접 지원하지 않으므로
  // 외부 WebSocket 서버 엔드포인트 정보를 반환
  const wsEndpoint = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'http://192.168.0.14:8025/ws'
  
  return NextResponse.json({
    endpoint: wsEndpoint,
    message: 'WebSocket 서버는 별도로 실행되어야 합니다. 외부 서버 엔드포인트를 사용하세요.'
  })
}

/**
 * POST 요청: 테스트용 메시지 전송 (개발 환경)
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Production 환경에서는 사용할 수 없습니다.' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { type, data } = body

    // WebSocket 메시지 형식으로 변환
    const message: WebSocketMessage = {
      type: type || MESSAGE_TYPES.COMMUNITY,
      data: data || {},
      timestamp: Date.now()
    }

    // 실제로는 WebSocket 서버로 메시지를 전달해야 함
    // 여기서는 로그만 출력
    console.log('📤 WebSocket 메시지 전송:', message)

    return NextResponse.json({
      success: true,
      message: '메시지가 전송되었습니다 (개발 모드)',
      data: message
    })
  } catch (error) {
    return NextResponse.json(
      { error: '메시지 전송 실패', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

