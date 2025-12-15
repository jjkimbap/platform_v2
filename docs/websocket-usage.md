# WebSocket 시스템 사용 가이드

## 📦 설치

```bash
npm install sockjs-client @types/sockjs-client --legacy-peer-deps
```

## 🚀 빠른 시작

### 1. App에 WebSocket Provider 추가

`app/layout.tsx`에 `WebSocketProvider`를 추가합니다:

```tsx
import { WebSocketProvider } from '@/contexts/WebSocketContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </body>
    </html>
  )
}
```

### 2. 컴포넌트에서 사용

```tsx
'use client'

import { useEffect } from 'react'
import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { WebSocketStatusIndicator } from '@/components/websocket-status-indicator'

export function MyComponent() {
  const { 
    isConnected, 
    registerHandler,
    lastMessage 
  } = useWebSocketContext()

  // 커뮤니티 모니터 메시지 구독
  useEffect(() => {
    const unsubscribe = registerHandler('COMMUNITY', (data) => {
      console.log('커뮤니티 업데이트:', data)
      // 여기에 상태 업데이트 로직 추가
    })

    return unsubscribe
  }, [registerHandler])

  return (
    <div>
      <WebSocketStatusIndicator />
      <p>연결 상태: {isConnected ? 'ONLINE' : 'OFFLINE'}</p>
    </div>
  )
}
```

## 📚 API 레퍼런스

### useWebSocketContext()

WebSocket Context에서 제공하는 모든 기능을 사용할 수 있습니다.

#### 반환값

- `status`: 연결 상태 (`'connecting' | 'connected' | 'disconnected' | 'error'`)
- `isConnected`: 연결 여부 (boolean)
- `isConnecting`: 연결 중 여부 (boolean)
- `reconnectAttempts`: 재연결 시도 횟수
- `lastMessage`: 마지막 수신 메시지
- `connect()`: 수동 연결
- `disconnect()`: 연결 해제
- `sendMessage(message)`: 메시지 전송
- `handleMessage(message)`: 메시지 수동 처리
- `registerHandler(type, handler)`: 메시지 핸들러 등록
- `registerHandlers(handlers)`: 여러 핸들러 한 번에 등록
- `getMessageLog()`: 메시지 로그 조회
- `clearMessageLog()`: 메시지 로그 초기화

### 메시지 타입

- `COMMUNITY`: 커뮤니티 모니터 (`community_monitor`)
- `CHAT`: 채팅 모니터 (`chat_monitor`)
- `TRADE_CHAT`: 거래 채팅 모니터 (`trade_chat_monitor`)
- `EXE`: 실행 모니터 (`exe_monitor`)
- `SCAN`: 스캔 모니터 (`scan_monitor`)
- `FAKE_SCAN`: 가짜 스캔 모니터 (`fake_scan_monitor`)

## 🔧 설정

환경 변수를 통해 WebSocket 엔드포인트를 설정할 수 있습니다:

```env
NEXT_PUBLIC_WS_ENDPOINT=http://52.221.10.205:8025/ws
```

설정 파일: `config/websocket.config.ts`

## 💡 사용 예시

### 여러 메시지 타입 구독

```tsx
useEffect(() => {
  const unsubscribers = [
    registerHandler('COMMUNITY', (data) => {
      // 커뮤니티 업데이트 처리
    }),
    registerHandler('CHAT', (data) => {
      // 채팅 업데이트 처리
    }),
    registerHandler('EXE', (data) => {
      // 실행 업데이트 처리
    }),
  ]

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe())
  }
}, [registerHandler])
```

### 메시지 전송

```tsx
const { sendMessage } = useWebSocketContext()

const handleSend = () => {
  sendMessage({
    type: 'ping',
    data: { timestamp: Date.now() }
  })
}
```

### 연결 상태 모니터링

```tsx
const { status, reconnectAttempts } = useWebSocketContext()

useEffect(() => {
  if (status === 'error') {
    console.error('WebSocket 연결 오류')
  }
  
  if (reconnectAttempts > 5) {
    console.warn('재연결 시도가 많습니다')
  }
}, [status, reconnectAttempts])
```

## 🎨 UI 컴포넌트

### WebSocketStatusIndicator

연결 상태를 시각적으로 표시하는 컴포넌트입니다.

```tsx
import { WebSocketStatusIndicator } from '@/components/websocket-status-indicator'

<WebSocketStatusIndicator showText={true} />
```

## ⚠️ 주의사항

1. **메모리 누수 방지**: `useEffect`의 cleanup 함수에서 반드시 `unsubscribe`를 호출하세요.
2. **서버 사이드 렌더링**: WebSocket은 클라이언트에서만 동작합니다. `'use client'` 지시어를 사용하세요.
3. **재연결**: 자동 재연결이 활성화되어 있습니다. 최대 10회까지 시도합니다.

## 🐛 문제 해결

### 연결이 안 될 때

1. 엔드포인트 URL 확인
2. 서버가 WebSocket을 지원하는지 확인
3. 방화벽/네트워크 설정 확인
4. 브라우저 콘솔에서 에러 메시지 확인

### 메시지가 수신되지 않을 때

1. 메시지 타입이 올바른지 확인
2. 핸들러가 제대로 등록되었는지 확인
3. `getMessageLog()`로 수신된 메시지 확인

