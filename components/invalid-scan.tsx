"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { TrendingUp, TrendingDown, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { InvalidScanItem } from "@/lib/invalid-scan-data"
import { fetchInvalidScanList, fetchInvalidScanSummary, fetchInvalidScanCountryDistribution, formatDateForAPI, getTodayDateString, InvalidScanListItem, InvalidScanCountryShare, CountryDistributionData } from "@/lib/api"
import { getAppTypeLabel, getDetectionTypeLabel, getDetectionTypeStyle, getAppTypeValue } from "@/lib/type-mappings"
import { useDateRange } from "@/hooks/use-date-range"

interface InvalidScanProps {
  invalidScans?: InvalidScanItem[]
}

export function InvalidScan({ invalidScans = [] }: InvalidScanProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("전체")
  const [selectedApp, setSelectedApp] = useState<string>("전체")
  const [countrySearchOpen, setCountrySearchOpen] = useState(false)
  const [countrySearchQuery, setCountrySearchQuery] = useState("")
  const [selectedScan, setSelectedScan] = useState<InvalidScanItem | null>(null)
  const [currentOffset, setCurrentOffset] = useState<number>(0)
  const [hasNextPage, setHasNextPage] = useState<boolean>(false)
  const itemsPerPage = 20
  const [scanList, setScanList] = useState<InvalidScanListItem[]>([])
  const [totalScanCount, setTotalScanCount] = useState<number>(0)
  const [loadingList, setLoadingList] = useState(false)
  const [summaryData, setSummaryData] = useState<{ totalCount: number; growthRate: number; htRatio?: number; copRatio?: number; globalRatio?: number } | null>(null) // 전체 데이터용
  const [filteredSummaryData, setFilteredSummaryData] = useState<{ totalCount: number; growthRate: number; htRatio?: number; copRatio?: number; globalRatio?: number } | null>(null) // 필터링된 데이터용 (앱별 점유율)
  const [apiCountryShareData, setApiCountryShareData] = useState<InvalidScanCountryShare[]>([])
  const [filteredCountry, setFilteredCountry] = useState<string | null>(null) // 추이 그래프 필터링용 국가
  const [currentFilterCountry, setCurrentFilterCountry] = useState<string | null>(null) // 앱별 점유율 필터링용 국가
  const [countryDistributionData, setCountryDistributionData] = useState<CountryDistributionData[]>([])
  const prevSelectedCountryRef = useRef<string | null>(null)

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
    
    if (filteredCountry === prevCountry && filteredCountry !== null) {
      // 같은 국가를 다시 클릭한 경우 "전체"로 변경
      setCurrentFilterCountry(null)
      prevSelectedCountryRef.current = null
    } else {
      // 새로운 국가 선택
      setCurrentFilterCountry(filteredCountry)
      prevSelectedCountryRef.current = filteredCountry
    }
  }, [filteredCountry])

  // 비정상 스캔 요약 데이터 가져오기 (전체 데이터)
  useEffect(() => {
    const loadSummary = async () => {
      try {
        console.log(`📡 [비정상스캔-요약] 전체 데이터 요청: ${startDate} ~ ${endDate}`)
        const response = await fetchInvalidScanSummary(startDate, endDate, null)
        console.log(`✅ [비정상스캔-요약] 전체 데이터 응답: totalCount=${response.summary.totalCount}, growthRate=${response.summary.growthRate}`)
        setSummaryData(response.summary)
        setApiCountryShareData(response.countryShare)
      } catch (error) {
        console.error('❌ Failed to load invalid scan summary:', error)
        setSummaryData(null)
        setApiCountryShareData([])
      }
    }
    loadSummary()
  }, [startDate, endDate])

  // 필터링된 국가의 앱별 점유율 데이터 가져오기
  useEffect(() => {
    const loadFilteredData = async () => {
      if (!currentFilterCountry) {
        // 필터가 없으면 전체 데이터 사용
        setFilteredSummaryData(null)
        return
      }
      
      try {
        console.log(`📡 [비정상스캔-요약] 필터링 데이터 요청: 국가=${currentFilterCountry}`)
        const response = await fetchInvalidScanSummary(startDate, endDate, currentFilterCountry)
        console.log(`✅ [비정상스캔-요약] 필터링 데이터 응답: totalCount=${response.summary.totalCount}`)
        setFilteredSummaryData(response.summary)
      } catch (error) {
        console.error('❌ Failed to load filtered invalid scan summary:', error)
        setFilteredSummaryData(null)
      }
    }
    loadFilteredData()
  }, [startDate, endDate, currentFilterCountry])

  // 비정상 스캔 국가별 분포도 데이터 가져오기 (국가 수 계산용)
  useEffect(() => {
    const loadCountryDistribution = async () => {
      try {
        console.log(`📡 [비정상스캔-분포도] 요청: ${startDate} ~ ${endDate}`)
        const data = await fetchInvalidScanCountryDistribution(startDate, endDate)
        console.log(`✅ [비정상스캔-분포도] 응답: ${data.length}개 국가`)
        setCountryDistributionData(data)
      } catch (error) {
        console.error('❌ Failed to load invalid scan country distribution:', error)
        setCountryDistributionData([])
      }
    }
    loadCountryDistribution()
  }, [startDate, endDate])

  // 비정상 스캔 리스트 가져오기
  useEffect(() => {
    const loadInvalidScanList = async () => {
      setLoadingList(true)
      try {
        const filterCountry = selectedCountry === "전체" ? null : selectedCountry
        const filterAppType = selectedApp === "전체" ? null : getAppTypeValue(selectedApp)
        console.log(`📡 [비정상스캔] 리스트 요청: offset=${currentOffset}, pageSize=${itemsPerPage}, 국가=${filterCountry || '전체'}, 앱=${selectedApp}`)
        const response = await fetchInvalidScanList(
          startDate,
          endDate,
          filterCountry,
          filterAppType,
          itemsPerPage,
          currentOffset
        )
        console.log(`✅ [비정상스캔] 리스트 응답: ${response.data.length}개 항목`)
        
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

  // 비정상 스캔 건수 (API 요약 데이터 우선 사용)
  const scanCount = summaryData?.totalCount || (totalScanCount > 0 ? totalScanCount : scanList.length)
  
  // 스캔 국가 수 (API 분포도 데이터 크기 사용)
  const countryCount = countryDistributionData.length

  // 증감률 (API 요약 데이터 사용)
  const scanCountChange = summaryData?.growthRate || 0

  // 사용 가능한 국가 목록 (API country_distribution 데이터에서 가져오기)
  const availableCountries = useMemo(() => {
    return countryDistributionData
      .map(item => item.regCountry)
      .filter(country => country && country.trim() !== '') // 빈 문자열 제거
      .filter((country, index, self) => self.indexOf(country) === index) // 중복 제거
  }, [countryDistributionData])

  // 국가 검색 필터링
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery) return availableCountries
    return availableCountries.filter(country =>
      country.toLowerCase().includes(countrySearchQuery.toLowerCase())
    )
  }, [availableCountries, countrySearchQuery])
  
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

  // 국가별 점유율 계산 (API 요약 데이터만 사용, 테이블 필터링과 무관)
  const countryShareData = useMemo(() => {
    if (apiCountryShareData.length > 0) {
      // API에서 가져온 국가별 점유율 사용 (전체 데이터, 필터링 없음)
      return apiCountryShareData.slice(0, 5).map(item => ({
        name: item.name,
        value: item.value,
        percentage: typeof item.percentage === 'number' ? item.percentage : parseFloat(String(item.percentage)) || 0
      }))
    }
    
    // API 데이터가 없으면 빈 배열 반환 (테이블 데이터 사용 안 함)
    return []
  }, [apiCountryShareData])

  // 앱별 점유율 계산 (필터링된 데이터 우선 사용, 없으면 전체 데이터 사용)
  const appShareData = useMemo(() => {
    const summaryToUse = filteredSummaryData || summaryData
    
    if (summaryToUse && summaryToUse.htRatio !== undefined && summaryToUse.copRatio !== undefined && summaryToUse.globalRatio !== undefined) {
      // API에서 가져온 요약 데이터 사용
      const totalCount = summaryToUse.totalCount || 0
      return [
        { 
          name: "HT", 
          value: Math.round((summaryToUse.htRatio! / 100) * totalCount), 
          percentage: summaryToUse.htRatio!.toFixed(1) 
        },
        { 
          name: "COP", 
          value: Math.round((summaryToUse.copRatio! / 100) * totalCount), 
          percentage: summaryToUse.copRatio!.toFixed(1) 
        },
        { 
          name: "Global", 
          value: Math.round((summaryToUse.globalRatio! / 100) * totalCount), 
          percentage: summaryToUse.globalRatio!.toFixed(1) 
        }
      ]
    }
    
    // 기본 데이터 (fallback) - scanList에서 계산
    const appCounts: Record<string, number> = {}
    scanList.forEach(scan => {
      const appName = getAppTypeLabel(scan.appType)
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
  }, [summaryData, filteredSummaryData, scanList])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

  return (
    <Card className="p-4 bg-card border-border transition-all flex flex-col h-full">
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">비정상 스캔</h3>
          
        </div>
        
        {/* 상단 통계 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">비정상 스캔 건수</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{scanCount.toLocaleString()}개</p>
              <div className={`flex items-center gap-1 text-sm ${scanCountChange >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
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
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            // 국가 클릭 시 앱별 점유율과 테이블 모두 필터링
                            // 같은 국가를 다시 클릭하면 "전체"로 변경
                            if (currentFilterCountry === entry.name) {
                              setFilteredCountry(null)
                              setSelectedCountry("전체")
                            } else {
                              setFilteredCountry(entry.name)
                              setSelectedCountry(entry.name)
                            }
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => {
                        const percentage = typeof props.payload.percentage === 'number' 
                          ? props.payload.percentage.toFixed(1) 
                          : (props.payload.percentage || '0.0')
                        return `${name} : ${value.toLocaleString()}개 (${percentage}%)`
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">데이터 없음</p>
            )}
            <div className="flex flex-col gap-1 mt-2">
              {/* 첫 번째 줄: 3개 국가 */}
              <div className="flex gap-1">
                {countryShareData.slice(0, 3).map((item, index) => (
                  <div 
                    key={item.name} 
                    className="flex items-center gap-1 text-xs cursor-pointer hover:opacity-70"
                    onClick={() => {
                      // 국가 클릭 시 앱별 점유율과 테이블 모두 필터링
                      // 같은 국가를 다시 클릭하면 "전체"로 변경
                      if (currentFilterCountry === item.name) {
                        setFilteredCountry(null)
                        setSelectedCountry("전체")
                      } else {
                        setFilteredCountry(item.name)
                        setSelectedCountry(item.name)
                      }
                    }}
                  >
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{typeof item.percentage === 'number' ? item.percentage.toFixed(1) : item.percentage}%</span>
                  </div>
                ))}
              </div>
              {/* 두 번째 줄: 2개 국가 */}
              <div className="flex gap-1">
                {countryShareData.slice(3, 5).map((item, index) => (
                  <div 
                    key={item.name} 
                    className="flex items-center gap-1 text-xs cursor-pointer hover:opacity-70"
                    onClick={() => {
                      // 국가 클릭 시 앱별 점유율과 테이블 모두 필터링
                      // 같은 국가를 다시 클릭하면 "전체"로 변경
                      if (currentFilterCountry === item.name) {
                        setFilteredCountry(null)
                        setSelectedCountry("전체")
                      } else {
                        setFilteredCountry(item.name)
                        setSelectedCountry(item.name)
                      }
                    }}
                  >
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{typeof item.percentage === 'number' ? item.percentage.toFixed(1) : item.percentage}%</span>
                  </div>
                ))}
              </div>
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
                        `${props.payload.percentage}%`,
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">국가:</span>
              <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen}>
                <PopoverTrigger asChild>
                  <button
                    role="combobox"
                    aria-expanded={countrySearchOpen}
                    className="w-[120px] justify-between border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500 rounded-md px-3 py-2 text-sm flex items-center gap-2"
                  >
                    <span className="truncate">{selectedCountry || "국가 선택"}</span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="국가 검색..." 
                      value={countrySearchQuery}
                      onValueChange={setCountrySearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="전체"
                          onSelect={() => {
                            setSelectedCountry("전체")
                            setCountrySearchOpen(false)
                            setCountrySearchQuery("")
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCountry === "전체" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          전체
                        </CommandItem>
                        {filteredCountries.map((country) => (
                          <CommandItem
                            key={country}
                            value={country}
                            onSelect={() => {
                              setSelectedCountry(country)
                              setCountrySearchOpen(false)
                              setCountrySearchQuery("")
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCountry === country ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {country}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">앱:</span>
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
                    const appTypeName = getAppTypeLabel(scan.appType)
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
                            detectionType: getDetectionTypeLabel(scan.detectionType) as "중간이탈" | "시간경과",
                            reporter: '',
                            imageUrl: imageUrl || undefined,
                            date: scan.detDate ? new Date(scan.detDate) : undefined,
                            detDate: scan.detDate,
                            detTime: scan.detTime
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
                          <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${getDetectionTypeStyle(scan.detectionType).bg} ${getDetectionTypeStyle(scan.detectionType).text}`}>
                            {getDetectionTypeLabel(scan.detectionType)}
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
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getDetectionTypeStyle(selectedScan.detectionType === "중간이탈" ? "1" : "2").bg} ${getDetectionTypeStyle(selectedScan.detectionType === "중간이탈" ? "1" : "2").text}`}>
                    {selectedScan.detectionType}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">검출시각</p>
                  <p className="font-semibold">
                    {selectedScan.detDate && selectedScan.detTime 
                      ? `${selectedScan.detDate} ${selectedScan.detTime}`
                      : selectedScan.detDate 
                        ? selectedScan.detDate
                        : selectedScan.date
                          ? selectedScan.date.toLocaleString('ko-KR')
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

