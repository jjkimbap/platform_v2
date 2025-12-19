# 🚀 Docker 명령어 치트시트

빠른 참조용 명령어 모음입니다.

---

## 🔍 1. TypeScript 타입 체크

```bash
# 타입 체크만 실행 (빌드 없이)
npm run type-check

# 빌드 (자동으로 타입 체크 포함)
npm run build
```

> **Note**: `npm run build` 실행 시 자동으로 타입 체크가 먼저 수행됩니다. 타입 에러가 있으면 빌드가 중단됩니다.

---

## 📦 2. 배포 파일 생성

### 스크립트 사용 (권장)
```bash
# 기본 압축
./scripts/create-deploy-package.sh

# 파일명 지정
./scripts/create-deploy-package.sh -o myapp.tar.gz

# 상세 출력
./scripts/create-deploy-package.sh -v
```

### 직접 명령어 (macOS/Linux)
```bash
# macOS & Linux 호환
tar -czf platform-v2.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  .
```

### 크기 확인
```bash
# 전체 크기
du -sh .

# 압축 파일 크기
du -sh platform-v2.tar.gz

# 스크립트로 상세 확인
./scripts/check-size.sh
```

---

## 🐳 3. Docker 빌드

### Docker Compose (권장)
```bash
# 빌드
docker-compose build

# 빌드 (캐시 무시)
docker-compose build --no-cache

# 특정 서비스만
docker-compose build app
```

### Docker 명령어
```bash
# 기본 빌드
docker build -t platform-v2:latest .

# 캐시 무시
docker build --no-cache -t platform-v2:latest .

# 특정 태그
docker build -t platform-v2:v1.0.0 .

# 스크립트 사용
./scripts/build-docker.sh
./scripts/build-docker.sh v1.0.0
```

---

## 🚀 4. Docker 실행

### Docker Compose
```bash
# 시작 (백그라운드)
docker-compose up -d

# 시작 (빌드 포함)
docker-compose up -d --build

# 시작 (로그 보기)
docker-compose up

# 개발 환경
docker-compose -f docker-compose.dev.yml up -d
```

### Docker 명령어
```bash
# 기본 실행
docker run -d --name platform-v2-app -p 3000:3000 platform-v2:latest

# 환경 변수 파일 사용
docker run -d --name platform-v2-app -p 3000:3000 --env-file .env.production platform-v2:latest

# 환경 변수 직접 지정
docker run -d --name platform-v2-app -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://52.77.138.41:8025 \
  platform-v2:latest
```

---

## 📊 5. 상태 확인

### 컨테이너 상태
```bash
# Docker Compose
docker-compose ps

# Docker 명령어
docker ps
docker ps -a  # 중지된 것도 포함
```

### 로그 확인
```bash
# 실시간 로그
docker-compose logs -f

# 최근 N줄
docker-compose logs --tail=100

# 특정 서비스
docker-compose logs -f app

# Docker 명령어
docker logs -f platform-v2-app
docker logs --tail=100 platform-v2-app
```

### 리소스 사용량
```bash
# 실시간 모니터링
docker stats

# 특정 컨테이너만
docker stats platform-v2-app
```

---

## 🔄 6. 재시작 & 중지

### Docker Compose
```bash
# 재시작
docker-compose restart

# 특정 서비스만
docker-compose restart app

# 중지
docker-compose stop

# 중지 및 삭제
docker-compose down

# 볼륨까지 삭제
docker-compose down -v
```

### Docker 명령어
```bash
# 재시작
docker restart platform-v2-app

# 중지
docker stop platform-v2-app

# 시작
docker start platform-v2-app

# 삭제
docker rm platform-v2-app
docker rm -f platform-v2-app  # 강제 삭제
```

---

## 🔍 6. 디버깅

### 컨테이너 접속
```bash
# Docker Compose
docker-compose exec app sh

# Docker 명령어
docker exec -it platform-v2-app sh
docker exec -it platform-v2-app /bin/bash  # bash가 있는 경우
```

### 환경 변수 확인
```bash
# 모든 환경 변수
docker exec platform-v2-app printenv

# 특정 변수만
docker exec platform-v2-app printenv | grep NEXT_PUBLIC

# 파일 확인
docker exec platform-v2-app cat /app/.env.production
```

### 네트워크 확인
```bash
# 네트워크 목록
docker network ls

# 네트워크 상세
docker network inspect platform-network

# 컨테이너 네트워크
docker inspect platform-v2-app | grep -A 20 "NetworkSettings"
```

---

## 🧹 8. 정리

### 컨테이너 정리
```bash
# 중지된 컨테이너 삭제
docker container prune

# 모든 컨테이너 강제 삭제
docker rm -f $(docker ps -aq)
```

### 이미지 정리
```bash
# 사용하지 않는 이미지 삭제
docker image prune

# 모든 사용하지 않는 이미지 삭제
docker image prune -a

# 특정 이미지 삭제
docker rmi platform-v2:latest

# 모든 이미지 삭제
docker rmi $(docker images -q)
```

### 전체 정리
```bash
# 모든 리소스 정리 (주의!)
docker system prune

# 볼륨 포함 전체 정리
docker system prune -a --volumes

# 디스크 사용량 확인
docker system df
```

---

## 📤 9. 배포

### 서버로 전송
```bash
# SCP로 전송
scp platform-v2.tar.gz user@server:/path/to/deploy/

# 자동 배포 스크립트
./scripts/deploy.sh server-ip username
```

### 서버에서 실행
```bash
# 1. 압축 해제
tar -xzf platform-v2.tar.gz

# 2. 환경 설정
cp .env.example .env.production
nano .env.production

# 3. 실행
docker-compose up -d --build
```

---

## 🔧 10. 업데이트

### 코드 업데이트
```bash
# 1. 새 파일 전송
scp platform-v2.tar.gz user@server:/path/

# 2. 서버에서 재배포
ssh user@server
cd /path/to/deploy
tar -xzf platform-v2.tar.gz
docker-compose down
docker-compose up -d --build
```

### 이미지만 재빌드
```bash
docker-compose build
docker-compose up -d
```

### 무중단 업데이트
```bash
# 1. 새 이미지 빌드
docker-compose build

# 2. 롤링 업데이트
docker-compose up -d --no-deps --build app
```

---

## 🚨 11. 문제 해결

### 빌드 실패
```bash
# 캐시 삭제 후 재빌드
docker-compose build --no-cache

# 로그 확인
docker-compose logs --tail=100
```

### API 연결 실패
```bash
# 환경 변수 확인
docker exec platform-v2-app printenv | grep NEXT_PUBLIC

# 네트워크 테스트
docker exec -it platform-v2-app sh
wget -O- http://52.77.138.41:8025/api/health
```

### 포트 충돌
```bash
# 사용 중인 포트 확인
sudo lsof -i :3000

# 프로세스 종료
kill -9 <PID>

# 다른 포트 사용
docker run -p 3001:3000 platform-v2:latest
```

### 디스크 공간 부족
```bash
# 공간 확인
df -h
docker system df

# 정리
docker system prune -a
```

---

## 💡 12. 유용한 팁

### 컨테이너 자동 재시작
```yaml
# docker-compose.yml
services:
  app:
    restart: unless-stopped
```

### 로그 크기 제한
```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 헬스체크
```bash
# 컨테이너 헬스체크 확인
docker inspect --format='{{.State.Health.Status}}' platform-v2-app
```

### 빠른 재배포
```bash
# 한 줄 명령어
docker-compose down && docker-compose up -d --build
```

---

## 📝 13. 자주 사용하는 조합

### 타입 체크 & 빌드
```bash
# 타입 체크만
npm run type-check

# 타입 체크 + 빌드
npm run build
```

### 개발 시작
```bash
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
```

### 프로덕션 배포
```bash
./scripts/create-deploy-package.sh
scp platform-v2.tar.gz user@server:/home/user/
./scripts/deploy.sh server-ip username
```

### 로그 모니터링
```bash
docker-compose logs -f --tail=100
```

### 완전 재시작
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### 상태 체크
```bash
docker-compose ps && docker-compose logs --tail=20
```

---

## 🔗 참고 문서

- 상세 가이드: `README-DOCKER.md`
- 빠른 시작: `QUICK-START-DOCKER.md`
- 배포 가이드: `DEPLOY-GUIDE.md`
- 파일 체크리스트: `DOCKER-FILES-CHECKLIST.md`

---

**💾 이 파일을 저장해두고 필요할 때 참고하세요!**
