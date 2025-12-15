# Redis Pub/Sub과 WebSocket 통합 가이드

## 개요

Redis pub/sub으로 들어온 이벤트를 WebSocket을 통해 클라이언트에 실시간으로 전달하는 시스템입니다.

## 아키텍처

```
Redis Pub/Sub → WebSocket 서버 → 클라이언트 (React)
```

## 구현 방법

### 방법 1: 외부 WebSocket 서버 사용 (권장)

현재 설정된 엔드포인트(`http://192.168.0.14:8025/ws`)가 이미 Redis를 구독하고 WebSocket으로 전달하는 경우:

1. **서버 사이드 (Node.js + SockJS 서버)**
   - Redis pub/sub 구독
   - WebSocket 연결 관리
   - 메시지 브로드캐스트

2. **클라이언트 사이드 (이미 구현됨)**
   - `useWebSocket` Hook으로 연결
   - `useMessageHandler`로 메시지 처리
   - `RealtimeIndicator`에서 실시간 표시

### 방법 2: Next.js에서 직접 구현

Next.js는 WebSocket 서버를 직접 지원하지 않으므로, 별도의 Node.js 서버가 필요합니다.

## Redis 채널 매핑

| Redis 채널 | WebSocket 메시지 타입 | 설명 |
|-----------|---------------------|------|
| `community_monitor` | `community_monitor` | 커뮤니티 게시물 업데이트 |
| `chat_monitor` | `chat_monitor` | 채팅 메시지 업데이트 |
| `trade_chat_monitor` | `trade_chat_monitor` | 거래 채팅 업데이트 |
| `exe_monitor` | `exe_monitor` | 앱 실행 업데이트 |
| `scan_monitor` | `scan_monitor` | 제품 스캔 업데이트 |
| `fake_scan_monitor` | `fake_scan_monitor` | 가짜 스캔 업데이트 |

## WebSocket 서버 구현 예시

### Node.js + SockJS 서버 예시

```javascript
const http = require('http');
const sockjs = require('sockjs');
const redis = require('redis');

// Redis 클라이언트 생성
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

const redisSubscriber = redisClient.duplicate();

// SockJS 서버 생성
const sockjsServer = sockjs.createServer({
  sockjs_url: 'https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js'
});

// WebSocket 연결 관리
const connections = new Set();

sockjsServer.on('connection', (conn) => {
  connections.add(conn);
  console.log('✅ WebSocket 연결:', connections.size);

  conn.on('close', () => {
    connections.delete(conn);
    console.log('🔌 WebSocket 연결 해제:', connections.size);
  });
});

// Redis 구독
const channels = [
  'community_monitor',
  'chat_monitor',
  'trade_chat_monitor',
  'exe_monitor',
  'scan_monitor',
  'fake_scan_monitor'
];

channels.forEach(channel => {
  redisSubscriber.subscribe(channel, (message) => {
    try {
      const data = JSON.parse(message);
      const wsMessage = {
        type: channel,
        data: data,
        timestamp: Date.now()
      };

      // 모든 연결된 클라이언트에 브로드캐스트
      connections.forEach(conn => {
        conn.write(JSON.stringify(wsMessage));
      });
    } catch (error) {
      console.error(`❌ 메시지 처리 실패 (${channel}):`, error);
    }
  });
});

// HTTP 서버 생성
const server = http.createServer();
sockjsServer.installHandlers(server, { prefix: '/ws' });

server.listen(8025, () => {
  console.log('🚀 WebSocket 서버 시작: http://localhost:8025/ws');
});

// Redis 연결
redisClient.connect();
redisSubscriber.connect();
```

## 메시지 형식

### Redis에서 발행하는 메시지 형식

```json
{
  "type": "community_monitor",
  "data": {
    "postId": "123",
    "author": "홍길동",
    "title": "제품 리뷰",
    "views": 100,
    "likes": 10,
    "comments": 5,
    "bookmarks": 2
  }
}
```

### WebSocket으로 전달되는 메시지 형식

```json
{
  "type": "community_monitor",
  "data": {
    "postId": "123",
    "author": "홍길동",
    "title": "제품 리뷰",
    "views": 100,
    "likes": 10,
    "comments": 5,
    "bookmarks": 2
  },
  "timestamp": 1703123456789
}
```

## 클라이언트에서 사용

이미 구현된 `RealtimeIndicator` 컴포넌트가 WebSocket 메시지를 자동으로 수신하고 표시합니다:

```tsx
// components/realtime-indicator.tsx
const { isConnected, registerHandler } = useWebSocketContext()

useEffect(() => {
  const unsubscribe = registerHandler('COMMUNITY', (data) => {
    // 커뮤니티 이벤트 처리
    setEvents(prev => [newEvent, ...prev])
  })
  return unsubscribe
}, [registerHandler])
```

## 환경 변수 설정

```env
# Redis 연결 URL
REDIS_URL=redis://localhost:6379

# WebSocket 서버 엔드포인트
NEXT_PUBLIC_WS_ENDPOINT=http://192.168.0.14:8025/ws
```

## 테스트

### Redis에 테스트 메시지 발행

```bash
redis-cli PUBLISH community_monitor '{"postId":"123","author":"홍길동","title":"테스트 게시글"}'
```

### 클라이언트에서 확인

1. 브라우저 개발자 도구 콘솔에서 메시지 수신 확인
2. `RealtimeIndicator` 컴포넌트에서 실시간 이벤트 표시 확인
3. 버튼 색상이 초록색으로 변경되는지 확인 (연결 성공 시)

## 문제 해결

### WebSocket 연결이 안 될 때

1. WebSocket 서버가 실행 중인지 확인
2. 방화벽 설정 확인
3. 엔드포인트 URL 확인

### 메시지가 수신되지 않을 때

1. Redis pub/sub이 정상 작동하는지 확인
2. WebSocket 서버에서 Redis 구독이 정상인지 확인
3. 클라이언트에서 핸들러가 등록되었는지 확인

### Redis 연결 실패

1. Redis 서버가 실행 중인지 확인
2. `REDIS_URL` 환경 변수 확인
3. 네트워크 연결 확인

