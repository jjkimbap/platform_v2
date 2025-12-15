import { MESSAGE_TYPES } from '@/config/websocket.config'

/**
 * WebSocket 메시지 타입
 */
export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES]

/**
 * WebSocket 메시지 인터페이스
 */
export interface WebSocketMessage {
  type: MessageType
  data: any
  timestamp?: number
}

/**
 * 커뮤니티 모니터 메시지 데이터
 */
export interface CommunityMonitorData {
  app_kind: string        // HT, COP, Global 등
  type: string            // TradeEntity, CommDebateEntity, CommProductReviewEntity, CommInfoEntity
  title: string           // 게시글 제목
  user_no: string         // 작성자 번호
  user_nickname: string   // 작성자 닉네임
  create_date: string     // 생성일시 (yyyy-MM-dd HH:mm:ss)
  [key: string]: any
}

/**
 * 채팅 모니터 메시지 데이터
 */
export interface ChatMonitorData {
  roomId?: string
  userId?: string
  message?: string
  timestamp?: number
  [key: string]: any
}

/**
 * 실행 모니터 메시지 데이터
 */
export interface ExeMonitorData {
  userId?: string
  appKind?: string
  activeUsers?: number
  [key: string]: any
}

/**
 * 스캔 모니터 메시지 데이터
 */
export interface ScanMonitorData {
  userId?: string
  scanType?: string
  activeUsers?: number
  [key: string]: any
}

/**
 * 메시지 핸들러 타입
 */
export type MessageHandler = (data: any) => void | Promise<void>

/**
 * 메시지 핸들러 맵
 */
export interface MessageHandlerMap {
  [MESSAGE_TYPES.TRADE_CHAT]?: MessageHandler
  [MESSAGE_TYPES.CHAT]?: MessageHandler
  [MESSAGE_TYPES.COMMUNITY]?: MessageHandler
  [MESSAGE_TYPES.EXE]?: MessageHandler
  [MESSAGE_TYPES.SCAN]?: MessageHandler
  [MESSAGE_TYPES.FAKE_SCAN]?: MessageHandler
}

