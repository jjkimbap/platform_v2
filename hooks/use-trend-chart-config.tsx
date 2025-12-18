import { useMemo } from 'react'

/**
 * Y축 설정을 계산하는 함수
 * 5 또는 10의 배수로 정수 틱을 생성
 */
function calculateYAxisConfig(data: any[], dataKeys: string[]) {
    // 모든 데이터 값 찾기
    const allValues: number[] = []
    data.forEach(item => {
      dataKeys.forEach(key => {
        const value = item[key]
        if (typeof value === 'number' && value !== null && !isNaN(value)) {
          allValues.push(value)
        }
      })
    })

    if (allValues.length === 0) {
      return {
        domain: [0, 100] as [number, number],
        ticks: [0, 20, 40, 60, 80, 100],
        interval: 20
      }
    }

    const maxValue = Math.max(...allValues)
    
    // 10% 여백 추가
    const maxWithPadding = maxValue * 1.1

    // 적절한 간격 선택 (5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000...)
    // 목표: 5~10개의 틱 생성
    const baseIntervals = [5, 10, 20, 50]
    const multipliers = [1, 10, 100, 1000, 10000, 100000]
    
    const intervals: number[] = []
    multipliers.forEach(mult => {
      baseIntervals.forEach(base => {
        intervals.push(base * mult)
      })
    })
    
    let selectedInterval = intervals[0]
    
    // 5~10개의 틱이 생성되는 가장 작은 간격 선택
    for (const interval of intervals) {
      const maxRounded = Math.ceil(maxWithPadding / interval) * interval
      const tickCount = Math.floor(maxRounded / interval) + 1
      
      if (tickCount >= 5 && tickCount <= 10) {
        selectedInterval = interval
        break
      } else if (tickCount < 5) {
        // 틱이 너무 적으면 이전 간격 사용
        const prevIndex = intervals.indexOf(interval) - 1
        if (prevIndex >= 0) {
          selectedInterval = intervals[prevIndex]
        } else {
          selectedInterval = interval
        }
        break
      }
    }

    // 선택된 간격으로 최대값 계산 (간격의 배수로 올림)
    const maxRounded = Math.ceil(maxWithPadding / selectedInterval) * selectedInterval

    // 0부터 정수 틱 생성 (5~10개)
    const ticks: number[] = []
    for (let i = 0; i <= maxRounded; i += selectedInterval) {
      ticks.push(Math.round(i)) // 정수로 변환
      // 최대 10개까지만 생성
      if (ticks.length >= 10) break
    }

    return {
      domain: [0, maxRounded] as [number, number],
      ticks: ticks,
      interval: selectedInterval
    }
}

// 주별 날짜를 "00월0주" 형식으로 변환하는 함수
function formatWeeklyDate(dateStr: string): string {
    if (!dateStr) return dateStr
    
    // yyyy-MM-dd 형식인 경우 (주 시작일, 월요일)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number)
      const weekStartDate = new Date(year, month - 1, day)
      
      // 해당 주가 속한 월의 첫 번째 날짜
      const firstDayOfMonth = new Date(year, month - 1, 1)
      
      // 주 시작일(월요일)이 해당 월의 몇 번째 주인지 계산
      const daysFromMonthStart = Math.floor((weekStartDate.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24))
      
      // 주 번호 계산: (일수 / 7) + 1 (첫 주는 1주차)
      const weekNumber = Math.max(1, Math.floor(daysFromMonthStart / 7) + 1)
      
      return `${month}월${weekNumber}주`
    }
    
    // 이미 "N주" 형식인 경우 (mock 데이터)
    if (/^\d+주$/.test(dateStr)) {
      const weekNum = parseInt(dateStr.replace('주', ''))
      const currentMonth = new Date().getMonth() + 1
      return `${currentMonth}월${weekNum}주`
    }
    
    return dateStr
  }

/**
 * 통일된 툴팁 컴포넌트를 생성하는 함수
 */
function createUnifiedTooltip(activeTab: string) {
  return ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        // 날짜 포맷팅: activeTab에 따라 다르게 처리
        let formattedLabel = label
        if (activeTab === 'weekly') {
          // 주별일 때 "00월0주" 형식으로 변환
          formattedLabel = formatWeeklyDate(label)
        } else if (activeTab === 'daily') {
          // 일별일 때 날짜 포맷팅
          if (typeof label === 'string') {
            // yyyy-MM-dd 형식인 경우 그대로 반환
            if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
              formattedLabel = label
            }
            // yyyy-MM 형식인 경우 (일별 데이터가 아닌 경우)
            else if (/^\d{4}-\d{2}$/.test(label)) {
              formattedLabel = label
            }
            // yyyyMMdd 형식인 경우
            else if (/^\d{8}$/.test(label)) {
              formattedLabel = `${label.substring(0, 4)}-${label.substring(4, 6)}-${label.substring(6, 8)}`
            }
          }
        }

        return (
          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
            {formattedLabel && <p className="font-semibold text-foreground mb-2">{formattedLabel}</p>}
            {payload.map((entry: any, index: number) => {
              const isConversionRate = entry.dataKey?.includes('conversionRate')
              const value = entry.value !== null && entry.value !== undefined ? entry.value : 0
              const formattedValue = isConversionRate 
                ? value.toFixed(1) 
                : value.toLocaleString()
              
              return (
                <div 
                  key={index} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto' }}>
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ 
                        backgroundColor: entry.color,
                        opacity: entry.dataKey.includes('Predicted') ? 0.7 : 1
                      }}
                    />
                    <span className="text-sm text-muted-foreground" style={{ textAlign: 'left' }}>
                      {entry.name}:
                    </span>
                  </div>
                  <span 
                    className="text-sm font-medium text-foreground" 
                    style={{ textAlign: 'right', flex: '0 0 auto', marginLeft: '16px' }}
                  >
                    {formattedValue}
                    {entry.dataKey.includes('Rate') || isConversionRate ? '%' : ''}
                  </span>
                </div>
              )
            })}
          </div>
        )
      }
      return null
    }
}

/**
 * 추이 차트의 Y축 설정과 툴팁을 통일된 방식으로 제공하는 훅
 * 
 * @param data 차트 데이터 배열
 * @param dataKeys Y축에 표시할 데이터 키 배열 (예: ["execution", "scan"])
 * @param activeTab 현재 활성 탭 ('monthly' | 'weekly' | 'daily')
 * @returns Y축 props와 통일된 툴팁 컴포넌트
 */
export function useTrendChartConfig(
  data: any[],
  dataKeys: string[],
  activeTab: string = 'monthly'
) {
  // Y축 설정 계산
  const yAxisConfig = useMemo(() => {
    return calculateYAxisConfig(data, dataKeys)
  }, [data, dataKeys])

  // 통일된 툴팁 컴포넌트
  const unifiedTooltip = useMemo(() => {
    return createUnifiedTooltip(activeTab)
  }, [activeTab])

  // Y축 Props 반환
  const yAxisProps = {
    yAxisId: "left" as const,
    domain: yAxisConfig.domain,
    ticks: yAxisConfig.ticks,
    tickFormatter: (value: number) => Math.round(value).toLocaleString(),
    stroke: "#737373",
    style: { fontSize: "12px" },
    width: 50
  }

  return {
    yAxisProps,
    unifiedTooltip,
    yAxisConfig
  }
}

