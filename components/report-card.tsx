"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ReportItem } from "@/lib/report-data"
import { fetchReportSummary, fetchCountryDistribution, fetchReportList, fetchReportCountryShare, formatDateForAPI, getTodayDateString, ReportSummary, CountryDistributionData, CountryShareData, ReportListItem } from "@/lib/api"
import { getAppTypeLabel, getRegGubunLabel, getRegGubunStyle, getAppTypeValue } from "@/lib/type-mappings"
import { useDateRange } from "@/hooks/use-date-range"

interface ReportCardProps {
  reports?: ReportItem[]
}

export function ReportCard({ reports = [] }: ReportCardProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("전체")
  const [selectedApp, setSelectedApp] = useState<string>("전체")
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)
  const [currentOffset, setCurrentOffset] = useState<number>(0)
  const [hasNextPage, setHasNextPage] = useState<boolean>(false)
  const itemsPerPage = 20
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null) // 전체 데이터용
  const [filteredReportSummary, setFilteredReportSummary] = useState<ReportSummary | null>(null) // 필터링된 데이터용 (앱별 점유율)
  const [countryShareData, setCountryShareData] = useState<CountryShareData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentFilterCountry, setCurrentFilterCountry] = useState<string | null>(null)
  const prevSelectedCountryRef = useRef<string | null>(null)
  const [reportList, setReportList] = useState<ReportListItem[]>([])
  const [totalReportCount, setTotalReportCount] = useState<number>(0)
  const [loadingList, setLoadingList] = useState(false)

  // 전역 날짜 범위 사용
  const { dateRange } = useDateRange()
  
  // 클라이언트에서만 오늘 날짜 가져오기 (Hydration 오류 방지)
  const [todayDate, setTodayDate] = useState<string>('2025-01-01')
  useEffect(() => {
    setTodayDate(getTodayDateString())
  }, [])
  
  // 날짜 범위를 문자열로 변환
  const startDate = dateRange?.from ? formatDateForAPI(dateRange.from) : '2025-01-01'
  const endDate = dateRange?.to ? formatDateForAPI(dateRange.to) : todayDate

  // 국가 선택 처리 (같은 국가를 다시 클릭하면 "전체"로 변경)
  useEffect(() => {
    const prevCountry = prevSelectedCountryRef.current
    
    if (selectedCountry === prevCountry && selectedCountry !== "전체" && selectedCountry !== null) {
      // 같은 국가를 다시 클릭한 경우 "전체"로 변경
      setCurrentFilterCountry(null)
      prevSelectedCountryRef.current = null
    } else {
      // 새로운 국가 선택
      const filterCountry = selectedCountry === "전체" ? null : selectedCountry
      setCurrentFilterCountry(filterCountry)
      prevSelectedCountryRef.current = selectedCountry
    }
  }, [selectedCountry])

  // API에서 제보하기 요약 데이터 가져오기 (전체 데이터)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [summary, countryDistribution, countryShare] = await Promise.all([
          fetchReportSummary(startDate, endDate, null), // 전체 데이터
          fetchCountryDistribution(startDate, endDate), // 국가 필터용
          fetchReportCountryShare(startDate, endDate) // 국가별 점유율 (상위 5개)
        ])
        setReportSummary(summary)
        setCountryShareData(countryShare)
      } catch (error) {
        console.error('Failed to load report data:', error)
        setReportSummary({
          reportCount: 0,
          growthRate: 0,
          htRatio: 0,
          copRatio: 0,
          globalRatio: 0
        })
        setCountryShareData([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [startDate, endDate])

  // 필터링된 국가의 앱별 점유율 데이터 가져오기
  useEffect(() => {
    const loadFilteredData = async () => {
      if (!currentFilterCountry) {
        // 필터가 없으면 전체 데이터 사용
        setFilteredReportSummary(null)
        return
      }
      
      try {
        const summary = await fetchReportSummary(startDate, endDate, currentFilterCountry)
        setFilteredReportSummary(summary)
      } catch (error) {
        console.error('Failed to load filtered report data:', error)
        setFilteredReportSummary(null)
      }
    }
    loadFilteredData()
  }, [startDate, endDate, currentFilterCountry])

  // 제보하기 리스트 가져오기
  useEffect(() => {
    const loadReportList = async () => {
      setLoadingList(true)
      try {
        const filterCountry = selectedCountry === "전체" ? null : selectedCountry
        const filterAppType = selectedApp === "전체" ? null : getAppTypeValue(selectedApp)
        const currentPage = Math.floor(currentOffset / itemsPerPage) + 1
        console.log(`📡 제보하기 리스트 가져오기 (offset: ${currentOffset}, pageSize: ${itemsPerPage}, 현재 페이지: ${currentPage}, 국가: ${filterCountry || '전체'}, 앱: ${selectedApp}, 날짜: ${startDate} ~ ${endDate})`)
        const response = await fetchReportList(
          startDate,
          endDate,
          filterCountry,
          filterAppType,
          itemsPerPage,
          currentOffset
        )
        console.log(`✅ 제보하기 리스트 응답: ${response.data.length}개 항목`)
        
        // 응답 데이터가 pageSize보다 작으면 마지막 페이지
        const hasMore = response.data.length === itemsPerPage
        setHasNextPage(hasMore)
        setReportList(response.data)
        
        // total이 있으면 사용, 없으면 현재 offset + 데이터 개수로 추정
        if (response.total > 0) {
          setTotalReportCount(response.total)
        } else {
          // total이 없으면 현재까지의 최대값으로 추정
          setTotalReportCount(currentOffset + response.data.length)
        }
      } catch (error) {
        console.error('❌ Failed to load report list:', error)
        setReportList([])
        setTotalReportCount(0)
        setHasNextPage(false)
      } finally {
        setLoadingList(false)
      }
    }
    loadReportList()
  }, [currentOffset, startDate, endDate, selectedCountry, selectedApp, itemsPerPage])

  // 현재 페이지 계산 (offset 기반)
  const currentPage = Math.floor(currentOffset / itemsPerPage) + 1
  const totalPages = totalReportCount > 0 ? Math.ceil(totalReportCount / itemsPerPage) : currentPage + (hasNextPage ? 1 : 0)
  console.log(`📄 페이지네이션 정보: offset=${currentOffset}, currentPage=${currentPage}, hasNextPage=${hasNextPage}, totalPages=${totalPages}`)

  // 제보 건수 (API 데이터 사용)
  const reportCount = reportSummary?.reportCount ?? 0
  
  // 제보 국가 수 (API 데이터에서 계산)
  const uniqueCountries = new Set(reportList.map(r => r.country))

  // 증감률 (API 데이터 사용)
  const reportCountChange = reportSummary?.growthRate ?? 0

  // 사용 가능한 국가 목록 (중복 제거) - countryDistribution에서 가져오기
  const [countryDistributionData, setCountryDistributionData] = useState<CountryDistributionData[]>([])
  
  // 국가 분포도 데이터 가져오기 (필터용)
  useEffect(() => {
    const loadCountryDistribution = async () => {
      try {
        const data = await fetchCountryDistribution(startDate, endDate)
        setCountryDistributionData(data)
      } catch (error) {
        console.error('Failed to load country distribution:', error)
        setCountryDistributionData([])
      }
    }
    loadCountryDistribution()
  }, [startDate, endDate])
  
  const availableCountries = useMemo(() => {
    return countryDistributionData
      .map(item => item.regCountry)
      .filter(country => country && country.trim() !== '') // 빈 문자열 제거
      .filter((country, index, self) => self.indexOf(country) === index) // 중복 제거
  }, [countryDistributionData])
  
  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentOffset(0)
  }, [selectedCountry, selectedApp, startDate, endDate])
  
  // 날짜 변경 시 선택된 국가가 유효한지 확인하고, 없으면 "전체"로 리셋
  useEffect(() => {
    if (selectedCountry !== "전체" && !availableCountries.includes(selectedCountry)) {
      setSelectedCountry("전체")
    }
  }, [availableCountries, selectedCountry])
  const countryCount = availableCountries.length
  // 앱별 점유율 계산 (필터링된 데이터 우선 사용, 없으면 전체 데이터 사용)
  const appShareData = useMemo(() => {
    const summaryToUse = filteredReportSummary || reportSummary
    
    if (summaryToUse) {
      return [
        { name: "HT", value: Math.round((summaryToUse.htRatio / 100) * (summaryToUse.reportCount || 0)), percentage: summaryToUse.htRatio },
        { name: "COP", value: Math.round((summaryToUse.copRatio / 100) * (summaryToUse.reportCount || 0)), percentage: summaryToUse.copRatio },
        { name: "Global", value: Math.round((summaryToUse.globalRatio / 100) * (summaryToUse.reportCount || 0)), percentage: summaryToUse.globalRatio }
      ]
    }
    
    // 기본 데이터 (fallback)
    const appCounts: Record<string, number> = {}
    reportList.forEach(report => {
      appCounts[report.appType] = (appCounts[report.appType] || 0) + 1
    })
    const total = reportList.length
    return Object.entries(appCounts)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: total > 0 ? ((count / total) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value)
  }, [reportList, reportSummary, filteredReportSummary])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

  return (
    <Card className="p-4 bg-card border-border transition-all flex flex-col h-full">
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">제보 내역</h3>
          
        </div>
        
        {/* 상단 통계 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">제보 건수</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{reportCount.toLocaleString()}개</p>
              <div className={`flex items-center gap-1 text-sm ${reportCountChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportCountChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{reportCountChange >= 0 ? '+' : ''}{reportCountChange.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">제보 국가</p>
            <p className="text-2xl font-bold">{countryCount}개국</p>
          </div>
        </div>

        {/* 국가별/앱별 점유율 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 국가별 점유율 */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2 font-semibold">국가별 점유율</p>
            {countryShareData.length > 0 ? (
              <>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={countryShareData.map(item => ({ name: item.name, value: item.value, percentage: item.percentage }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {countryShareData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              // 국가 클릭 시 해당 국가로 필터링
                              setSelectedCountry(entry.name)
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${name} : ${value}개 (${props.payload.percentage?.toFixed(1) || 0}%)`,
                          
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {countryShareData.map((item, index) => (
                    <div 
                      key={item.name} 
                      className="flex items-center gap-1 text-xs cursor-pointer hover:opacity-70"
                      onClick={() => {
                        // 국가 클릭 시 해당 국가로 필터링
                        setSelectedCountry(item.name)
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">데이터 없음</p>
            )}
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
                        `${props.payload.percentage}%`
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
        <div className="flex items-center gap-2">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[120px] border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                <SelectItem value="전체" className="cursor-pointer hover:bg-blue-50">전체</SelectItem>
                {availableCountries.filter(country => country && country.trim() !== '').map(country => (
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
        {/* 테이블 */}
        <div className="overflow-auto relative" style={{ maxHeight: '300px' }}>
          <table className="w-full caption-bottom text-base border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead className="sticky top-0 bg-background z-10">
                <tr className="border-b">
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '12%' }}>제품</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>IDX</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '14%' }}>국가</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '14%' }}>앱종류</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>제보종류</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '17%' }}>제보자</th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground bg-background" style={{ width: '20%' }}>제보 시각</th>
                </tr>
              </thead>
              <tbody>
                {loadingList ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      로딩 중...
                    </td>
                  </tr>
                ) : reportList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  reportList.map((report, index) => {
                    const imgBaseUrl = process.env.NEXT_PUBLIC_API_IMG_URL || ''
                    const labelImgUrl = report.labelImg ? `${imgBaseUrl}${report.labelImg}` : null
                    const itemImgUrl = report.itemImg ? `${imgBaseUrl}${report.itemImg}` : null
                    
                    // 고유한 키 생성: offset과 인덱스를 조합
                    const uniqueKey = `${currentOffset}-${index}-${report.idx}`
                    
                    return (
                      <tr 
                        key={uniqueKey} 
                        className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          // ReportItem 형식으로 변환하여 상세보기 표시
                          setSelectedReport({
                            id: report.idx,
                            country: report.country,
                            appType: getAppTypeLabel(report.appType) as any,
                            reportType: getRegGubunLabel(report.regGubun) as "검출" | "제보" | "기타",
                            reporter: report.member,
                            imageUrl: labelImgUrl || itemImgUrl || undefined,
                            reportTime: report.reportTime
                          })
                        }}
                      >
                       
                        <td className="p-2 align-middle text-center">
                          {itemImgUrl ? (
                            <div className="w-12 h-12 relative rounded overflow-hidden mx-auto">
                              <img
                                src={itemImgUrl}
                                alt={`제품 ${report.idx}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  const fallback = e.currentTarget.parentElement?.querySelector('.fallback-item')
                                  if (fallback) fallback.classList.remove('hidden')
                                }}
                              />
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground mx-auto hidden fallback-item">
                                제품
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground mx-auto">
                              제품
                            </div>
                          )}
                        </td>
                        <td className="p-2 align-middle text-center font-medium" style={{ maxWidth: '20%' }}>
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={String(report.idx)}>
                            {report.idx}
                          </div>
                        </td>
                        <td className="p-2 align-middle text-center" style={{ maxWidth: '14%' }}>
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={report.country}>
                            {report.country}
                          </div>
                        </td>
                        <td className="p-2 align-middle text-center">{getAppTypeLabel(report.appType)}</td>
                        <td className="p-2 align-middle text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${getRegGubunStyle(report.regGubun).bg} ${getRegGubunStyle(report.regGubun).text}`}>
                            {getRegGubunLabel(report.regGubun)}
                          </span>
                        </td>
                        <td className="p-2 align-middle text-center" style={{ maxWidth: '20%' }}>
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={report.member}>
                            {report.member}
                          </div>
                        </td>
                        <td className="p-2 align-middle text-center">
                          {report.reportTime 
                            ? new Date(report.reportTime).toLocaleString('ko-KR', { 
                                year: '2-digit', 
                                month: '2-digit', 
                                day: '2-digit', 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false
                              }).replace(/\. /g, '.').replace(/\.$/, '')
                            : '-'}
                        </td>
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
                  ? `1-${reportList.length}개 표시`
                  : `${currentOffset + 1}-${currentOffset + reportList.length}개 표시`
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
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">제보 시각</p>
                  <p className="font-semibold">
                    {selectedReport.reportTime 
                      ? new Date(selectedReport.reportTime).toLocaleString('ko-KR', { 
                          year: '2-digit', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false
                        }).replace(/\. /g, '.').replace(/\.$/, '')
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
