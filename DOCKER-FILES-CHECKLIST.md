# Docker 빌드 필수 파일 체크리스트

## ✅ 반드시 포함해야 하는 파일

### 1. Docker 설정 파일
- [ ] `Dockerfile` - 프로덕션 빌드 설정
- [ ] `Dockerfile.dev` - 개발 환경 설정 (선택)
- [ ] `.dockerignore` - Docker 빌드 시 제외할 파일 목록
- [ ] `docker-compose.yml` - Docker Compose 설정
- [ ] `docker-compose.dev.yml` - 개발용 Compose 설정 (선택)
- [ ] `nginx.conf` - Nginx 설정 (선택)

### 2. Next.js 설정 파일
- [ ] `next.config.mjs` - Next.js 설정 (output: 'standalone' 필수!)
- [ ] `package.json` - 의존성 목록
- [ ] `package-lock.json` - 의존성 버전 고정
- [ ] `tsconfig.json` - TypeScript 설정

### 3. 소스 코드
- [ ] `app/` - Next.js 앱 디렉토리
- [ ] `components/` - React 컴포넌트
- [ ] `lib/` - 유틸리티 함수
- [ ] `hooks/` - 커스텀 훅
- [ ] `public/` - 정적 파일

### 4. 스타일 설정
- [ ] `app/globals.css` - 전역 스타일
- [ ] `tailwind.config.js` - Tailwind 설정 (있는 경우)
- [ ] `postcss.config.mjs` - PostCSS 설정

### 5. 환경 변수 (중요!)
- [ ] `.env.example` - 환경 변수 예시 템플릿
- [ ] `.env.production` - 프로덕션 환경 변수 (서버에서 생성)

### 6. 설정 파일
- [ ] `public/config/` - 설정 JSON 파일들
- [ ] `components.json` - UI 컴포넌트 설정 (있는 경우)

---

## ❌ 포함하지 말아야 하는 파일

### 빌드 결과물
- `node_modules/` - Docker에서 새로 설치
- `.next/` - Docker에서 새로 빌드
- `out/` - 빌드 출력
- `build/` - 빌드 출력
- `dist/` - 빌드 출력

### 개발 환경 전용
- `.env.local` - 로컬 개발용 (민감 정보 포함 가능)
- `.env.development.local` - 로컬 개발용
- `*.log` - 로그 파일

### Git 관련
- `.git/` - Git 저장소
- `.gitignore` - (포함해도 무방하지만 Docker에서 불필요)

### IDE 설정
- `.vscode/` - VS Code 설정
- `.idea/` - IntelliJ 설정
- `.cursor/` - Cursor 설정

### OS 파일
- `.DS_Store` - macOS
- `Thumbs.db` - Windows

### 임시 파일
- `*.tsbuildinfo` - TypeScript 빌드 정보
- `coverage/` - 테스트 커버리지
- `*.tar.gz` - 압축 파일

---

## 📦 최소 필수 구조

```
platform_v2/
├── Dockerfile                    # 필수
├── .dockerignore                 # 필수
├── docker-compose.yml            # 권장
├── next.config.mjs              # 필수
├── package.json                 # 필수
├── package-lock.json            # 필수
├── tsconfig.json                # 필수
├── .env.example                 # 권장
├── app/                         # 필수
├── components/                  # 필수
├── lib/                         # 필수
├── hooks/                       # 필수
├── public/                      # 필수
└── styles/ (또는 app/globals.css) # 필수
```

---

## 🔍 파일 크기 체크

압축 전 확인:
```bash
du -sh . --exclude=node_modules --exclude=.next --exclude=.git
```

예상 크기: **10-30MB** (소스 코드만)

---

## 💡 팁

1. **package-lock.json 포함**: 의존성 버전 일관성 보장
2. **public/ 폴더**: 이미지, 설정 파일 등 정적 자원 포함
3. **.env.production**: 서버에서 별도로 생성 (민감 정보 포함)
4. **next.config.mjs**: `output: 'standalone'` 설정 확인
