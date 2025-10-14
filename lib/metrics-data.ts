// 커뮤니티 지표 데이터
export const communityMetricsData = [
  {
    id: "CM-001",
    title: "커뮤니티 활성도",
    value: "85.2%",
    target: "90%",
    achievement: 94.7,
    iconName: "Activity",
    description: "일일 활성 사용자 수 / 전체 가입 사용자 수 × 100%",
    trendData: [
      { value: 78.5 },
      { value: 80.2 },
      { value: 82.1 },
      { value: 83.8 },
      { value: 84.5 },
      { value: 85.0 },
      { value: 85.2 },
    ],
    trendColor: "#10b981",
    source: "community"
  },
  {
    id: "CM-002",
    title: "게시물 작성률",
    value: "12.8%",
    target: "15%",
    achievement: 85.3,
    iconName: "MessageSquare",
    description: "게시물 작성 사용자 수 / 전체 활성 사용자 수 × 100%",
    trendData: [
      { value: 10.5 },
      { value: 11.2 },
      { value: 11.8 },
      { value: 12.1 },
      { value: 12.3 },
      { value: 12.6 },
      { value: 12.8 },
    ],
    trendColor: "#3b82f6",
    source: "community"
  }
]

// 사용자 성장 지표 데이터
export const userGrowthMetricsData = [
  {
    id: "UG-001",
    title: "신규 유입수",
    value: "2,582명",
    target: "3,000명",
    achievement: 86.1,
    iconName: "Users",
    description: "앱 유입 + 커머스 유입 총합",
    textData: [
      { label: "앱 유입", value: "2,575명", color: "#3b82f6" },
      { label: "커머스 유입", value: "7명", color: "#f59e0b" },
    ],
    trendData: [
      { value: 600 },
      { value: 400 },
      { value: 199 },
      { value: 50 },
      { value: 20 },
      { value: 300 },
      { value: 10 },
    ],
    trendColor: "#f59e0b",
    source: "user-growth"
  },
  {
    id: "UG-002",
    title: "커뮤니티 참여율",
    value: "5.0%",
    target: "8%",
    achievement: 62.5,
    iconName: "UserCheck",
    description: "커뮤니티 참여 신규회원 / 전체 신규회원 × 100%",
    textData: [
      { label: "게시물 작성 유저", value: "129명", color: "#10b981" },
      { label: "미참여 유저", value: "2,446명", color: "#ef4444" },
    ],
    source: "user-growth"
  },
  {
    id: "UG-003",
    title: "스캔 기기 가입 전환율",
    value: "24.8%",
    target: "30%",
    achievement: 82.7,
    iconName: "Target",
    description: "스캔 후 가입한 사용자 비율",
    trendData: [
      { value: 18.5 },
      { value: 20.2 },
      { value: 19.8 },
      { value: 22.1 },
      { value: 21.5 },
      { value: 23.8 },
      { value: 24.8 },
    ],
    trendColor: "#3b82f6",
    source: "user-growth"
  },
  {
    id: "UG-004",
    title: "커뮤니티 신규 게시물",
    value: "143개",
    target: "200개",
    achievement: 71.5,
    iconName: "MessageSquare",
    description: "커뮤니티별 신규 게시물 작성 수",
    textData: [
      { label: "Q&A", value: "45개", color: "#3b82f6" },
      { label: "제품리뷰", value: "38개", color: "#10b981" },
      { label: "판별팁", value: "32개", color: "#f59e0b" },
      { label: "인증거래", value: "28개", color: "#8b5cf6" },
    ],
    trendData: [
      { name: "Q&A", value: 45, color: "#3b82f6" },
      { name: "제품리뷰", value: 38, color: "#10b981" },
      { name: "판별팁", value: 32, color: "#f59e0b" },
      { name: "인증거래", value: 28, color: "#8b5cf6" },
    ],
    trendColor: "#10b981",
    source: "user-growth"
  },
  {
    id: "UG-005",
    title: "신규 채팅방",
    value: "156개",
    target: "200개",
    achievement: 78.0,
    iconName: "MessageCircle",
    description: "신규 채팅방 생성 수",
    textData: [
      { label: "1:1 채팅방", value: "89개", color: "#3b82f6" },
      { label: "인증거래", value: "67개", color: "#10b981" },
    ],
    trendData: [
      { value: 28.5 },
      { value: 30.2 },
      { value: 29.8 },
      { value: 31.5 },
      { value: 30.9 },
      { value: 32.1 },
      { value: 32.5 },
    ],
    trendColor: "#f59e0b",
    source: "user-growth"
  }
]

// 핵심 활성도 지표 데이터
export const activityMetricsData = [
  {
    id: "AM-001",
    title: "실행 DAU",
    value: "2,827",
    target: "3,500",
    achievement: 80.8,
    iconName: "Users",
    description: "일일 활성 사용자 수",
    trendData: [
      { value: 12000 },
      { value: 4000 },
      { value: 12200 },
      { value: 1000 },
      { value: 13200 },
      { value: 4000 },
      { value: 15800 },
    ],
    trendColor: "#3b82f6",
    source: "activity"
  },
  {
    id: "AM-002",
    title: "스캔 DAU",
    value: "1,172",
    target: "2,000",
    achievement: 58.6,
    iconName: "Scan",
    description: "스캔 기능 사용 일일 활성 사용자 수",
    trendData: [
      { value: 9500 },
      { value: 10200 },
      { value: 2000 },
      { value: 10800 },
      { value: 10500 },
      { value: 1500 },
      { value: 12340 },
    ],
    trendColor: "#10b981",
    source: "activity"
  },
  {
    id: "AM-003",
    title: "실행대비 스캔 전환율",
    value: "62%",
    target: "65%",
    achievement: 95.4,
    iconName: "Target",
    description: "실행 사용자 대비 스캔 사용자 비율",
    textData: [
      { label: "🇰🇷 한국", value: "12,450회", color: "#3b82f6" },
      { label: "🇺🇸 미국", value: "8,720회", color: "#10b981" },
      { label: "🇯🇵 일본", value: "6,380회", color: "#f59e0b" },
    ],
    source: "activity"
  },
  {
    id: "AM-004",
    title: "프리랜딩 답변율",
    value: "63% (747명)",
    target: "80%",
    achievement: 94.1,
    iconName: "MessageSquare",
    description: "프리랜딩 질문에 대한 답변율",
    trendData: [
      { value: 70.2 },
      { value: 72.1 },
      { value: 73.8 },
      { value: 74.5 },
      { value: 75.0 },
      { value: 75.2 },
      { value: 75.3 },
    ],
    trendColor: "#ec4899",
    source: "activity"
  },
  {
    id: "AM-005",
    title: "답변율 저조업체 알림",
    value: "4개",
    target: "2개 이하",
    achievement: 50.0,
    iconName: "AlertTriangle",
    description: "답변율 50% 미만 업체 수",
    textData: [
      { label: "업체 C", value: "28%", color: "#ef4444" },
      { label: "업체 A", value: "35%", color: "#f97316" },
      { label: "업체 B", value: "42%", color: "#eab308" },
    ],
    source: "activity"
  }
]

// 트렌드 분석 지표 데이터
export const trendMetricsData = [
  {
    id: "TR-001",
    title: "인기 게시물 트렌드",
    value: "상승",
    target: "지속 상승",
    achievement: 85.0,
    iconName: "TrendingUp",
    description: "인기 게시물 조회수 증가율",
    trendData: [
      { value: 85 },
      { value: 92 },
      { value: 88 },
      { value: 95 },
      { value: 98 },
      { value: 102 },
      { value: 108 },
    ],
    trendColor: "#f59e0b",
    source: "trend"
  },
  {
    id: "TR-002",
    title: "사용자 랭킹 변화",
    value: "안정",
    target: "상위 유지",
    achievement: 92.0,
    iconName: "BarChart3",
    description: "상위 사용자 활동 지수 변화율",
    trendData: [
      { value: 95 },
      { value: 96 },
      { value: 94 },
      { value: 97 },
      { value: 95 },
      { value: 98 },
      { value: 97 },
    ],
    trendColor: "#8b5cf6",
    source: "trend"
  }
]
