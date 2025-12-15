# WebSocket 연결 문제 해결 가이드

## 문제 진단

웹소켓 연결이 안 되는 경우 다음을 확인하세요:

### 1. 서버가 실행 중인지 확인

```bash
# 서버가 실행 중인지 확인
curl http://192.168.0.14:8025/ws/info

# 또는 브라우저에서 직접 접속
# http://192.168.0.14:8025/ws/info
```

**예상 응답:**
- 서버가 실행 중이면: JSON 형식의 서버 정보
- 서버가 실행되지 않으면: 연결 오류

### 2. 브라우저 콘솔 확인

브라우저 개발자 도구(F12) → Console 탭에서 다음 메시지 확인:

**정상 연결:**
```
🔌 WebSocket 연결 시도: { endpoint: 'http://192.168.0.14:8025/ws', ... }
📡 SockJS 인스턴스 생성 완료: { readyState: 0, ... }
✅ WebSocket 연결 성공
```

**연결 실패:**
```
❌ WebSocket 에러: { ... }
⚠️ WebSocket 연결 종료: { code: 1006, ... }
```

### 3. Network 탭 확인

브라우저 개발자 도구 → Network 탭에서:

1. **`ws/info` 요청 확인**
   - 상태 코드: 200 OK
   - Response Headers에 CORS 헤더 확인
   - Response Body에 서버 정보 확인

2. **WebSocket 연결 확인**
   - `ws` 또는 `websocket` 타입의 요청
   - 상태: 101 Switching Protocols (정상)

### 4. 디버깅 페이지 사용

브라우저에서 `/websocket-debug` 페이지 접속:
```
http://localhost:3000/websocket-debug
```

이 페이지에서:
- 연결 상태 확인
- 엔드포인트 확인
- 재연결 시도 횟수 확인
- 수동으로 연결/해제 테스트

## 일반적인 문제와 해결 방법

### 문제 1: 서버가 실행되지 않음

**증상:**
- `ws/info` 요청이 실패
- 네트워크 오류 (ERR_CONNECTION_REFUSED)

**해결:**
```bash
# Node.js 서버 실행
node server/websocket-server.example.js

# 또는 Spring Boot 서버 실행
# 서버가 8025 포트에서 실행 중인지 확인
```

### 문제 2: CORS 오류

**증상:**
- `Access-Control-Allow-Origin` 오류
- `Access-Control-Allow-Headers` 오류

**해결:**
- 서버의 `CorsFilter`에서 올바른 헤더 설정 확인
- `Access-Control-Allow-Origin`에 클라이언트 origin 포함
- `Access-Control-Allow-Headers`에 필요한 헤더 포함

### 문제 3: 잘못된 엔드포인트

**증상:**
- 연결 시도는 하지만 연결 실패
- 404 오류

**해결:**
1. 환경 변수 확인:
   ```bash
   # .env.local 파일 확인
   NEXT_PUBLIC_WS_ENDPOINT=http://192.168.0.14:8025/ws
   ```

2. 서버 설정 확인:
   - 서버가 `/ws` 경로로 설정되어 있는지 확인
   - SockJS 서버가 올바른 prefix로 설정되어 있는지 확인

### 문제 4: 방화벽/네트워크 문제

**증상:**
- 로컬에서는 연결되지만 다른 네트워크에서는 안 됨
- 타임아웃 오류

**해결:**
1. 방화벽 설정 확인
2. 서버가 모든 인터페이스(0.0.0.0)에서 리스닝하는지 확인:
   ```javascript
   server.listen(PORT, '0.0.0.0', () => {
     // 모든 인터페이스에서 리스닝
   })
   ```

### 문제 5: SockJS 서버 설정 문제

**증상:**
- `ws/info`는 성공하지만 실제 연결 실패
- 연결이 즉시 종료됨

**해결:**
1. 서버 코드에서 SockJS 설정 확인:
   ```javascript
   const sockjsServer = sockjs.createServer({
     prefix: '/ws',
     // 다른 설정들...
   })
   ```

2. 서버가 연결을 올바르게 처리하는지 확인:
   ```javascript
   sockjsServer.on('connection', (conn) => {
     console.log('✅ 연결 성공')
     // 연결 처리...
   })
   ```

## 디버깅 단계

### 1단계: 기본 연결 테스트

```bash
# 터미널에서 서버 정보 확인
curl http://192.168.0.14:8025/ws/info
```

### 2단계: 브라우저 콘솔 확인

브라우저 개발자 도구에서:
1. Console 탭 열기
2. 페이지 새로고침
3. WebSocket 관련 로그 확인

### 3단계: Network 탭 확인

1. Network 탭 열기
2. `ws/info` 요청 확인
3. WebSocket 연결 확인

### 4단계: 디버깅 페이지 사용

1. `/websocket-debug` 페이지 접속
2. 연결 상태 확인
3. 수동으로 연결 시도

### 5단계: 서버 로그 확인

서버 콘솔에서:
- 연결 시도 로그 확인
- 에러 메시지 확인
- Redis 연결 상태 확인

## 예상 로그

### 정상 연결 시

**클라이언트 (브라우저 콘솔):**
```
🔌 WebSocket 연결 시도: { endpoint: 'http://192.168.0.14:8025/ws', ... }
📡 SockJS 인스턴스 생성 완료: { readyState: 0, ... }
✅ WebSocket 연결 성공 { endpoint: 'http://192.168.0.14:8025/ws', readyState: 1, ... }
```

**서버 (터미널):**
```
✅ WebSocket 연결 (총 1개)
✅ Redis 구독 성공
```

### 연결 실패 시

**클라이언트:**
```
❌ WebSocket 에러: { error: ..., type: 'error', ... }
⚠️ WebSocket 연결 종료: { code: 1006, reason: '', wasClean: false, ... }
🔄 재연결 시도 예정 (현재 시도: 1/10)
```

**서버:**
```
❌ Redis 연결 실패: ...
```

## 추가 리소스

- [SockJS 공식 문서](https://github.com/sockjs/sockjs-client)
- [WebSocket API 문서](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [CORS 문제 해결 가이드](./cors-complete-fix.md)

