# 🔨 빌드 프로세스 가이드

## 📋 개요

이 프로젝트는 **TypeScript 타입 안정성**을 보장하기 위해 모든 빌드 프로세스에서 자동으로 타입 체크를 수행합니다.

---

## 🔍 타입 체크 설정

### 1. TypeScript 설정 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    // ... 기타 설정
  }
}
```

### 2. Next.js 설정 (`next.config.mjs`)

```javascript
typescript: {
  // 빌드 시 타입 체크 활성화
  ignoreBuildErrors: false,
}
```

### 3. NPM Scripts (`package.json`)

```json
{
  "scripts": {
    "build": "npm run type-check && next build",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🚀 빌드 프로세스

### 로컬 빌드

```bash
# 1. 타입 체크만 실행
npm run type-check

# 2. 타입 체크 + 빌드
npm run build
```

**프로세스 순서:**
1. `tsc --noEmit` - TypeScript 타입 체크
2. 타입 에러가 없으면 → `next build` 실행
3. 타입 에러가 있으면 → **빌드 중단** ❌

### Docker 빌드

```bash
# Docker Compose 사용
docker-compose build

# 또는 Docker 직접 사용
docker build -t platform-v2 .
```

**Dockerfile 빌드 프로세스:**
1. 의존성 설치 (`npm ci`)
2. 소스 코드 복사
3. **`npm run build` 실행** → 자동으로 타입 체크 포함
4. 타입 에러 시 Docker 빌드 실패 ❌

---

## ✅ 타입 체크 성공

```bash
$ npm run type-check

> my-v0-project@0.1.0 type-check
> tsc --noEmit

# 출력 없음 = 타입 에러 없음 ✅
```

---

## ❌ 타입 체크 실패

```bash
$ npm run build

> my-v0-project@0.1.0 type-check
> tsc --noEmit

components/example.tsx:10:5 - error TS2322: Type 'string' is not assignable to type 'number'.

10     value: "123"
       ~~~~~

Found 1 error in components/example.tsx:10

# 빌드 중단됨 ❌
```

**해결 방법:**
1. TypeScript 에러 수정
2. 다시 `npm run type-check` 실행
3. 에러 없으면 `npm run build` 실행

---

## 🐳 Docker 빌드 시 타입 에러 처리

### 에러 발생 시

```bash
$ docker-compose build

[+] Building 45.2s (12/15)
 => [builder 6/6] RUN npm run build
 => ERROR [builder] RUN npm run build

------
 > [builder 6/6] RUN npm run build:
#12 2.456 
#12 2.456 > my-v0-project@0.1.0 type-check
#12 2.456 > tsc --noEmit
#12 2.456 
#12 5.234 components/example.tsx:10:5 - error TS2322
#12 5.234 
------
ERROR: failed to solve: process "/bin/sh -c npm run build" did not complete successfully
```

### 해결 단계

1. **로컬에서 먼저 타입 체크**
   ```bash
   npm run type-check
   ```

2. **에러 수정**
   - TypeScript 에러 메시지 확인
   - 해당 파일 수정

3. **다시 확인**
   ```bash
   npm run type-check  # 로컬 확인
   npm run build       # 로컬 빌드 확인
   ```

4. **Docker 빌드**
   ```bash
   docker-compose build --no-cache
   ```

---

## 📊 빌드 프로세스 흐름도

```
┌─────────────────┐
│ npm run build   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  type-check     │ ◄── tsc --noEmit
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  ✅ 통과    ❌ 실패
    │         │
    │         └──► 빌드 중단
    ▼
┌─────────────────┐
│  next build     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 빌드 완료 ✅    │
└─────────────────┘
```

---

## 🎯 Best Practices

### 1. 개발 중

```bash
# 주기적으로 타입 체크 실행
npm run type-check

# 또는 watch 모드 (별도 터미널에서)
npx tsc --noEmit --watch
```

### 2. 커밋 전

```bash
# 타입 체크 + 로컬 빌드 확인
npm run type-check && npm run build
```

### 3. 배포 전

```bash
# 로컬에서 Docker 빌드 테스트
docker-compose build

# 타입 체크 포함되어 있으므로 안전하게 배포 가능
```

---

## 🔧 문제 해결

### Q: 타입 체크를 일시적으로 건너뛰고 싶어요

**권장하지 않지만**, 긴급 상황에서는:

```bash
# next.config.mjs에서 임시로 변경
typescript: {
  ignoreBuildErrors: true,  // 임시로만 사용!
}
```

⚠️ **주의**: 배포 후 반드시 다시 `false`로 변경하고 타입 에러를 수정하세요.

### Q: Docker 빌드가 타입 에러로 실패해요

```bash
# 1. 로컬에서 먼저 확인
npm run type-check

# 2. 모든 에러 확인
npx tsc --noEmit --pretty

# 3. 에러 수정 후 다시 빌드
docker-compose build --no-cache
```

### Q: 특정 파일의 타입 체크만 하고 싶어요

```bash
# 특정 파일만
npx tsc --noEmit components/example.tsx

# 특정 디렉토리
npx tsc --noEmit components/**/*.tsx
```

---

## 📚 관련 문서

- **Docker 가이드**: `README-DOCKER.md`
- **배포 가이드**: `DEPLOY-GUIDE.md`
- **명령어 치트시트**: `COMMANDS-CHEATSHEET.md`
- **보안 업데이트**: `SECURITY-UPDATE.md`

---

## 🎉 결론

✅ **타입 안정성 보장**
- 모든 빌드에서 자동 타입 체크
- 타입 에러 시 빌드 실패로 조기 발견

✅ **일관된 품질**
- 로컬/Docker 빌드 모두 동일한 검증
- CI/CD 파이프라인에 통합 가능

✅ **개발자 경험 향상**
- 명확한 에러 메시지
- 배포 전 문제 발견

---

**마지막 업데이트**: 2025년 12월 17일
