/**
 * WebSocket 연결 테스트 스크립트
 * Node.js 환경에서 SockJS 연결을 테스트합니다.
 */

const SockJS = require('sockjs-client');
const WEBSOCKET_ENDPOINT = process.env.WS_ENDPOINT || 'http://192.168.0.14:8025/ws';

console.log('🔌 WebSocket 연결 테스트 시작');
console.log('📍 엔드포인트:', WEBSOCKET_ENDPOINT);
console.log('');

// SockJS 연결 생성
const socket = new SockJS(WEBSOCKET_ENDPOINT, null, {
  withCredentials: false
});

console.log('📡 SockJS 인스턴스 생성 완료:', {
  readyState: socket.readyState,
  url: socket.url || WEBSOCKET_ENDPOINT,
  protocol: socket.protocol
});

// 연결 성공
socket.onopen = () => {
  console.log('');
  console.log('✅ WebSocket 연결 성공!');
  console.log('📊 연결 정보:', {
    readyState: socket.readyState,
    url: socket.url,
    protocol: socket.protocol
  });
  
  // 테스트 메시지 전송
  const testMessage = {
    type: 'test',
    message: '연결 테스트 메시지',
    timestamp: Date.now()
  };
  
  console.log('');
  console.log('📤 테스트 메시지 전송:', testMessage);
  socket.send(JSON.stringify(testMessage));
  
  // 3초 후 연결 종료
  setTimeout(() => {
    console.log('');
    console.log('🔌 연결 종료');
    socket.close(1000, '테스트 완료');
    process.exit(0);
  }, 3000);
};

// 메시지 수신
socket.onmessage = (event) => {
  console.log('');
  console.log('📥 메시지 수신:', event.data);
  try {
    const data = JSON.parse(event.data);
    console.log('📦 파싱된 데이터:', data);
  } catch (e) {
    console.log('⚠️ JSON 파싱 실패 (텍스트 메시지):', event.data);
  }
};

// 연결 종료
socket.onclose = (event) => {
  console.log('');
  console.log('⚠️ WebSocket 연결 종료:', {
    code: event.code,
    reason: event.reason,
    wasClean: event.wasClean
  });
  
  if (event.code !== 1000) {
    console.log('❌ 비정상 종료 (코드:', event.code, ')');
    process.exit(1);
  } else {
    console.log('✅ 정상 종료');
    process.exit(0);
  }
};

// 에러 처리
socket.onerror = (error) => {
  console.log('');
  console.error('❌ WebSocket 에러:', error);
  console.error('에러 타입:', error.type);
  console.error('에러 타겟:', error.target);
  process.exit(1);
};

// 타임아웃 설정 (10초)
setTimeout(() => {
  if (socket.readyState !== 1) {
    console.log('');
    console.error('❌ 연결 타임아웃 (10초)');
    console.log('현재 상태:', {
      readyState: socket.readyState,
      states: {
        0: 'CONNECTING',
        1: 'OPEN',
        2: 'CLOSING',
        3: 'CLOSED'
      }
    });
    socket.close();
    process.exit(1);
  }
}, 10000);

console.log('⏳ 연결 대기 중...');

