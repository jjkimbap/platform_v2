"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { sampleInvalidScans, InvalidScanItem } from "@/lib/invalid-scan-data"

interface InvalidScanProps {
  invalidScans?: InvalidScanItem[]
}

export function InvalidScan({ invalidScans = [] }: InvalidScanProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("전체")
  const [selectedApp, setSelectedApp] = useState<string>("전체")
  const [selectedScan, setSelectedScan] = useState<InvalidScanItem | null>(null)

  // 샘플 데이터 (props로 받거나 공유 데이터 사용)
  const scansData: InvalidScanItem[] = invalidScans.length > 0 ? invalidScans : sampleInvalidScans

  // 필터링된 데이터
  const filteredScans = scansData.filter(scan => {
    const countryMatch = selectedCountry === "전체" || scan.country === selectedCountry
    const appMatch = selectedApp === "전체" || scan.appType === selectedApp
    return countryMatch && appMatch
  })

  // 비정상 스캔 건수
  const scanCount = filteredScans.length
  
  // 스캔 국가 수 (중복 제거)
  const uniqueCountries = new Set(filteredScans.map(s => s.country))
  const countryCount = uniqueCountries.size

  // 증감률 계산 (이전 기간 대비, mock 데이터)
  const getScanCountChange = () => {
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

  const scanCountChange = getScanCountChange()

  // 사용 가능한 국가 목록 (중복 제거)
  const availableCountries = Array.from(new Set(scansData.map(s => s.country)))

  // 국가별 점유율 계산
  const countryShareData = useMemo(() => {
    const countryCounts: Record<string, number> = {}
    filteredScans.forEach(scan => {
      countryCounts[scan.country] = (countryCounts[scan.country] || 0) + 1
    })
    const total = filteredScans.length
    return Object.entries(countryCounts)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // 상위 5개 국가만 표시
  }, [filteredScans])

  // 앱별 점유율 계산
  const appShareData = useMemo(() => {
    const appCounts: Record<string, number> = {}
    filteredScans.forEach(scan => {
      appCounts[scan.appType] = (appCounts[scan.appType] || 0) + 1
    })
    const total = filteredScans.length
    return Object.entries(appCounts)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredScans])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

  return (
    <Card className="p-4 bg-card border-border transition-all flex flex-col h-full">
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">비정상 스캔</h3>
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
        
        {/* 상단 통계 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">비정상 스캔 건수</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{scanCount.toLocaleString()}개</p>
              <div className={`flex items-center gap-1 text-sm ${scanCountChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {scanCountChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{scanCountChange >= 0 ? '+' : ''}{scanCountChange.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">비정상 스캔 국가</p>
            <p className="text-2xl font-bold">{countryCount}개국</p>
          </div>
        </div>

        {/* 국가별/앱별 점유율 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 국가별 점유율 */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2 font-semibold">국가별 점유율</p>
            {countryShareData.length > 0 ? (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={countryShareData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
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
                        '스캔 수'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">데이터 없음</p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {countryShareData.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 앱별 점유율 */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2 font-semibold">앱별 점유율</p>
            {appShareData.length > 0 ? (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appShareData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={60} />
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        `${value}개 (${props.payload.percentage}%)`,
                        '스캔 수'
                      ]}
                    />
                    <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                      {appShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">데이터 없음</p>
            )}
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-auto relative" style={{ maxHeight: '300px' }}>
          <table className="w-full caption-bottom text-base border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead className="sticky top-0 bg-background z-10">
                <tr className="border-b">
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '12%' }}>이미지</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>IDX</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '14%' }}>국가</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '14%' }}>앱종류</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>검출종류</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>제보자</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map((scan) => (
                  <tr 
                    key={scan.id} 
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedScan(scan)}
                  >
                    <td className="p-2 align-middle text-center">
                      {scan.imageUrl ? (
                        <div className="w-12 h-12 relative rounded overflow-hidden mx-auto">
                          <img
                            src={scan.imageUrl}
                            alt={`비정상 스캔 ${scan.id}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground mx-auto">
                          이미지
                        </div>
                      )}
                    </td>
                    <td className="p-2 align-middle text-center font-medium">{scan.id}</td>
                    <td className="p-2 align-middle text-center">{scan.country}</td>
                    <td className="p-2 align-middle text-center">{scan.appType}</td>
                    <td className="p-2 align-middle text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                        scan.detectionType === "중간이탈" 
                          ? "bg-orange-100 text-orange-800" 
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {scan.detectionType}
                      </span>
                    </td>
                    <td className="p-2 align-middle text-center">{scan.reporter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* 상세보기 Dialog */}
      <Dialog open={!!selectedScan} onOpenChange={(open) => !open && setSelectedScan(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>비정상 스캔 상세보기</DialogTitle>
          </DialogHeader>
          {selectedScan && (
            <div className="space-y-4">
              {/* 이미지 영역 */}
              <div className="w-full">
                {selectedScan.imageUrl ? (
                  <div className="w-full max-h-[600px] relative rounded-lg overflow-hidden border">
                    <img
                      src={selectedScan.imageUrl}
                      alt={`비정상 스캔 ${selectedScan.id}`}
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
                  <p className="font-semibold">{selectedScan.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">국가</p>
                  <p className="font-semibold">{selectedScan.country}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">앱종류</p>
                  <p className="font-semibold">{selectedScan.appType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">검출종류</p>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    selectedScan.detectionType === "중간이탈" 
                      ? "bg-orange-100 text-orange-800" 
                      : "bg-purple-100 text-purple-800"
                  }`}>
                    {selectedScan.detectionType}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">제보자</p>
                  <p className="font-semibold">{selectedScan.reporter}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

