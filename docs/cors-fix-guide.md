# CORS 오류 해결 가이드

## 문제

```
Access to XMLHttpRequest at 'http://192.168.0.14:8025/ws/info?t=...' from origin 'http://localhost:3004' 
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response 
must not be the wildcard '*' when the request's credentials mode is 'include'.
```

## 원인

SockJS가 WebSocket 연결을 시도할 때, 서버에서 `Access-Control-Allow-Origin: *`를 사용하면서 동시에 credentials를 요구하는 경우 발생합니다.

## 해결 방법

### 방법 1: 서버 측 CORS 설정 수정 (권장)

WebSocket 서버(`http://192.168.0.14:8025`)에서 CORS 헤더를 다음과 같이 수정해야 합니다:

```javascript
// ❌ 잘못된 설정
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Credentials', 'true');

// ✅ 올바른 설정 (방법 1: 특정 origin 허용)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3004',
  'http://192.168.0.14:3000',
  'http://192.168.0.14:3004'
];

const origin = req.headers.origin;
if (origin && allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
res.setHeader('Access-Control-Allow-Credentials', 'false'); // credentials 사용 안 함

// ✅ 올바른 설정 (방법 2: credentials 사용 안 함)
res.setHeader('Access-Control-Allow-Origin', '*');
// Access-Control-Allow-Credentials 헤더를 설정하지 않거나 false로 설정
```

### 방법 2: Next.js에서 프록시 사용

`next.config.mjs`에 rewrites를 추가하여 프록시 사용:

```javascript
async rewrites() {
  return [
    {
      source: '/ws/:path*',
      destination: 'http://192.168.0.14:8025/ws/:path*',
    },
  ]
}
```

그리고 `config/websocket.config.ts`에서 엔드포인트를 상대 경로로 변경:

```typescript
ENDPOINT: process.env.NEXT_PUBLIC_WS_ENDPOINT || '/ws'
```

### 방법 3: 서버 예시 파일 사용

`server/websocket-server.example.js` 파일을 참고하여 올바른 CORS 설정이 포함된 서버를 실행하세요.

## 서버 설정 예시 (Node.js + SockJS)

```javascript
const http = require('http');
const sockjs = require('sockjs');

const server = http.createServer((req, res) => {
  // CORS 헤더 설정
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3004',
    'http://192.168.0.14:3000',
    'http://192.168.0.14:3004'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  res.writeHead(404);
  res.end();
});

const sockjsServer = sockjs.createServer({
  prefix: '/ws'
});

sockjsServer.installHandlers(server, { prefix: '/ws' });

server.listen(8025, () => {
  console.log('WebSocket 서버 시작: http://localhost:8025/ws');
});
```

## 확인 방법

1. 브라우저 개발자 도구 → Network 탭
2. `ws/info` 요청 확인
3. Response Headers에서 `Access-Control-Allow-Origin` 확인
4. `Access-Control-Allow-Credentials`가 `true`이면 문제 발생

## 임시 해결책

서버 설정을 변경할 수 없는 경우, Next.js의 API Route를 통해 프록시를 사용하거나, 서버 관리자에게 CORS 설정 변경을 요청해야 합니다.

