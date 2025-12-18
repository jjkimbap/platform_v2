"use client"

import React, { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'

interface CountryData {
  name: string
  value: number
  latitude?: number  // 위도 (선택사항)
  longitude?: number // 경도 (선택사항)
}

interface CountryHeatmapEChartsProps {
  data?: CountryData[]
  height?: string
  title?: string
  onCountrySelect?: (country: string) => void
  selectedCountry?: string
}

function CountryHeatmapECharts({ 
  data = [], 
  height = "h-96",
  title = "국가별 실행 수 히트맵",
  onCountrySelect,
  selectedCountry
}: CountryHeatmapEChartsProps) {
  const [mounted, setMounted] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // CDN에서 세계 지도 GeoJSON 로드
    const loadWorldMap = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        const worldGeoJSON = await response.json()
        
        // ECharts에 지도 등록
        echarts.registerMap('world', worldGeoJSON)
        setMapLoaded(true)
      } catch (error) {
        console.error('Failed to load world map:', error)
        // 지도 로드 실패 시에도 차트는 표시
        setMapLoaded(true)
      }
    }
    
    loadWorldMap()
  }, [])

  // 기본 국가 목록 (사용자가 요청한 국가들)
  const defaultCountries = [
     "중국", "대한민국", "베트남", "태국", "일본", "러시아", "방글라데시", "中国",
    "인도네시아", "카자흐스탄", "말레이시아", "미국", "대만", "이란", "홍콩", "필리핀",
    "싱가포르", "사우디아라비아", "이라크", "우즈베키스탄", "캐나다", "캄보디아", "영국",
    "우크라이나", "이집트", "오스트레일리아", "아프가니스탄", "파키스탄", "키르기스스탄",
    "인도", "독일", "요르단", "알제리", "모로코", "프랑스", "스리랑카", "오만", "라오스",
    "멕시코", "폴란드", "미얀마(버마)", "이탈리아", "쿠웨이트", "나이지리아", "마카오",
    "레바논", "타지키스탄", "네덜란드", "스페인"
  ]

  // 실제 실행 수 데이터
  const generateSampleData = (): CountryData[] => {
    return [
      { name: "없음", value: 61608 },
      { name: "중국", value: 46758 },
      { name: "대한민국", value: 18923 },
      { name: "베트남", value: 16948 },
      { name: "태국", value: 11781 },
      { name: "일본", value: 4335 },
      { name: "러시아", value: 4306 },
      { name: "방글라데시", value: 4203 },
      { name: "中国", value: 4074 },
      { name: "인도네시아", value: 3860 },
      { name: "카자흐스탄", value: 3478 },
      { name: "말레이시아", value: 2400 },
      { name: "미국", value: 1993 },
      { name: "대만", value: 1818 },
      { name: "이란", value: 1779 },
      { name: "홍콩", value: 1622 },
      { name: "필리핀", value: 1560 },
      { name: "싱가포르", value: 1314 },
      { name: "사우디아라비아", value: 1240 },
      { name: "이라크", value: 984 },
      { name: "우즈베키스탄", value: 883 },
      { name: "캐나다", value: 755 },
      { name: "캄보디아", value: 674 },
      { name: "영국", value: 673 },
      { name: "우크라이나", value: 589 },
      { name: "이집트", value: 581 },
      { name: "오스트레일리아", value: 580 },
      { name: "아프가니스탄", value: 560 },
      { name: "파키스탄", value: 504 },
      { name: "키르기스스탄", value: 455 },
      { name: "인도", value: 376 },
      { name: "독일", value: 352 },
      { name: "요르단", value: 286 },
      { name: "알제리", value: 268 },
      { name: "모로코", value: 236 },
      { name: "프랑스", value: 221 },
      { name: "스리랑카", value: 220 },
      { name: "오만", value: 217 },
      { name: "라오스", value: 179 },
      { name: "멕시코", value: 175 },
      { name: "폴란드", value: 173 },
      { name: "미얀마(버마)", value: 159 },
      { name: "이탈리아", value: 154 },
      { name: "쿠웨이트", value: 137 },
      { name: "나이지리아", value: 123 },
      { name: "마카오", value: 117 },
      { name: "레바논", value: 116 },
      { name: "타지키스탄", value: 114 },
      { name: "네덜란드", value: 113 },
      { name: "스페인", value: 105 },
      { name: "韩国", value: 105 }
    ]
  }

  const chartData = data.length > 0 ? data : generateSampleData()

  // GPS 좌표로 국가 인식하는 함수
  const detectCountryFromGPS = (lat: number, lng: number): string | null => {
    // 국가별 대략적인 경계 좌표 (실제로는 GeoJSON의 polygon으로 체크해야 함)
    // 예시: 간단한 사각형 기반 체크
    const countryBounds: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
      "중국": { minLat: 18.0, maxLat: 54.0, minLng: 73.0, maxLng: 135.0 },
      "대한민국": { minLat: 33.0, maxLat: 43.0, minLng: 124.0, maxLng: 132.0 },
      "일본": { minLat: 24.0, maxLat: 46.0, minLng: 123.0, maxLng: 146.0 },
      "베트남": { minLat: 8.0, maxLat: 23.0, minLng: 102.0, maxLng: 109.0 },
      "태국": { minLat: 5.0, maxLat: 21.0, minLng: 97.0, maxLng: 106.0 },
      "미국": { minLat: 25.0, maxLat: 50.0, minLng: -125.0, maxLng: -65.0 },
      "인도": { minLat: 6.0, maxLat: 36.0, minLng: 68.0, maxLng: 97.0 },
      "러시아": { minLat: 41.0, maxLat: 82.0, minLng: 19.0, maxLng: 180.0 },
    }

    for (const [country, bounds] of Object.entries(countryBounds)) {
      if (lat >= bounds.minLat && lat <= bounds.maxLat && 
          lng >= bounds.minLng && lng <= bounds.maxLng) {
        return country
      }
    }
    return null
  }

  // GPS 값이 있는 데이터 처리: "없음"을 실제 국가로 변경
  const processedData = chartData.map(item => {
    // NaN이나 undefined 값 처리
    const value = (item.value != null && !isNaN(item.value)) ? item.value : 0
    
    if (item.name === "없음" && item.latitude && item.longitude) {
      const detectedCountry = detectCountryFromGPS(item.latitude, item.longitude)
      if (detectedCountry) {
        return { ...item, name: detectedCountry, value }
      }
    }
    return { ...item, value }
  })

  // 같은 국가끼리 합치기
  const aggregatedData: Record<string, CountryData> = {}
  processedData.forEach(item => {
    const value = (item.value && !isNaN(item.value)) ? item.value : 0
    if (aggregatedData[item.name]) {
      aggregatedData[item.name].value = ((aggregatedData[item.name].value && !isNaN(aggregatedData[item.name].value)) ? aggregatedData[item.name].value : 0) + value
    } else {
      aggregatedData[item.name] = { ...item, value }
    }
  })

  const finalData = Object.values(aggregatedData)
  
  // 실행 수가 많은 순으로 정렬
  const sortedData = [...finalData].sort((a, b) => b.value - a.value)

  const handleChartClick = (params: any) => {
    if (onCountrySelect && params.componentType === 'series') {
      // 지도에서 클릭한 경우
      if (params.seriesType === 'map') {
        const koreanName = koreanCountryNames[params.name] || params.name
        onCountrySelect(koreanName)
      }
      // 막대 차트에서 클릭한 경우
      else if (params.seriesType === 'bar') {
        onCountrySelect(params.name)
      }
    }
  }

  // 국가별 지도 데이터 (국가명을 영어로 매핑) - 남극대륙 제외
  const countryMapData = [
    { name: "China", value: (() => { const v = chartData.find(d => d.name === "중국" || d.name === "中国")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "South Korea", value: (() => { const v = chartData.find(d => d.name === "대한민국")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Vietnam", value: (() => { const v = chartData.find(d => d.name === "베트남")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Thailand", value: (() => { const v = chartData.find(d => d.name === "태국")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Japan", value: (() => { const v = chartData.find(d => d.name === "일본")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Russia", value: (() => { const v = chartData.find(d => d.name === "러시아")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Bangladesh", value: (() => { const v = chartData.find(d => d.name === "방글라데시")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Indonesia", value: (() => { const v = chartData.find(d => d.name === "인도네시아")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Kazakhstan", value: (() => { const v = chartData.find(d => d.name === "카자흐스탄")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Malaysia", value: (() => { const v = chartData.find(d => d.name === "말레이시아")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "United States", value: (() => { const v = chartData.find(d => d.name === "미국")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Taiwan", value: (() => { const v = chartData.find(d => d.name === "대만")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Iran", value: (() => { const v = chartData.find(d => d.name === "이란")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Hong Kong", value: (() => { const v = chartData.find(d => d.name === "홍콩")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Philippines", value: (() => { const v = chartData.find(d => d.name === "필리핀")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Singapore", value: (() => { const v = chartData.find(d => d.name === "싱가포르")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Saudi Arabia", value: (() => { const v = chartData.find(d => d.name === "사우디아라비아")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Iraq", value: (() => { const v = chartData.find(d => d.name === "이라크")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Uzbekistan", value: (() => { const v = chartData.find(d => d.name === "우즈베키스탄")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Canada", value: (() => { const v = chartData.find(d => d.name === "캐나다")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Cambodia", value: (() => { const v = chartData.find(d => d.name === "캄보디아")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "United Kingdom", value: (() => { const v = chartData.find(d => d.name === "영국")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Ukraine", value: (() => { const v = chartData.find(d => d.name === "우크라이나")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Egypt", value: (() => { const v = chartData.find(d => d.name === "이집트")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Australia", value: (() => { const v = chartData.find(d => d.name === "오스트레일리아")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Afghanistan", value: (() => { const v = chartData.find(d => d.name === "아프가니스탄")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Pakistan", value: (() => { const v = chartData.find(d => d.name === "파키스탄")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Kyrgyzstan", value: (() => { const v = chartData.find(d => d.name === "키르기스스탄")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "India", value: (() => { const v = chartData.find(d => d.name === "인도")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Germany", value: (() => { const v = chartData.find(d => d.name === "독일")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Jordan", value: (() => { const v = chartData.find(d => d.name === "요르단")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Algeria", value: (() => { const v = chartData.find(d => d.name === "알제리")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Morocco", value: (() => { const v = chartData.find(d => d.name === "모로코")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "France", value: (() => { const v = chartData.find(d => d.name === "프랑스")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Sri Lanka", value: (() => { const v = chartData.find(d => d.name === "스리랑카")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Oman", value: (() => { const v = chartData.find(d => d.name === "오만")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Laos", value: (() => { const v = chartData.find(d => d.name === "라오스")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Mexico", value: (() => { const v = chartData.find(d => d.name === "멕시코")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Poland", value: (() => { const v = chartData.find(d => d.name === "폴란드")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Myanmar", value: (() => { const v = chartData.find(d => d.name === "미얀마(버마)")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Italy", value: (() => { const v = chartData.find(d => d.name === "이탈리아")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Kuwait", value: (() => { const v = chartData.find(d => d.name === "쿠웨이트")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Nigeria", value: (() => { const v = chartData.find(d => d.name === "나이지리아")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Macao", value: (() => { const v = chartData.find(d => d.name === "마카오")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Lebanon", value: (() => { const v = chartData.find(d => d.name === "레바논")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Tajikistan", value: (() => { const v = chartData.find(d => d.name === "타지키스탄")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Netherlands", value: (() => { const v = chartData.find(d => d.name === "네덜란드")?.value; return (v != null && !isNaN(v)) ? v : 0; })() },
    { name: "Spain", value: (() => { const v = chartData.find(d => d.name === "스페인")?.value; return (v != null && !isNaN(v)) ? v : 0; })() }
  ].filter(item => item.name !== "Antarctica") // 남극대륙 제외

  // 한국어 국가명 매핑
  const koreanCountryNames: { [key: string]: string } = {
    "China": "중국",
    "South Korea": "대한민국", 
    "Vietnam": "베트남",
    "Thailand": "태국",
    "Japan": "일본",
    "Russia": "러시아",
    "Bangladesh": "방글라데시",
    "Indonesia": "인도네시아",
    "Kazakhstan": "카자흐스탄",
    "Malaysia": "말레이시아",
    "United States": "미국",
    "Taiwan": "대만",
    "Iran": "이란",
    "Hong Kong": "홍콩",
    "Philippines": "필리핀",
    "Singapore": "싱가포르",
    "Saudi Arabia": "사우디아라비아",
    "Iraq": "이라크",
    "Uzbekistan": "우즈베키스탄",
    "Canada": "캐나다",
    "Cambodia": "캄보디아",
    "United Kingdom": "영국",
    "Ukraine": "우크라이나",
    "Egypt": "이집트",
    "Australia": "오스트레일리아",
    "Afghanistan": "아프가니스탄",
    "Pakistan": "파키스탄",
    "Kyrgyzstan": "키르기스스탄",
    "India": "인도",
    "Germany": "독일",
    "Jordan": "요르단",
    "Algeria": "알제리",
    "Morocco": "모로코",
    "France": "프랑스",
    "Sri Lanka": "스리랑카",
    "Oman": "오만",
    "Laos": "라오스",
    "Mexico": "멕시코",
    "Poland": "폴란드",
    "Myanmar": "미얀마(버마)",
    "Italy": "이탈리아",
    "Kuwait": "쿠웨이트",
    "Nigeria": "나이지리아",
    "Macao": "마카오",
    "Lebanon": "레바논",
    "Tajikistan": "타지키스탄",
    "Netherlands": "네덜란드",
    "Spain": "스페인"
  }

  // 최대값 계산
  const maxValue = Math.max(...countryMapData.map(item => (item.value && !isNaN(item.value)) ? item.value : 0), 0)
  
  // 색상에 따른 텍스트 색상 결정 함수
  const getTextColor = (value: number): string => {
    if (maxValue === 0) return '#000'
    const ratio = value / maxValue
    
    // visualMap 색상: ['#e6f3ff', '#1890ff', '#0050b3', '#003a8c', '#002766']
    // 진한 색상(ratio >= 0.6): 흰색, 연한 색상(ratio < 0.6): 검정색
    if (ratio >= 0.6) {
      return '#ffffff' // 진한 색상일 때 흰색
    } else {
      return '#000000' // 연한 색상일 때 검정색
    }
  }

  const mapOption = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        const koreanName = koreanCountryNames[params.name] || params.name
        const value = (params.value != null && !isNaN(params.value)) ? params.value : 0
        return `${koreanName}: ${value.toLocaleString()}회 실행`
      }
    },
    visualMap: {
      min: 0,
      max: maxValue,
      left: 'left',
      top: 'bottom',
      text: ['높음', '낮음'],
      calculable: true,
      inRange: {
        color: ['#e6f3ff', '#1890ff', '#0050b3', '#003a8c', '#002766']
      },
      textStyle: {
        color: '#333'
      }
    },
    toolbox: {
      show: true,
      orient: 'vertical',
      left: 'right',
      top: 'center',
      feature: {
        restore: {
          title: '원래대로'
        },
        saveAsImage: {
          title: '이미지 저장'
        }
      }
    },
    series: [
      {
        name: '국가별 실행 수',
        type: 'map',
        map: 'world',
        data: countryMapData,
        roam: true, // 확대/축소 및 드래그 허용
        scaleLimit: {
          min: 1,
          max: 4
        },
        zoom: 5.2, // 기본 확대 레벨을 더 크게 설정
        center: [60, 40], // 더 가운데 배치 (동경 120도, 북위 20도)
        emphasis: {
          label: {
            show: true,
            color: function(params: any) {
              const rawValue = params.data?.value || params.value || 0
              const value = (rawValue != null && !isNaN(rawValue)) ? rawValue : 0
              return getTextColor(value)
            },
            formatter: function(params: any) {
              const koreanName = koreanCountryNames[params.name] || params.name
              const rawValue = params.data?.value || params.value || 0
              const value = (rawValue != null && !isNaN(rawValue)) ? rawValue : 0
              return `${koreanName}\n${value.toLocaleString()}`
            }
          },
          itemStyle: {
            areaColor: undefined // 호버 시 색상 변경 비활성화
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
          areaColor: function(params: any) {
            // 선택된 국가 강조 비활성화
            return undefined
          }
        },
        label: {
          show: false // 기본적으로는 숨김, 마우스 오버 시에만 표시
        },
        select: {
          itemStyle: {
            areaColor: '#ff6b6b'
          },
          label: {
            show: true,
            color: '#ffffff', // 선택된 국가는 항상 흰색
            formatter: function(params: any) {
              const koreanName = koreanCountryNames[params.name] || params.name
              const rawValue = params.data?.value || params.value || 0
              const value = (rawValue != null && !isNaN(rawValue)) ? rawValue : 0
              return `${koreanName}\n${value.toLocaleString()}`
            }
          }
        }
      }
    ]
  }

  // 국가별 막대 차트 옵션 (대안)
  const barChartOption = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        return `${params[0].name}: ${params[0].value.toLocaleString()}회 실행`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sortedData.map(item => item.name),
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: '실행 수',
      nameLocation: 'middle',
      nameGap: 50
    },
    series: [
      {
        name: '실행 수',
        type: 'bar',
        data: sortedData.map(item => item.value),
        itemStyle: {
          color: function(params: any) {
            // 값에 따라 색상 그라데이션 적용
            const maxValue = Math.max(...sortedData.map(item => item.value))
            const ratio = params.value / maxValue
            
            if (ratio >= 0.8) return '#ff4d4f'
            if (ratio >= 0.6) return '#ff7a45'
            if (ratio >= 0.4) return '#ffa940'
            if (ratio >= 0.2) return '#ffec3d'
            return '#bae637'
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  if (!mounted || !mapLoaded) {
    return (
      <div className={`${height} flex flex-col`}>
        <h3 className="text-xl font-semibold mb-4">
          {title}
        </h3>
        <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-lg font-semibold mb-2">지도 로딩 중...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${height} flex flex-col`}>
      <h3 className="text-xl font-semibold mb-4">
        {title}
      </h3>
      <div className="flex-1">
        <ReactECharts 
          option={mapOption} 
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          onEvents={{
            click: handleChartClick
          }}
        />
      </div>
    </div>
  )
}

export default CountryHeatmapECharts
