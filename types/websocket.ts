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
  postId?: string
  author?: string
  title?: string
  views?: number
  likes?: number
  comments?: number
  bookmarks?: number
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

