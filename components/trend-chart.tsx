
"use client"

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts"
import { CustomLegend } from "@/components/platform/common/custom-legend"

interface TrendChartProps {
  data: Array<{ date: string; [key: string]: string | number | null }>
  lines: Array<{
    dataKey: string
    name: string
    color: string
    strokeDasharray?: string
    yAxisId?: string
  }>
  bars?: Array<{
    dataKey: string
    name: string
    color: string
    yAxisId?: string
    stackId?: string
  }>
  targets?: Array<{
    dataKey: string
    value: number
    color: string
    label: string
    yAxisId?: string
  }>
  height?: number
  showEventLine?: boolean
  eventDate?: string
  hideLegend?: boolean
  hideTooltip?: boolean
  hideAxes?: boolean
  rightDomain?: [number, number] // right y축 domain을 직접 지정 (예: [0, 100])
  leftDomain?: [number, number] // left y축 domain을 직접 지정
  leftTicks?: number[] // left y축 ticks를 직접 지정 (100의 배수 등)
  activeTab?: string // 'monthly' | 'weekly' | 'daily'
}

// 주별 날짜를 "00월0주" 형식으로 변환하는 함수
// period는 주의 시작일(월요일)의 날짜(YYYY-MM-DD 형식)
const formatWeeklyDate = (dateStr: string): string => {
  if (!dateStr) return dateStr
  
  // yyyy-MM-dd 형식인 경우 (주 시작일, 월요일)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    const weekStartDate = new Date(year, month - 1, day)
    
    // 해당 주가 속한 월의 첫 번째 날짜
    const firstDayOfMonth = new Date(year, month - 1, 1)
    
    // 주 시작일(월요일)이 해당 월의 몇 번째 주인지 계산
    // 월의 첫 번째 날짜부터 주 시작일까지의 일수 계산
    const daysFromMonthStart = Math.floor((weekStartDate.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24))
    
    // 주 번호 계산: (일수 / 7) + 1 (첫 주는 1주차)
    // 단, 주 시작일이 월의 첫 번째 날짜보다 이전이면 이전 달의 마지막 주이므로 해당 월의 1주차로 처리
    const weekNumber = Math.max(1, Math.floor(daysFromMonthStart / 7) + 1)
    
    return `${month}월${weekNumber}주`
  }
  
  // 이미 "N주" 형식인 경우 (mock 데이터)
  if (/^\d+주$/.test(dateStr)) {
    const weekNum = parseInt(dateStr.replace('주', ''))
    // 현재 월을 기본값으로 사용 (실제로는 데이터에서 월 정보를 가져와야 함)
    const currentMonth = new Date().getMonth() + 1
    return `${currentMonth}월${weekNum}주`
  }
  
  return dateStr
}

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label, activeTab }: any) => {
  if (active && payload && payload.length) {
    // 날짜 포맷팅: activeTab에 따라 다르게 처리
    let formattedLabel = label
    if (activeTab === 'weekly') {
      // 주별일 때 포맷팅 적용
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
        <p className="font-semibold text-foreground mb-2">{formattedLabel}</p>
        {payload.map((entry: any, index: number) => {
          const isConversionRate = entry.dataKey?.includes('conversionRate')
          const value = entry.value !== null && entry.value !== undefined ? entry.value : 0
          const formattedValue = isConversionRate 
            ? value.toFixed(1) 
            : value.toLocaleString()
          
          return (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ 
                  backgroundColor: entry.color,
                  opacity: entry.dataKey.includes('Predicted') ? 0.7 : 1
                }}
              />
              <span className="text-sm text-muted-foreground">{entry.name}:</span>
              <span className="text-sm font-medium text-foreground">
                {formattedValue}
                {entry.dataKey.includes('Rate') ? '%' : ''}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

export function TrendChart({ data, lines, bars, targets, height = 300, showEventLine = false, eventDate, hideLegend = false, hideTooltip = false, hideAxes = false, rightDomain: customRightDomain, leftDomain: customLeftDomain, leftTicks, activeTab = 'monthly' }: TrendChartProps) {
  // Y축 범위를 동적으로 계산
  const calculateYAxisDomain = (axisId: string) => {
    const allValues: number[] = []
    
    // 데이터에서 값 추출
    data.forEach(item => {
      lines.forEach(line => {
        if (line.yAxisId === axisId || (!line.yAxisId && axisId === 'left')) {
          const value = item[line.dataKey]
          if (typeof value === 'number' && value !== null) {
            allValues.push(value)
          }
        }
      })
      
      bars?.forEach(bar => {
        if (bar.yAxisId === axisId || (!bar.yAxisId && axisId === 'right')) {
          const value = item[bar.dataKey]
          if (typeof value === 'number' && value !== null) {
            allValues.push(value)
          }
        }
      })
    })
    
    // 목표치에서 값 추출
    targets?.forEach(target => {
      if (target.yAxisId === axisId || (!target.yAxisId && axisId === 'left')) {
        allValues.push(target.value)
      }
    })
    
    if (allValues.length === 0) return [0, 100]
    
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const padding = (max - min) * 0.1 // 10% 여백 추가
    
    return [Math.max(0, min - padding), max + padding]
  }

  // leftDomain이 prop으로 전달되면 사용하고, 아니면 동적으로 계산
  const leftDomain = customLeftDomain || calculateYAxisDomain('left')
  // rightDomain이 prop으로 전달되면 사용하고, 아니면 동적으로 계산
  const rightDomain = customRightDomain || calculateYAxisDomain('right')

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke="#f59e0b" strokeWidth="1" opacity="0.6"/>
          </pattern>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="transparent" />
        {!hideAxes && <XAxis 
          dataKey="date" 
          stroke="#737373" 
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => {
            // 주별일 때 "00월0주" 형식으로 변환
            if (activeTab === 'weekly') {
              return formatWeeklyDate(value)
            }
            // 날짜를 yyyy-MM 형식으로 변환
            if (typeof value === 'string') {
              // 이미 yyyy-MM 형식인 경우
              if (/^\d{4}-\d{2}$/.test(value)) {
                return value
              }
              // yyyy-MM-dd 형식인 경우
              if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return value.substring(0, 7)
              }
              // yyyyMMdd 형식인 경우
              if (/^\d{8}$/.test(value)) {
                return `${value.substring(0, 4)}-${value.substring(4, 6)}`
              }
            }
            return value
          }}
        />}
        {!hideAxes && <YAxis 
          yAxisId="left" 
          domain={leftDomain} 
          stroke="#737373" 
          style={{ fontSize: "12px" }}
          ticks={leftTicks}
          tickFormatter={(value) => value.toLocaleString()}
        />}
        {!hideAxes && <YAxis yAxisId="right" domain={rightDomain} orientation="right" stroke="#737373" style={{ fontSize: "12px" }} />}
        {!hideTooltip && <Tooltip content={(props) => <CustomTooltip {...props} activeTab={activeTab} />} />}
        {!hideLegend && <Legend content={<CustomLegend />} verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: "20px" }} />}
        {targets?.map((target) => (
          <ReferenceLine
            key={target.dataKey}
            yAxisId={target.yAxisId || "left"}
            y={target.value}
            stroke={target.color}
            strokeDasharray="3 3"
            strokeWidth={2}
            label={{
              value: `★ ${target.label}`,
              position: "top",
              style: { 
                fill: target.color, 
                fontSize: "12px", 
                fontWeight: "bold" 
              }
            }}
          />
        ))}
        {showEventLine && eventDate && (
          <ReferenceLine
            x={eventDate}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: "이벤트 날짜",
              position: "top",
              style: { 
                fill: "#ef4444", 
                fontSize: "12px", 
                fontWeight: "bold" 
              }
            }}
          />
        )}
        {bars?.map((bar) => {
          // rgba 색상이 전달된 경우 그대로 사용 (반투명 처리)
          const isRgbaColor = bar.color && bar.color.startsWith('rgba')
          const fillColor = isRgbaColor 
            ? bar.color 
            : (bar.dataKey.includes('Predicted') ? "url(#diagonalHatch)" : bar.color)
          const barOpacity = isRgbaColor 
            ? 1 
            : (bar.dataKey.includes('Predicted') ? 0.8 : 0.7)
          
          return (
            <Bar
              key={bar.dataKey}
              yAxisId={bar.yAxisId || "right"}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={fillColor}
              opacity={barOpacity}
              stackId={bar.stackId}
            />
          )
        })}
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            yAxisId={line.yAxisId || "left"}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            strokeDasharray={line.strokeDasharray}
            dot={false}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
