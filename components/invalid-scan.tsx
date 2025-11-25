"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { sampleInvalidScans, InvalidScanItem } from "@/lib/invalid-scan-data"
import { fetchInvalidScanList, formatDateForAPI, InvalidScanListItem } from "@/lib/api"
import { useDateRange } from "@/hooks/use-date-range"

interface InvalidScanProps {
  invalidScans?: InvalidScanItem[]
}

export function InvalidScan({ invalidScans = [] }: InvalidScanProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("전체")
  const [selectedApp, setSelectedApp] = useState<string>("전체")
  const [selectedScan, setSelectedScan] = useState<InvalidScanItem | null>(null)
  const [currentOffset, setCurrentOffset] = useState<number>(0)
  const [hasNextPage, setHasNextPage] = useState<boolean>(false)
  const itemsPerPage = 20
  const [scanList, setScanList] = useState<InvalidScanListItem[]>([])
  const [totalScanCount, setTotalScanCount] = useState<number>(0)
  const [loadingList, setLoadingList] = useState(false)

  // 전역 날짜 범위 사용
  const { dateRange } = useDateRange()
  
  // 날짜 범위를 문자열로 변환
  const startDate = dateRange?.from ? formatDateForAPI(dateRange.from) : '2025-01-01'
  const endDate = dateRange?.to ? formatDateForAPI(dateRange.to) : '2025-11-30'

  // 비정상 스캔 리스트 가져오기
  useEffect(() => {
    const loadInvalidScanList = async () => {
      setLoadingList(true)
      try {
        const filterCountry = selectedCountry === "전체" ? null : selectedCountry
        const filterAppType = selectedApp === "전체" ? null : (selectedApp === "HT" ? 1 : selectedApp === "COP" ? 2 : 20)
        console.log(`📡 비정상 스캔 리스트 가져오기 (offset: ${currentOffset}, pageSize: ${itemsPerPage}, 국가: ${filterCountry || '전체'}, 앱: ${selectedApp}, 날짜: ${startDate} ~ ${endDate})`)
        const response = await fetchInvalidScanList(
          startDate,
          endDate,
          filterCountry,
          filterAppType,
          itemsPerPage,
          currentOffset
        )
        console.log(`✅ 비정상 스캔 리스트 응답: ${response.data.length}개 항목`)
        
        // 응답 데이터가 pageSize보다 작으면 마지막 페이지
        const hasMore = response.data.length === itemsPerPage
        setHasNextPage(hasMore)
        setScanList(response.data)
        
        // total이 있으면 사용, 없으면 현재 offset + 데이터 개수로 추정
        if (response.total && response.total > 0) {
          setTotalScanCount(response.total)
        } else {
          setTotalScanCount(currentOffset + response.data.length)
        }
      } catch (error) {
        console.error('❌ Failed to load invalid scan list:', error)
        setScanList([])
        setTotalScanCount(0)
        setHasNextPage(false)
      } finally {
        setLoadingList(false)
      }
    }
    loadInvalidScanList()
  }, [currentOffset, startDate, endDate, selectedCountry, selectedApp, itemsPerPage])

  // 현재 페이지 계산 (offset 기반)
  const currentPage = Math.floor(currentOffset / itemsPerPage) + 1

  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentOffset(0)
  }, [selectedCountry, selectedApp])

  // 비정상 스캔 건수 (API 데이터 사용)
  const scanCount = totalScanCount > 0 ? totalScanCount : scanList.length
  
  // 스캔 국가 수 (API 데이터에서 계산)
  const uniqueCountries = new Set(scanList.map(s => s.country))
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

  // 사용 가능한 국가 목록 (중복 제거) - API 데이터에서 계산
  const availableCountries = Array.from(new Set(scanList.map(s => s.country)))

  // 국가별 점유율 계산 (API 데이터 사용)
  const countryShareData = useMemo(() => {
    const countryCounts: Record<string, number> = {}
    scanList.forEach(scan => {
      countryCounts[scan.country] = (countryCounts[scan.country] || 0) + 1
    })
    const total = scanList.length
    return Object.entries(countryCounts)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // 상위 5개 국가만 표시
  }, [scanList])

  // 앱별 점유율 계산 (API 데이터 사용)
  const appShareData = useMemo(() => {
    const appCounts: Record<string, number> = {}
    scanList.forEach(scan => {
      const appName = scan.appType === 1 ? 'HT' : scan.appType === 2 ? 'COP' : 'Global'
      appCounts[appName] = (appCounts[appName] || 0) + 1
    })
    const total = scanList.length
    return Object.entries(appCounts)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value)
  }, [scanList])

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
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>국가</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '14%' }}>앱종류</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>검출종류</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>일자</th>
                </tr>
              </thead>
              <tbody>
                {loadingList ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      로딩 중...
                    </td>
                  </tr>
                ) : scanList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  scanList.map((scan, index) => {
                    const imgBaseUrl = process.env.NEXT_PUBLIC_API_IMG_URL || ''
                    const imageUrl = scan.imageUrl ? `${imgBaseUrl}${scan.imageUrl}` : null
                    const appTypeName = scan.appType === 1 ? 'HT' : scan.appType === 2 ? 'COP' : 'Global'
                    const detDateTime = scan.detDate && scan.detTime 
                      ? `${scan.detDate} ${scan.detTime}`
                      : scan.detDate || scan.detTime || '-'
                    
                    // 고유한 키 생성: offset과 인덱스를 조합
                    const uniqueKey = `${currentOffset}-${index}`
                    
                    return (
                      <tr 
                        key={uniqueKey} 
                        className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          // InvalidScanItem 형식으로 변환하여 상세보기 표시
                          setSelectedScan({
                            id: index,
                            country: scan.country,
                            appType: appTypeName,
                            detectionType: scan.detectionType as "중간이탈" | "시간경과",
                            reporter: '',
                            imageUrl: imageUrl || undefined,
                            date: scan.detDate ? new Date(scan.detDate) : undefined
                          })
                        }}
                      >
                        <td className="p-2 align-middle text-center">
                          {imageUrl ? (
                            <div className="w-12 h-12 relative rounded overflow-hidden mx-auto">
                              <img
                                src={imageUrl}
                                alt={`비정상 스캔 ${index}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  const fallback = e.currentTarget.parentElement?.querySelector('.fallback-image')
                                  if (fallback) fallback.classList.remove('hidden')
                                }}
                              />
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground mx-auto hidden fallback-image">
                                이미지
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground mx-auto">
                              이미지
                            </div>
                          )}
                        </td>
                        <td className="p-2 align-middle text-center">{scan.country}</td>
                        <td className="p-2 align-middle text-center">{appTypeName}</td>
                        <td className="p-2 align-middle text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                            scan.detectionType === "중간이탈" 
                              ? "bg-orange-100 text-orange-800" 
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {scan.detectionType}
                          </span>
                        </td>
                        <td className="p-2 align-middle text-center">{detDateTime}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
        </div>

        {/* 페이지네이션 */}
        {(currentOffset > 0 || hasNextPage) && (
          <div className="flex items-center justify-center gap-2 mt-4 py-2 border-t pt-4">
            <button
              onClick={() => {
                const newOffset = Math.max(0, currentOffset - itemsPerPage)
                console.log(`⬅️ 이전 페이지 클릭: offset ${currentOffset} -> ${newOffset}`)
                setCurrentOffset(newOffset)
              }}
              disabled={currentOffset === 0}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              이전
            </button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-muted-foreground">
                {currentOffset === 0 
                  ? `1-${scanList.length}개 표시`
                  : `${currentOffset + 1}-${currentOffset + scanList.length}개 표시`
                }
                {hasNextPage}
              </span>
            </div>
            <button
              onClick={() => {
                const newOffset = currentOffset + itemsPerPage
                console.log(`➡️ 다음 페이지 클릭: offset ${currentOffset} -> ${newOffset}`)
                setCurrentOffset(newOffset)
              }}
              disabled={!hasNextPage}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              다음
            </button>
          </div>
        )}
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

