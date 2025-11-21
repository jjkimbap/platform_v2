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
      `http://192.168.0.14:8025/api/user/userJoinPath?type=${type}&start_date=${startDate}&end_date=${endDate}`,
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
function parsePercentage(value: string | null): number {
  if (!value || value === 'null') return 0
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

  const dailyTrends: NewMemberTrendData[] = dailyTrendsWithDate.map(({ dateStr, values }) => ({
    date: formatDateForDisplay(dateStr, 'daily'),
    ht: values.ht > 0 ? values.ht : null,
    cop: values.cop > 0 ? values.cop : null,
    global: values.global > 0 ? values.global : null,
    commerce: values.commerce > 0 ? values.commerce : null,
    etc: values.etc > 0 ? values.etc : null
  }))

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
  const weekly: NewMemberTrendData[] = Array.from(weeklyMap.entries())
    .sort((a, b) => a[1].weekStart.getTime() - b[1].weekStart.getTime())
    .map(([_, data], index) => ({
      date: `${index + 1}주`,
      ht: data.ht > 0 ? data.ht : null,
      cop: data.cop > 0 ? data.cop : null,
      global: data.global > 0 ? data.global : null,
      commerce: data.commerce > 0 ? data.commerce : null,
      etc: data.etc > 0 ? data.etc : null
    }))

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
      `http://192.168.0.14:8025/api/analytics/new-user/trend?type=${type}&start_date=${startDate}&end_date=${endDate}&_t=${timestamp}`,
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
    const trends: NewMemberTrendData[] = Array.from(dateMap.entries())
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
      .map(({ dateStr, values }) => {
        // type에 따라 날짜 포맷 변경
        let formattedDate = formatDateForDisplay(dateStr, type)
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
 */
function formatDateForDisplay(dateStr: string, type: 'daily' | 'weekly' | 'monthly'): string {
  try {
    const date = new Date(dateStr)
    if (type === 'daily') {
      const day = date.getDate()
      return `${day}일`
    } else if (type === 'weekly') {
      // 주차 계산 (월의 첫 주부터)
      const weekNumber = Math.ceil(date.getDate() / 7)
      return `${weekNumber}주`
    } else {
      // monthly
      const month = date.getMonth() + 1
      return `${month}월`
    }
  } catch {
    return dateStr
  }
}

/**
 * 신규 회원 통합 데이터를 가져오는 API 함수
 * 
 * 이 함수는 다음 정보를 한번에 가져옵니다:
 * 1. 신규 회원 수, 증감률 (summary)
 * 2. 가입 경로별 점유율 (email, naver, kakao, facebook, google, apple, line) (distribution)
 * 3. 월별/주별/일별 추이 데이터 (trends)
 * 
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
 * @returns 신규 회원 통합 데이터
 * 
 * @example
 * ```typescript
 * const data = await fetchNewMemberComprehensive('2024-01-01', '2024-11-30')
 * // data.summary.newMembers -> 3086
 * // data.distribution.email -> 27.22
 * // data.distribution.kakao -> 3.08
 * // data.trends.daily -> [{ date: "1일", ht: 49, cop: 57, ... }, ...]
 * ```
 */
export async function fetchNewMemberComprehensive(
  type: 'daily' | 'weekly' | 'monthly',
  startDate: string,
  endDate: string
): Promise<NewMemberComprehensiveResponse> {
  console.log('🌐 fetchNewMemberComprehensive 함수 호출됨')
  console.log('🌐 파라미터:', { type, startDate, endDate })
  
  try {
    // 기존 API 엔드포인트 사용 (comprehensive 엔드포인트가 없으므로)
    const url = `http://192.168.0.14:8025/api/analytics/new-user/trend?type=${type}&start_date=${startDate}&end_date=${endDate}`
    console.log('🌐 API URL:', url)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃
    
    console.log('🌐 fetch 요청 시작')
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    console.log('🌐 fetch 응답 받음:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API 응답 에러:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    console.log('🌐 JSON 파싱 시작')
    let apiResponse: NewMemberApiResponse
    try {
      apiResponse = await response.json()
    } catch (jsonError) {
      console.error('❌ JSON 파싱 실패:', jsonError)
      const text = await response.text()
      console.error('❌ 응답 텍스트:', text.substring(0, 500))
      throw new Error(`Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`)
    }
    
    console.log('🌐 JSON 파싱 완료, 데이터 개수:', apiResponse.data?.length || 0)
    
    if (!apiResponse || !apiResponse.data) {
      throw new Error('API response is missing data field')
    }
    
    // 실제 API 응답을 변환
    console.log('🌐 transformNewMemberData 호출 시작')
    try {
      const result = transformNewMemberData(apiResponse)
      console.log('🌐 transformNewMemberData 완료')
      return result
    } catch (transformError) {
      console.error('❌ transformNewMemberData 에러:', transformError)
      throw transformError
    }
  } catch (error) {
    console.error('❌ fetchNewMemberComprehensive 에러 발생')
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ API 요청 타임아웃:', error)
      throw new Error('API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('❌ 네트워크 에러:', error)
      throw new Error('네트워크 연결에 실패했습니다. API 서버가 실행 중인지 확인해주세요.')
    }
    console.error('❌ Error fetching new member comprehensive data:', error)
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      // 에러 메시지를 그대로 전달
      throw error
    }
    throw new Error(`Unknown error: ${String(error)}`)
  }
}
