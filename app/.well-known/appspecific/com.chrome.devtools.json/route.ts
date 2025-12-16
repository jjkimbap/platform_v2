import { NextResponse } from 'next/server'

/**
 * Chrome DevTools 자동 탐지 엔드포인트
 * 
 * Chrome이 자동으로 요청하는 엔드포인트입니다.
 * 404 오류를 방지하기 위해 빈 응답을 반환합니다.
 */
export async function GET() {
  return NextResponse.json({}, { status: 200 })
}


