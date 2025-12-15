# WebSocket 메시지 유실 문제 해결

## 문제 원인 분석

### 1. 서버 측 문제

**현재 코드 (문제 있음):**
```javascript
connections.forEach(conn => {
  try {
    conn.write(messageStr);
    sentCount++;
  } catch (error) {
    console.error(`❌ 메시지 전송 실패:`, error);
    connections.delete(conn);
  }
});
```

**문제점:**
1. 연결 상태 확인 없이 메시지 전송
2. 연결이 끊어진 클라이언트가 `connections` Set에 남아있을 수 있음
3. 에러 발생 시 단순 삭제만 하고 재시도 없음
4. 연결 상태를 확인하는 로직이 없음

### 2. 클라이언트 측 문제

**현재 코드:**
```typescript
socket.onmessage = (event: MessageEvent) => {
  if (socket.readyState === 1) {
    setLastMessage(message)
  } else {
    messageQueueRef.current.push(message)
  }
}
```

**문제점:**
1. 연결이 끊어지는 순간의 메시지는 유실될 수 있음
2. 메시지 큐는 연결 성공 후에만 처리됨
3. 재연결 중에 받은 메시지는 큐에 쌓이지만 처리되지 않을 수 있음

## 해결 방법

### 서버 측 수정

```javascript
// 개선된 메시지 브로드캐스트
connections.forEach(conn => {
  try {
    // 연결 상태 확인
    if (conn.readyState === 1) { // OPEN 상태만 전송
      conn.write(messageStr);
      sentCount++;
    } else {
      // 연결이 끊어진 클라이언트는 Set에서 제거
      console.warn(`⚠️ 연결 끊어진 클라이언트 제거 (readyState: ${conn.readyState})`);
      connections.delete(conn);
    }
  } catch (error) {
    console.error(`❌ 메시지 전송 실패:`, error);
    // 에러 발생 시 연결 제거
    connections.delete(conn);
  }
});
```

### 클라이언트 측 수정

```typescript
// 메시지 수신 개선
socket.onmessage = (event: MessageEvent) => {
  if (!isMountedRef.current) return

  try {
    const message: WebSocketMessage = JSON.parse(event.data)
    message.timestamp = Date.now()

    // 연결 상태와 관계없이 메시지 처리
    // 연결이 끊어지는 순간에도 메시지를 받을 수 있음
    setLastMessage(message)
    
    // 연결이 끊어진 상태면 큐에도 추가 (재연결 후 처리)
    if (socket.readyState !== 1) {
      messageQueueRef.current.push(message)
    }
  } catch (error) {
    console.error('❌ 메시지 파싱 실패:', error, event.data)
  }
}
```

## 추가 개선 사항

### 1. 연결 상태 모니터링

서버에서 주기적으로 연결 상태를 확인하고 끊어진 연결을 정리:

```javascript
// 주기적으로 연결 상태 확인 (30초마다)
setInterval(() => {
  const beforeCount = connections.size;
  connections.forEach(conn => {
    if (conn.readyState !== 1) {
      connections.delete(conn);
    }
  });
  const afterCount = connections.size;
  if (beforeCount !== afterCount) {
    console.log(`🧹 끊어진 연결 정리: ${beforeCount} → ${afterCount}`);
  }
}, 30000);
```

### 2. 메시지 전송 재시도 (선택사항)

중요한 메시지의 경우 재시도 로직 추가:

```javascript
function sendMessageWithRetry(conn, message, maxRetries = 3) {
  let retries = 0;
  
  function attemptSend() {
    try {
      if (conn.readyState === 1) {
        conn.write(message);
        return true;
      } else {
        throw new Error('Connection not open');
      }
    } catch (error) {
      retries++;
      if (retries < maxRetries) {
        setTimeout(attemptSend, 100 * retries);
        return false;
      } else {
        throw error;
      }
    }
  }
  
  return attemptSend();
}
```

### 3. 메시지 로깅

메시지 전송 실패 시 상세 로깅:

```javascript
connections.forEach(conn => {
  try {
    if (conn.readyState === 1) {
      conn.write(messageStr);
      sentCount++;
    } else {
      console.warn(`⚠️ 연결 상태 이상:`, {
        readyState: conn.readyState,
        states: { 0: 'CONNECTING', 1: 'OPEN', 2: 'CLOSING', 3: 'CLOSED' }
      });
      connections.delete(conn);
    }
  } catch (error) {
    console.error(`❌ 메시지 전송 실패:`, {
      error: error.message,
      stack: error.stack,
      readyState: conn.readyState
    });
    connections.delete(conn);
  }
});
```

## 체크리스트

- [ ] 서버에서 연결 상태 확인 후 메시지 전송
- [ ] 끊어진 연결을 주기적으로 정리
- [ ] 클라이언트에서 메시지 수신 로직 개선
- [ ] 메시지 전송 실패 시 상세 로깅
- [ ] 연결 상태 모니터링 추가

