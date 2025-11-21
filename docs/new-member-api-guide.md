# 신규 회원 통합 API 사용 가이드

## 개요

신규 회원 관련 모든 데이터를 한번에 가져오는 통합 API입니다.

## API 엔드포인트

```
GET /api/platform/newMemberComprehensive?start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}
```

## 응답 JSON 구조

```json
{
  "summary": {
    "newMembers": 2340,        // 현재 신규 회원 수
    "growthRate": 8.7,          // 증감률 (%)
    "totalMembers": 18500       // 총 회원 수
  },
  "distribution": {
    "ht": 42.5,                 // HT 점유율 (%)
    "cop": 35.2,                // COP 점유율 (%)
    "global": 15.8,             // Global 점유율 (%)
    "commerce": 6.5             // 커머스 점유율 (%)
  },
  "trends": {
    "monthly": [...],           // 월별 추이 데이터
    "weekly": [...],            // 주별 추이 데이터
    "daily": [...]              // 일별 추이 데이터
  }
}
```

## 사용 위치

### 1. `platform-comprehensive-metrics.tsx` (신규 회원 카드)

**현재**: 하드코딩된 데이터 사용
```tsx
<div className="text-xl md:text-2xl lg:text-3xl font-bold">2,340</div>
<div className="flex items-center gap-1 text-green-600 text-sm">
  <TrendingUp className="h-3 w-3" />
  <span>+8.7%</span>
</div>
```

**변경 후**: API 데이터 사용
```tsx
const { summary, distribution } = data
<div className="text-xl md:text-2xl lg:text-3xl font-bold">
  {summary.newMembers.toLocaleString()}
</div>
<div className="flex items-center gap-1 text-green-600 text-sm">
  <TrendingUp className="h-3 w-3" />
  <span>+{summary.growthRate}%</span>
</div>
```

### 2. `platform-trend-charts-section.tsx` (추이 차트)

**현재**: 하드코딩된 데이터 사용
```tsx
const monthlyNewMemberData = [
  { date: "1월", app: 850, commerce: 350, ... },
  ...
]
```

**변경 후**: API 데이터 사용
```tsx
const { trends } = data
const monthlyNewMemberData = trends.monthly.map(item => ({
  date: item.date,
  app: (item.ht || 0) + (item.cop || 0) + (item.global || 0),
  commerce: item.commerce || 0,
  appPredicted: (item.htPredicted || 0) + (item.copPredicted || 0) + (item.globalPredicted || 0),
  commercePredicted: item.commercePredicted || 0
}))
```

## 구현 예시

### 컴포넌트에서 사용하기

```tsx
"use client"

import { useState, useEffect } from "react"
import { fetchNewMemberComprehensive, formatDateForAPI } from "@/lib/api"

export function PlatformComprehensiveMetrics() {
  const [newMemberData, setNewMemberData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // 날짜 범위 설정 (예: 최근 1년)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setFullYear(endDate.getFullYear() - 1)

        const data = await fetchNewMemberComprehensive(
          formatDateForAPI(startDate),
          formatDateForAPI(endDate)
        )
        setNewMemberData(data)
      } catch (error) {
        console.error('Failed to load new member data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!newMemberData) return null

  const { summary, distribution } = newMemberData

  return (
    <Card>
      {/* summary 사용 */}
      <div className="text-xl font-bold">{summary.newMembers.toLocaleString()}</div>
      <div>+{summary.growthRate}%</div>
      <div>총 회원: {summary.totalMembers.toLocaleString()}</div>

      {/* distribution 사용 */}
      <BarChart data={[{
        ht: distribution.ht,
        cop: distribution.cop,
        global: distribution.global,
        commerce: distribution.commerce
      }]} />
    </Card>
  )
}
```

## 백엔드 구현 가이드

백엔드에서 이 API를 구현할 때 다음 정보를 포함해야 합니다:

1. **summary**: 
   - `newMembers`: 현재 기간의 신규 회원 수
   - `growthRate`: 전 기간 대비 증감률 (%)
   - `totalMembers`: 전체 회원 수

2. **distribution**: 
   - 각 유입 경로(HT, COP, Global, Commerce)의 점유율 (%)

3. **trends**: 
   - `monthly`: 월별 추이 데이터 (date, ht, cop, global, commerce, 각각의 Predicted 값)
   - `weekly`: 주별 추이 데이터
   - `daily`: 일별 추이 데이터

## 장점

1. **단일 API 호출**: 여러 API를 호출할 필요 없이 한번에 모든 데이터를 가져옴
2. **일관성**: 모든 컴포넌트가 동일한 데이터 소스를 사용
3. **성능**: 네트워크 요청 횟수 감소
4. **유지보수**: 데이터 구조 변경 시 한 곳만 수정하면 됨

