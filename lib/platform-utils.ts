/**
 * Platform 관련 공통 유틸리티 함수
 */

/**
 * 달성률에 따른 색상 반환
 */
export const getColorByRate = (rate: number) => {
  if (rate <= 50) {
    return {
      text: 'text-foreground',
      bg: 'bg-red-600'
    }
  } else if (rate <= 79) {
    return {
      text: 'text-foreground',
      bg: 'bg-yellow-400'
    }
  } else {
    return {
      text: 'text-foreground',
      bg: 'bg-green-600'
    }
  }
}

/**
 * 숫자를 포맷팅하여 반환 (예: 1000 -> "1,000")
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A'
  return value.toLocaleString()
}

/**
 * 퍼센트 포맷팅
 */
export const formatPercent = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(decimals)}%`
}

/**
 * 증감률 계산 및 포맷팅
 */
export const calculateChangeRate = (
  current: number | null | undefined,
  previous: number | null | undefined
): { value: number; formatted: string; isPositive: boolean } => {
  if (current === null || current === undefined || previous === null || previous === undefined) {
    return { value: 0, formatted: 'N/A', isPositive: false }
  }
  
  if (previous === 0) {
    return { value: 0, formatted: '0%', isPositive: false }
  }
  
  const changeRate = ((current - previous) / previous) * 100
  const isPositive = changeRate >= 0
  
  return {
    value: changeRate,
    formatted: `${isPositive ? '+' : ''}${changeRate.toFixed(1)}%`,
    isPositive
  }
}

/**
 * 국가별 배율 반환 (간단한 예시)
 */
export const getCountryMultiplier = (country: string): number => {
  const multipliers: Record<string, number> = {
    "전체": 1.0,
    "한국": 1.2,
    "일본": 0.8,
    "미국": 0.6,
    "중국": 0.9,
    "베트남": 0.5
  }
  
  return multipliers[country] || 1.0
}

/**
 * 앱 타입별 배율 반환
 */
export const getAppMultiplier = (app: string): number => {
  const multipliers: Record<string, number> = {
    "전체": 1.0,
    "HT": 0.45,
    "COP": 0.32,
    "Global": 0.23
  }
  
  return multipliers[app] || 1.0
}

/**
 * 데이터 배열에서 현재/과거 데이터 분리
 */
export const splitActualAndPredicted = <T extends Record<string, any>>(
  data: T[],
  actualKeys: string[],
  predictedKeys: string[]
): { actual: T[]; predicted: T[] } => {
  const actual = data.map(item => {
    const actualItem = { ...item }
    predictedKeys.forEach(key => {
      delete actualItem[key]
    })
    return actualItem
  })
  
  const predicted = data.map(item => {
    const predictedItem = { ...item }
    actualKeys.forEach(key => {
      if (item[key] === null || item[key] === undefined) {
        // 실제 데이터가 없는 경우에만 예측 데이터 유지
      } else {
        delete predictedItem[key]
      }
    })
    return predictedItem
  })
  
  return { actual, predicted }
}

/**
 * 스크롤 이벤트 디바운스
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 스크롤 이벤트 쓰로틀 (requestAnimationFrame 기반)
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number = 16 // ~60fps
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  let lastFunc: NodeJS.Timeout | null = null
  let lastRan: number = 0
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      lastRan = Date.now()
      inThrottle = true
    } else {
      if (lastFunc) clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

/**
 * requestAnimationFrame 기반 쓰로틀
 */
export const rafThrottle = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null
  let lastArgs: Parameters<T> | null = null
  
  return (...args: Parameters<T>) => {
    lastArgs = args
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) func(...lastArgs)
        rafId = null
        lastArgs = null
      })
    }
  }
}

/**
 * 섹션 ID 배열로 현재 활성 섹션 찾기 (개선된 버전)
 */
export const findActiveSection = (
  sectionIds: string[],
  headerOffset: number = 140
): string => {
  if (sectionIds.length === 0) return ""
  
  let currentSection = sectionIds[0]
  let maxVisible = -Infinity
  
  // 각 섹션의 가시성과 위치를 계산
  for (let i = 0; i < sectionIds.length; i++) {
    const section = document.getElementById(sectionIds[i])
    if (!section) continue
    
    const rect = section.getBoundingClientRect()
    const top = rect.top - headerOffset
    const bottom = rect.bottom - headerOffset
    
    // 섹션이 헤더 오프셋 이하에 있고, 최대한 많이 보이는 섹션 선택
    if (top <= 0 && bottom > 0) {
      const visibleHeight = Math.min(bottom, window.innerHeight - headerOffset)
      if (visibleHeight > maxVisible) {
        maxVisible = visibleHeight
        currentSection = sectionIds[i]
      }
    }
  }
  
  // 위에서 찾지 못한 경우, 가장 위에 있는 섹션 반환
  if (maxVisible === -Infinity) {
    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const section = document.getElementById(sectionIds[i])
      if (section) {
        const rect = section.getBoundingClientRect()
        if (rect.top <= headerOffset + 50) { // 약간의 여유 추가
          currentSection = sectionIds[i]
          break
        }
      }
    }
  }
  
  return currentSection
}

