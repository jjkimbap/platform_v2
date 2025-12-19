#!/bin/bash

# 배포 패키지 크기 확인 스크립트 (macOS/Linux 호환)

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}배포 패키지 크기 확인${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 전체 디렉토리 크기
echo -e "${BLUE}📊 전체 디렉토리 크기:${NC}"
du -sh .
echo ""

# node_modules 크기
if [ -d "node_modules" ]; then
    echo -e "${BLUE}📦 node_modules 크기:${NC}"
    du -sh node_modules
else
    echo -e "${YELLOW}⚠️  node_modules가 없습니다${NC}"
fi
echo ""

# .next 크기
if [ -d ".next" ]; then
    echo -e "${BLUE}🔨 .next 빌드 크기:${NC}"
    du -sh .next
else
    echo -e "${YELLOW}⚠️  .next가 없습니다${NC}"
fi
echo ""

# .git 크기
if [ -d ".git" ]; then
    echo -e "${BLUE}📁 .git 크기:${NC}"
    du -sh .git
else
    echo -e "${YELLOW}⚠️  .git이 없습니다${NC}"
fi
echo ""

# 예상 압축 파일 크기 계산
echo -e "${BLUE}📦 예상 배포 패키지 크기 (압축 전):${NC}"

# macOS와 Linux에서 모두 작동하는 방법
TOTAL_SIZE=$(du -sk . 2>/dev/null | cut -f1)
NODE_SIZE=$(du -sk node_modules 2>/dev/null | cut -f1)
NEXT_SIZE=$(du -sk .next 2>/dev/null | cut -f1)
GIT_SIZE=$(du -sk .git 2>/dev/null | cut -f1)

# 기본값 설정
NODE_SIZE=${NODE_SIZE:-0}
NEXT_SIZE=${NEXT_SIZE:-0}
GIT_SIZE=${GIT_SIZE:-0}

# 제외할 크기 계산
EXCLUDE_SIZE=$((NODE_SIZE + NEXT_SIZE + GIT_SIZE))
DEPLOY_SIZE=$((TOTAL_SIZE - EXCLUDE_SIZE))

# KB를 MB로 변환
DEPLOY_SIZE_MB=$((DEPLOY_SIZE / 1024))

echo -e "  약 ${GREEN}${DEPLOY_SIZE_MB}MB${NC} (압축 전)"
echo -e "  압축 후: 약 ${GREEN}$((DEPLOY_SIZE_MB / 3))-$((DEPLOY_SIZE_MB / 2))MB${NC} 예상"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}💡 참고${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  - 배포 시 node_modules, .next, .git은 제외됩니다"
echo "  - tar.gz 압축 시 크기가 1/2 ~ 1/3로 줄어듭니다"
echo "  - 일반적인 배포 패키지: 10-30MB"
echo ""
