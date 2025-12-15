# CORS 오류 완전 해결 가이드

## 현재 상황

1. **SockJS의 `/ws/info` 경로**
   - SockJS는 연결 전에 자동으로 `/ws/info`를 호출합니다
   - 서버에서 `/ws`로 설정하면 SockJS가 `/ws/info`를 자동으로 사용합니다

2. **오류 메시지**
   ```
   Access-Control-Allow-Credentials' header in the response is '' 
   which must be 'true' when the request's credentials mode is 'include'
   ```

3. **문제 원인**
   - 서버에서 `Access-Control-Allow-Credentials` 헤더가 빈 문자열('')로 설정됨
   - 또는 다른 필터/설정에서 덮어쓰고 있을 수 있음

## 해결 방법

### 1. 클라이언트 측 수정 (완료)

`hooks/useWebSocket.ts`에서 `withCredentials: false` 명시:

```typescript
const socket = new SockJSClass(WEBSOCKET_CONFIG.ENDPOINT, null, {
  withCredentials: false
})
```

### 2. 서버 측 수정 (필수)

`CorsFilter.java`에서 다음을 수정:

```java
@Override
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
        throws IOException, ServletException {
    HttpServletResponse response = (HttpServletResponse) res;
    HttpServletRequest request = (HttpServletRequest) req;

    String origin = request.getHeader("Origin");
    
    // ✅ 요청한 origin 허용
    if (origin != null) {
        response.setHeader("Access-Control-Allow-Origin", origin);
    }
    
    // ✅ 중요: Access-Control-Allow-Credentials 헤더를 완전히 제거
    // 이 헤더를 설정하지 않으면 브라우저는 credentials를 사용하지 않는 것으로 간주
    // 빈 문자열('')로 설정하지 않음
    // true로 설정하지 않음 (wildcard와 충돌)
    
    // ❌ 제거해야 할 라인들:
    // response.setHeader("Access-Control-Allow-Credentials", "true");
    // response.setHeader("Access-Control-Allow-Credentials", "");
    // response.setHeader("Access-Control-Allow-Origin", "*");
    
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.setHeader("Access-Control-Max-Age", "3600");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Authorization");

    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
        response.setStatus(HttpServletResponse.SC_OK);
        return;
    }
    
    chain.doFilter(req, res);
}
```

### 3. 다른 필터/설정 확인

서버에 다른 CORS 설정이 있는지 확인:

1. **Spring Security 설정**
   ```java
   @Configuration
   public class SecurityConfig {
       @Bean
       public CorsConfigurationSource corsConfigurationSource() {
           CorsConfiguration configuration = new CorsConfiguration();
           configuration.setAllowedOrigins(Arrays.asList("*"));
           // 이 설정이 CorsFilter와 충돌할 수 있음
           return configuration;
       }
   }
   ```

2. **WebMvcConfigurer의 CORS 설정**
   ```java
   @Configuration
   public class WebConfig implements WebMvcConfigurer {
       @Override
       public void addCorsMappings(CorsRegistry registry) {
           registry.addMapping("/**")
                   .allowedOrigins("*")
                   .allowedMethods("*");
           // 이 설정도 확인 필요
       }
   }
   ```

3. **SockJS 서버 설정**
   ```java
   @Configuration
   public class WebSocketConfig implements WebSocketConfigurer {
       @Override
       public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
           registry.addHandler(webSocketHandler(), "/ws")
                   .setAllowedOrigins("*") // 또는 특정 origin
                   .withSockJS();
       }
   }
   ```

## 확인 방법

### 서버 측 확인

1. 서버 로그에서 `/ws/info` 요청 확인
2. Response Headers 확인:
   ```bash
   curl -H "Origin: http://192.168.0.172:3000" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        http://192.168.0.14:8025/ws/info \
        -v
   ```

### 브라우저 개발자 도구

1. Network 탭 → `ws/info` 요청 확인
2. Response Headers 확인:
   - ✅ `Access-Control-Allow-Origin: http://192.168.0.172:3000`
   - ✅ `Access-Control-Allow-Credentials` 헤더가 없어야 함
   - ❌ `Access-Control-Allow-Credentials: ''` (빈 문자열)이면 안됨
   - ❌ `Access-Control-Allow-Origin: *`이면 안됨

## 최종 체크리스트

- [ ] 클라이언트에서 `withCredentials: false` 설정
- [ ] 서버에서 `Access-Control-Allow-Credentials` 헤더 제거
- [ ] 서버에서 `Access-Control-Allow-Origin: *` 제거
- [ ] 서버에서 요청한 origin을 그대로 허용
- [ ] 다른 CORS 설정 확인 및 충돌 해결
- [ ] 서버 재시작
- [ ] 브라우저에서 테스트

## 참고

- `/ws/info`는 SockJS의 내부 경로입니다
- 서버에서 `/ws`로 설정하면 SockJS가 자동으로 `/ws/info`를 호출합니다
- `Access-Control-Allow-Credentials` 헤더를 설정하지 않으면 credentials를 사용하지 않는 것으로 간주됩니다

