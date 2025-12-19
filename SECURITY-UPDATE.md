# 🚨 보안 업데이트 가이드

## ⚠️ Next.js 보안 취약점 (Critical)

**발견된 취약점**: Next.js 14.2.0  
**심각도**: Critical  
**발표일**: 2025년 12월 11일  
**참조**: https://nextjs.org/blog/security-update-2025-12-11

---

## 🔧 즉시 업데이트 필요

### 1. package.json 업데이트 완료 ✅

다음 패키지들이 업데이트되었습니다:

```json
{
  "next": "^14.2.21",      // 14.2.0 → 14.2.21 (보안 패치)
  "echarts": "^6.0.0",     // 5.6.0 → 6.0.0 (최신 안정 버전)
  "react-leaflet": "^5.0.0" // 4.2.1 → 5.0.0 (최신 안정 버전)
}
```

### 2. 의존성 재설치 (필수!)

터미널에서 다음 명령어를 실행하세요:

```bash
# 1. 기존 의존성 삭제
rm -rf node_modules package-lock.json

# 2. 의존성 재설치
npm install

# 3. 보안 검사
npm audit

# 4. 개발 서버 재시작
npm run dev
```

---

## 📋 단계별 업데이트 절차

### Step 1: 백업 (권장)

```bash
# 현재 상태 백업
git add .
git commit -m "Before security update"
```

### Step 2: 의존성 정리

```bash
# node_modules와 lock 파일 삭제
rm -rf node_modules package-lock.json

# npm 캐시 정리 (선택사항)
npm cache clean --force
```

### Step 3: 재설치

```bash
# 의존성 재설치
npm install

# 설치 확인
npm list next
# 예상 출력: next@14.2.21 (또는 그 이상)
```

### Step 4: 빌드 테스트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드 테스트
npm run build
```

### Step 5: Docker 이미지 재빌드 (배포 시)

```bash
# Docker 이미지 재빌드
docker-compose build --no-cache

# 재시작
docker-compose up -d
```

---

## 🔍 업데이트 확인

### 현재 버전 확인

```bash
# Next.js 버전 확인
npm list next

# 모든 패키지 버전 확인
npm list --depth=0

# 보안 취약점 확인
npm audit
```

### 예상 출력

```
✅ next@14.2.21 (보안 패치 적용됨)
✅ 0 vulnerabilities found
```

---

## 🚀 배포 환경 업데이트

### 이미 배포된 서버가 있는 경우

#### 방법 A: 전체 재배포 (권장)

```bash
# 1. 새 배포 패키지 생성
./scripts/create-deploy-package.sh

# 2. 서버로 전송
scp platform-v2-deploy.tar.gz user@server:/path/

# 3. 서버에서 재배포
ssh user@server
cd /path/to/deploy
tar -xzf platform-v2-deploy.tar.gz

# 4. Docker 재빌드
docker-compose down
docker-compose up -d --build
```

#### 방법 B: 서버에서 직접 업데이트

```bash
# 서버 접속
ssh user@server
cd /path/to/deploy

# Git으로 최신 코드 받기 (Git 사용 시)
git pull origin main

# 또는 package.json만 업데이트 후
rm -rf node_modules package-lock.json
npm install

# Docker 재빌드
docker-compose build --no-cache
docker-compose up -d
```

---

## ⚠️ 주의사항

### 1. Breaking Changes 확인

Next.js 14.2.21은 마이너 패치이므로 breaking changes가 없어야 합니다.  
하지만 다음을 확인하세요:

- [ ] 개발 서버가 정상 실행되는가?
- [ ] 빌드가 성공하는가?
- [ ] 주요 기능이 정상 작동하는가?
- [ ] API 호출이 정상인가?

### 2. 기타 업데이트된 패키지

**echarts**: 5.6.0 → 6.0.0
- 차트 라이브러리 메이저 업데이트
- 기존 차트 코드 확인 필요
- 호환성 이슈 가능성 낮음

**react-leaflet**: 4.2.1 → 5.0.0
- 지도 라이브러리 메이저 업데이트
- 지도 사용 페이지 테스트 필요
- API 변경 가능성 있음

### 3. 롤백 계획

문제 발생 시:

```bash
# Git으로 이전 버전 복구
git checkout HEAD~1 package.json package-lock.json
npm install

# 또는 백업에서 복구
git stash
git checkout [이전-커밋-해시]
npm install
```

---

## 📊 업데이트 체크리스트

### 로컬 개발 환경
- [ ] package.json 확인
- [ ] node_modules 삭제
- [ ] package-lock.json 삭제
- [ ] npm install 실행
- [ ] npm audit 실행 (취약점 0개 확인)
- [ ] npm run dev 테스트
- [ ] npm run build 테스트
- [ ] 주요 페이지 동작 확인

### 프로덕션 환경
- [ ] 새 배포 패키지 생성
- [ ] Docker 이미지 재빌드
- [ ] 컨테이너 재시작
- [ ] 헬스체크 확인
- [ ] 로그 모니터링
- [ ] 주요 기능 테스트

---

## 🔗 관련 정보

### Next.js 보안 공지
- https://nextjs.org/blog/security-update-2025-12-11
- https://github.com/vercel/next.js/security/advisories

### npm 보안 가이드
- https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities

### Docker 보안 베스트 프랙티스
- https://docs.docker.com/develop/security-best-practices/

---

## 💡 예방 조치

### 정기적인 업데이트

```bash
# 매주 또는 매월 실행
npm outdated
npm audit
npm update

# 메이저 업데이트는 수동 확인 후 진행
```

### package.json 버전 관리

```json
{
  "next": "^14.2.21",  // ✅ 패치 버전 자동 업데이트
  "react": "^18.3.1"   // ✅ 마이너 버전 자동 업데이트
}
```

### CI/CD에 보안 검사 추가

```yaml
# .github/workflows/security.yml
name: Security Check

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit
```

---

## 📞 문제 발생 시

### 1. 빌드 실패

```bash
# 캐시 정리
rm -rf .next node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

### 2. 런타임 에러

```bash
# 로그 확인
docker-compose logs -f

# 컨테이너 재시작
docker-compose restart
```

### 3. API 호출 실패

```bash
# 환경 변수 확인
printenv | grep NEXT_PUBLIC

# Next.js 설정 확인
cat next.config.mjs
```

---

**업데이트 완료 시간**: 5-10분  
**다운타임**: 거의 없음 (Docker 롤링 업데이트 사용 시)  
**우선순위**: 🚨 즉시 (Critical)

---

**작성일**: 2025-12-17  
**마지막 업데이트**: 2025-12-17
