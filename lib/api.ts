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
      `/api/user/userJoinPath?type=${type}&start_date=${startDate}&end_date=${endDate}&_t=${timestamp}`,
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
