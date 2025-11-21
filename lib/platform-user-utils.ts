/**
 * Platform 유저 관련 유틸리티 함수
 */

import { UserDetail } from "@/components/platform/common/user-detail-modal"

// Mock 월별 활동 데이터 (실제로는 API에서 가져와야 함)
const monthlyActivityData = [
  { month: "7월", posts: 25, comments: 80, likes: 200, bookmarks: 15, cumulative: 320, predicted: null, postsPredicted: null, commentsPredicted: null, likesPredicted: null, bookmarksPredicted: null },
  { month: "8월", posts: 32, comments: 95, likes: 250, bookmarks: 18, cumulative: 395, predicted: null, postsPredicted: null, commentsPredicted: null, likesPredicted: null, bookmarksPredicted: null },
  { month: "9월", posts: 28, comments: 88, likes: 220, bookmarks: 16, cumulative: 352, predicted: null, postsPredicted: null, commentsPredicted: null, likesPredicted: null, bookmarksPredicted: null },
  { month: "10월", posts: 35, comments: 110, likes: 280, bookmarks: 22, cumulative: 447, predicted: null, postsPredicted: null, commentsPredicted: null, likesPredicted: null, bookmarksPredicted: null },
  { month: "11월", posts: 38, comments: 120, likes: 320, bookmarks: 25, cumulative: 503, predicted: null, postsPredicted: null, commentsPredicted: null, likesPredicted: null, bookmarksPredicted: null },
  { month: "12월", posts: 42, comments: 135, likes: 350, bookmarks: 28, cumulative: 555, predicted: 555, postsPredicted: 42, commentsPredicted: 135, likesPredicted: 350, bookmarksPredicted: 28 },
  { month: "1월", posts: null, comments: null, likes: null, bookmarks: null, cumulative: null, predicted: 580, postsPredicted: 45, commentsPredicted: 150, likesPredicted: 380, bookmarksPredicted: 32 },
  { month: "2월", posts: null, comments: null, likes: null, bookmarks: null, cumulative: null, predicted: 610, postsPredicted: 48, commentsPredicted: 165, likesPredicted: 400, bookmarksPredicted: 35 },
]

/**
 * user_no를 통해 유저 상세 정보를 가져오는 함수
 * 실제로는 API 호출을 해야 하지만, 현재는 mock 데이터를 사용
 */
export const getUserDetailFromUserNo = async (userNo: string): Promise<UserDetail | null> => {
  // TODO: 실제 API 호출로 변경
  // const response = await fetch(`/api/users/${userNo}`)
  // return await response.json()
  
  // Mock 데이터 기반으로 유저 정보 생성
  const mockDetails: Record<string, Partial<UserDetail>> = {
    'u001': { id: 'user001', email: 'hong@example.com', nickname: '홍길동', language: 'ko', gender: '남', signupApp: 'HT', signupPath: '앱스토어', osInfo: 'iOS 17.0', signupDate: '2024-03-15', imageUrl: '/placeholder-user.jpg', posts: 45, comments: 120, likes: 32, bookmarks: 28, chatRooms: 5 },
    'u002': { id: 'user002', email: 'lee@example.com', nickname: '이영희', language: 'ko', gender: '여', signupApp: 'COP', signupPath: '구글 플레이', osInfo: 'Android 14', signupDate: '2024-05-20', imageUrl: '/placeholder-user.jpg', posts: 38, comments: 95, likes: 25, bookmarks: 22, chatRooms: 8 },
    'u003': { id: 'user003', email: 'park@example.com', nickname: '박민수', language: 'ja', gender: '남', signupApp: 'Global', signupPath: '앱스토어', osInfo: 'iOS 16.5', signupDate: '2024-07-10', imageUrl: '/placeholder-user.jpg', posts: 32, comments: 88, likes: 18, bookmarks: 19, chatRooms: 3 },
    'u004': { id: 'user004', email: 'choi@example.com', nickname: '최지영', language: 'en', gender: '여', signupApp: 'HT', signupPath: '직접 다운로드', osInfo: 'Android 13', signupDate: '2024-09-01', imageUrl: '/placeholder-user.jpg', posts: 28, comments: 75, likes: 15, bookmarks: 16, chatRooms: 6 },
    'u005': { id: 'user005', email: 'jung@example.com', nickname: '정수현', language: 'ko', gender: '남', signupApp: 'COP', signupPath: '구글 플레이', osInfo: 'Android 14', signupDate: '2024-11-15', imageUrl: '/placeholder-user.jpg', posts: 25, comments: 65, likes: 12, bookmarks: 14, chatRooms: 4 },
  }
  
  const mockDetail = mockDetails[userNo]
  if (!mockDetail) {
    // 기본값 반환
    return {
      id: userNo,
      email: `${userNo}@example.com`,
      nickname: '알 수 없음',
      language: 'ko',
      gender: '미지정',
      country: '미지정',
      signupApp: 'HT',
      signupPath: '알 수 없음',
      osInfo: '알 수 없음',
      signupDate: new Date().toISOString().split('T')[0],
      posts: 0,
      comments: 0,
      likes: 0,
      bookmarks: 0,
      chatRooms: 0,
    }
  }
  
  return {
    id: mockDetail.id || userNo,
    email: mockDetail.email || '',
    nickname: mockDetail.nickname || '',
    language: mockDetail.language || 'ko',
    gender: mockDetail.gender || '미지정',
    country: mockDetail.country || '미지정',
    imageUrl: mockDetail.imageUrl,
    signupApp: mockDetail.signupApp || 'HT',
    signupPath: mockDetail.signupPath || '',
    osInfo: mockDetail.osInfo || '',
    signupDate: mockDetail.signupDate || '',
    posts: mockDetail.posts || 0,
    comments: mockDetail.comments || 0,
    likes: mockDetail.likes || 0,
    bookmarks: mockDetail.bookmarks || 0,
    chatRooms: mockDetail.chatRooms || 0,
  }
}

/**
 * 유저의 커뮤니티 활동 추이 데이터 생성
 */
export const getCommunityUserTrendData = (user: { posts?: number; comments?: number; likes?: number; bookmarks?: number }): Array<{
  month: string
  posts: number | null
  postsPredicted?: number | null
  comments: number | null
  commentsPredicted?: number | null
  likes: number | null
  likesPredicted?: number | null
  bookmarks?: number | null
  bookmarksPredicted?: number | null
}> => {
  const totalActivity = (user.posts || 0) + (user.comments || 0) + (user.likes || 0) + (user.bookmarks || 0)
  const baseMultiplier = totalActivity > 0 ? totalActivity / 100 : 0.5
  
  return monthlyActivityData.map(item => {
    const cumulativeValue = item.cumulative != null ? Math.round((item.cumulative || 0) * baseMultiplier) : null
    const predictedValue = item.predicted != null ? Math.round((item.predicted || 0) * baseMultiplier) : null
    
    return {
      month: item.month,
      posts: item.posts != null ? Math.round((item.posts || 0) * baseMultiplier) : null,
      comments: item.comments != null ? Math.round((item.comments || 0) * baseMultiplier) : null,
      likes: item.likes != null ? Math.round((item.likes || 0) * baseMultiplier) : null,
      bookmarks: item.bookmarks != null ? Math.round((item.bookmarks || 0) * baseMultiplier) : null,
      postsPredicted: item.postsPredicted != null ? Math.round((item.postsPredicted || 0) * baseMultiplier) : null,
      commentsPredicted: item.commentsPredicted != null ? Math.round((item.commentsPredicted || 0) * baseMultiplier) : null,
      likesPredicted: item.likesPredicted != null ? Math.round((item.likesPredicted || 0) * baseMultiplier) : null,
      bookmarksPredicted: item.bookmarksPredicted != null ? Math.round((item.bookmarksPredicted || 0) * baseMultiplier) : null,
    }
  })
}

