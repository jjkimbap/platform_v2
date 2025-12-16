import { NewMemberComprehensiveResponse, API_ANALYTICS_URL, NewMemberApiResponse, transformNewMemberData } from "./api";

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
  console.log('🌐 fetchNewMemberComprehensive 함수 호출됨');
  console.log('🌐 파라미터:', { type, startDate, endDate });

  try {
    // 기존 API 엔드포인트 사용 (comprehensive 엔드포인트가 없으므로)
    const url = `${API_ANALYTICS_URL}/new-user/trend?type=${type}&start_date=${startDate}&end_date=${endDate}`;
    console.log('🌐 API URL:', url);

    console.log('🌐 fetch 요청 시작');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    console.log('🌐 fetch 응답 받음:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 응답 에러:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    console.log('🌐 JSON 파싱 시작');
    let apiResponse: NewMemberApiResponse;
    try {
      apiResponse = await response.json();
    } catch (jsonError) {
      console.error('❌ JSON 파싱 실패:', jsonError);
      const text = await response.text();
      console.error('❌ 응답 텍스트:', text.substring(0, 500));
      throw new Error(`Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
    }

    console.log('🌐 JSON 파싱 완료, 데이터 개수:', apiResponse.data?.length || 0);

    if (!apiResponse || !apiResponse.data) {
      throw new Error('API response is missing data field');
    }

    // 실제 API 응답을 변환
    console.log('🌐 transformNewMemberData 호출 시작');
    try {
      const result = transformNewMemberData(apiResponse);
      console.log('🌐 transformNewMemberData 완료');
      return result;
    } catch (transformError) {
      console.error('❌ transformNewMemberData 에러:', transformError);
      throw transformError;
    }
  } catch (error) {
    console.error('❌ fetchNewMemberComprehensive 에러 발생');
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('❌ 네트워크 에러:', error);
      throw new Error('네트워크 연결에 실패했습니다. API 서버가 실행 중인지 확인해주세요.');
    }
    console.error('❌ Error fetching new member comprehensive data:', error);
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      // 에러 메시지를 그대로 전달
      throw error;
    }
    throw new Error(`Unknown error: ${String(error)}`);
  }
}
