# CORS 오류 해결 가이드 (서버 측)

## 문제

```
Access to XMLHttpRequest at 'http://192.168.0.14:8025/ws/info?t=...' 
from origin 'http://localhost:3005' has been blocked by CORS policy: 
The value of the 'Access-Control-Allow-Origin' header in the response 
must not be the wildcard '*' when the request's credentials mode is 'include'.
```

## 원인

- SockJS가 `withCredentials`를 사용하는 경우
- 서버에서 `Access-Control-Allow-Origin: *`를 사용하면서 동시에 credentials를 요구
- 이 두 가지는 함께 사용할 수 없음

## 해결 방법

### 방법 1: 서버에서 특정 Origin 허용 (권장)

포트 8025 서버의 HTTP 핸들러를 다음과 같이 수정:

```javascript
const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://192.168.0.14:3000',
    'http://192.168.0.14:3004',
    'http://192.168.0.14:3005'
  ];

  // 특정 origin 허용 (wildcard 대신)
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  // credentials 사용 안 함 (이 헤더를 설정하지 않음)
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 나머지 요청 처리
  // ...
});
```

### 방법 2: SockJS 서버 옵션 설정

SockJS 서버 생성 시 CORS 옵션 설정:

```javascript
const sockjsServer = sockjs.createServer({
  prefix: '/ws',
  // CORS 관련 옵션은 HTTP 서버 레벨에서 처리
});
```

### 방법 3: Express.js를 사용하는 경우

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://192.168.0.14:3000',
    'http://192.168.0.14:3004',
    'http://192.168.0.14:3005'
  ],
  credentials: false // 중요: false로 설정
}));
```

## 현재 서버 설정 확인

포트 8025 서버(`http://192.168.0.14:8025`)에서:

1. HTTP 요청 핸들러 확인
2. CORS 헤더 설정 확인
3. `Access-Control-Allow-Origin` 값 확인
4. `Access-Control-Allow-Credentials` 헤더 제거 또는 false 설정

## 테스트 방법

### 1. 서버 로그 확인
```bash
# 서버 콘솔에서 CORS 관련 로그 확인
```

### 2. 브라우저 개발자 도구
- Network 탭 → `ws/info` 요청 확인
- Response Headers에서 `Access-Control-Allow-Origin` 확인
- `Access-Control-Allow-Credentials`가 없거나 `false`인지 확인

### 3. curl 테스트
```bash
curl -H "Origin: http://localhost:3005" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://192.168.0.14:8025/ws/info \
     -v
```

응답 헤더에서 다음을 확인:
- `Access-Control-Allow-Origin: http://localhost:3005` (wildcard가 아님)
- `Access-Control-Allow-Credentials` 헤더가 없거나 `false`

## 참고 파일

- `server/websocket-server.example.js` - 올바른 CORS 설정 예시
- 이 파일을 참고하여 실제 서버 설정을 수정하세요

