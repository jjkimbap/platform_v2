// 급상승 점수 계산 설정
export interface TrendingScoreConfig {
  // 기존 활동이 없을 때 기준
  zeroActivityThreshold: number  // 최소 활동량 (기본: 10)
  zeroActivityBaseScore: number  // 기본 점수 (기본: 50)
  zeroActivityMultiplier: number  // 점수 배수 (기본: 2)
  
  // 낮은 활동량 구간 (< lowActivityThreshold)
  lowActivityThreshold: number  // 낮은 활동량 기준 (기본: 10)
  lowActivityIncreases: {
    high: number  // 높은 증가량 (기본: 5)
    highScore: number  // 높은 증가량 점수 (기본: 60)
    medium: number  // 중간 증가량 (기본: 3)
    mediumScore: number  // 중간 증가량 점수 (기본: 40)
    low: number  // 낮은 증가량 (기본: 2)
    lowScore: number  // 낮은 증가량 점수 (기본: 20)
  }
  
  // 높은 활동량 구간 (>= lowActivityThreshold)
  highActivityThresholds: {
    // 비율 + 절대값 기준
    percentageAndAbsolute: Array<{
      percentage: number
      absolute: number
      score: number
    }>
    // 절대값만 기준
    absoluteOnly: Array<{
      absolute: number
      score: number
    }>
    // 비율만 기준
    percentageOnly: Array<{
      percentage: number
      score: number
    }>
  }
  
  // 커뮤니티 성장률 기반 자동 조정
  adaptiveScoring: {
    enabled: boolean  // 자동 조정 사용 여부
    communityGrowthMultiplier: number  // 커뮤니티 성장률 배수 (기본: 1.0)
    adjustmentRange: {
      min: number  // 최소 조정 범위 (기본: 0.5)
      max: number  // 최대 조정 범위 (기본: 2.0)
    }
  }
}

// 기본 설정값
export const defaultTrendingScoreConfig: TrendingScoreConfig = {
  zeroActivityThreshold: 10,
  zeroActivityBaseScore: 50,
  zeroActivityMultiplier: 2,
  
  lowActivityThreshold: 10,
  lowActivityIncreases: {
    high: 5,
    highScore: 60,
    medium: 3,
    mediumScore: 40,
    low: 2,
    lowScore: 20,
  },
  
  highActivityThresholds: {
    percentageAndAbsolute: [
      { percentage: 50, absolute: 20, score: 90 },
      { percentage: 40, absolute: 15, score: 80 },
      { percentage: 30, absolute: 15, score: 75 },
      { percentage: 20, absolute: 10, score: 60 },
      { percentage: 20, absolute: 5, score: 35 },
    ],
    absoluteOnly: [
      { absolute: 20, score: 50 },
      { absolute: 10, score: 25 },
    ],
    percentageOnly: [
      { percentage: 30, score: 40 },
      { percentage: 15, score: 15 },
    ],
  },
  
  adaptiveScoring: {
    enabled: true,
    communityGrowthMultiplier: 1.0,
    adjustmentRange: {
      min: 0.5,
      max: 2.0,
    },
  },
}

// 설정 파일에서 로드하는 함수
export async function getTrendingScoreConfig(): Promise<TrendingScoreConfig> {
  try {
    const timestamp = Date.now()
    const response = await fetch(`/config/trending-score.json?t=${timestamp}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch trending score config')
    }
    const config = await response.json()
    return { ...defaultTrendingScoreConfig, ...config } as TrendingScoreConfig
  } catch (error) {
    console.error('Error loading trending score config:', error)
    return defaultTrendingScoreConfig
  }
}

// 커뮤니티 성장률 계산 (전체 유저 데이터 기반)
export interface CommunityGrowthMetrics {
  avgActivity: number  // 평균 활동량
  medianActivity: number  // 중앙값 활동량
  stdDev: number  // 표준편차
  growthRate: number  // 평균 성장률 (%)
}

export function calculateCommunityGrowth(
  users: Array<{ 
    posts?: number; 
    comments?: number; 
    chatRooms?: number; 
    messages?: number; 
    trendData?: any[];
    [key: string]: any;
  }>
): CommunityGrowthMetrics {
  // 현재 활동량 계산
  const currentActivities = users.map(user => 
    (user.posts || 0) + (user.comments || 0) + (user.chatRooms || 0) + (user.messages || 0)
  )
  
  // 이전 활동량 계산 (trendData에서)
  const previousActivities: number[] = []
  users.forEach(user => {
    const currentActivity = (user.posts || 0) + (user.comments || 0) + (user.chatRooms || 0) + (user.messages || 0)
    
    if (user.trendData && user.trendData.length >= 4) {
      const prevMonths = user.trendData.slice(0, 3)
      let prevActivity = 0
      prevMonths.forEach((month: any) => {
        prevActivity += (month.posts || 0) + (month.comments || 0) + (month.chatRooms || 0) + (month.messages || 0)
      })
      previousActivities.push(Math.round(prevActivity / 3))
    } else {
      // trendData가 없으면 현재의 70%로 가정
      previousActivities.push(Math.round(currentActivity * 0.7))
    }
  })
  
  // 평균 계산
  const avgCurrent = currentActivities.reduce((a, b) => a + b, 0) / currentActivities.length
  const avgPrevious = previousActivities.length > 0 
    ? previousActivities.reduce((a, b) => a + b, 0) / previousActivities.length 
    : avgCurrent * 0.7
  
  // 중앙값 계산
  const sortedCurrent = [...currentActivities].sort((a, b) => a - b)
  const medianCurrent = sortedCurrent[Math.floor(sortedCurrent.length / 2)]
  
  const sortedPrevious = [...previousActivities].sort((a, b) => a - b)
  const medianPrevious = sortedPrevious.length > 0 
    ? sortedPrevious[Math.floor(sortedPrevious.length / 2)]
    : medianCurrent * 0.7
  
  // 표준편차 계산
  const variance = currentActivities.reduce((sum, val) => sum + Math.pow(val - avgCurrent, 2), 0) / currentActivities.length
  const stdDev = Math.sqrt(variance)
  
  // 성장률 계산
  const growthRate = avgPrevious > 0 ? ((avgCurrent - avgPrevious) / avgPrevious) * 100 : 0
  
  return {
    avgActivity: avgCurrent,
    medianActivity: medianCurrent,
    stdDev,
    growthRate,
  }
}

// 커뮤니티 성장률에 따른 임계값 조정
export function adjustThresholdsByGrowth(
  config: TrendingScoreConfig,
  growthMetrics: CommunityGrowthMetrics
): TrendingScoreConfig {
  if (!config.adaptiveScoring.enabled) {
    return config
  }
  
  // 성장률에 따른 배수 계산 (성장률이 높으면 기준을 높게)
  // 예: 성장률 50% → 배수 1.2, 성장률 -20% → 배수 0.8
  const growthMultiplier = Math.max(
    config.adaptiveScoring.adjustmentRange.min,
    Math.min(
      config.adaptiveScoring.adjustmentRange.max,
      1.0 + (growthMetrics.growthRate / 100) * config.adaptiveScoring.communityGrowthMultiplier
    )
  )
  
  // 설정값 조정
  const adjustedConfig = { ...config }
  
  // 절대값 기준 조정
  adjustedConfig.zeroActivityThreshold = Math.round(config.zeroActivityThreshold * growthMultiplier)
  adjustedConfig.lowActivityThreshold = Math.round(config.lowActivityThreshold * growthMultiplier)
  adjustedConfig.lowActivityIncreases = {
    high: Math.round(config.lowActivityIncreases.high * growthMultiplier),
    highScore: config.lowActivityIncreases.highScore,
    medium: Math.round(config.lowActivityIncreases.medium * growthMultiplier),
    mediumScore: config.lowActivityIncreases.mediumScore,
    low: Math.round(config.lowActivityIncreases.low * growthMultiplier),
    lowScore: config.lowActivityIncreases.lowScore,
  }
  
  // 높은 활동량 구간의 절대값 기준도 조정
  adjustedConfig.highActivityThresholds = {
    percentageAndAbsolute: config.highActivityThresholds.percentageAndAbsolute.map(threshold => ({
      ...threshold,
      absolute: Math.round(threshold.absolute * growthMultiplier),
    })),
    absoluteOnly: config.highActivityThresholds.absoluteOnly.map(threshold => ({
      ...threshold,
      absolute: Math.round(threshold.absolute * growthMultiplier),
    })),
    percentageOnly: config.highActivityThresholds.percentageOnly,
  }
  
  return adjustedConfig
}

