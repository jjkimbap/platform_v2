export interface InvalidScanItem {
  id: number
  imageUrl?: string
  country: string
  appType: string
  detectionType: "중간이탈" | "시간경과"
  reporter: string
  date?: Date
}

// 비정상 스캔 데이터를 한 곳에서 관리
export const sampleInvalidScans: InvalidScanItem[] = [
  { id: 1234123412341, country: "한국", appType: "HT", detectionType: "중간이탈", reporter: "김철수", date: new Date(2024, 5, 1) },
  { id: 234524523452, country: "일본", appType: "COP", detectionType: "시간경과", reporter: "이영희", date: new Date(2024, 5, 2) },
  { id: 323452345234, country: "미국", appType: "Global", detectionType: "중간이탈", reporter: "박민수", date: new Date(2024, 5, 3) },
  { id: 44534534534534, country: "중국", appType: "HT", detectionType: "시간경과", reporter: "최지영", date: new Date(2024, 5, 4) },
  { id: 534534534534534, country: "베트남", appType: "COP", detectionType: "중간이탈", reporter: "정수현", date: new Date(2024, 5, 5) },
  { id: 63434534534534, country: "한국", appType: "Global", detectionType: "시간경과", reporter: "강민호", date: new Date(2024, 5, 6) },
  { id: 75545345345345, country: "일본", appType: "HT", detectionType: "중간이탈", reporter: "윤서연", date: new Date(2024, 5, 7) },
  { id: 8678657878678, country: "미국", appType: "COP", detectionType: "시간경과", reporter: "임동현", date: new Date(2024, 4, 28) },
  { id: 9567856785, country: "중국", appType: "HT", detectionType: "중간이탈", reporter: "조은지", date: new Date(2024, 4, 27) },
  { id: 78678567810, country: "베트남", appType: "Global", detectionType: "시간경과", reporter: "송준호", date: new Date(2024, 4, 26) },
  { id: 116786785678, country: "한국", appType: "COP", detectionType: "중간이탈", reporter: "한지우", date: new Date(2024, 4, 25) },
  { id: 1787878782, country: "일본", appType: "HT", detectionType: "시간경과", reporter: "백승현", date: new Date(2024, 4, 24) },
  { id: 1345245783, country: "한국", appType: "HT", detectionType: "중간이탈", reporter: "김민수", date: new Date(2024, 4, 23) },
  { id: 178967896784, country: "중국", appType: "COP", detectionType: "시간경과", reporter: "이영희", date: new Date(2024, 4, 22) },
  { id: 1523457890, country: "미국", appType: "Global", detectionType: "중간이탈", reporter: "박민수", date: new Date(2024, 4, 21) },
  { id: 1234576896, country: "베트남", appType: "HT", detectionType: "시간경과", reporter: "정수현", date: new Date(2024, 3, 15) },
  { id: 123456787, country: "일본", appType: "COP", detectionType: "중간이탈", reporter: "윤서연", date: new Date(2024, 3, 20) },
  { id: 14213452368, country: "한국", appType: "Global", detectionType: "시간경과", reporter: "강민호", date: new Date(2024, 3, 25) },
]

