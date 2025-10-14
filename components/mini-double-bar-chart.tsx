"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"

interface MiniDoubleBarChartProps {
  data: Array<{
    name: string
    male: number
    female: number
  }>
  height?: number
  maleColor?: string
  femaleColor?: string
}

export function MiniDoubleBarChart({ 
  data, 
  height = 40, 
  maleColor = "#3b82f6", 
  femaleColor = "#ec4899" 
}: MiniDoubleBarChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 8 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 8 }}
          />
          <Bar dataKey="male" fill={maleColor} radius={[2, 2, 0, 0]} />
          <Bar dataKey="female" fill={femaleColor} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
