/**
 * API 응답 값과 표시 값 간의 매핑 정의
 * 타입이 추가되거나 변경될 경우 이 파일만 수정하면 됩니다.
 */

// 앱 타입 매핑
export const APP_TYPE_MAP: Record<number, string> = {
  1: 'HT',
  2: 'COP',
  20: 'Global'
} as const

export type AppTypeValue = keyof typeof APP_TYPE_MAP
export type AppTypeLabel = typeof APP_TYPE_MAP[AppTypeValue]

/**
 * 앱 타입 번호를 표시 문자열로 변환
 * @param appType 앱 타입 번호 (1: HT, 2: COP, 20: Global)
 * @returns 표시 문자열 또는 기본값
 */
export function getAppTypeLabel(appType: number): string {
  return APP_TYPE_MAP[appType] || 'Global'
}

// 제보 종류 매핑
export const REG_GUBUN_MAP: Record<number, string> = {
  0: '검출',
  1: '제보'
} as const

export type RegGubunValue = keyof typeof REG_GUBUN_MAP
export type RegGubunLabel = typeof REG_GUBUN_MAP[RegGubunValue]

/**
 * 제보 종류 번호를 표시 문자열로 변환
 * @param regGubun 제보 종류 번호 (0: 검출, 1: 제보)
 * @returns 표시 문자열 또는 기본값
 */
export function getRegGubunLabel(regGubun: number): string {
  return REG_GUBUN_MAP[regGubun] ?? '기타'
}

// 검출 타입 매핑 (비정상 스캔)
export const DETECTION_TYPE_MAP: Record<string, string> = {
  '1': '중간이탈',
  '2': '시간경과'
  // 나중에 타입이 추가되면 여기에 추가
  // '3': '새로운타입',
} as const

export type DetectionTypeValue = keyof typeof DETECTION_TYPE_MAP
export type DetectionTypeLabel = typeof DETECTION_TYPE_MAP[DetectionTypeValue]

/**
 * 검출 타입 코드를 표시 문자열로 변환
 * @param detectionType 검출 타입 코드 ("1": 중간이탈, "2": 시간경과)
 * @returns 표시 문자열 또는 기본값
 */
export function getDetectionTypeLabel(detectionType: string | number): string {
  const typeStr = String(detectionType)
  return DETECTION_TYPE_MAP[typeStr] || '시간경과'
}

/**
 * 검출 타입에 따른 스타일 클래스 반환
 * @param detectionType 검출 타입 코드
 * @returns Tailwind CSS 클래스 문자열
 */
export function getDetectionTypeStyle(detectionType: string | number): {
  bg: string
  text: string
} {
  const typeStr = String(detectionType)
  if (typeStr === '1') {
    return {
      bg: 'bg-orange-100',
      text: 'text-orange-800'
    }
  }
  return {
    bg: 'bg-purple-100',
    text: 'text-purple-800'
  }
}

/**
 * 제보 종류에 따른 스타일 클래스 반환
 * @param regGubun 제보 종류 번호
 * @returns Tailwind CSS 클래스 문자열
 */
export function getRegGubunStyle(regGubun: number): {
  bg: string
  text: string
} {
  if (regGubun === 0) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-800'
    }
  }
  return {
    bg: 'bg-green-100',
    text: 'text-green-800'
  }
}

/**
 * 앱 타입 라벨을 번호로 변환 (역매핑)
 * @param appTypeLabel 앱 타입 라벨 ("HT", "COP", "Global")
 * @returns 앱 타입 번호 또는 null
 */
export function getAppTypeValue(appTypeLabel: string): number | null {
  const entries = Object.entries(APP_TYPE_MAP)
  const found = entries.find(([_, label]) => label === appTypeLabel)
  return found ? Number(found[0]) : null
}

// OS 타입 매핑
export const OS_TYPE_MAP: Record<number, string> = {
  1: '안드로이드',
  2: 'iOS'
} as const

export type OsTypeValue = keyof typeof OS_TYPE_MAP
export type OsTypeLabel = typeof OS_TYPE_MAP[OsTypeValue]

/**
 * OS 타입 번호를 표시 문자열로 변환
 * @param osType OS 타입 번호 (1: 안드로이드, 2: iOS)
 * @returns 표시 문자열 또는 기본값
 */
export function getOsTypeLabel(osType: string | number | null | undefined): string {
  if (osType === null || osType === undefined || osType === '') {
    return '-'
  }
  const osTypeNum = typeof osType === 'string' ? parseInt(osType, 10) : osType
  if (isNaN(osTypeNum)) {
    return String(osType) // 숫자가 아니면 원본 반환
  }
  return OS_TYPE_MAP[osTypeNum] || String(osType)
}

// 성별 매핑
export const GENDER_MAP: Record<number, string> = {
  1: '여성',
  0: '남성'
} as const

export type GenderValue = keyof typeof GENDER_MAP
export type GenderLabel = typeof GENDER_MAP[GenderValue]

/**
 * 성별 번호를 표시 문자열로 변환
 * @param gender 성별 번호 (1: 여성, 2: 남성)
 * @returns 표시 문자열 또는 기본값
 */
export function getGenderLabel(gender: string | number | null | undefined): string {
  if (gender === null || gender === undefined || gender === '') {
    return '-'
  }
  const genderNum = typeof gender === 'string' ? parseInt(gender, 10) : gender
  if (isNaN(genderNum)) {
    return String(gender) // 숫자가 아니면 원본 반환
  }
  return GENDER_MAP[genderNum] || String(gender)
}

// 카테고리 매핑
export const CATEGORY_MAP: Record<string, string> = {
  '1': '코스메틱',
  '2': '패션',
  '3': '전자제품',
  '4': '의학',
  '5': '잡화',
  '6': '기타',
  '7': '리빙',
  '8': '유아용품',
  '9': '미용기기',
  '10': '보증·관리',
  '11': '제조·산업',
  '12': '식품',
  '13': '기능성뷰티',
  '14': '토탈케어',
  '15': '차량용품',
  '16': '애완용품',
  '17': '건강기능 식품',
  '18': '주류·담배 (죄악산업)',
  '19': '스포츠 용품',
  '20': '공공기관·협회',
  '21': '무역',
  '22': '도소매',
  '23': '엔터·IT',
  '24': 'IP',
  '25': '부동산',
} as const

export type CategoryValue = keyof typeof CATEGORY_MAP
export type CategoryLabel = typeof CATEGORY_MAP[CategoryValue]

/**
 * 카테고리 코드를 표시 문자열로 변환
 * @param category 카테고리 코드 (1-25)
 * @returns 표시 문자열 또는 기본값
 */
export function getCategoryLabel(category: string | number | null | undefined): string {
  if (category === null || category === undefined || category === '') {
    return '기타'
  }
  const categoryStr = String(category)
  return CATEGORY_MAP[categoryStr] || '기타'
}

