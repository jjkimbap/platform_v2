# CORS 필터 문제 분석 및 해결

## 현재 코드의 문제점

```java
// 문제가 있는 코드
String origin = request.getHeader("Origin");
if (origin != null) {
    response.setHeader("Access-Control-Allow-Origin", origin);  // 1. origin 설정
}
response.setHeader("Access-Control-Allow-Credentials", "true");  // 2. credentials true
response.setHeader("Access-Control-Allow-Origin", "*");        // 3. wildcard로 덮어쓰기 ❌
```

### 문제 분석

1. **1번 라인**: `origin`을 설정 (예: `http://localhost:3005`)
2. **2번 라인**: `Access-Control-Allow-Credentials: true` 설정
3. **3번 라인**: `Access-Control-Allow-Origin: *`로 덮어쓰기 ❌

**결과**: 
- `Access-Control-Allow-Credentials: true`와 `Access-Control-Allow-Origin: *`는 함께 사용할 수 없음
- 브라우저가 CORS 오류 발생

## 해결 방법

### 방법 1: 간단한 수정 (권장)

```java
String origin = request.getHeader("Origin");

// ✅ 요청한 origin을 그대로 허용
if (origin != null) {
    response.setHeader("Access-Control-Allow-Origin", origin);
}

// ❌ 이 두 라인 제거
// response.setHeader("Access-Control-Allow-Credentials", "true");
// response.setHeader("Access-Control-Allow-Origin", "*");

response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
response.setHeader("Access-Control-Max-Age", "3600");
response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Authorization");
```

### 방법 2: 특정 Origin만 허용 (보안 강화)

```java
private static final List<String> ALLOWED_ORIGINS = Arrays.asList(
    "http://localhost:3000",
    "http://localhost:3004",
    "http://localhost:3005",
    "http://192.168.0.14:3000",
    "http://192.168.0.14:3004",
    "http://192.168.0.14:3005"
);

String origin = request.getHeader("Origin");

if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
}
// credentials 헤더는 설정하지 않음
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
        
        // ✅ 요청한 origin 허용 (wildcard 제거)
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
        
        // ❌ 제거: credentials 사용 안 함
        // response.setHeader("Access-Control-Allow-Credentials", "true");
        
        // ❌ 제거: wildcard 사용 안 함
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

## 핵심 변경 사항

1. ✅ `response.setHeader("Access-Control-Allow-Origin", origin)` 유지
2. ❌ `response.setHeader("Access-Control-Allow-Credentials", "true")` 제거
3. ❌ `response.setHeader("Access-Control-Allow-Origin", "*")` 제거

## 적용 방법

1. 서버 코드에서 `CorsFilter.java` 파일 수정
2. 서버 재시작
3. 클라이언트에서 WebSocket 연결 테스트

## 확인 방법

서버 재시작 후:
1. 브라우저 개발자 도구 → Network 탭
2. `ws/info` 요청 확인
3. Response Headers 확인:
   - `Access-Control-Allow-Origin: http://localhost:3005` (wildcard가 아님)
   - `Access-Control-Allow-Credentials` 헤더가 없어야 함

