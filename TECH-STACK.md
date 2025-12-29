# 기술 스택 (Tech Stack)

이 문서는 프로젝트에서 사용된 모든 기술 스택을 정리한 것입니다.

## 📦 핵심 프레임워크 & 런타임

### 프론트엔드 프레임워크
- **Next.js 14.2.21** - React 기반 풀스택 프레임워크
  - App Router 사용
  - Server Components & Client Components
  - Standalone 빌드 모드 (Docker 배포용)

### 언어
- **TypeScript 5.x** - 정적 타입 검사
  - Strict 모드 활성화
  - ES6 타겟
  - 빌드 시 타입 체크 자동 실행

### 런타임
- **Node.js 20** - 서버 사이드 런타임
- **React 18.3.1** - UI 라이브러리
- **React DOM 18.3.1** - DOM 렌더링

---

## 🎨 UI/UX 라이브러리

### UI 컴포넌트 라이브러리
- **Radix UI** - 접근성 중심의 헤드리스 UI 컴포넌트
  - `@radix-ui/react-dialog` - 모달/다이얼로그
  - `@radix-ui/react-accordion` - 아코디언
  - `@radix-ui/react-select` - 셀렉트 박스
  - `@radix-ui/react-tooltip` - 툴팁
  - `@radix-ui/react-tabs` - 탭
  - `@radix-ui/react-dropdown-menu` - 드롭다운 메뉴
  - `@radix-ui/react-popover` - 팝오버
  - `@radix-ui/react-toast` - 토스트 알림
  - 기타 20+ 컴포넌트

### 스타일링
- **Tailwind CSS 4.1.9** - 유틸리티 우선 CSS 프레임워크
  - `tailwindcss-animate` - 애니메이션
  - `tailwind-merge` - 클래스 병합 유틸리티
  - `clsx` - 조건부 클래스명
  - `class-variance-authority` - 컴포넌트 변형 관리

### 아이콘
- **Lucide React 0.454.0** - 아이콘 라이브러리

### 폼 관리
- **React Hook Form 7.60.0** - 폼 상태 관리
- **Zod 3.25.76** - 스키마 검증
- **@hookform/resolvers** - Zod 통합

---

## 📊 데이터 시각화

### 차트 라이브러리
- **Recharts (latest)** - React 차트 라이브러리
  - ComposedChart, BarChart, LineChart
  - PieChart, ResponsiveContainer
  - 커스텀 툴팁 및 범례

- **ECharts 5.6.0** - 고급 차트 라이브러리
  - `echarts-for-react` - React 래퍼

### 지도 라이브러리
- **Leaflet 1.9.4** - 오픈소스 지도 라이브러리
- **React Leaflet 4.2.1** - React 래퍼
- **@types/leaflet** - TypeScript 타입 정의

### 지리 데이터 처리
- **D3.js 7.9.0** - 데이터 시각화
  - `d3-hexbin` - 헥스빈 차트
  - `topojson-client` - TopoJSON 처리
  - `@types/d3` - TypeScript 타입 정의

---

## 🗄️ 데이터 & 상태 관리

### 상태 관리
- **Zustand (latest)** - 경량 상태 관리 라이브러리
- **Immer (latest)** - 불변성 관리

### 데이터 페칭
- **Fetch API** - 네이티브 HTTP 클라이언트
- **Redis 5.10.0** - 캐싱 및 세션 관리
  - `@types/redis` - TypeScript 타입 정의

---

## 🛠️ 개발 도구

### 빌드 도구
- **Next.js Build System** - 내장 빌드 시스템
- **PostCSS 8.5** - CSS 후처리
- **Autoprefixer 10.4.20** - CSS 벤더 프리픽스

### 개발 서버
- **Next.js Dev Server** - 핫 리로드 개발 서버
- **tsx 4.21.0** - TypeScript 실행 도구
- **ts-node 10.9.2** - Node.js TypeScript 실행

### 코드 품질
- **ESLint** - 코드 린팅 (빌드 시 무시)
- **TypeScript Compiler** - 타입 체크
  - 빌드 전 자동 타입 체크 (`npm run type-check`)

---

## 📅 날짜 & 시간 처리

- **date-fns 4.1.0** - 날짜 유틸리티
- **react-calendar 6.0.0** - 캘린더 컴포넌트
- **react-day-picker 9.8.0** - 날짜 선택기

---

## 🎯 기타 유틸리티

### UI 유틸리티
- **cmdk 1.0.4** - 커맨드 팔레트
- **sonner 1.7.4** - 토스트 알림
- **vaul 0.9.9** - 드로어 컴포넌트
- **embla-carousel-react 8.5.1** - 캐러셀
- **react-resizable-panels 2.1.7** - 리사이즈 가능한 패널
- **input-otp 1.4.1** - OTP 입력

### 테마 관리
- **next-themes 0.4.6** - 다크/라이트 모드

### 폰트
- **Geist 1.3.1** - 폰트 패밀리

### 분석
- **@vercel/analytics 1.3.1** - Vercel 분석

---

## 🐳 배포 & 인프라

### 컨테이너화
- **Docker** - 컨테이너화
  - Multi-stage 빌드 (deps → builder → runner)
  - Alpine Linux 기반
  - Standalone 빌드 모드
  - Non-root 사용자 실행

### 배포 환경
- **Node.js 20 Alpine** - 경량 런타임
- **포트**: 8020
- **호스트**: 0.0.0.0

### 배포 스크립트
- `build-docker.sh` - Docker 빌드
- `create-deploy-package.sh` - 배포 패키지 생성
- `deploy.sh` - 배포 스크립트
- `check-size.sh` - 빌드 크기 확인

---

## 🔧 프로젝트 구조

### 디렉토리 구조
```
platform_v2/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── platform/          # 플랫폼 대시보드
│   └── page.tsx          # 메인 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   └── platform/         # 플랫폼 전용 컴포넌트
├── lib/                   # 유틸리티 함수
├── hooks/                 # 커스텀 React 훅
├── public/               # 정적 파일
├── scripts/               # 배포/빌드 스크립트
└── config/                # 설정 파일
```

### 주요 기능 모듈
- **API 통합** (`lib/api.ts`) - 백엔드 API 클라이언트
- **차트 컴포넌트** - Recharts 기반 데이터 시각화
- **랭킹 시스템** - 유저/게시물 랭킹 및 추이 분석
- **예측 데이터** - Forecast 데이터 처리 및 시각화
- **이미지 처리** - CDN 이미지 URL 관리

---

## 📋 주요 기능

### 데이터 시각화
- 실시간 차트 (Recharts)
- 지도 시각화 (Leaflet)
- 고급 차트 (ECharts)

### 사용자 인터페이스
- 반응형 디자인 (Tailwind CSS)
- 다크/라이트 모드 (next-themes)
- 접근성 우선 UI (Radix UI)

### 데이터 관리
- 타입 안전성 (TypeScript)
- 폼 검증 (Zod + React Hook Form)
- 상태 관리 (Zustand)

### 성능 최적화
- 코드 스플리팅 (Next.js)
- 이미지 최적화
- 패키지 최적화 (`optimizePackageImports`)

---

## 🔐 보안

- CORS 설정 (Next.js headers)
- Non-root Docker 사용자
- 환경 변수 관리 (.env)
- 타입 안전성 (TypeScript strict mode)

---

## 📝 개발 워크플로우

### 빌드 프로세스
1. 타입 체크 (`npm run type-check`)
2. Next.js 빌드 (`npm run build`)
3. Standalone 출력 생성
4. Docker 이미지 빌드

### 개발 환경
- 핫 리로드 개발 서버
- 타입 체크 통합
- 자동 포맷팅

---

## 📚 문서

- `README-DOCKER.md` - Docker 가이드
- `QUICK-START-DOCKER.md` - 빠른 시작 가이드
- `DEPLOY-GUIDE.md` - 배포 가이드
- `BUILD-PROCESS.md` - 빌드 프로세스
- `COMMANDS-CHEATSHEET.md` - 명령어 모음
- `SECURITY-UPDATE.md` - 보안 업데이트

---

## 🎯 프로젝트 특징

- **타입 안전성**: TypeScript strict mode
- **접근성**: Radix UI 기반 접근성 우선 설계
- **성능**: Next.js 최적화 및 코드 스플리팅
- **확장성**: 모듈화된 컴포넌트 구조
- **유지보수성**: 타입 체크 자동화 및 문서화

---

*마지막 업데이트: 2025-12-17*














