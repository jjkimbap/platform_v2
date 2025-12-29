# 🚀 Docker 빠른 시작 가이드

## 1️⃣ 로컬에서 테스트 (개발 환경)

```bash
# 개발 환경 실행 (hot reload 지원)
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f

# 접속: http://localhost:3000
```

---

## 2️⃣ 프로덕션 빌드 및 실행

### 방법 A: Docker Compose 사용 (권장)

```bash
# 1. 환경 변수 설정
cp .env.example .env.production
nano .env.production  # 실제 값으로 수정

# 2. 빌드 및 실행
docker-compose up -d --build

# 3. 상태 확인
docker-compose ps

# 4. 로그 확인
docker-compose logs -f
```

### 방법 B: Docker 명령어 사용

```bash
# 1. 이미지 빌드
docker build -t platform-v2:latest .

# 2. 컨테이너 실행
docker run -d \
  --name platform-v2-app \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://52.77.138.41:8025 \
  -e NEXT_PUBLIC_API_IMG_URL=https://d19cvjpkp3cfnf.cloudfront.net \
  platform-v2:latest

# 3. 상태 확인
docker ps

# 4. 로그 확인
docker logs -f platform-v2-app
```

### 방법 C: 빌드 스크립트 사용

```bash
# 빌드 스크립트 실행
./scripts/build-docker.sh

# 실행
docker-compose up -d
```

---

## 3️⃣ 서버 배포

### 자동 배포 (스크립트 사용)

```bash
# 배포용 파일 압축
./scripts/pack-for-deploy.sh

# 서버로 배포 (SSH 사용)
./scripts/deploy.sh [서버IP] [사용자명]

# 예시
./scripts/deploy.sh 192.168.1.100 ubuntu
```

### 수동 배포

```bash
# 1. 파일 압축
tar -czf platform-v2.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  .

# 2. 서버로 전송
scp platform-v2.tar.gz user@server:/path/to/deploy/

# 3. 서버에서 실행
ssh user@server
cd /path/to/deploy
tar -xzf platform-v2.tar.gz

# 4. 환경 변수 설정
cp .env.example .env.production
nano .env.production

# 5. Docker Compose로 실행
docker-compose up -d --build
```

---

## 4️⃣ 필수 환경 변수

`.env.production` 파일을 생성하고 다음 값들을 설정하세요:

```env
# 백엔드 API 서버 주소
NEXT_PUBLIC_API_BASE_URL=http://your-api-server:8025

# 이미지 CDN 주소
NEXT_PUBLIC_API_IMG_URL=https://your-cdn-url.cloudfront.net

# Node 환경
NODE_ENV=production
```

---

## 5️⃣ 유용한 명령어

### 상태 확인
```bash
# 컨테이너 상태
docker-compose ps

# 리소스 사용량
docker stats

# 헬스체크
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### 로그 관리
```bash
# 실시간 로그
docker-compose logs -f

# 최근 100줄
docker-compose logs --tail=100

# 특정 서비스만
docker-compose logs -f app
```

### 재시작
```bash
# 전체 재시작
docker-compose restart

# 특정 서비스만
docker-compose restart app

# 중지 후 재시작
docker-compose down && docker-compose up -d
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

## 6️⃣ 문제 해결

### 빌드 실패 시

```bash
# 캐시 삭제 후 재빌드
docker-compose build --no-cache

# Docker Desktop 메모리 증가 (설정 > Resources > Memory)
```

### API 연결 실패 시

```bash
# 환경 변수 확인
docker exec platform-v2-app printenv | grep NEXT_PUBLIC

# 컨테이너 내부에서 테스트
docker exec -it platform-v2-app sh
wget -O- http://52.77.138.41:8025/api/health || echo "API 연결 실패"
```

### 포트 충돌 시

```bash
# 사용 중인 포트 확인
sudo lsof -i :3000

# 다른 포트로 실행
docker run -p 3001:3000 platform-v2:latest
```

---

## 7️⃣ 접속 확인

```bash
# 로컬
curl http://localhost:3000

# 서버
curl http://your-server-ip:3000

# 브라우저
open http://localhost:3000
```

---

## 📝 다음 단계

- 상세한 가이드는 `README-DOCKER.md` 참고
- CI/CD 설정은 `.github/workflows/deploy.yml` 참고
- 모니터링 설정은 별도 문서 참고

---

## ⚠️ 주의사항

1. `.env.production` 파일은 Git에 커밋하지 마세요
2. 프로덕션에서는 Nginx 리버스 프록시 사용 권장
3. 정기적으로 Docker 이미지 업데이트
4. 로그 파일 크기 모니터링

---

**빠른 질문? 문제 발생?**
- Docker 로그: `docker-compose logs -f`
- 상세 가이드: `README-DOCKER.md`
- 컨테이너 상태: `docker-compose ps`
