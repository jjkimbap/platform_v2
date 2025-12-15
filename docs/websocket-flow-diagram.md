# WebSocket 실시간 처리 플로우

## 현재 시스템 구조

```
┌─────────────────┐
│  Redis Pub 서버 │  (포트 8050)
│  이벤트 발생    │
└────────┬────────┘
         │
         │ Redis PUBLISH
         ▼
┌─────────────────┐
│   Redis Server  │  (포트 6379)
│   Pub/Sub       │
└────────┬────────┘
         │
         │ Redis SUBSCRIBE
         ▼
┌─────────────────┐
│ WebSocket 서버  │  (포트 8025)
│ Redis 구독      │
│ WebSocket 연결  │
└────────┬────────┘
         │
         │ WebSocket 메시지
         ▼
┌─────────────────┐
│  Next.js 클라이언트 │  (포트 3000)
│  React 앱       │
│  실시간 UI 업데이트│
└─────────────────┘
```

## 상세 플로우

### 1단계: 이벤트 발생 (포트 8050)
```
Redis Pub 서버 (8050)
  ↓
이벤트 발생 (예: 게시물 작성, 채팅 메시지 등)
  ↓
Redis PUBLISH 명령 실행
```

**예시:**
```javascript
// 포트 8050 서버에서
redisClient.publish('community_monitor', JSON.stringify({
  postId: '123',
  author: '홍길동',
  title: '제품 리뷰',
  views: 100
}));
```

### 2단계: Redis Pub/Sub (포트 6379)
```
Redis Server
  ↓
채널: community_monitor, chat_monitor, exe_monitor, scan_monitor 등
  ↓
구독자들에게 메시지 브로드캐스트
```

### 3단계: WebSocket 서버 구독 (포트 8025)
```
WebSocket 서버 (8025)
  ↓
setupRedisSubscriptions() 실행
  ↓
각 채널 구독:
  - community_monitor
  - chat_monitor
  - trade_chat_monitor
  - exe_monitor
  - scan_monitor
  - fake_scan_monitor
  ↓
메시지 수신 시 WebSocket 형식으로 변환
```

**코드 위치:** `server/websocket-server.example.js` 82-137줄

### 4단계: 클라이언트로 전달 (포트 8025 → 3000)
```
WebSocket 서버 (8025)
  ↓
연결된 모든 클라이언트에 브로드캐스트
  ↓
SockJS를 통해 메시지 전송
```

### 5단계: 클라이언트 수신 및 처리 (포트 3000)
```
Next.js 클라이언트 (3000)
  ↓
useWebSocket Hook으로 메시지 수신
  ↓
useMessageHandler로 타입별 처리
  ↓
RealtimeIndicator에서 실시간 UI 업데이트
```

## 실제 코드 플로우

### 서버 사이드 (포트 8025)

```javascript
// 1. Redis 구독 설정
async function setupRedisSubscriptions() {
  await redisSubscriber.connect();
  
  // 2. 각 채널 구독
  for (const channel of REDIS_CHANNELS) {
    await redisSubscriber.subscribe(channel, (message) => {
      // 3. 메시지 수신
      const data = JSON.parse(message);
      
      // 4. WebSocket 메시지 형식으로 변환
      const wsMessage = {
        type: channel,
        data: data,
        timestamp: Date.now()
      };
      
      // 5. 모든 클라이언트에 브로드캐스트
      connections.forEach(conn => {
        conn.write(JSON.stringify(wsMessage));
      });
    });
  }
}
```

### 클라이언트 사이드 (포트 3000)

```typescript
// 1. WebSocket 연결
const { isConnected, lastMessage } = useWebSocketContext();

// 2. 메시지 핸들러 등록
useEffect(() => {
  const unsubscribe = registerHandler('COMMUNITY', (data) => {
    // 3. UI 업데이트
    setEvents(prev => [newEvent, ...prev]);
  });
  return unsubscribe;
}, [registerHandler]);

// 4. 자동 메시지 처리
useEffect(() => {
  if (lastMessage) {
    handleMessage(lastMessage);
  }
}, [lastMessage]);
```

## 메시지 흐름 예시

### 예시 1: 커뮤니티 게시물 작성

```
1. 포트 8050 서버
   → Redis PUBLISH 'community_monitor' 
   → { postId: '123', author: '홍길동', title: '리뷰' }

2. Redis Server
   → 구독자들에게 메시지 전달

3. 포트 8025 WebSocket 서버
   → 메시지 수신
   → WebSocket 형식으로 변환
   → { type: 'community_monitor', data: {...}, timestamp: ... }
   → 모든 클라이언트에 브로드캐스트

4. 포트 3000 클라이언트
   → WebSocket 메시지 수신
   → registerHandler('COMMUNITY') 실행
   → RealtimeIndicator에 이벤트 추가
   → UI 업데이트
```

### 예시 2: 채팅 메시지

```
1. 포트 8050 서버
   → Redis PUBLISH 'chat_monitor'
   → { roomId: 'room1', userId: 'user123', message: '안녕하세요' }

2. Redis Server
   → 구독자들에게 메시지 전달

3. 포트 8025 WebSocket 서버
   → 메시지 수신 및 브로드캐스트

4. 포트 3000 클라이언트
   → registerHandler('CHAT') 실행
   → 채팅 UI 업데이트
```

## 포트별 역할 정리

| 포트 | 역할 | 책임 |
|------|------|------|
| **8050** | Redis Pub 서버 | 이벤트 발생 시 Redis에 PUBLISH |
| **6379** | Redis Server | Pub/Sub 메시지 중계 |
| **8025** | WebSocket 서버 | Redis 구독 → WebSocket 브로드캐스트 |
| **3000** | Next.js 클라이언트 | WebSocket 연결 → UI 업데이트 |

## 확인 사항

### 1. 포트 8050 서버 확인
- Redis PUBLISH 명령이 정상 실행되는지
- 올바른 채널 이름 사용하는지

### 2. 포트 8025 서버 확인
- Redis 구독이 정상 작동하는지
- WebSocket 연결이 정상인지
- 메시지 브로드캐스트가 되는지

### 3. 포트 3000 클라이언트 확인
- WebSocket 연결 상태 (초록색 버튼)
- 메시지 수신 로그 확인
- UI 업데이트 확인

## 문제 해결 체크리스트

1. ✅ 포트 8050에서 Redis PUBLISH 실행 확인
2. ✅ 포트 8025에서 Redis 구독 확인
3. ✅ 포트 8025에서 WebSocket 서버 실행 확인
4. ✅ 포트 3000에서 WebSocket 연결 확인
5. ✅ 메시지 핸들러 등록 확인

