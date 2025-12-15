/**
 * WebSocket 설정
 */
export const WEBSOCKET_CONFIG = {
  // WebSocket 엔드포인트 (환경변수 또는 기본값)
  ENDPOINT: process.env.NEXT_PUBLIC_WS_ENDPOINT || 'http://192.168.0.14:8025/ws',

  // 재연결 설정
  RECONNECT_DELAY: 5000, // 5초
  MAX_RECONNECT_ATTEMPTS: 10, // 최대 재연결 시도 횟수

  // Exponential backoff 설정
  INITIAL_RECONNECT_DELAY: 1000, // 초기 재연결 지연 (1초)
  MAX_RECONNECT_DELAY: 30000, // 최대 재연결 지연 (30초)
  BACKOFF_MULTIPLIER: 1.5, // 지연 시간 배수
} as const

// 디버깅: 설정된 엔드포인트 출력 (클라이언트에서만)
// 주의: 서버 사이드 렌더링 시에는 실행되지 않음

/**
 * 메시지 타입 상수
 */
export const MESSAGE_TYPES = {
  TRADE_CHAT: 'trade_chat_monitor',
  CHAT: 'chat_monitor',
  COMMUNITY: 'community_monitor',
  EXE: 'exe_monitor',
  SCAN: 'scan_monitor',
  FAKE_SCAN: 'fake_scan_monitor',
} as const

/**
 * 연결 상태 타입
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

