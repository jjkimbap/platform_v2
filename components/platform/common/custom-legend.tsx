"use client"

import React from "react"

interface CustomLegendProps {
  payload?: Array<{
    value?: string
    color?: string
    [key: string]: any
  }>
}

/**
 * 범례에서 "(예측)" 항목을 필터링하는 커스텀 범례 컴포넌트
 * 툴팁에서는 예측 항목이 표시되지만, 범례에서는 숨김 처리
 */
export const CustomLegend = React.memo(({ payload }: CustomLegendProps) => {
  if (!payload) return null
  
  // "(예측)" 또는 "예측"을 포함하지 않는 항목만 필터링
  const filteredPayload = payload.filter((item) => {
    const value = item.value || ''
    return !value.includes('(예측)') && !value.includes('예측')
  })
  
  return (
    <div className="flex items-center justify-center gap-4 pt-5">
      {filteredPayload.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div 
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
})

CustomLegend.displayName = "CustomLegend"

