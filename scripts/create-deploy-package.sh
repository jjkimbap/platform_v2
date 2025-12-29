#!/bin/bash

# ===========================================
# Docker 배포용 패키지 생성 스크립트
# ===========================================
# 사용법: ./scripts/create-deploy-package.sh [옵션]
# 옵션:
#   -o, --output <파일명>  출력 파일명 (기본: platform-v2-deploy.tar.gz)
#   -v, --verbose          상세 출력
#   -h, --help             도움말

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 기본 설정
OUTPUT_FILE="platform-v2-deploy.tar.gz"
VERBOSE=false

# 도움말 출력
show_help() {
    echo ""
    echo -e "${GREEN}Docker 배포용 패키지 생성 스크립트${NC}"
    echo ""
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  -o, --output <파일명>   출력 파일명 (기본: platform-v2-deploy.tar.gz)"
    echo "  -v, --verbose           상세 출력"
    echo "  -h, --help              이 도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0"
    echo "  $0 -o myapp.tar.gz"
    echo "  $0 -v"
    echo ""
}

# 인자 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}❌ 알 수 없는 옵션: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Docker 배포용 패키지 생성${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 기존 파일 삭제
if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}⚠️  기존 파일 삭제: $OUTPUT_FILE${NC}"
    rm -f "$OUTPUT_FILE"
fi

# 필수 파일 체크
echo -e "${BLUE}🔍 필수 파일 확인 중...${NC}"

REQUIRED_FILES=(
    "Dockerfile"
    "next.config.mjs"
    "package.json"
    "tsconfig.json"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    else
        echo -e "${GREEN}  ✅ $file${NC}"
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ 필수 파일이 없습니다:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo -e "${RED}  - $file${NC}"
    done
    exit 1
fi

echo ""
echo -e "${YELLOW}📦 파일 압축 중...${NC}"

# 압축 옵션
TAR_OPTIONS="-czf"
if [ "$VERBOSE" = true ]; then
    TAR_OPTIONS="-czvf"
fi

# 파일 압축
tar $TAR_OPTIONS "$OUTPUT_FILE" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='out' \
    --exclude='build' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='.cursor' \
    --exclude='*.log' \
    --exclude='.env.local' \
    --exclude='.env.development.local' \
    --exclude='.env.test.local' \
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
    --exclude='.vercel' \
    --exclude='.cache' \
    --exclude='.parcel-cache' \
    .

if [ ! -f "$OUTPUT_FILE" ]; then
    echo ""
    echo -e "${RED}❌ 압축 실패${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ 압축 완료!${NC}"
echo ""

# 파일 정보
FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
FILE_COUNT=$(tar -tzf "$OUTPUT_FILE" | wc -l | tr -d ' ')

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 패키지 정보${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${YELLOW}파일명:${NC} $OUTPUT_FILE"
echo -e "  ${YELLOW}크기:${NC}   $FILE_SIZE"
echo -e "  ${YELLOW}파일수:${NC} $FILE_COUNT 개"
echo ""

# 주요 파일 목록 (처음 20개만)
echo -e "${BLUE}📋 포함된 주요 파일 (처음 20개):${NC}"
tar -tzf "$OUTPUT_FILE" | head -20 | while read line; do
    echo -e "  ${GREEN}✓${NC} $line"
done
echo -e "  ${YELLOW}...${NC}"
echo ""

# 다음 단계 안내
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📤 다음 단계${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}1. 서버로 파일 전송:${NC}"
echo -e "   ${GREEN}scp $OUTPUT_FILE user@server:/path/to/deploy/${NC}"
echo ""
echo -e "${YELLOW}2. 서버에서 압축 해제:${NC}"
echo -e "   ${GREEN}ssh user@server${NC}"
echo -e "   ${GREEN}cd /path/to/deploy${NC}"
echo -e "   ${GREEN}tar -xzf $OUTPUT_FILE${NC}"
echo ""
echo -e "${YELLOW}3. 환경 변수 설정:${NC}"
echo -e "   ${GREEN}cp .env.example .env.production${NC}"
echo -e "   ${GREEN}nano .env.production${NC}  # 실제 값으로 수정"
echo ""
echo -e "${YELLOW}4. Docker로 실행:${NC}"
echo -e "   ${GREEN}docker-compose up -d --build${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✨ 패키지 생성 완료!${NC}"
echo ""
