export interface ReportItem {
  id: number
  imageUrl?: string
  country: string
  appType: string
  reportType: "검출" | "제보"
  reporter: string
  date?: Date // 날짜 정보 추가
}

// 제보 데이터를 한 곳에서 관리
export const sampleReports: ReportItem[] = [
  { id: 112343452345, country: "한국", appType: "HT", reportType: "검출", reporter: "홍길동", date: new Date(2024, 5, 1) },
  { id: 345234523452, country: "일본", appType: "COP", reportType: "제보", reporter: "이영희", date: new Date(2024, 5, 2) },
  { id: 34523452452, country: "미국", appType: "Global", reportType: "검출", reporter: "박민수", date: new Date(2024, 5, 3) },
  { id: 53453453454, country: "중국", appType: "HT", reportType: "제보", reporter: "최지영", date: new Date(2024, 5, 4) },
  { id: 523452345234, country: "베트남", appType: "COP", reportType: "검출", reporter: "정수현", date: new Date(2024, 5, 5) },
  { id: 3454534534, country: "한국", appType: "Global", reportType: "제보", reporter: "강민호", date: new Date(2024, 5, 6) },
  { id: 734534534, country: "일본", appType: "HT", reportType: "검출", reporter: "윤서연", date: new Date(2024, 5, 7) },
  { id: 834534525342, country: "미국", appType: "COP", reportType: "제보", reporter: "임동현", date: new Date(2024, 4, 28) },
  { id: 1234123413, country: "중국", appType: "HT", reportType: "검출", reporter: "조은지", date: new Date(2024, 4, 27) },
  { id: 103453453453, country: "베트남", appType: "Global", reportType: "제보", reporter: "송준호", date: new Date(2024, 4, 26) },
  { id: 113453453453, country: "한국", appType: "COP", reportType: "검출", reporter: "한지우", date: new Date(2024, 4, 25) },
  { id: 123453453453, country: "일본", appType: "HT", reportType: "제보", reporter: "백승현", date: new Date(2024, 4, 24) },
  { id: 133453453453, country: "한국", appType: "HT", reportType: "제보", reporter: "김철", date: new Date(2024, 4, 23) },
  { id: 143453453453, country: "중국", appType: "COP", reportType: "제보", reporter: "이영희", date: new Date(2024, 4, 22) },
  { id: 153453453453, country: "미국", appType: "Global", reportType: "검출", reporter: "박민수", date: new Date(2024, 4, 21) },
  { id: 12342343246, country: "베트남", appType: "HT", reportType: "제보", reporter: "정수현", date: new Date(2024, 3, 15) },
  { id: 134342342347, country: "일본", appType: "COP", reportType: "제보", reporter: "윤서연", date: new Date(2024, 3, 20) },
  { id: 1545786867898, country: "한국", appType: "Global", reportType: "검출", reporter: "강민호", date: new Date(2024, 3, 25) },
  { id: 18967896899, country: "중국", appType: "HT", reportType: "제보", reporter: "최지영", date: new Date(2024, 2, 10) },
  { id: 2789678967896890, country: "미국", appType: "COP", reportType: "제보", reporter: "임동현", date: new Date(2024, 2, 15) },
  { id: 2789678967897891, country: "베트남", appType: "Global", reportType: "검출", reporter: "송준호", date: new Date(2024, 2, 20) },
  { id: 22898989, country: "일본", appType: "HT", reportType: "제보", reporter: "한지우", date: new Date(2024, 1, 5) },
  { id: 297897897893, country: "한국", appType: "COP", reportType: "제보", reporter: "백승현", date: new Date(2024, 1, 10) },
  { id: 26789678964, country: "중국", appType: "Global", reportType: "검출", reporter: "김철수", date: new Date(2024, 0, 15) },
]

