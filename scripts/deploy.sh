#!/bin/bash

# 서버 배포 스크립트
# 사용법: ./scripts/deploy.sh [서버주소] [사용자명]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 인자 확인
if [ $# -lt 2 ]; then
    echo -e "${RED}❌ 사용법: $0 <서버주소> <사용자명>${NC}"
    echo "예시: $0 192.168.1.100 ubuntu"
    exit 1
fi

SERVER=$1
USER=$2
DEPLOY_PATH="/home/${USER}/platform-v2"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Platform V2 서버 배포${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${YELLOW}📋 배포 정보:${NC}"
echo "  - 서버: ${SERVER}"
echo "  - 사용자: ${USER}"
echo "  - 배포 경로: ${DEPLOY_PATH}"
echo ""

# 1. 필요한 파일만 압축
echo -e "${YELLOW}📦 파일 압축 중...${NC}"
tar -czf platform-v2.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env.local' \
  --exclude='*.tar.gz' \
  .

if [ ! -f "platform-v2.tar.gz" ]; then
    echo -e "${RED}❌ 압축 파일 생성 실패${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 압축 완료 ($(du -h platform-v2.tar.gz | cut -f1))${NC}"
echo ""

# 2. 서버에 배포 디렉토리 생성
echo -e "${YELLOW}📁 서버에 배포 디렉토리 생성...${NC}"
ssh ${USER}@${SERVER} "mkdir -p ${DEPLOY_PATH}"

# 3. 파일 전송
echo -e "${YELLOW}📤 파일 전송 중...${NC}"
scp platform-v2.tar.gz ${USER}@${SERVER}:${DEPLOY_PATH}/

# 4. 서버에서 압축 해제 및 배포
echo -e "${YELLOW}🚀 서버에서 배포 실행...${NC}"
ssh ${USER}@${SERVER} << EOF
    cd ${DEPLOY_PATH}
    
    # 기존 컨테이너 중지
    if [ -f docker-compose.yml ]; then
        echo "기존 컨테이너 중지..."
        docker-compose down
    fi
    
    # 압축 해제
    echo "파일 압축 해제..."
    tar -xzf platform-v2.tar.gz
    
    # .env.production 확인
    if [ ! -f .env.production ]; then
        echo "⚠️  .env.production 파일이 없습니다."
        echo "    .env.example을 복사하여 .env.production을 생성하고"
        echo "    환경 변수를 설정한 후 다시 배포해주세요."
        exit 1
    fi
    
    # Docker 이미지 빌드
    echo "Docker 이미지 빌드..."
    docker-compose build
    
    # 컨테이너 시작
    echo "컨테이너 시작..."
    docker-compose up -d
    
    # 정리
    rm -f platform-v2.tar.gz
    
    echo ""
    echo "✅ 배포 완료!"
    echo ""
    echo "상태 확인: docker-compose ps"
    echo "로그 확인: docker-compose logs -f"
EOF

# 5. 로컬 압축 파일 삭제
rm -f platform-v2.tar.gz

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 배포가 완료되었습니다!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📊 서버 상태 확인:${NC}"
echo "  ssh ${USER}@${SERVER} 'cd ${DEPLOY_PATH} && docker-compose ps'"
echo ""
echo -e "${YELLOW}📜 로그 확인:${NC}"
echo "  ssh ${USER}@${SERVER} 'cd ${DEPLOY_PATH} && docker-compose logs -f'"
echo ""
echo -e "${YELLOW}🌐 접속:${NC}"
echo "  http://${SERVER}:3000"
