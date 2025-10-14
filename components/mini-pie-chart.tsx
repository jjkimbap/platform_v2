"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface MiniPieChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  className?: string
}

export function MiniPieChart({ data, className }: MiniPieChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={80}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={35}
            paddingAngle={1}
            dataKey="value"
            startAngle={90}
            endAngle={450}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
