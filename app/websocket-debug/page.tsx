'use client'

import { WebSocketDebug } from '@/components/websocket-debug'

export default function WebSocketDebugPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">WebSocket 연결 디버깅</h1>
      <WebSocketDebug />
    </div>
  )
}

