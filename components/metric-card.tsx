"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { MiniTrendChart } from "@/components/mini-trend-chart"
import { MiniDoubleBarChart } from "@/components/mini-double-bar-chart"
import { MiniStackedBarChart } from "@/components/mini-stacked-bar-chart"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  onClick?: () => void
  className?: string
  trendData?: Array<{ value: number } | { name: string; value: number; color: string }>
  trendColor?: string
  barData?: Array<{
    name: string
    male: number
    female: number
  }>
  maleColor?: string
  femaleColor?: string
  textData?: Array<{
    label: string
    value: string | number
    color?: string
  }>
  target?: string
  achievement?: number
  inactivePosts?: string
}

export function MetricCard({ title, value, icon, onClick, className, trendData, trendColor, barData, maleColor, femaleColor, textData, target, achievement, inactivePosts }: MetricCardProps) {

  return (
    <Card
      className={cn("p-6 pb-0 bg-card border-border hover:border-primary/50 transition-all cursor-pointer flex flex-col h-full", className)}
      onClick={onClick}
    >
      <div className="space-y-4 flex-1">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {inactivePosts && (
                <span className="text-sm text-muted-foreground">{inactivePosts}</span>
              )}
            </div>
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        
        {trendData && (
          <div className="mt-4">
            {trendData.length > 0 && 'name' in trendData[0] ? (
              <MiniStackedBarChart data={trendData as Array<{ name: string; value: number; color: string }>} />
            ) : (
              <MiniTrendChart data={trendData as Array<{ value: number }>} color={trendColor} height={40} />
            )}
          </div>
        )}
        
        {barData && (
          <div className="mt-4">
            <MiniDoubleBarChart 
              data={barData} 
              maleColor={maleColor}
              femaleColor={femaleColor}
              height={40} 
            />
          </div>
        )}
        
        {textData && (
          <div className="mt-4 space-y-1">
            {textData.map((item, index) => {
              // 한 줄에 두 개씩 표시하기 위해 인덱스가 짝수일 때만 렌더링
              if (index % 2 === 0) {
                const nextItem = textData[index + 1]
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span 
                        className="font-semibold"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </span>
                    </div>
                    {nextItem && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{nextItem.label}</span>
                        <span 
                          className="font-semibold"
                          style={{ color: nextItem.color }}
                        >
                          {nextItem.value}
                        </span>
                      </div>
                    )}
                  </div>
                )
              }
              return null
            })}
          </div>
        )}

            {/* 목표치와 달성률 표시 */}
            {(target || achievement !== undefined) && (
              <div className="mt-auto">
                <div className="p-3 pb-6 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">목표:</span>
                      <span className="font-medium">{target || 'N/A'}</span>
                    </div>
                    {achievement !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">달성률:</span>
                        <span className={`font-semibold ${
                          achievement >= 81 ? 'text-green-600' : 
                          achievement >= 51 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {achievement.toFixed(1)}%
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          achievement >= 81 ? 'bg-green-500' : 
                          achievement >= 51 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    )}
                  </div>
                  
                  {/* 진행률 막대그래프 */}
                  {achievement !== undefined && (
                    <div className="relative">
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            achievement >= 81 ? 'bg-green-500' : 
                            achievement >= 51 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(achievement, 100)}%` }}
                        />
                      </div>
                      {/* 목표선 표시 */}
                      <div 
                        className="absolute top-0 h-2 w-0.5 bg-foreground/60"
                        style={{ left: '100%' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
      </div>
    </Card>
  )
}
