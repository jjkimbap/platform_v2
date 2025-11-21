"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { sampleReports, ReportItem } from "@/lib/report-data"

interface ReportCardProps {
  reports?: ReportItem[]
}

export function ReportCard({ reports = [] }: ReportCardProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("전체")
  const [selectedApp, setSelectedApp] = useState<string>("전체")
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)

  // 샘플 데이터 (props로 받거나 공유 데이터 사용)
  const reportsData: ReportItem[] = reports.length > 0 ? reports : sampleReports

  // 필터링된 데이터
  const filteredReports = reportsData.filter(report => {
    const countryMatch = selectedCountry === "전체" || report.country === selectedCountry
    const appMatch = selectedApp === "전체" || report.appType === selectedApp
    return countryMatch && appMatch
  })

  // 제보 건수
  const reportCount = filteredReports.length
  
  // 제보 국가 수 (중복 제거)
  const uniqueCountries = new Set(filteredReports.map(r => r.country))
  const countryCount = uniqueCountries.size

  // 증감률 계산 (이전 기간 대비, mock 데이터)
  const getReportCountChange = () => {
    // 실제로는 이전 기간 데이터와 비교하지만, 여기서는 mock 데이터 사용
    const changeMap: Record<string, number> = {
      "전체": 12.5,
      "한국": 15.2,
      "일본": -3.2,
      "미국": 8.7,
      "중국": 18.9,
      "베트남": 22.1
    }
    return changeMap[selectedCountry] || 10.0
  }

  const reportCountChange = getReportCountChange()

  // 사용 가능한 국가 목록 (중복 제거)
  const availableCountries = Array.from(new Set(reportsData.map(r => r.country)))

  // 국가별 점유율 계산
  const countryShareData = useMemo(() => {
    const countryCounts: Record<string, number> = {}
    filteredReports.forEach(report => {
      countryCounts[report.country] = (countryCounts[report.country] || 0) + 1
    })
    const total = filteredReports.length
    return Object.entries(countryCounts)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // 상위 5개 국가만 표시
  }, [filteredReports])

  // 앱별 점유율 계산
  const appShareData = useMemo(() => {
    const appCounts: Record<string, number> = {}
    filteredReports.forEach(report => {
      appCounts[report.appType] = (appCounts[report.appType] || 0) + 1
    })
    const total = filteredReports.length
    return Object.entries(appCounts)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredReports])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

  return (
    <Card className="p-4 bg-card border-border transition-all flex flex-col h-full">
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">제보 내역</h3>
          <div className="flex items-center gap-2">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[120px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                <SelectItem value="전체" className="cursor-pointer hover:bg-blue-50">전체</SelectItem>
                {availableCountries.map(country => (
                  <SelectItem key={country} value={country} className="cursor-pointer hover:bg-blue-50">
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedApp} onValueChange={setSelectedApp}>
              <SelectTrigger className="w-[120px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                <SelectItem value="전체" className="cursor-pointer hover:bg-blue-50">전체</SelectItem>
                <SelectItem value="HT" className="cursor-pointer hover:bg-blue-50">HT</SelectItem>
                <SelectItem value="COP" className="cursor-pointer hover:bg-blue-50">COP</SelectItem>
                <SelectItem value="Global" className="cursor-pointer hover:bg-blue-50">Global</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* 좌우 레이아웃: 좌측 지표, 우측 테이블 */}
        <div className="grid grid-cols-[300px_1fr] gap-4 flex-1 min-h-0">
          {/* 좌측: 지표 영역 (세로 배치) */}
          <div className="flex flex-col gap-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
            {/* 제보 건수 */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">제보 건수</p>
              <div className="flex items-center gap-1.5">
                <p className="text-2xl font-bold">{reportCount.toLocaleString()}개</p>
                <div className={`flex items-center gap-0.5 text-xs ${reportCountChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {reportCountChange >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{reportCountChange >= 0 ? '+' : ''}{reportCountChange.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* 제보 국가 */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">제보 국가</p>
              <p className="text-2xl font-bold">{countryCount}개국</p>
            </div>

            {/* 국가별 점유율 */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2 font-semibold">국가별 점유율</p>
              {countryShareData.length > 0 ? (
                <>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={countryShareData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {countryShareData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => [
                            `${value}개 (${props.payload.percentage}%)`,
                            '제보 수'
                          ]}
                        />
                        <Legend 
                          iconSize={8}
                          wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {countryShareData.slice(0, 5).map((item, index) => (
                      <div key={item.name} className="flex items-center gap-1 text-xs">
                        <div 
                          className="w-2.5 h-2.5 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">데이터 없음</p>
              )}
            </div>

            {/* 앱별 점유율 - 누적 막대 차트 */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2 font-semibold">앱별 점유율</p>
              {appShareData.length > 0 ? (() => {
                const total = appShareData.reduce((sum, a) => sum + a.value, 0)
                const htValue = appShareData.find(a => a.name === "HT")?.value || 0
                const copValue = appShareData.find(a => a.name === "COP")?.value || 0
                const globalValue = appShareData.find(a => a.name === "Global")?.value || 0
                const htPercent = total > 0 ? (htValue / total) * 100 : 0
                const copPercent = total > 0 ? (copValue / total) * 100 : 0
                const globalPercent = total > 0 ? (globalValue / total) * 100 : 0
                
                return (
                  <>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={[{ name: "", HT: htPercent, COP: copPercent, Global: globalPercent }]}
                          layout="vertical"
                          barSize={30}
                          stackOffset="expand"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis type="category" dataKey="name" hide />
                          <Tooltip 
                            formatter={(value: number, name: string) => {
                              const labels: Record<string, string> = { HT: "HT", COP: "COP", Global: "Global" }
                              const actualValue = name === "HT" ? htValue : name === "COP" ? copValue : globalValue
                              return [`${actualValue}개 (${value.toFixed(1)}%)`, labels[name] || name]
                            }}
                          />
                          <Legend 
                            iconSize={10}
                            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                            formatter={(value) => {
                              const labels: Record<string, string> = { HT: "HT", COP: "COP", Global: "Global" }
                              return labels[value] || value
                            }}
                          />
                          <Bar dataKey="HT" stackId="a" fill="#3b82f6" name="HT" />
                          <Bar dataKey="COP" stackId="a" fill="#10b981" name="COP" />
                          <Bar dataKey="Global" stackId="a" fill="#f59e0b" name="Global" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {appShareData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-1 text-xs">
                          <div 
                            className="w-2.5 h-2.5 rounded" 
                            style={{ 
                              backgroundColor: item.name === "HT" ? "#3b82f6" : item.name === "COP" ? "#10b981" : "#f59e0b"
                            }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })() : (
                <p className="text-xs text-muted-foreground">데이터 없음</p>
              )}
            </div>
          </div>

          {/* 우측: 테이블 */}
          <div className="overflow-auto relative min-h-0" style={{ maxHeight: '700px' }}>
          <table className="w-full caption-bottom text-base border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead className="sticky top-0 bg-background z-10">
                <tr className="border-b">
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '12%' }}>이미지</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>IDX</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '14%' }}>국가</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '14%' }}>앱종류</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>제보종류</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>제보자</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr 
                    key={report.id} 
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="p-2 align-middle text-center">
                      {report.imageUrl ? (
                        <div className="w-12 h-12 relative rounded overflow-hidden mx-auto">
                          <img
                            src={report.imageUrl}
                            alt={`제보 ${report.id}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground mx-auto">
                          이미지
                        </div>
                      )}
                    </td>
                    <td className="p-2 align-middle text-center font-medium">{report.id}</td>
                    <td className="p-2 align-middle text-center">{report.country}</td>
                    <td className="p-2 align-middle text-center">{report.appType}</td>
                    <td className="p-2 align-middle text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                        report.reportType === "검출" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {report.reportType}
                      </span>
                    </td>
                    <td className="p-2 align-middle text-center">{report.reporter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 상세보기 Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>제보 상세보기</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              {/* 이미지 영역 */}
              <div className="w-full">
                {selectedReport.imageUrl ? (
                  <div className="w-full max-h-[600px] relative rounded-lg overflow-hidden border">
                    <img
                      src={selectedReport.imageUrl}
                      alt={`제보 ${selectedReport.id}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                    이미지 없음
                  </div>
                )}
              </div>

              {/* 상세 정보 */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">IDX</p>
                  <p className="font-semibold">{selectedReport.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">국가</p>
                  <p className="font-semibold">{selectedReport.country}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">앱종류</p>
                  <p className="font-semibold">{selectedReport.appType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">제보종류</p>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    selectedReport.reportType === "검출" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {selectedReport.reportType}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">제보자</p>
                  <p className="font-semibold">{selectedReport.reporter}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
