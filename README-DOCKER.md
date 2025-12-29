# Docker 빌드 및 배포 가이드

이 문서는 플랫폼 대시보드 애플리케이션을 Docker로 빌드하고 배포하는 방법을 설명합니다.

> **🔍 자동 타입 체크**: 모든 빌드 프로세스(로컬 및 Docker)에서 TypeScript 타입 체크가 자동으로 실행됩니다. 타입 에러가 있으면 빌드가 실패합니다.

## 📋 목차

1. [사전 요구사항](#사전-요구사항)
2. [환경 변수 설정](#환경-변수-설정)
3. [Docker 빌드](#docker-빌드)
4. [Docker 실행](#docker-실행)
5. [Docker Compose 사용](#docker-compose-사용)
6. [배포](#배포)
7. [문제 해결](#문제-해결)

---

## 🔧 사전 요구사항

### 필수 설치
- **Docker**: 20.10 이상
- **Docker Compose**: 2.0 이상 (선택사항)

### Docker 설치 확인
```bash
docker --version
docker-compose --version
```

---

## 🌐 환경 변수 설정

### 1. 환경 변수 파일 생성

```bash
# .env.example을 복사하여 .env.production 생성
cp .env.example .env.production
```

### 2. .env.production 파일 편집

```env
# API Base URL (백엔드 서버 주소)
NEXT_PUBLIC_API_BASE_URL=http://your-api-server:8025

# API 이미지 URL (CDN 주소)
NEXT_PUBLIC_API_IMG_URL=https://your-cdn-url.cloudfront.net

# Node 환경
NODE_ENV=production

# Next.js 텔레메트리 비활성화
NEXT_TELEMETRY_DISABLED=1
```

### 3. 환경 변수 설명

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | 백엔드 API 서버 주소 | `http://52.77.138.41:8025` |
| `NEXT_PUBLIC_API_IMG_URL` | 이미지 CDN 주소 | `https://d19cvjpkp3cfnf.cloudfront.net` |
| `NODE_ENV` | Node.js 환경 설정 | `production` |

> ⚠️ **중요**: `.env.production` 파일은 민감한 정보를 포함할 수 있으므로 Git에 커밋하지 마세요.

---

## 🐳 Docker 빌드

### 방법 1: Docker 명령어 사용

```bash
# 프로덕션 이미지 빌드
docker build -t platform-v2:latest .

# 특정 태그로 빌드
docker build -t platform-v2:v1.0.0 .

# 빌드 시 캐시 무시
docker build --no-cache -t platform-v2:latest .
```

### 방법 2: Docker Compose 사용

```bash
# 프로덕션 이미지 빌드
docker-compose build

# 개발 이미지 빌드
docker-compose -f docker-compose.dev.yml build
```

### 빌드 확인

```bash
# 빌드된 이미지 확인
docker images | grep platform-v2
```

---

## 🚀 Docker 실행

### 방법 1: Docker 명령어 사용

```bash
# 기본 실행
docker run -d \
  --name platform-v2-app \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://52.77.138.41:8025 \
  -e NEXT_PUBLIC_API_IMG_URL=https://d19cvjpkp3cfnf.cloudfront.net \
  platform-v2:latest

# 환경 변수 파일 사용
docker run -d \
  --name platform-v2-app \
  -p 3000:3000 \
  --env-file .env.production \
  platform-v2:latest
```

### 방법 2: Docker Compose 사용 (권장)

```bash
# 프로덕션 환경 실행
docker-compose up -d

# 개발 환경 실행 (hot reload 지원)
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

### 실행 확인

```bash
# 컨테이너 상태 확인
docker ps

# 애플리케이션 접속
curl http://localhost:3000

# 브라우저에서 접속
open http://localhost:3000
```

---

## 📦 Docker Compose 사용

### 프로덕션 환경

**docker-compose.yml** 파일을 사용하여 프로덕션 환경을 실행합니다.

```bash
# 시작
docker-compose up -d

# 재시작
docker-compose restart

# 중지 및 삭제
docker-compose down

# 볼륨까지 삭제
docker-compose down -v
```

### 개발 환경

**docker-compose.dev.yml** 파일을 사용하여 개발 환경을 실행합니다.

```bash
# 시작 (hot reload 지원)
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f

# 중지
docker-compose -f docker-compose.dev.yml down
```

### Nginx 리버스 프록시 사용

```bash
# Nginx와 함께 실행
docker-compose up -d

# Nginx 포트로 접속
curl http://localhost:80
```

---

## 🌍 배포

### 서버 배포 준비

1. **서버에 Docker 설치**
```bash
# Ubuntu 예시
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **프로젝트 파일 전송**
```bash
# 필요한 파일만 압축
tar -czf platform-v2.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  .

# 서버로 전송
scp platform-v2.tar.gz user@your-server:/path/to/deploy/

# 서버에서 압축 해제
ssh user@your-server
cd /path/to/deploy/
tar -xzf platform-v2.tar.gz
```

3. **환경 변수 설정**
```bash
# 서버에서 .env.production 생성
cp .env.example .env.production
nano .env.production  # 실제 값으로 수정
```

4. **Docker Compose로 실행**
```bash
# 빌드 및 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

### CI/CD 파이프라인 (GitHub Actions 예시)

`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker Image
        run: docker build -t platform-v2:${{ github.sha }} .
      
      - name: Push to Registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker tag platform-v2:${{ github.sha }} your-registry/platform-v2:latest
          docker push your-registry/platform-v2:latest
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /path/to/deploy
            docker-compose pull
            docker-compose up -d
```

---

## 🛠️ 문제 해결

### 빌드 실패

**문제**: Docker 빌드 시 메모리 부족
```bash
# Docker 메모리 증가 (Docker Desktop 설정에서)
# 또는 swap 사용
docker build --memory=4g --memory-swap=8g -t platform-v2:latest .
```

**문제**: 의존성 설치 실패
```bash
# 캐시 삭제 후 재빌드
docker-compose build --no-cache
```

### 실행 오류

**문제**: 컨테이너가 즉시 종료됨
```bash
# 로그 확인
docker logs platform-v2-app

# 컨테이너 내부 접속하여 디버깅
docker run -it --rm platform-v2:latest sh
```

**문제**: API 연결 실패
```bash
# 환경 변수 확인
docker exec platform-v2-app printenv | grep NEXT_PUBLIC

# 네트워크 확인
docker network ls
docker network inspect platform-network
```

### 포트 충돌

```bash
# 사용 중인 포트 확인
sudo lsof -i :3000

# 다른 포트로 실행
docker run -p 3001:3000 platform-v2:latest
```

### 로그 확인

```bash
# 실시간 로그
docker-compose logs -f

# 최근 100줄
docker-compose logs --tail=100

# 특정 서비스만
docker-compose logs -f app
```

---

## 📊 모니터링

### 컨테이너 상태 확인

```bash
# 리소스 사용량 확인
docker stats

# 헬스체크 확인
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### 로그 관리

```bash
# 로그 크기 제한 설정 (docker-compose.yml)
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## 🔒 보안 권장사항

1. **환경 변수 보안**
   - `.env.production` 파일은 절대 Git에 커밋하지 않기
   - 프로덕션 서버에서는 Docker secrets 사용 고려

2. **이미지 최적화**
   - 정기적으로 베이스 이미지 업데이트
   - 불필요한 패키지 제거

3. **네트워크 보안**
   - 필요한 포트만 노출
   - 방화벽 규칙 설정

---

## 📝 추가 명령어

### 이미지 관리

```bash
# 사용하지 않는 이미지 정리
docker image prune -a

# 특정 이미지 삭제
docker rmi platform-v2:latest

# 이미지 내보내기
docker save -o platform-v2.tar platform-v2:latest

# 이미지 가져오기
docker load -i platform-v2.tar
```

### 컨테이너 관리

```bash
# 컨테이너 재시작
docker restart platform-v2-app

# 컨테이너 중지
docker stop platform-v2-app

# 컨테이너 삭제
docker rm platform-v2-app

# 컨테이너 내부 접속
docker exec -it platform-v2-app sh
```

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. Docker 로그: `docker-compose logs -f`
2. 환경 변수: `docker exec platform-v2-app printenv`
3. 네트워크 연결: `docker network inspect platform-network`
4. 컨테이너 상태: `docker ps -a`

---

## 🔄 업데이트

새 버전 배포 시:

```bash
# 1. 새 코드 가져오기
git pull origin main

# 2. 이미지 재빌드
docker-compose build

# 3. 무중단 재시작
docker-compose up -d

# 4. 이전 이미지 정리
docker image prune -f
```

---

**작성일**: 2025-12-17  
**버전**: 1.0.0
