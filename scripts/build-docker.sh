#!/bin/bash

# Docker 이미지 빌드 스크립트
# 사용법: ./scripts/build-docker.sh [태그]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 기본 설정
IMAGE_NAME="platform-v2"
DEFAULT_TAG="latest"
TAG="${1:-$DEFAULT_TAG}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Platform V2 Docker 이미지 빌드${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker가 설치되어 있지 않습니다.${NC}"
    echo "Docker를 설치한 후 다시 시도해주세요."
    exit 1
fi

echo -e "${YELLOW}📦 이미지 정보:${NC}"
echo "  - 이름: $IMAGE_NAME"
echo "  - 태그: $TAG"
echo ""

# 빌드 시작
echo -e "${YELLOW}🔨 Docker 이미지 빌드 시작...${NC}"
docker build -t "${IMAGE_NAME}:${TAG}" .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 빌드 완료!${NC}"
    echo ""
    echo -e "${YELLOW}📊 이미지 정보:${NC}"
    docker images | grep "${IMAGE_NAME}" | grep "${TAG}"
    echo ""
    echo -e "${YELLOW}🚀 실행 방법:${NC}"
    echo "  docker run -d -p 3000:3000 --name platform-v2-app ${IMAGE_NAME}:${TAG}"
    echo ""
    echo -e "${YELLOW}🐳 Docker Compose 사용:${NC}"
    echo "  docker-compose up -d"
else
    echo ""
    echo -e "${RED}❌ 빌드 실패${NC}"
    exit 1
fi
