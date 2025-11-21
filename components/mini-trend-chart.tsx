"use client"

import { LineChart, Line, ResponsiveContainer } from "recharts"

interface MiniTrendChartProps {
  data: Array<{ value: number }>
  color?: string
  height?: number
}

export function MiniTrendChart({ data, color = "#3b82f6", height = 40 }: MiniTrendChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
