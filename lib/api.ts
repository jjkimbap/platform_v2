// API 기본 URL 설정 (환경 변수에서 가져오기)
const API_BASE_URL = 'http://192.168.0.14:8025'// process.env.NEXT_PUBLIC_API_BASE_URL || 'http://52.77.138.41:8025'

// Controller별 API URL 설정
const API_USER_URL = `${API_BASE_URL}/api/user`
export const API_ANALYTICS_URL = `${API_BASE_URL}/api/analytics`
const API_REPORT_URL = `${API_BASE_URL}/api/report`

// API 응답 타입 정의
export interface UserJoinPathData {
  appUserCount: number
  commerceUserCount: number
  period: string
}

export interface UserJoinPathResponse {
  data: UserJoinPathData[]
  total: {
    appUserCount: number
    commerceUserCount: number
  }
}

// API 호출 함수
export async function fetchUserJoinPath(
  type: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate: string,
  endDate: string
): Promise<UserJoinPathResponse> {
  try {
    const timestamp = Date.now() // 캐시 방지를 위한 타임스탬프
    const response = await fetch(
      `${API_USER_URL}/userJoinPath?type=${type}&start_date=${startDate}&end_date=${endDate}`,
      {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Cache-Control': 'no-cache',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: UserJoinPathData[] = await response.json()
    
    // TOTAL 데이터 추출
    const totalData = data.find(item => item.period === 'TOTAL')
    const dailyData = data.filter(item => item.period !== 'TOTAL')
    
    // 디버깅을 위한 로그
    console.log('API Response:', data)
    console.log('Total Data:', totalData)
    console.log('Daily Data Count:', dailyData.length)
    
    return {
      data: dailyData,
      total: {
        appUserCount: totalData?.appUserCount || 0,
        commerceUserCount: totalData?.commerceUserCount || 0,
      }
    }
  } catch (error) {
    console.error('Error fetching user join path data:', error)
    throw error
  }
}

// 날짜 포맷팅 유틸리티 (로컬 시간대 기준)
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 차트용 데이터 변환 (날짜순 정렬)
export function transformDataForChart(data: UserJoinPathData[]) {
  return data
    .filter(item => item.period !== 'TOTAL') // TOTAL 제외
    .sort((a, b) => a.period.localeCompare(b.period)) // 날짜순 정렬
    .map(item => ({
      date: item.period,
      app: item.appUserCount,
      commerce: item.commerceUserCount,
    }))
}

// === 신규 회원 통합 데이터 타입 정의 ===

// 실제 API 응답 데이터 타입
export interface NewMemberRawData {
  global: string | null
  line: string | null
  appGubun: string              // "0", "1", "2", "20", "GLOBAL"
  period: string                // 날짜 (YYYY-MM-DD) 또는 "TOTAL"
  email: string | null
  cop: string | null
  naver: string | null
  isCommerce: string            // "N" 또는 "TOTAL"
  kakao: string | null
  facebook: string | null
  ht: string | null
  growthRate: number | null
  inflowAppRatio: string | null
  google: string | null
  comparisonLabel: string | null
  prevNewUsers: number | null
  compareEndDate: string | null
  apple: string | null
  etc: string | null
  newUsers: number
  inflowCommerceRatio: string | null
  compareStartDate: string | null

}

export interface NewMemberApiResponse {
  data: NewMemberRawData[]
}

export interface NewMemberTrendData {
  date: string
  ht?: number | null
  cop?: number | null
  global?: number | null
  commerce?: number | null
  etc?: number | null              // 기타 (appGubun "0")
  htPredicted?: number | null
  copPredicted?: number | null
  globalPredicted?: number | null
  commercePredicted?: number | null
  etcPredicted?: number | null
}

export interface NewMemberComprehensiveResponse {
  // 요약 정보 (platform-comprehensive-metrics.tsx의 신규 회원 카드용)
  summary: {
    newMembers: number          // 현재 신규 회원 수
    growthRate: number          // 증감률 (%)
    comparisonLabel: string      // 비교 라벨 (예: "vs 직전 30일")
    // totalMembers는 총 다운로드, 총 스캔, 총 실행과 함께 별도 API로 받아옴
  }
  
  // 가입 경로별 점유율 (platform-comprehensive-metrics.tsx의 가입 경로별 점유율 차트용)
  distribution: {
    email: number              // 이메일 가입 경로 점유율 (%)
    naver: number              // 네이버 가입 경로 점유율 (%)
    kakao: number              // 카카오 가입 경로 점유율 (%)
    facebook: number           // 페이스북 가입 경로 점유율 (%)
    google: number             // 구글 가입 경로 점유율 (%)
    apple: number              // 애플 가입 경로 점유율 (%)
    line: number               // 라인 가입 경로 점유율 (%)
  }
  
  // 추이 데이터 (platform-trend-charts-section.tsx의 monthlyNewMemberData, dailyNewMemberData, weeklyNewMemberData용)
  trends: {
    monthly: NewMemberTrendData[]  // 월별 추이
    weekly: NewMemberTrendData[]   // 주별 추이
    daily: NewMemberTrendData[]    // 일별 추이
  }
}

// 퍼센트 문자열을 숫자로 변환하는 유틸리티 함수
function parsePercentage(value: string | number | null): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (value === 'null') return 0
  // "62.48%" 형식을 62.48로 변환
  const numStr = value.replace('%', '').trim()
  const num = parseFloat(numStr)
  return isNaN(num) ? 0 : num
}

// 숫자 또는 null을 반환하는 유틸리티 함수
function parseNumberOrNull(value: number | null | undefined): number | null {
  return value !== null && value !== undefined ? value : null
}

/**
 * 실제 API 응답을 NewMemberComprehensiveResponse 형식으로 변환
 * 
 * @param apiResponse 실제 API 응답 데이터
 * @returns 변환된 통합 데이터
 */
export function transformNewMemberData(
  apiResponse: NewMemberApiResponse
): NewMemberComprehensiveResponse {
  if (!apiResponse || !apiResponse.data) {
    throw new Error('Invalid API response: data is missing')
  }

  const { data } = apiResponse

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid API response: data is not an array or is empty')
  }

  console.log('🔍 transformNewMemberData - 전체 데이터 개수:', data.length)
  console.log('🔍 period 값들:', data.map(item => item.period))

  // 1. 요약 정보 추출 (period === "TOTAL"인 항목)
  const summaryData = data.find(item => item.period === 'TOTAL')
  
  console.log('🔍 Summary Data 찾기 결과:', summaryData ? '찾음' : '없음')
  
  if (!summaryData) {
    console.error('❌ Summary data (TOTAL) not found')
    console.error('Available periods:', data.map(item => ({ period: item.period, appGubun: item.appGubun })))
    throw new Error(`Summary data (TOTAL) not found in API response. Available periods: ${data.map(item => item.period).join(', ')}`)
  }

  console.log('✅ Summary Data:', {
    newUsers: summaryData.newUsers,
    growthRate: summaryData.growthRate,
    comparisonLabel: summaryData.comparisonLabel,
    email: summaryData.email,
    naver: summaryData.naver,
    kakao: summaryData.kakao
  })

  const summary = {
    newMembers: summaryData.newUsers || 0,
    growthRate: summaryData.growthRate || 0,
    comparisonLabel: summaryData.comparisonLabel || ''
    // totalMembers는 총 다운로드, 총 스캔, 총 실행과 함께 별도 API로 받아옴
  }
  
  console.log('✅ 변환된 Summary:', summary)

  // 2. 가입 경로별 점유율 추출 (summaryData에서 퍼센트 문자열을 숫자로 변환)
  const distribution = {
    email: parsePercentage(summaryData.email),
    naver: parsePercentage(summaryData.naver),
    kakao: parsePercentage(summaryData.kakao),
    facebook: parsePercentage(summaryData.facebook),
    google: parsePercentage(summaryData.google),
    apple: parsePercentage(summaryData.apple),
    line: parsePercentage(summaryData.line)
  }

  // 3. 추이 데이터 추출 (period !== "TOTAL"인 항목들)
  const trendData = data.filter(item => item.period !== 'TOTAL')
  
  // 날짜별로 그룹화하고 appGubun별로 합산
  // 원본 날짜 정보를 유지하기 위해 Map에 날짜 객체도 저장
  const dateMap = new Map<string, {
    dateObj: Date
    ht: number
    cop: number
    global: number
    commerce: number
    etc: number              // 기타 (appGubun "0")
  }>()

  trendData.forEach(item => {
    const dateStr = item.period
    const dateObj = new Date(dateStr)
    
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, { dateObj, ht: 0, cop: 0, global: 0, commerce: 0, etc: 0 })
    }
    
    const dateData = dateMap.get(dateStr)!
    const newUsers = item.newUsers || 0
    
    // appGubun에 따라 분류
    // 정확한 매핑:
    // - isCommerce === "Y" → Commerce
    // - isCommerce === "N"이고 appGubun === "1" → HT
    // - isCommerce === "N"이고 appGubun === "2" → COP
    // - isCommerce === "N"이고 appGubun === "20" → Global
    // - isCommerce === "N"이고 appGubun === "0" → 기타
    if (item.isCommerce === 'Y') {
      // 커머스 유입
      dateData.commerce += newUsers
    } else if (item.isCommerce === 'N') {
      // 앱 유입
      if (item.appGubun === '1') {
        // HT
        dateData.ht += newUsers
      } else if (item.appGubun === '2') {
        // COP
        dateData.cop += newUsers
      } else if (item.appGubun === '20') {
        // Global
        dateData.global += newUsers
      } else if (item.appGubun === '0') {
        // 기타
        dateData.etc += newUsers
      }
    }
  })

  // 날짜순으로 정렬하여 daily 추이 데이터 생성
  const dailyTrendsWithDate: Array<{ dateStr: string, dateObj: Date, values: { ht: number, cop: number, global: number, commerce: number, etc: number } }> = 
    Array.from(dateMap.entries())
      .map(([dateStr, data]) => ({
        dateStr,
        dateObj: data.dateObj,
        values: {
          ht: data.ht,
          cop: data.cop,
          global: data.global,
          commerce: data.commerce,
          etc: data.etc
        }
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

  const dailyTrends: NewMemberTrendData[] = dailyTrendsWithDate.map(({ dateStr, values }, index) => {
    const previousDate = index > 0 ? dailyTrendsWithDate[index - 1].dateObj : undefined
    return {
      date: formatDateForDisplay(dateStr, 'daily', previousDate),
      ht: values.ht > 0 ? values.ht : null,
      cop: values.cop > 0 ? values.cop : null,
      global: values.global > 0 ? values.global : null,
      commerce: values.commerce > 0 ? values.commerce : null,
      etc: values.etc > 0 ? values.etc : null
    }
  })

  // 주별/월별 데이터는 일별 데이터를 집계하여 생성
  const weeklyTrends = aggregateToWeekly(dailyTrendsWithDate)
  const monthlyTrends = aggregateToMonthly(dailyTrendsWithDate)

  return {
    summary,
    distribution,
    trends: {
      daily: dailyTrends,
      weekly: weeklyTrends,
      monthly: monthlyTrends
    }
  }
}


/**
 * 일별 데이터를 주별로 집계
 */
function aggregateToWeekly(
  dailyDataWithDate: Array<{ dateStr: string, dateObj: Date, values: { ht: number, cop: number, global: number, commerce: number, etc: number } }>
): NewMemberTrendData[] {
  // 주별로 그룹화 (월요일 기준)
  const weeklyMap = new Map<string, {
    weekStart: Date
    ht: number
    cop: number
    global: number
    commerce: number
    etc: number
  }>()

  dailyDataWithDate.forEach(({ dateObj, values }) => {
    // 해당 주의 시작일(월요일) 계산
    const dayOfWeek = dateObj.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 월요일로 조정
    const weekStart = new Date(dateObj)
    weekStart.setDate(dateObj.getDate() + diff)
    weekStart.setHours(0, 0, 0, 0)
    
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        weekStart,
        ht: 0,
        cop: 0,
        global: 0,
        commerce: 0,
        etc: 0
      })
    }
    
    const weekData = weeklyMap.get(weekKey)!
    weekData.ht += values.ht
    weekData.cop += values.cop
    weekData.global += values.global
    weekData.commerce += values.commerce
    weekData.etc += values.etc
  })

  // 주 시작일 순으로 정렬
  const sortedWeekly = Array.from(weeklyMap.entries())
    .sort((a, b) => a[1].weekStart.getTime() - b[1].weekStart.getTime())
  
  const weekly: NewMemberTrendData[] = sortedWeekly.map(([_, data], index) => {
    const month = data.weekStart.getMonth() + 1
    const weekNumber = index + 1
    // 이전 주와 같은 월인지 확인
    const previousWeek = index > 0 ? sortedWeekly[index - 1][1] : null
    const isNewMonth = !previousWeek || previousWeek.weekStart.getMonth() !== data.weekStart.getMonth() || previousWeek.weekStart.getFullYear() !== data.weekStart.getFullYear()
    
    return {
      date: isNewMonth ? `${month}월 ${weekNumber}주` : `${weekNumber}주`,
      ht: data.ht > 0 ? data.ht : null,
      cop: data.cop > 0 ? data.cop : null,
      global: data.global > 0 ? data.global : null,
      commerce: data.commerce > 0 ? data.commerce : null,
      etc: data.etc > 0 ? data.etc : null
    }
  })

  return weekly
}

/**
 * 일별 데이터를 월별로 집계
 */
function aggregateToMonthly(
  dailyDataWithDate: Array<{ dateStr: string, dateObj: Date, values: { ht: number, cop: number, global: number, commerce: number, etc: number } }>
): NewMemberTrendData[] {
  // 월별로 그룹화
  const monthlyMap = new Map<string, {
    month: number
    year: number
    ht: number
    cop: number
    global: number
    commerce: number
    etc: number
  }>()

  dailyDataWithDate.forEach(({ dateObj, values }) => {
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1
    const monthKey = `${year}-${String(month).padStart(2, '0')}`
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month,
        year,
        ht: 0,
        cop: 0,
        global: 0,
        commerce: 0,
        etc: 0
      })
    }
    
    const monthData = monthlyMap.get(monthKey)!
    monthData.ht += values.ht
    monthData.cop += values.cop
    monthData.global += values.global
    monthData.commerce += values.commerce
    monthData.etc += values.etc
  })

  // 월 순으로 정렬
  const monthly: NewMemberTrendData[] = Array.from(monthlyMap.entries())
    .sort((a, b) => {
      if (a[1].year !== b[1].year) return a[1].year - b[1].year
      return a[1].month - b[1].month
    })
    .map(([_, data]) => ({
      date: `${data.month}월`,
      ht: data.ht > 0 ? data.ht : null,
      cop: data.cop > 0 ? data.cop : null,
      global: data.global > 0 ? data.global : null,
      commerce: data.commerce > 0 ? data.commerce : null,
      etc: data.etc > 0 ? data.etc : null
    }))

  return monthly
}

/**
 * 신규 회원 추이 데이터를 가져오는 API 함수
 * 
 * @param type 데이터 타입 (daily, weekly, monthly)
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
 * @returns 신규 회원 추이 데이터
 */
export async function fetchNewUserTrend(
  type: 'daily' | 'weekly' | 'monthly',
  startDate: string,
  endDate: string
): Promise<NewMemberTrendData[]> {
  try {
    const timestamp = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
    
    const response = await fetch(
      `${API_ANALYTICS_URL}/new-user/trend?type=${type}&start_date=${startDate}&end_date=${endDate}&_t=${timestamp}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse: NewMemberApiResponse = await response.json()
    
    // 추이 데이터만 변환 (period !== "TOTAL"인 항목들)
    const trendData = apiResponse.data.filter(item => item.period !== 'TOTAL')
    
    // 날짜별로 그룹화하고 appGubun별로 합산
    const dateMap = new Map<string, {
      dateObj: Date
      ht: number
      cop: number
      global: number
      commerce: number
      etc: number
    }>()

    trendData.forEach(item => {
      const dateStr = item.period
      const dateObj = new Date(dateStr)
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { dateObj, ht: 0, cop: 0, global: 0, commerce: 0, etc: 0 })
      }
      
      const dateData = dateMap.get(dateStr)!
      const newUsers = item.newUsers || 0
      
      // appGubun에 따라 분류
      if (item.isCommerce === 'Y') {
        dateData.commerce += newUsers
      } else if (item.isCommerce === 'N') {
        if (item.appGubun === '1') {
          dateData.ht += newUsers
        } else if (item.appGubun === '2') {
          dateData.cop += newUsers
        } else if (item.appGubun === '20') {
          dateData.global += newUsers
        } else if (item.appGubun === '0') {
          dateData.etc += newUsers
        }
      }
    })

    // 날짜순으로 정렬하여 추이 데이터 생성
    const sortedData = Array.from(dateMap.entries())
      .map(([dateStr, data]) => ({
        dateStr,
        dateObj: data.dateObj,
        values: {
          ht: data.ht,
          cop: data.cop,
          global: data.global,
          commerce: data.commerce,
          etc: data.etc
        }
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    
    const trends: NewMemberTrendData[] = sortedData.map(({ dateStr, values }, index) => {
        // type에 따라 날짜 포맷 변경 (이전 날짜 전달하여 월 변경 감지)
        const previousDate = index > 0 ? sortedData[index - 1].dateObj : undefined
        let formattedDate = formatDateForDisplay(dateStr, type, previousDate)
        return {
          date: formattedDate,
          ht: values.ht > 0 ? values.ht : null,
          cop: values.cop > 0 ? values.cop : null,
          global: values.global > 0 ? values.global : null,
          commerce: values.commerce > 0 ? values.commerce : null,
          etc: values.etc > 0 ? values.etc : null
        }
      })

    return trends
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('API 요청 타임아웃:', error)
      throw new Error('API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
    }
    console.error('Error fetching new user trend data:', error)
    throw error
  }
}

/**
 * 날짜를 표시 형식으로 변환
 * @param dateStr 날짜 문자열 (YYYY-MM-DD)
 * @param type 데이터 타입 (daily, weekly, monthly)
 * @param previousDate 이전 날짜 (월이 바뀌는지 확인용)
 */
function formatDateForDisplay(dateStr: string, type: 'daily' | 'weekly' | 'monthly', previousDate?: Date): string {
  try {
    const date = new Date(dateStr)
    if (type === 'daily') {
      const day = date.getDate()
      const month = date.getMonth() + 1
      
      // 이전 날짜가 있고 월이 바뀌었거나, 첫 번째 날짜인 경우 월 표시
      if (!previousDate || previousDate.getMonth() !== date.getMonth() || previousDate.getFullYear() !== date.getFullYear()) {
        return `${month}월 ${day}일`
      }
      return `${day}일`
    } else if (type === 'weekly') {
      // 주차 계산 (월의 첫 주부터)
      const weekNumber = Math.ceil(date.getDate() / 7)
      const month = date.getMonth() + 1
      return `${month}월 ${weekNumber}주`
    } else {
      // monthly
      const month = date.getMonth() + 1
      return `${month}월`
    }
  } catch {
    return dateStr
  }
}

// === 커뮤니티 게시물 데이터 타입 정의 ===

// 실제 API 응답 데이터 타입
export interface CommunityPostRawData {
  appGubun: string              // "GLOBAL"
  period: string                // 날짜 (YYYY-MM-DD) 또는 "TOTAL"
  posts: number                 // 게시물 수
  growthRate: number | null     // 증감률 (%)
  tradeRatio: string | number | null      // 인증거래 점유율 (%)
  commInfoRatio: string | number | null   // 판별팁 점유율 (%)
  commReviewRatio: string | number | null // 제품리뷰 점유율 (%)
  commDebateRatio: string | number | null // Q&A 점유율 (%)
  statusKey?: string            // period !== "TOTAL"인 경우 카테고리 (trade, commInfo, commReview, commDebate)
}

export interface CommunityPostApiResponse {
  data: CommunityPostRawData[]
}

export interface CommunityPostSummary {
  posts: number                 // 게시물 수
  growthRate: number            // 증감률 (%)
  tradeRatio: number            // 인증거래 점유율 (%)
  commInfoRatio: number         // 판별팁 점유율 (%)
  commReviewRatio: number       // 제품리뷰 점유율 (%)
  commDebateRatio: number       // Q&A 점유율 (%)
}

export interface CommunityPostTrendData {
  date: string
  trade: number          // 인증거래
  tips: number           // 판별팁
  review: number         // 제품리뷰
  qa: number             // Q&A
  communityPosts: number // 전체 게시물 수 (전체 보기용)
}

/**
 * 커뮤니티 게시물 추이 데이터를 가져오는 API 함수
 * 
 * @param type 데이터 타입 (daily, weekly, monthly)
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
 * @returns 커뮤니티 게시물 추이 데이터
 */
export async function fetchCommunityPostTrend(
  type: 'daily' | 'weekly' | 'monthly',
  startDate: string,
  endDate: string
): Promise<CommunityPostTrendData[]> {
  try {
    const timestamp = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
    
    const response = await fetch(
      `${API_ANALYTICS_URL}/community-post/trend?type=${type}&start_date=${startDate}&end_date=${endDate}&_t=${timestamp}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 커뮤니티 게시물 API 응답 에러:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    let apiResponse: CommunityPostApiResponse
    try {
      apiResponse = await response.json()
    } catch (jsonError) {
      console.error('❌ 커뮤니티 게시물 JSON 파싱 실패:', jsonError)
      const text = await response.text()
      console.error('❌ 응답 텍스트:', text.substring(0, 500))
      throw new Error(`Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`)
    }
    
    console.log('🔍 커뮤니티 게시물 API 응답:', apiResponse)
    
    // appGubun === "GLOBAL"인 데이터만 필터링
    const globalData = apiResponse.data.filter(item => item.appGubun === 'GLOBAL')
    console.log('🔍 GLOBAL 데이터 필터링 결과:', globalData.length, '개')
    
    // period !== "TOTAL"인 추이 데이터만 필터링
    const trendData = apiResponse.data.filter(item => item.period !== 'TOTAL')
    console.log('🔍 추이 데이터 필터링 결과:', trendData.length, '개')
    console.log('🔍 추이 데이터 샘플:', trendData.slice(0, 3))
    
    // 날짜별로 그룹화하고 statusKey별로 합산
    const dateMap = new Map<string, {
      dateObj: Date
      trade: number
      tips: number
      review: number
      qa: number
      total: number
    }>()

    trendData.forEach(item => {
      const dateStr = item.period
      const dateObj = new Date(dateStr)
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { dateObj, trade: 0, tips: 0, review: 0, qa: 0, total: 0 })
      }
      
      const dateData = dateMap.get(dateStr)!
      const posts = item.posts || 0
      
      // statusKey에 따라 분류
      if (item.statusKey === 'trade') {
        dateData.trade += posts
      } else if (item.statusKey === 'comm_info') {
        dateData.tips += posts
      } else if (item.statusKey === 'comm_review') {
        dateData.review += posts
      } else if (item.statusKey === 'comm_debate') {
        dateData.qa += posts
      } else {
        // statusKey가 없거나 다른 값인 경우 전체에 합산
        console.log('⚠️ 알 수 없는 statusKey:', item.statusKey, 'period:', item.period)
      }
      
      // 전체 게시물 수 합산
      dateData.total += posts
    })
    
    console.log('🔍 날짜별 그룹화 결과:', dateMap.size, '개 날짜')

    // 날짜순으로 정렬하여 추이 데이터 생성
    const trends: CommunityPostTrendData[] = Array.from(dateMap.entries())
      .map(([dateStr, data]) => ({
        dateStr,
        dateObj: data.dateObj,
        values: {
          trade: data.trade,
          tips: data.tips,
          review: data.review,
          qa: data.qa,
          total: data.total
        }
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map(({ dateStr, values }) => {
        // type에 따라 날짜 포맷 변경
        let formattedDate = formatDateForDisplay(dateStr, type)
        return {
          date: formattedDate,
          trade: values.trade || 0,
          tips: values.tips || 0,
          review: values.review || 0,
          qa: values.qa || 0,
          communityPosts: values.total || 0
        }
      })

    console.log('✅ 변환된 추이 데이터:', trends.length, '개')
    console.log('✅ 추이 데이터 샘플:', trends.slice(0, 3))
    return trends
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('API 요청 타임아웃:', error)
      throw new Error('API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
    }
    console.error('Error fetching community post trend data:', error)
    throw error
  }
}

/**
 * 커뮤니티 게시물 요약 데이터를 가져오는 API 함수
 * 
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
 * @returns 커뮤니티 게시물 요약 데이터
 */
export async function fetchCommunityPostSummary(
  startDate: string,
  endDate: string
): Promise<CommunityPostSummary> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
    
    const response = await fetch(
      `${API_ANALYTICS_URL}/community-post/trend?type=monthly&start_date=${startDate}&end_date=${endDate}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse: CommunityPostApiResponse = await response.json()
    
    // appGubun === "GLOBAL"이고 period === "TOTAL"인 데이터 찾기
    const summaryData = apiResponse.data.find(
      item => item.appGubun === 'GLOBAL' && item.period === 'TOTAL'
    )
    
    if (!summaryData) {
      throw new Error('Summary data (TOTAL) not found in API response')
    }

    return {
      posts: summaryData.posts || 0,
      growthRate: summaryData.growthRate || 0,
      tradeRatio: parsePercentage(summaryData.tradeRatio),
      commInfoRatio: parsePercentage(summaryData.commInfoRatio),
      commReviewRatio: parsePercentage(summaryData.commReviewRatio),
      commDebateRatio: parsePercentage(summaryData.commDebateRatio)
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('API 요청 타임아웃:', error)
      throw new Error('API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
    }
    console.error('Error fetching community post summary data:', error)
    throw error
  }
}

// === 채팅방 데이터 타입 정의 ===

// 실제 API 응답 데이터 타입
export interface ChatRoomRawData {
  chatRoomType: string              // "GLOBAL", "chat_room", "trade_chat_room"
  period: string                    // 날짜 (YYYY-MM-DD) 또는 "TOTAL"
  roomCount: number                 // 채팅방 수
  growthRate: number | null         // 증감률 (%)
  tradeChatRatio: string | number | null      // 인증거래 채팅 점유율 (%)
  chatRatio: string | number | null            // 1:1 채팅 점유율 (%)
  statusKey?: string                // "TOTAL" 또는 기타
}

export interface ChatRoomApiResponse {
  data: ChatRoomRawData[]
}

export interface ChatRoomSummary {
  roomCount: number                 // 채팅방 수
  growthRate: number                // 증감률 (%)
  tradeChatRatio: number            // 인증거래 채팅 점유율 (%)
  chatRatio: number                 // 1:1 채팅 점유율 (%)
}

export interface ChatRoomTrendData {
  date: string
  roomCount: number                 // 전체 채팅방 수 (전체 보기용)
  oneOnOne: number                  // 1:1 채팅 (chat_room)
  tradingChat: number               // 인증거래 채팅 (trade_chat_room)
}

/**
 * 채팅방 요약 데이터를 가져오는 API 함수
 * 
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
 * @returns 채팅방 요약 데이터
 */
export async function fetchChatRoomSummary(
  startDate: string,
  endDate: string
): Promise<ChatRoomSummary> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
    
    const response = await fetch(
      `${API_ANALYTICS_URL}/chat-room/trend?type=monthly&start_date=${startDate}&end_date=${endDate}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 채팅방 API 응답 에러:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    let apiResponse: ChatRoomApiResponse
    try {
      apiResponse = await response.json()
    } catch (jsonError) {
      console.error('❌ 채팅방 JSON 파싱 실패:', jsonError)
      const text = await response.text()
      console.error('❌ 응답 텍스트:', text.substring(0, 500))
      throw new Error(`Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`)
    }
    
    console.log('🔍 채팅방 API 응답:', apiResponse)
    
    // chatRoomType === "GLOBAL"인 데이터 찾기
    const globalData = apiResponse.data.find(
      item => item.chatRoomType === 'GLOBAL'
    )
    
    if (!globalData) {
      throw new Error('GLOBAL chat room data not found in API response')
    }

    return {
      roomCount: globalData.roomCount || 0,
      growthRate: globalData.growthRate || 0,
      tradeChatRatio: parsePercentage(globalData.tradeChatRatio),
      chatRatio: parsePercentage(globalData.chatRatio)
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('API 요청 타임아웃:', error)
      throw new Error('API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
    }
    console.error('Error fetching chat room summary data:', error)
    throw error
  }
}

/**
 * 채팅방 추이 데이터를 가져오는 API 함수
 * 
 * @param type 데이터 타입 (daily, weekly, monthly)
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
 * @returns 채팅방 추이 데이터
 */
export async function fetchChatRoomTrend(
  type: 'daily' | 'weekly' | 'monthly',
  startDate: string,
  endDate: string
): Promise<ChatRoomTrendData[]> {
  try {
    const timestamp = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
    
    const response = await fetch(
      `${API_ANALYTICS_URL}/chat-room/trend?type=${type}&start_date=${startDate}&end_date=${endDate}&_t=${timestamp}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 채팅방 추이 API 응답 에러:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    let apiResponse: ChatRoomApiResponse
    try {
      apiResponse = await response.json()
    } catch (jsonError) {
      console.error('❌ 채팅방 추이 JSON 파싱 실패:', jsonError)
      const text = await response.text()
      console.error('❌ 응답 텍스트:', text.substring(0, 500))
      throw new Error(`Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`)
    }
    
    console.log('🔍 채팅방 추이 API 응답:', apiResponse)
    
    // 전체 추이: statusKey === "TOTAL"이고 period !== "TOTAL"인 데이터
    const totalTrendData = apiResponse.data.filter(
      item => item.statusKey === 'TOTAL' && item.period !== 'TOTAL'
    )
    
    // 채팅 타입별 추이: chatRoomType별로 필터링
    const chatRoomData = apiResponse.data.filter(
      item => item.chatRoomType === 'chat_room' && item.period !== 'TOTAL'
    )
    const tradeChatRoomData = apiResponse.data.filter(
      item => item.chatRoomType === 'trade_chat_room' && item.period !== 'TOTAL'
    )
    
    console.log('🔍 전체 추이 데이터:', totalTrendData.length, '개')
    console.log('🔍 1:1 채팅 데이터:', chatRoomData.length, '개')
    console.log('🔍 인증거래 채팅 데이터:', tradeChatRoomData.length, '개')
    
    // 날짜별로 그룹화
    const dateMap = new Map<string, {
      dateObj: Date
      roomCount: number
      oneOnOne: number
      tradingChat: number
    }>()

    // 전체 추이 데이터 추가
    totalTrendData.forEach(item => {
      const dateStr = item.period
      const dateObj = new Date(dateStr)
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { dateObj, roomCount: 0, oneOnOne: 0, tradingChat: 0 })
      }
      
      const dateData = dateMap.get(dateStr)!
      dateData.roomCount = item.roomCount || 0
    })

    // 1:1 채팅 데이터 추가
    chatRoomData.forEach(item => {
      const dateStr = item.period
      const dateObj = new Date(dateStr)
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { dateObj, roomCount: 0, oneOnOne: 0, tradingChat: 0 })
      }
      
      const dateData = dateMap.get(dateStr)!
      dateData.oneOnOne = item.roomCount || 0
    })

    // 인증거래 채팅 데이터 추가
    tradeChatRoomData.forEach(item => {
      const dateStr = item.period
      const dateObj = new Date(dateStr)
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { dateObj, roomCount: 0, oneOnOne: 0, tradingChat: 0 })
      }
      
      const dateData = dateMap.get(dateStr)!
      dateData.tradingChat = item.roomCount || 0
    })
    
    console.log('🔍 날짜별 그룹화 결과:', dateMap.size, '개 날짜')

    // 날짜순으로 정렬하여 추이 데이터 생성
    const sortedData = Array.from(dateMap.entries())
      .map(([dateStr, data]) => ({
        dateStr,
        dateObj: data.dateObj,
        values: {
          roomCount: data.roomCount,
          oneOnOne: data.oneOnOne,
          tradingChat: data.tradingChat
        }
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    
    const trends: ChatRoomTrendData[] = sortedData.map(({ dateStr, values }, index) => {
        // type에 따라 날짜 포맷 변경 (이전 날짜 전달하여 월 변경 감지)
        const previousDate = index > 0 ? sortedData[index - 1].dateObj : undefined
        let formattedDate = formatDateForDisplay(dateStr, type, previousDate)
        return {
          date: formattedDate,
          roomCount: values.roomCount || 0,
          oneOnOne: values.oneOnOne || 0,
          tradingChat: values.tradingChat || 0
        }
      })

    console.log('✅ 변환된 채팅방 추이 데이터:', trends.length, '개')
    console.log('✅ 추이 데이터 샘플:', trends.slice(0, 3))
    return trends
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('API 요청 타임아웃:', error)
      throw new Error('API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
    }
    console.error('Error fetching chat room trend data:', error)
    throw error
  }
}

// === 제보하기 데이터 타입 정의 ===

// 실제 API 응답 데이터 타입
export interface ReportRawData {
  rowType?: string                   // "summary", "trend" 등
  country: string                    // "GLOBAL", "TOTAL", 국가 코드
  period: string                     // 날짜 (YYYY-MM-DD), "TOTAL", "COUNTRY_TOTAL"
  reportCount?: number               // 제보 건수
  growthRate?: number | null         // 증감률 (%)
  htReportCount?: number            // HT 제보 건수
  copReportCount?: number            // COP 제보 건수
  globalReportCount?: number         // Global 제보 건수
  wechatReportCount?: number         // Wechat 제보 건수
  htRatio?: string | number | null   // HT 점유율 (%)
  copRatio?: string | number | null  // COP 점유율 (%)
  globalRatio?: string | number | null // Global 점유율 (%)
  countryRatio?: string | number | null // 국가별 점유율 (%)
  countryName?: string               // 국가명
}

export interface ReportApiResponse {
  data: ReportRawData[]
}

export interface ReportSummary {
  reportCount: number                // 제보 건수
  growthRate: number                 // 증감률 (%)
  htRatio: number                    // HT 점유율 (%)
  copRatio: number                   // COP 점유율 (%)
  globalRatio: number                // Global 점유율 (%)
}

export interface ReportTrendData {
  date: string
  HT: number
  COP: number
  Global: number
  Wechat: number
  HT_Predicted?: number | null
  COP_Predicted?: number | null
  Global_Predicted?: number | null
  Wechat_Predicted?: number | null
}

export interface CountryShareData {
  name: string
  value: number
  percentage: number
}

/**
 * 제보하기 요약 데이터를 가져오는 API 함수
 * 
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
 * @returns 제보하기 요약 데이터
 */
export async function fetchReportSummary(
  startDate: string,
  endDate: string,
  filterCountry?: string | null
): Promise<ReportSummary> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
    
    // filter_country 파라미터 추가
    let url = `${API_REPORT_URL}/analytics/summary?type=daily&start_date=${startDate}&end_date=${endDate}`
    if (filterCountry) {
      const encodedCountry = encodeURIComponent(filterCountry)
      url += `&filter_country=${encodedCountry}`
    }
    
    const response = await fetch(
      url,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 제보하기 요약 API 응답 에러:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    let apiResponse: ReportApiResponse
    try {
      apiResponse = await response.json()
    } catch (jsonError) {
      console.error('❌ 제보하기 요약 JSON 파싱 실패:', jsonError)
      const text = await response.text()
      console.error('❌ 응답 텍스트:', text.substring(0, 500))
      throw new Error(`Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`)
    }
    
    console.log('🔍 제보하기 요약 API 응답:', apiResponse)
    
    // rowType이 "summary"인 데이터 찾기
    const summaryData = apiResponse.data.find(
      item => item.rowType === 'summary'
    )
    
    if (!summaryData) {
      // 데이터가 없으면 기본값 반환
      console.warn(`⚠️ rowType "summary" report data not found in API response`)
      return {
        reportCount: 0,
        growthRate: 0,
        htRatio: 0,
        copRatio: 0,
        globalRatio: 0
      }
    }

    console.log('✅ Summary 데이터 찾음:', summaryData)

    return {
      reportCount: summaryData.reportCount || 0,
      growthRate: summaryData.growthRate || 0,
      htRatio: parsePercentage(summaryData.htRatio ?? null),
      copRatio: parsePercentage(summaryData.copRatio ?? null),
      globalRatio: parsePercentage(summaryData.globalRatio ?? null)
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('API 요청 타임아웃:', error)
      throw new Error('API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
    }
    console.error('Error fetching report summary data:', error)
    throw error
  }
}


/**
 * 제보하기 추이 데이터를 가져오는 API 함수
 * 
 * @param type 데이터 타입 (daily, weekly, monthly)
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
 * @param filterCountry 국가 필터 (null이면 전체, 값이 있으면 특정 국가)
 * @returns 제보하기 추이 데이터
 */
export async function fetchReportTrend(
  type: 'daily' | 'weekly' | 'monthly',
  startDate: string,
  endDate: string,
  filterCountry?: string | null
): Promise<ReportTrendData[]> {
  try {
    const timestamp = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
    
    // filter_country 파라미터 추가
    let url = `${API_REPORT_URL}/analytics/summary?type=${type}&start_date=${startDate}&end_date=${endDate}&_t=${timestamp}`
    if (filterCountry) {
      const encodedCountry = encodeURIComponent(filterCountry)
      url += `&filter_country=${encodedCountry}`
    }
    
    const response = await fetch(
      url,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 제보하기 추이 API 응답 에러:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    let apiResponse: ReportApiResponse
    try {
      apiResponse = await response.json()
    } catch (jsonError) {
      console.error('❌ 제보하기 추이 JSON 파싱 실패:', jsonError)
      const text = await response.text()
      console.error('❌ 응답 텍스트:', text.substring(0, 500))
      throw new Error(`Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`)
    }
    
    console.log('🔍 제보하기 추이 API 응답:', apiResponse)
    
    // period가 "TOTAL"이 아닌 데이터만 필터링
    const trendData = apiResponse.data.filter(
      item => item.period !== 'TOTAL' && item.period !== 'COUNTRY_TOTAL'
    )
    
    console.log('🔍 추이 데이터 필터링 결과:', trendData.length, '개')
    
    // 날짜별로 그룹화하고 앱별로 합산
    const dateMap = new Map<string, {
      dateObj: Date
      HT: number
      COP: number
      Global: number
      Wechat: number
    }>()

    trendData.forEach(item => {
      const dateStr = item.period
      const dateObj = new Date(dateStr)
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { dateObj, HT: 0, COP: 0, Global: 0, Wechat: 0 })
      }
      
      const dateData = dateMap.get(dateStr)!
      dateData.HT += item.htReportCount || 0
      dateData.COP += item.copReportCount || 0
      dateData.Global += item.globalReportCount || 0
      dateData.Wechat += item.wechatReportCount || 0
    })
    
    console.log('🔍 날짜별 그룹화 결과:', dateMap.size, '개 날짜')

    // 날짜순으로 정렬하여 추이 데이터 생성
    const sortedData = Array.from(dateMap.entries())
      .map(([dateStr, data]) => ({
        dateStr,
        dateObj: data.dateObj,
        values: {
          HT: data.HT,
          COP: data.COP,
          Global: data.Global,
          Wechat: data.Wechat
        }
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    
    const trends: ReportTrendData[] = sortedData.map(({ dateStr, values }, index) => {
        // type에 따라 날짜 포맷 변경 (이전 날짜 전달하여 월 변경 감지)
        const previousDate = index > 0 ? sortedData[index - 1].dateObj : undefined
        let formattedDate = formatDateForDisplay(dateStr, type, previousDate)
        return {
          date: formattedDate,
          HT: values.HT || 0,
          COP: values.COP || 0,
          Global: values.Global || 0,
          Wechat: values.Wechat || 0,
          HT_Predicted: null,
          COP_Predicted: null,
          Global_Predicted: null,
          Wechat_Predicted: null
        }
      })

    console.log('✅ 변환된 제보하기 추이 데이터:', trends.length, '개')
    console.log('✅ 추이 데이터 샘플:', trends.slice(0, 3))
    return trends
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('API 요청 타임아웃:', error)
      throw new Error('API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
    }
    console.error('Error fetching report trend data:', error)
    throw error
  }
}

/**
 * 국가별 제보 분포도 데이터를 가져오는 API 함수
 * 
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
 * @returns 국가별 제보 분포도 데이터 (regCountry별 count)
 */
export interface CountryDistributionData {
  regCountry: string
  count: number
}

// 제보하기 리스트 데이터 타입
export interface ReportListItem {
  idx: number
  country: string
  appType: number
  regGubun: number
  member: string
  labelImg: string | null
  itemImg: string | null
  reportTime: Date
}

export interface ReportListResponse {
  data: ReportListItem[]
  total: number
}

// 비정상 스캔 리스트 데이터 타입
export interface InvalidScanListItem {
  imageUrl: string | null
  country: string
  appType: number
  detectionType: string
  detDate: string
  detTime: string
}

export interface InvalidScanListResponse {
  data: InvalidScanListItem[]
  total?: number
}

export async function fetchCountryDistribution(
  startDate: string,
  endDate: string
): Promise<CountryDistributionData[]> {
  try {
    const timestamp = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
    
    const response = await fetch(
      `${API_REPORT_URL}/analytics/country-distribution?start_date=${startDate}&end_date=${endDate}&_t=${timestamp}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 국가별 제보 분포도 API 응답 에러:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    let apiResponse: { data: CountryDistributionData[] }
    try {
      apiResponse = await response.json()
    } catch (jsonError) {
      console.error('❌ 국가별 제보 분포도 JSON 파싱 실패:', jsonError)
      const text = await response.text()
      console.error('❌ 응답 텍스트:', text.substring(0, 500))
      throw new Error(`Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`)
    }
    
    console.log('🔍 국가별 제보 분포도 API 응답:', apiResponse)
    
    const distributionData: CountryDistributionData[] = apiResponse.data.map(item => ({
      regCountry: item.regCountry || '',
      count: item.count || 0
    }))

    console.log('✅ 변환된 국가별 제보 분포도 데이터:', distributionData.length, '개')
    return distributionData
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('API 요청 타임아웃:', error)
      throw new Error('API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
    }
    console.error('Error fetching country distribution data:', error)
    throw error
  }
}

// 제보하기 리스트 가져오기
export async function fetchReportList(
  startDate: string,
  endDate: string,
  filterCountry: string | null = null,
  filterAppType: number | null = null,
  pageSize: number = 5,
  offset: number = 0
): Promise<ReportListResponse> {
  try {
    const timestamp = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
    
    let url = `${API_REPORT_URL}/analytics/list?start_date=${startDate}&end_date=${endDate}&pageSize=${pageSize}&offset=${offset}&_t=${timestamp}`
    if (filterCountry) {
      const encodedCountry = encodeURIComponent(filterCountry)
      url += `&filter_country=${encodedCountry}`
    }
    if (filterAppType !== null) {
      url += `&filter_app_type=${filterAppType}`
    }
    
    console.log('📡 제보하기 리스트 API 호출:', url)
    console.log(`📊 파라미터 상세: pageSize=${pageSize}, offset=${offset}, filterCountry=${filterCountry || 'null'}, filterAppType=${filterAppType || 'null'}`)
    
    const response = await fetch(
      url,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 제보하기 리스트 API 응답 에러:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    let apiResponse: { data: ReportListItem[], total?: number }
    try {
      apiResponse = await response.json()
    } catch (jsonError) {
      console.error('❌ 제보하기 리스트 JSON 파싱 실패:', jsonError)
      const text = await response.text()
      console.error('❌ 응답 텍스트:', text.substring(0, 500))
      throw new Error(`Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`)
    }
    
    console.log('✅ 제보하기 리스트 API 응답:', apiResponse.data.length, '개 항목, 총', apiResponse.total, '개')
    
        return {
          data: apiResponse.data.map(item => ({
            idx: item.idx || 0,
            country: item.country || '',
            appType: typeof item.appType === 'number' ? item.appType : (item.appType || 0),
            regGubun: item.regGubun || 0,
            member: item.member || '',
            labelImg: item.labelImg || null,
            itemImg: item.itemImg || null,
            reportTime: item.reportTime ? new Date(item.reportTime) : new Date(),
          }) as ReportListItem),
          total: apiResponse.total || 0
        }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('API 요청 타임아웃:', error)
      throw new Error('API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
    }
    console.error('Error fetching report list data:', error)
    throw error
  }
}

// 비정상 스캔 리스트 가져오기
export async function fetchInvalidScanList(
  startDate: string,
  endDate: string,
  filterCountry: string | null = null,
  filterAppType: number | null = null,
  pageSize: number = 20,
  offset: number = 0
): Promise<InvalidScanListResponse> {
  try {
    const timestamp = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
    
    let url = `${API_REPORT_URL}/invalid-scan/list?start_date=${startDate}&end_date=${endDate}&pageSize=${pageSize}&offset=${offset}&_t=${timestamp}`
    if (filterCountry) {
      const encodedCountry = encodeURIComponent(filterCountry)
      url += `&filter_country=${encodedCountry}`
    }
    if (filterAppType !== null) {
      url += `&filter_app_type=${filterAppType}`
    }
    
    console.log('📡 비정상 스캔 리스트 API 호출:', url)
    console.log(`📊 파라미터 상세: pageSize=${pageSize}, offset=${offset}, filterCountry=${filterCountry || 'null'}, filterAppType=${filterAppType || 'null'}`)
    
    const response = await fetch(
      url,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 비정상 스캔 리스트 API 응답 에러:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    let apiResponse: { data: InvalidScanListItem[], total?: number }
    try {
      apiResponse = await response.json()
    } catch (jsonError) {
      console.error('❌ 비정상 스캔 리스트 JSON 파싱 실패:', jsonError)
      const text = await response.text()
      console.error('❌ 응답 텍스트:', text.substring(0, 500))
      throw new Error(`Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`)
    }
    
    console.log('✅ 비정상 스캔 리스트 API 응답:', apiResponse.data.length, '개 항목')
    
    return {
      data: apiResponse.data.map(item => ({
        imageUrl: item.imageUrl || null,
        country: item.country || '',
        appType: typeof item.appType === 'number' ? item.appType : (item.appType || 0),
        detectionType: item.detectionType || '',
        detDate: item.detDate || '',
        detTime: item.detTime || '',
      }) as InvalidScanListItem),
      total: apiResponse.total || 0
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('API 요청 타임아웃:', error)
      throw new Error('API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
    }
    console.error('Error fetching invalid scan list data:', error)
    throw error
  }
}
