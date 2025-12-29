#!/bin/bash

# 배포용 파일 압축 스크립트
# Docker 서버에 전송할 파일만 압축합니다

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

OUTPUT_FILE="platform-v2-deploy.tar.gz"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}배포용 파일 압축${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 기존 압축 파일 삭제
if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}기존 압축 파일 삭제...${NC}"
    rm -f "$OUTPUT_FILE"
fi

echo -e "${YELLOW}📦 파일 압축 중...${NC}"
echo ""

# 필요한 파일만 압축
tar -czf "$OUTPUT_FILE" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='out' \
  --exclude='build' \
  --exclude='.git' \
  --exclude='.cursor' \
  --exclude='*.log' \
  --exclude='.env.local' \
  --exclude='.env.development.local' \
  --exclude='*.tar.gz' \
  --exclude='*.tar' \
  --exclude='.DS_Store' \
  --exclude='Thumbs.db' \
  --exclude='.vscode' \
  --exclude='.idea' \
  --exclude='coverage' \
  --exclude='.nyc_output' \
  --exclude='*.tsbuildinfo' \
  --exclude='pnpm-lock.yaml' \
  .

if [ ! -f "$OUTPUT_FILE" ]; then
    echo -e "${RED}❌ 압축 실패${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ 압축 완료!${NC}"
echo ""
echo -e "${YELLOW}📊 파일 정보:${NC}"
echo "  - 파일명: $OUTPUT_FILE"
echo "  - 크기: $(du -h $OUTPUT_FILE | cut -f1)"
echo ""

echo -e "${YELLOW}📋 압축된 내용:${NC}"
tar -tzf "$OUTPUT_FILE" | head -20
echo "  ..."
echo "  (총 $(tar -tzf $OUTPUT_FILE | wc -l) 개 파일)"
echo ""

echo -e "${YELLOW}📤 다음 단계:${NC}"
echo "  1. 서버로 파일 전송:"
echo "     scp $OUTPUT_FILE user@server:/path/to/deploy/"
echo ""
echo "  2. 서버에서 압축 해제:"
echo "     ssh user@server"
echo "     cd /path/to/deploy"
echo "     tar -xzf $OUTPUT_FILE"
echo ""
echo "  3. 환경 변수 설정:"
echo "     cp .env.example .env.production"
echo "     nano .env.production  # 실제 값으로 수정"
echo ""
echo "  4. Docker로 실행:"
echo "     docker-compose up -d --build"
