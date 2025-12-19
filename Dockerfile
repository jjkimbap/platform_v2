# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

# 필수 패키지 설치 (빌드 도구)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (production + dev dependencies)
RUN npm ci

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules

# 소스 코드 복사
COPY . .

# 환경 변수 설정 (빌드 시 필요)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Next.js 빌드
RUN npm run build

# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# 프로덕션 환경 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 보안을 위한 non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드 결과물 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# public 폴더 권한 설정
RUN chown -R nextjs:nodejs /app

# non-root 사용자로 전환
USER nextjs

# 포트 노출
EXPOSE 8020

ENV PORT=8020
ENV HOSTNAME="52.77.138.41"

# 앱 실행
CMD ["node", "server.js"]
