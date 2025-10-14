"use client"

interface MiniStackedBarChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  className?: string
}

export function MiniStackedBarChart({ data, className }: MiniStackedBarChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className={className}>
      <div className="space-y-1 text-xs">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const barLength = Math.ceil(percentage / 2) // 2%당 1개 블록
          const barBlocks = '█'.repeat(Math.max(1, barLength))
          
          return (
            <div key={index} className="flex items-center gap-2">
              <span className="w-16 text-left font-medium">{item.name}</span>
              <span className="text-muted-foreground">({item.value}개)</span>
              <span 
                className="font-mono text-sm"
                style={{ color: item.color }}
              >
                {barBlocks}
              </span>
              <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
