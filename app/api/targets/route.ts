import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET() {
  try {
    const configPath = join(process.cwd(), 'public', 'config', 'targets.json')
    const fs = require('fs')
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error reading targets config:', error)
    return NextResponse.json(
      { error: 'Failed to read targets config' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 목표치 데이터 검증
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // public/config 디렉토리 확인 및 생성
    const configDir = join(process.cwd(), 'public', 'config')
    if (!existsSync(configDir)) {
      await mkdir(configDir, { recursive: true })
    }

    // targets.json 파일 저장
    const configPath = join(configDir, 'targets.json')
    await writeFile(configPath, JSON.stringify(body, null, 2), 'utf-8')

    console.log('✅ 목표치 설정 저장 완료:', configPath)

    return NextResponse.json({ 
      success: true,
      message: '목표치가 성공적으로 저장되었습니다.'
    })
  } catch (error) {
    console.error('❌ Error saving targets config:', error)
    return NextResponse.json(
      { error: 'Failed to save targets config' },
      { status: 500 }
    )
  }
}

