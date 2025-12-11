/**
 * 성별 및 연령대 코드 매핑
 * genderCode와 ageCode에 따른 매핑
 */

/**
 * 연령대 코드 매핑
 * ageCode: 1-5
 */
export const AGE_CODE_MAP: Record<number, string> = {
  1: '10대',
  2: '20대',
  3: '30대',
  4: '40대',
  5: '50대 이상',
}

/**
 * 성별 코드 매핑
 * genderCode: 1(여성), 2(남성)
 */
export const GENDER_CODE_MAP: Record<number, string> = {
  1: '여성',
  2: '남성',
}

/**
 * 연령대 코드를 이름으로 변환
 * @param ageCode 연령대 코드 (1-5)
 * @returns 연령대 이름, 없으면 빈 문자열
 */
export function getAgeName(ageCode?: number | null): string {
  if (ageCode === null || ageCode === undefined) {
    return ''
  }
  return AGE_CODE_MAP[ageCode] || ''
}

/**
 * 성별 코드를 이름으로 변환
 * @param genderCode 성별 코드 (1: 여성, 2: 남성)
 * @returns 성별 이름, 없으면 빈 문자열
 */
export function getGenderName(genderCode?: number | null): string {
  if (genderCode === null || genderCode === undefined) {
    return ''
  }
  return GENDER_CODE_MAP[genderCode] || ''
}

/**
 * 연령대 이름을 코드로 변환
 * @param ageName 연령대 이름
 * @returns 연령대 코드, 없으면 null
 */
export function getAgeCode(ageName: string): number | null {
  const entry = Object.entries(AGE_CODE_MAP).find(([_, name]) => name === ageName)
  return entry ? Number(entry[0]) : null
}

/**
 * 성별 이름을 코드로 변환
 * @param genderName 성별 이름
 * @returns 성별 코드, 없으면 null
 */
export function getGenderCode(genderName: string): number | null {
  const entry = Object.entries(GENDER_CODE_MAP).find(([_, name]) => name === genderName)
  return entry ? Number(entry[0]) : null
}

/**
 * 모든 연령대 목록 반환 (정렬된 순서)
 * @returns 연령대 번호와 이름의 배열
 */
export function getAllAges(): Array<{ code: number; name: string }> {
  return Object.entries(AGE_CODE_MAP).map(([code, name]) => ({
    code: Number(code),
    name,
  })).sort((a, b) => a.code - b.code)
}

/**
 * 모든 성별 목록 반환
 * @returns 성별 번호와 이름의 배열
 */
export function getAllGenders(): Array<{ code: number; name: string }> {
  return Object.entries(GENDER_CODE_MAP).map(([code, name]) => ({
    code: Number(code),
    name,
  })).sort((a, b) => a.code - b.code)
}

