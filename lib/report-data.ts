export interface ReportItem {
  id: number
  imageUrl?: string
  country: string
  appType: number
  reportType: "검출" | "제보" | "기타"
  reporter: string
  reportTime?: Date // 날짜 정보 추가
}

