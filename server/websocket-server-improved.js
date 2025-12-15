/**
 * 개선된 WebSocket 서버
 * 
 * 메시지 유실 방지를 위한 개선 사항:
 * 1. 연결 상태 확인 후 메시지 전송
 * 2. 주기적인 연결 상태 모니터링
 * 3. 상세한 에러 로깅
 * 4. 끊어진 연결 자동 정리
 */

const http = require('http');
const sockjs = require('sockjs');
const { createClient } = require('redis');

// 환경 변수
const PORT = process.env.WS_PORT || 8025;
const REDIS_URL = process.env.REDIS_URL || 'redis://52.77.138.41:6379';

// Redis 클라이언트 생성
const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis 재연결 실패: 최대 시도 횟수 초과');
        return new Error('Redis 재연결 실패');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

const redisSubscriber = redisClient.duplicate();

// SockJS 서버 생성
const sockjsServer = sockjs.createServer({
  sockjs_url: 'https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js',
  log: (severity, message) => {
    if (severity === 'error') {
      console.error('SockJS:', message);
    }
  },
  prefix: '/ws'
});

// WebSocket 연결 관리
const connections = new Set();

sockjsServer.on('connection', (conn) => {
  connections.add(conn);
  console.log(`✅ WebSocket 연결 (총 ${connections.size}개)`);

  // 연결 종료 처리
  conn.on('close', () => {
    const wasRemoved = connections.delete(conn);
    if (wasRemoved) {
      console.log(`🔌 WebSocket 연결 해제 (총 ${connections.size}개)`);
    }
  });

  // 에러 처리
  conn.on('error', (error) => {
    console.error('❌ WebSocket 에러:', {
      error: error.message || error,
      readyState: conn.readyState
    });
    connections.delete(conn);
  });
  
  // ✅ 연결 상태 모니터링 (5초마다 확인)
  const stateCheckInterval = setInterval(() => {
    if (!connections.has(conn)) {
      clearInterval(stateCheckInterval);
      return;
    }
    
    // 연결이 끊어진 경우 정리
    if (conn.readyState === 3) { // CLOSED
      console.warn(`⚠️ 끊어진 연결 감지 및 제거 (readyState: CLOSED)`);
      connections.delete(conn);
      clearInterval(stateCheckInterval);
    }
  }, 5000);
});

// Redis 채널 목록
const REDIS_CHANNELS = [
  'community_monitor',
  'chat_monitor',
  'trade_chat_monitor',
  'exe_monitor',
  'scan_monitor',
  'fake_scan_monitor'
];

// ✅ 개선된 메시지 브로드캐스트 함수
function broadcastMessage(channel, messageStr) {
  let sentCount = 0;
  let failedCount = 0;
  const deadConnections = [];
  
  connections.forEach(conn => {
    try {
      // ✅ 연결 상태 확인 (OPEN 상태만 전송)
      // SockJS 연결의 readyState: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
      if (conn.readyState === 1) {
        conn.write(messageStr);
        sentCount++;
      } else {
        // 연결이 끊어진 클라이언트는 나중에 제거
        deadConnections.push(conn);
        failedCount++;
      }
    } catch (error) {
      console.error(`❌ 메시지 전송 실패:`, {
        error: error.message,
        readyState: conn.readyState
      });
      deadConnections.push(conn);
      failedCount++;
    }
  });

  // 끊어진 연결 제거
  deadConnections.forEach(conn => {
    connections.delete(conn);
  });

  if (sentCount > 0) {
    console.log(`📤 [${channel}] ${sentCount}개 클라이언트에 메시지 전송${failedCount > 0 ? ` (${failedCount}개 실패)` : ''}`);
  } else if (failedCount > 0) {
    console.warn(`⚠️ [${channel}] 모든 클라이언트 연결 실패 (${failedCount}개)`);
  }
  
  return { sentCount, failedCount };
}

// Redis 구독 및 메시지 브로드캐스트
async function setupRedisSubscriptions() {
  try {
    // Redis 연결
    await redisClient.connect();
    await redisSubscriber.connect();
    console.log('✅ Redis 연결 성공');

    // 각 채널 구독
    for (const channel of REDIS_CHANNELS) {
      await redisSubscriber.subscribe(channel, (message) => {
        try {
          // JSON 파싱 시도
          let data;
          try {
            data = JSON.parse(message);
          } catch {
            // JSON이 아니면 문자열로 처리
            data = { raw: message };
          }

          // WebSocket 메시지 형식으로 변환
          const wsMessage = {
            type: channel,
            data: data,
            timestamp: Date.now()
          };

          const messageStr = JSON.stringify(wsMessage);

          // ✅ 개선된 브로드캐스트 사용
          broadcastMessage(channel, messageStr);
        } catch (error) {
          console.error(`❌ 메시지 처리 실패 (${channel}):`, error);
        }
      });

      console.log(`✅ Redis 채널 구독: ${channel}`);
    }
  } catch (error) {
    console.error('❌ Redis 구독 설정 실패:', error);
    process.exit(1);
  }
}

// ✅ 주기적으로 연결 상태 정리 (30초마다)
setInterval(() => {
  const beforeCount = connections.size;
  const deadConnections = [];
  
  connections.forEach(conn => {
    if (conn.readyState !== 1) {
      deadConnections.push(conn);
    }
  });
  
  deadConnections.forEach(conn => {
    connections.delete(conn);
  });
  
  const afterCount = connections.size;
  if (beforeCount !== afterCount) {
    console.log(`🧹 끊어진 연결 정리: ${beforeCount} → ${afterCount} (${beforeCount - afterCount}개 제거)`);
  }
}, 30000);

// HTTP 서버 생성
const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://192.168.0.14:3000',
    'http://192.168.0.14:3004',
    'http://192.168.0.14:3005',
    'http://192.168.0.172:3000'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  res.writeHead(404);
  res.end();
});

sockjsServer.installHandlers(server, { prefix: '/ws' });

// 서버 시작
server.listen(PORT, () => {
  console.log(`🚀 WebSocket 서버 시작: http://0.0.0.0:${PORT}/ws`);
  setupRedisSubscriptions();
});

// 종료 처리
process.on('SIGINT', async () => {
  console.log('\n🛑 서버 종료 중...');
  await redisClient.quit();
  await redisSubscriber.quit();
  process.exit(0);
});

