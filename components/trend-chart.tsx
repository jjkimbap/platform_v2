"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface TrendChartProps {
  data: Array<{ date: string; [key: string]: string | number }>
  lines: Array<{
    dataKey: string
    name: string
    color: string
  }>
  height?: number
}

export function TrendChart({ data, lines, height = 300 }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis dataKey="date" stroke="#737373" style={{ fontSize: "12px" }} />
        <YAxis stroke="#737373" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0a0a0a",
            border: "1px solid #262626",
            borderRadius: "8px",
            color: "#ffffff",
          }}
        />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
