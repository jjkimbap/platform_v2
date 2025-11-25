
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
}

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
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
              {entry.value !== null && entry.value !== undefined ? entry.value.toLocaleString() : 0 }
              {entry.dataKey.includes('Rate') ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function TrendChart({ data, lines, bars, targets, height = 300, showEventLine = false, eventDate, hideLegend = false, hideTooltip = false, hideAxes = false }: TrendChartProps) {
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

  const leftDomain = calculateYAxisDomain('left')
  const rightDomain = calculateYAxisDomain('right')

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke="#f59e0b" strokeWidth="1" opacity="0.6"/>
          </pattern>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="transparent" />
        {!hideAxes && <XAxis dataKey="date" stroke="#737373" style={{ fontSize: "12px" }} />}
        {!hideAxes && <YAxis yAxisId="left" domain={leftDomain} stroke="#737373" style={{ fontSize: "12px" }} />}
        {!hideAxes && <YAxis yAxisId="right" domain={rightDomain} orientation="right" stroke="#737373" style={{ fontSize: "12px" }} />}
        {!hideTooltip && <Tooltip content={<CustomTooltip />} />}
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
        {bars?.map((bar) => (
          <Bar
            key={bar.dataKey}
            yAxisId={bar.yAxisId || "right"}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.dataKey.includes('Predicted') ? "url(#diagonalHatch)" : bar.color}
            opacity={bar.dataKey.includes('Predicted') ? 0.8 : 0.7}
          />
        ))}
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
