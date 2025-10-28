export interface TargetConfig {
  value: number
  color: string
  label: string
}

export interface TargetsConfig {
  execution: TargetConfig
  scan: TargetConfig
  conversionRate: TargetConfig
  userInflow: TargetConfig
  appInflow: TargetConfig
  commerceInflow: TargetConfig
  communityPosts: TargetConfig
  newChatRooms: TargetConfig
}

// 목표치 설정을 읽어오는 함수
export async function getTargetsConfig(): Promise<TargetsConfig> {
  try {
    // 타임스탬프를 쿼리 파라미터로 추가하여 캐시 무효화
    const timestamp = Date.now()
    const response = await fetch(`/config/targets.json?t=${timestamp}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch targets config')
    }
    const config = await response.json()
    console.log('Targets config loaded:', config) // 디버깅용 로그
    return config as TargetsConfig
  } catch (error) {
    console.error('Error loading targets config:', error)
    // 기본값 반환
    return {
      execution: { value: 15000, color: "#3b82f6", label: "실행 목표" },
      scan: { value: 12000, color: "#10b981", label: "스캔 목표" },
      conversionRate: { value: 75, color: "#f59e0b", label: "전환율 목표" },
      userInflow: { value: 10000, color: "#3b82f6", label: "신규회원 목표" },
      appInflow: { value: 7000, color: "#8b5cf6", label: "앱 유입 목표" },
      commerceInflow: { value: 3000, color: "#f59e0b", label: "커머스 유입 목표" },
      communityPosts: { value: 1500, color: "#10b981", label: "게시글 목표" },
      newChatRooms: { value: 400, color: "#f59e0b", label: "채팅방 목표" }
    }
  }
}

// 목표치 설정을 동기적으로 읽어오는 함수 (SSR용)
export function getTargetsConfigSync(): TargetsConfig {
  // 기본값 반환 (SSR에서는 동적 로딩이 어려움)
  return {
    execution: { value: 15000, color: "#3b82f6", label: "실행 목표" },
    scan: { value: 12000, color: "#10b981", label: "스캔 목표" },
    conversionRate: { value: 75, color: "#f59e0b", label: "전환율 목표" },
    userInflow: { value: 10000, color: "#3b82f6", label: "신규회원 목표" },
    appInflow: { value: 7000, color: "#8b5cf6", label: "앱 유입 목표" },
    commerceInflow: { value: 3000, color: "#f59e0b", label: "커머스 유입 목표" },
    communityPosts: { value: 1500, color: "#10b981", label: "게시글 목표" },
    newChatRooms: { value: 400, color: "#f59e0b", label: "채팅방 목표" }
  }
}
