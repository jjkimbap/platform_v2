"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { MiniTrendChart } from "@/components/mini-trend-chart"
import { MiniDoubleBarChart } from "@/components/mini-double-bar-chart"
import { MiniStackedBarChart } from "@/components/mini-stacked-bar-chart"
import PositiveNegativeBarChart from "@/components/positive-negative-bar-chart"
import CountryPieChart from "@/components/country-pie-chart"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value?: string | number
  diffValue?: number
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
  inactivePosts?: string
  comparisonText?: string
  showSignupPathLink?: boolean
  signupPathLinkText?: string
}

export function MetricCard({ title, value, diffValue, icon, onClick, className, trendData, trendColor, barData, maleColor, femaleColor, textData, inactivePosts, comparisonText, showSignupPathLink, signupPathLinkText }: MetricCardProps) {

  return (
    <Card
      className={cn("p-4 bg-card border-border transition-all flex flex-col h-full", className)}
    >
      <div className="space-y-3 flex-1">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="flex items-baseline gap-2">
            {value && <p className="text-3xl font-bold text-foreground">{value}</p>}
              {inactivePosts && (
                <span className="text-sm text-muted-foreground">{inactivePosts}</span>
              )}
              </div>
            {diffValue !== undefined && (
              <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                diffValue >= 0 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                전월 대비 {diffValue > 0 ? '+' : ''}{diffValue}%
              </div>
            )}
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
          <div className="mt-3 space-y-2">
            {textData.map((item, index) => {
              // 프리랜딩 답변율 통합 Positive/Negative Bar Chart (모든 연령대)
              const valueStr = String(item.value)
              const maleMatch = valueStr.match(/남 (\d+)명/)
              const femaleMatch = valueStr.match(/여 (\d+)명/)
              
              if (maleMatch && femaleMatch && index === 0) { // 첫 번째 항목에서만 전체 차트 표시
                // 모든 연령대 데이터 수집
                const ageGroups = textData.map(ageItem => {
                  const ageValueStr = String(ageItem.value)
                  const ageMaleMatch = ageValueStr.match(/남 (\d+)명/)
                  const ageFemaleMatch = ageValueStr.match(/여 (\d+)명/)
                  
                  if (ageMaleMatch && ageFemaleMatch) {
                    return {
                      ageGroup: ageItem.label,
                      male: parseInt(ageMaleMatch[1]),
                      female: parseInt(ageFemaleMatch[1])
                    }
                  }
                  return null
                }).filter((item): item is NonNullable<typeof item> => item !== null)
                
                return (
                  <div key="freelancing-chart" className="space-y-2">
                    {/* Recharts Positive/Negative Bar Chart */}
                    <PositiveNegativeBarChart data={ageGroups} />
                  </div>
                )
              } else if (maleMatch && femaleMatch) {
                return null // 다른 항목들은 표시하지 않음
              }
              
              // 국가별 실행 데이터 파이차트 (동적 데이터)
              if (textData.length >= 3 && textData.every(item => String(item.value).includes('회'))) {
                if (index === 0) { // 첫 번째 항목에서만 파이차트 표시
                  return (
                    <div key="country-pie-chart" className="space-y-2">
                      {/* Recharts 파이차트 */}
                      <CountryPieChart data={textData} />
                    </div>
                  )
                } else {
                  return null // 다른 항목들은 표시하지 않음
                }
              }
              
              // 마켓별 스캔 데이터 파이차트 (App Store, Play Store, WeChat, 그 외)
              if (textData.length === 4 && textData[0].label === "App Store" && textData[1].label === "Play Store" && textData[2].label === "WeChat" && textData[3].label === "그 외") {
                if (index === 0) { // 첫 번째 항목에서만 파이차트 표시
                  return (
                    <div key="market-scan-pie-chart" className="space-y-2">
                      {/* Recharts 파이차트 */}
                      <CountryPieChart data={textData} />
                    </div>
                  )
                } else {
                  return null // 다른 항목들은 표시하지 않음
                }
              }
              
              // 전환율 지표 막대그래프 (실행 대비 스캔 전환율 / 스캔 기기 가입 전환율)
              if (textData.length === 2 && textData[0].label === "실행 대비 스캔 전환율" && textData[1].label === "스캔 기기 가입 전환율") {
                const scanConversionValue = parseFloat(String(textData[0].value).match(/(\d+\.?\d*)%/)?.[1] || "0")
                const deviceConversionValue = parseFloat(String(textData[1].value).match(/(\d+\.?\d*)%/)?.[1] || "0")
                const maxValue = Math.max(scanConversionValue, deviceConversionValue)
                
                if (index === 0) { // 첫 번째 항목에서만 막대그래프 표시
                  return (
                    <div key="conversion-chart" className="space-y-2">
                      {/* 개별 항목들 */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">실행 대비 스캔 전환율</span>
                        <span className="font-semibold" style={{ color: textData[0].color }}>
                          {textData[0].value}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">스캔 기기 가입 전환율</span>
                        <span className="font-semibold" style={{ color: textData[1].color }}>
                          {textData[1].value}
                        </span>
                      </div>
                     
                    </div>
                  )
                } else {
                  return null // 두 번째 항목은 표시하지 않음
                }
              }
              
              // 신규 유입수 막대그래프 (앱/커머스)
              if (textData.length === 2 && textData[0].label === "앱 유입" && textData[1].label === "커머스 유입") {
                const appValue = parseInt(String(textData[0].value).match(/(\d+)명/)?.[1] || "0")
                const commerceValue = parseInt(String(textData[1].value).match(/(\d+)명/)?.[1] || "0")
                const total = appValue + commerceValue
                
                if (index === 0) { // 첫 번째 항목에서만 막대그래프 표시
                  return (
                    <div key="inflow-chart" className="space-y-2">
                      {/* 개별 항목들 */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">앱 유입</span>
                        <span className="font-semibold" style={{ color: textData[0].color }}>
                          {textData[0].value}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">커머스 유입</span>
                        <span className="font-semibold" style={{ color: textData[1].color }}>
                          {textData[1].value}
                        </span>
                      </div>
                      {/* 통합 막대그래프 */}
                      <div className="flex h-3 rounded overflow-hidden border">
                        <div 
                          className="bg-blue-500"
                          style={{ width: `${(appValue / total) * 100}%` }}
                          title={`앱 유입: ${appValue}명 (${((appValue / total) * 100).toFixed(1)}%)`}
                        />
                        <div 
                          className="bg-green-500"
                          style={{ width: `${(commerceValue / total) * 100}%` }}
                          title={`커머스 유입: ${commerceValue}명 (${((commerceValue / total) * 100).toFixed(1)}%)`}
                        />
                      </div>
                    </div>
                  )
                } else {
                  return null // 두 번째 항목은 표시하지 않음
                }
              }
              
              // 신규 채팅방 막대그래프 (1:1/인증거래)
              if (textData.length === 2 && textData[0].label === "1:1" && textData[1].label === "인증거래") {
                const personalValue = parseInt(String(textData[0].value).match(/(\d+)개/)?.[1] || "0")
                const tradeValue = parseInt(String(textData[1].value).match(/(\d+)개/)?.[1] || "0")
                const total = personalValue + tradeValue
                
                if (index === 0) { // 첫 번째 항목에서만 막대그래프 표시
                  return (
                    <div key="chat-chart" className="space-y-2">
                      {/* 개별 항목들 */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">1:1</span>
                        <span className="font-semibold" style={{ color: textData[0].color }}>
                          {textData[0].value}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">인증거래</span>
                        <span className="font-semibold" style={{ color: textData[1].color }}>
                          {textData[1].value}
                        </span>
                      </div>
                      {/* 통합 막대그래프 */}
                      <div className="flex h-3 rounded overflow-hidden border">
                        <div 
                          className="bg-blue-500"
                          style={{ width: `${(personalValue / total) * 100}%` }}
                          title={`1:1: ${personalValue}개 (${((personalValue / total) * 100).toFixed(1)}%)`}
                        />
                        <div 
                          className="bg-green-500"
                          style={{ width: `${(tradeValue / total) * 100}%` }}
                          title={`인증거래: ${tradeValue}개 (${((tradeValue / total) * 100).toFixed(1)}%)`}
                        />
                      </div>
                    </div>
                  )
                } else {
                  return null // 두 번째 항목은 표시하지 않음
                }
              }
              
              // 스캔 기기 막대그래프 (미가입/가입)
              if (textData.length === 2 && textData[0].label === "비회원" && textData[1].label === "회원") {
                const nonMemberValue = parseInt(String(textData[0].value).match(/(\d+)개/)?.[1] || "0")
                const memberValue = parseInt(String(textData[1].value).match(/(\d+)개/)?.[1] || "0")
                const total = nonMemberValue + memberValue
                
                if (index === 0) { // 첫 번째 항목에서만 막대그래프 표시
                  return (
                    <div key="scan-device-chart" className="space-y-2">
                      {/* 개별 항목들 */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">비회원</span>
                        <span className="font-semibold" style={{ color: textData[0].color }}>
                          {textData[0].value}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">회원</span>
                        <span className="font-semibold" style={{ color: textData[1].color }}>
                          {textData[1].value}
                        </span>
                      </div>
                      
                      {/* 누적 막대그래프 */}
                      <div className="space-y-1">
                        
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                          <div className="h-full flex">
                            <div 
                              className="transition-all duration-300" 
                              style={{ 
                                width: `${(nonMemberValue / total) * 100}%`,
                                backgroundColor: textData[0].color 
                              }} 
                            />
                            <div 
                              className="transition-all duration-300" 
                              style={{ 
                                width: `${(memberValue / total) * 100}%`,
                                backgroundColor: textData[1].color 
                              }} 
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{((nonMemberValue / total) * 100).toFixed(1)}%</span>
                          <span>{((memberValue / total) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )
                } else {
                  return null // 다른 항목들은 표시하지 않음
                }
              }
              if (textData.length === 4 && textData[0].label === "Q&A" && textData[1].label === "제품리뷰" && textData[2].label === "판별팁" && textData[3].label === "인증거래") {
                const qaValue = parseInt(String(textData[0].value).match(/(\d+)개/)?.[1] || "0")
                const reviewValue = parseInt(String(textData[1].value).match(/(\d+)개/)?.[1] || "0")
                const tipValue = parseInt(String(textData[2].value).match(/(\d+)개/)?.[1] || "0")
                const tradeValue = parseInt(String(textData[3].value).match(/(\d+)개/)?.[1] || "0")
                const total = qaValue + reviewValue + tipValue + tradeValue
                
                if (index === 0) { // 첫 번째 항목에서만 막대그래프 표시
                  return (
                    <div key="community-chart" className="space-y-2">
                      {/* 개별 항목들 */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Q&A</span>
                        <span className="font-semibold" style={{ color: textData[0].color }}>
                          {textData[0].value}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">제품리뷰</span>
                        <span className="font-semibold" style={{ color: textData[1].color }}>
                          {textData[1].value}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">판별팁</span>
                        <span className="font-semibold" style={{ color: textData[2].color }}>
                          {textData[2].value}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">인증거래</span>
                        <span className="font-semibold" style={{ color: textData[3].color }}>
                          {textData[3].value}
                        </span>
                      </div>
                      {/* 통합 막대그래프 */}
                      <div className="flex h-3 rounded overflow-hidden border">
                        <div 
                          className="bg-blue-500"
                          style={{ width: `${(qaValue / total) * 100}%` }}
                          title={`Q&A: ${qaValue}개 (${((qaValue / total) * 100).toFixed(1)}%)`}
                        />
                        <div 
                          className="bg-green-500"
                          style={{ width: `${(reviewValue / total) * 100}%` }}
                          title={`제품리뷰: ${reviewValue}개 (${((reviewValue / total) * 100).toFixed(1)}%)`}
                        />
                        <div 
                          className="bg-yellow-500"
                          style={{ width: `${(tipValue / total) * 100}%` }}
                          title={`판별팁: ${tipValue}개 (${((tipValue / total) * 100).toFixed(1)}%)`}
                        />
                        <div 
                          className="bg-purple-500"
                          style={{ width: `${(tradeValue / total) * 100}%` }}
                          title={`인증거래: ${tradeValue}개 (${((tradeValue / total) * 100).toFixed(1)}%)`}
                        />
                      </div>
                    </div>
                  )
                } else {
                  return null // 나머지 항목들은 표시하지 않음
                }
              }
              
              // 기존 텍스트 표시 (막대그래프가 아닌 경우)
              return (
                <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span 
                  className="font-semibold"
                  style={{ color: item.color }}
                >
                  {item.value}
                </span>
              </div>
              )
            })}
          </div>
        )}

        {/* 비교 텍스트 */}
        {comparisonText && (
          <div className="mt-3 p-2 bg-muted/20 rounded text-left">
            <span className="text-xs text-muted-foreground">{comparisonText}</span>
          </div>
        )}

        {/* 가입 경로별 추이 상세보기 링크 */}
        {showSignupPathLink && (
          <div className="pt-2 border-t border-border">
            <button 
              onClick={onClick}
              className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              {signupPathLinkText || "→ 가입 경로별 추이 보기"}
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
