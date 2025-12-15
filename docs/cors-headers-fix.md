# CORS Headers 오류 해결

## 현재 오류

```
Request header field cache-control is not allowed by Access-Control-Allow-Headers 
in preflight response.
```

## 문제 분석

클라이언트 코드(`lib/api.ts`)에서 여러 API 호출에 `Cache-Control: no-cache` 헤더를 사용하고 있습니다:

```typescript
headers: {
  'accept': 'application/json',
  'Cache-Control': 'no-cache',
}
```

하지만 서버의 `CorsFilter`에서 `Access-Control-Allow-Headers`에 `Cache-Control`이 포함되어 있지 않아서 CORS 오류가 발생합니다.

## 해결 방법

서버의 `CorsFilter.java`에서 `Access-Control-Allow-Headers`에 필요한 헤더들을 추가하세요:

```java
// ❌ 기존 (문제 있음)
response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Authorization");

// ✅ 수정 후
response.setHeader("Access-Control-Allow-Headers", 
    "Content-Type, X-Requested-With, Authorization, Cache-Control, Accept");
```

## 수정된 전체 코드

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
        
        // ✅ 요청한 origin을 그대로 허용 (wildcard 제거)
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
        
        // ✅ credentials 헤더를 설정하지 않음
        // response.setHeader("Access-Control-Allow-Credentials", "false");
        
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Max-Age", "3600");
        
        // ✅ 클라이언트에서 사용하는 모든 헤더 포함
        response.setHeader("Access-Control-Allow-Headers", 
            "Content-Type, X-Requested-With, Authorization, Cache-Control, Accept");

        // 프리플라이트 요청에 대응
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return; // OPTIONS 요청은 여기서 종료
        }
        
        chain.doFilter(req, res);
    }
}
```

## 클라이언트에서 사용하는 헤더 목록

클라이언트 코드에서 확인된 헤더:
- `Content-Type` - JSON 요청 시 사용
- `Accept` - `application/json` 요청 시 사용
- `Cache-Control` - `no-cache` 설정 시 사용
- `Authorization` - 인증 토큰 사용 시 (현재 미사용 가능성 있음)
- `X-Requested-With` - 일부 프레임워크에서 사용

## 대안: 모든 헤더 허용 (개발 환경)

개발 환경에서만 사용 가능한 방법 (보안상 권장하지 않음):

```java
response.setHeader("Access-Control-Allow-Headers", "*");
```

하지만 프로덕션에서는 필요한 헤더만 명시하는 것이 좋습니다.

## 확인 방법

서버 재시작 후:
1. 브라우저 개발자 도구 → Network 탭
2. API 요청의 OPTIONS (preflight) 요청 확인
3. Response Headers 확인:
   - `Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization, Cache-Control, Accept`
   - `Cache-Control`이 포함되어 있어야 함

