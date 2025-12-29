# 🚀 배포 가이드 (단계별)

## 📋 요약

1. **파일 압축** → 2. **서버 전송** → 3. **환경 설정** → 4. **Docker 실행**

---

## 1️⃣ 배포 파일 압축

### 방법 A: 스크립트 사용 (권장) ⭐

```bash
# 기본 사용
./scripts/create-deploy-package.sh

# 파일명 지정
./scripts/create-deploy-package.sh -o myapp.tar.gz

# 상세 출력
./scripts/create-deploy-package.sh -v
```

### 방법 B: 직접 명령어 입력

```bash
tar -czf platform-v2-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env.local' \
  .
```

**생성 결과**: `platform-v2-deploy.tar.gz` (약 10-30MB)

---

## 2️⃣ 서버로 파일 전송

### SSH로 전송

```bash
# 기본 전송
scp platform-v2-deploy.tar.gz user@your-server-ip:/home/user/

# 예시
scp platform-v2-deploy.tar.gz ubuntu@192.168.1.100:/home/ubuntu/
```

### 자동 배포 스크립트 사용

```bash
./scripts/deploy.sh your-server-ip username

# 예시
./scripts/deploy.sh 192.168.1.100 ubuntu
```

---

## 3️⃣ 서버에서 설정

### A. 서버 접속 및 압축 해제

```bash
# 1. 서버 접속
ssh user@your-server-ip

# 2. 배포 디렉토리 생성
mkdir -p ~/platform-v2
cd ~/platform-v2

# 3. 압축 해제
tar -xzf ~/platform-v2-deploy.tar.gz

# 4. 압축 파일 삭제 (선택)
rm ~/platform-v2-deploy.tar.gz
```

### B. 환경 변수 설정 (중요!)

```bash
# 1. 환경 변수 파일 생성
cp .env.example .env.production

# 2. 실제 값으로 수정
nano .env.production
```

**`.env.production` 내용:**

```env
# 백엔드 API 서버 주소 (실제 주소로 변경!)
NEXT_PUBLIC_API_BASE_URL=http://52.77.138.41:8025

# 이미지 CDN 주소
NEXT_PUBLIC_API_IMG_URL=https://d19cvjpkp3cfnf.cloudfront.net

# Node 환경
NODE_ENV=production

# 텔레메트리 비활성화
NEXT_TELEMETRY_DISABLED=1
```

> ⚠️ **중요**: `NEXT_PUBLIC_API_BASE_URL`을 반드시 실제 API 서버 주소로 변경하세요!

---

## 4️⃣ Docker 실행

### 방법 A: Docker Compose 사용 (권장) ⭐

```bash
# 빌드 및 실행
docker-compose up -d --build

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

### 방법 B: Docker 명령어 직접 사용

```bash
# 1. 이미지 빌드
docker build -t platform-v2:latest .

# 2. 컨테이너 실행
docker run -d \
  --name platform-v2-app \
  -p 3000:3000 \
  --env-file .env.production \
  platform-v2:latest

# 3. 상태 확인
docker ps

# 4. 로그 확인
docker logs -f platform-v2-app
```

---

## 5️⃣ 접속 확인

### 로컬에서 테스트

```bash
# HTTP 요청
curl http://your-server-ip:3000

# 헬스체크 (있는 경우)
curl http://your-server-ip:3000/api/health
```

### 브라우저 접속

```
http://your-server-ip:3000
```

---

## 🔧 문제 해결

### 빌드 실패 시

```bash
# 로그 확인
docker-compose logs

# 캐시 삭제 후 재빌드
docker-compose build --no-cache
docker-compose up -d
```

### API 연결 실패 시

```bash
# 환경 변수 확인
docker exec platform-v2-app printenv | grep NEXT_PUBLIC

# 컨테이너 재시작
docker-compose restart
```

### 포트 충돌 시

```bash
# 사용 중인 프로세스 확인
sudo lsof -i :3000

# 해당 프로세스 종료 또는 다른 포트 사용
docker run -p 3001:3000 platform-v2:latest
```

---

## 📊 유용한 명령어

### 상태 확인

```bash
# 컨테이너 상태
docker-compose ps

# 리소스 사용량
docker stats

# 로그 (실시간)
docker-compose logs -f

# 로그 (최근 100줄)
docker-compose logs --tail=100
```

### 재시작

```bash
# 전체 재시작
docker-compose restart

# 특정 서비스만
docker-compose restart app

# 완전 재시작 (중지 후 시작)
docker-compose down
docker-compose up -d
```

### 업데이트

```bash
# 1. 새 파일 전송
scp platform-v2-deploy.tar.gz user@server:/path/

# 2. 서버에서 압축 해제
ssh user@server
cd /path/to/deploy
tar -xzf platform-v2-deploy.tar.gz

# 3. 재배포
docker-compose down
docker-compose up -d --build
```

### 정리

```bash
# 컨테이너 중지 및 삭제
docker-compose down

# 볼륨까지 삭제
docker-compose down -v

# 사용하지 않는 이미지 정리
docker image prune -a
```

---

## 🎯 빠른 체크리스트

배포 전 확인사항:

- [ ] Docker가 서버에 설치되어 있는가?
- [ ] 파일이 제대로 압축되었는가? (10-30MB)
- [ ] `.env.production`이 생성되었는가?
- [ ] API 서버 주소가 올바른가?
- [ ] 포트 3000이 열려있는가?
- [ ] 방화벽 설정이 되어있는가?

배포 후 확인사항:

- [ ] 컨테이너가 실행 중인가? (`docker-compose ps`)
- [ ] 로그에 에러가 없는가? (`docker-compose logs`)
- [ ] 브라우저에서 접속되는가?
- [ ] API 호출이 정상적으로 되는가?

---

## 📞 추가 도움말

- **상세 가이드**: `README-DOCKER.md`
- **빠른 시작**: `QUICK-START-DOCKER.md`
- **파일 체크리스트**: `DOCKER-FILES-CHECKLIST.md`
- **환경 변수 예시**: `.env.example`

---

## 💡 팁

1. **첫 배포**: 시간이 걸릴 수 있습니다 (의존성 다운로드)
2. **재배포**: 캐시 사용으로 빠르게 완료됩니다
3. **로그 모니터링**: `docker-compose logs -f`로 실시간 확인
4. **자동 재시작**: `restart: unless-stopped` 설정으로 서버 재부팅 시 자동 시작

---

**작성일**: 2025-12-17  
**난이도**: 초급-중급  
**예상 시간**: 15-30분
