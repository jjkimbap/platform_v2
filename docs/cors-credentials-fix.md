# CORS Credentials 오류 해결

## 현재 오류

```
Access-Control-Allow-Credentials' header in the response is '' 
which must be 'true' when the request's credentials mode is 'include'
```

## 문제 분석

### SockJS의 /info 경로

1. **`/ws/info`는 SockJS가 자동으로 사용하는 경로입니다**
   - 클라이언트가 `new SockJS('http://192.168.0.14:8025/ws')` 호출
   - SockJS가 자동으로 `GET http://192.168.0.14:8025/ws/info?t=타임스탬프` 요청
   - 서버 정보를 받아서 실제 WebSocket 연결 시작

2. **현재 문제**
   - SockJS가 credentials를 요구함 (`credentials mode is 'include'`)
   - 서버에서 `Access-Control-Allow-Credentials`가 빈 문자열('')로 설정됨
   - 브라우저가 CORS 오류 발생

## 해결 방법

### 서버 측 수정 (CorsFilter.java)

**문제**: `Access-Control-Allow-Credentials` 헤더가 빈 문자열로 설정되거나, 다른 필터에서 덮어쓰고 있을 수 있습니다.

```java
package com.cknb.htPlatform.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        String origin = request.getHeader("Origin");
        
        // ✅ 요청한 origin을 그대로 허용
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
        
        // ✅ 중요: credentials 헤더를 완전히 제거하거나 명시적으로 false 설정
        // 방법 1: 헤더를 설정하지 않음 (권장)
        // (아무것도 하지 않음)
        
        // 방법 2: 명시적으로 false 설정
        // response.setHeader("Access-Control-Allow-Credentials", "false");
        
        // ❌ 빈 문자열로 설정하지 않음
        // response.setHeader("Access-Control-Allow-Credentials", ""); // 이렇게 하면 안됨
        
        // ❌ true로 설정하지 않음 (wildcard와 충돌)
        // response.setHeader("Access-Control-Allow-Credentials", "true");
        
        // ❌ wildcard 사용 안 함
        // response.setHeader("Access-Control-Allow-Origin", "*");
        
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Authorization");

        // 프리플라이트 요청에 대응
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        chain.doFilter(req, res);
    }
}
```

### 클라이언트 측 확인

클라이언트에서는 이미 `withCredentials: false`로 설정되어 있습니다:

```typescript
const socket = new SockJSClass(WEBSOCKET_CONFIG.ENDPOINT, null, {
  withCredentials: false
});
```

하지만 SockJS가 내부적으로 credentials를 사용하려고 할 수 있습니다.

## 추가 확인 사항

### 1. 다른 필터나 설정 확인

서버에 다른 CORS 설정이 있는지 확인하세요:
- Spring Security 설정
- 다른 Filter
- WebMvcConfigurer의 CORS 설정

### 2. SockJS 서버 설정 확인

SockJS 서버 설정에서도 CORS를 확인하세요:

```java
@Configuration
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler(), "/ws")
                .setAllowedOrigins("*") // 또는 특정 origin
                .withSockJS()
                .setSupressCors(false); // CORS 억제하지 않음
    }
}
```

### 3. 디버깅 방법

서버 로그에서 다음을 확인:
1. `/ws/info` 요청이 들어오는지
2. CORS 헤더가 올바르게 설정되는지
3. 다른 필터가 헤더를 덮어쓰는지

브라우저 개발자 도구에서:
1. Network 탭 → `ws/info` 요청 확인
2. Response Headers 확인:
   - `Access-Control-Allow-Origin`이 올바른 origin인지
   - `Access-Control-Allow-Credentials`가 없거나 `false`인지

## 최종 해결책

**서버에서 `Access-Control-Allow-Credentials` 헤더를 완전히 제거하세요.**

이 헤더를 설정하지 않으면 브라우저는 credentials를 사용하지 않는 것으로 간주합니다.

