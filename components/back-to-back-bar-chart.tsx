"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"

interface BackToBackBarChartProps {
  data: Array<{
    category: string
    male: number
    female: number
  }>
  height?: number
  maleColor?: string
  femaleColor?: string
}

export function BackToBackBarChart({ 
  data, 
  height = 400, 
  maleColor = "#3b82f6", 
  femaleColor = "#ec4899" 
}: BackToBackBarChartProps) {
  // 데이터를 변환하여 남성은 음수로, 여성은 양수로 설정
  const transformedData = data.map(item => ({
    category: item.category,
    male: -item.male, // 남성 데이터를 음수로 변환
    female: item.female, // 여성 데이터는 양수로 유지
    maleOriginal: item.male, // 원본 남성 데이터 저장
    femaleOriginal: item.female, // 원본 여성 데이터 저장
  }))

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={transformedData}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
        >
          <XAxis 
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => Math.abs(value).toString()}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <YAxis 
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
            width={60}
          />
          
          {/* 남성 막대 (음수) */}
          <Bar dataKey="male" fill={maleColor} radius={[0, 4, 4, 0]}>
            {transformedData.map((entry, index) => (
              <Cell key={`male-${index}`} fill={maleColor} />
            ))}
          </Bar>
          
          {/* 여성 막대 (양수) */}
          <Bar dataKey="female" fill={femaleColor} radius={[4, 0, 0, 4]}>
            {transformedData.map((entry, index) => (
              <Cell key={`female-${index}`} fill={femaleColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* 범례 */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: maleColor }}></div>
          <span className="text-sm text-muted-foreground">남성</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: femaleColor }}></div>
          <span className="text-sm text-muted-foreground">여성</span>
        </div>
      </div>
    </div>
  )
}
