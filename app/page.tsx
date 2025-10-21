"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ActivityMetrics } from "@/components/activity-metrics"
import { TrendChartsSection } from "@/components/trend-charts-section"
import { RankingAccordions } from "@/components/ranking-accordions"
import { useState } from "react"
import { MetricModal } from "@/components/metric-modal"
import { TrendChart } from "@/components/trend-chart"

export default function DashboardPage() {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [marketRegistrationModalOpen, setMarketRegistrationModalOpen] = useState(false)
  const [isRealtimeOpen, setIsRealtimeOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background w-full">
      <DashboardHeader onRealtimeToggle={setIsRealtimeOpen} />
      <main className={isRealtimeOpen ? "w-[75%] px-4 py-6 space-y-6 transition-all duration-300" : "w-full px-4 py-6 space-y-6 transition-all duration-300"}>
        {/* 다운로드 수 & 마켓 등록율 */}
        <section className="space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 다운로드 수 박스 */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div 
                className="flex items-center justify-between cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setDownloadModalOpen(true)}
              >
                <div className="flex items-center gap-2">
                  <span>검색기간 월 다운로드 수</span>
                  <span className="font-semibold text-foreground">32,000</span>
                </div>
              </div>
            </div>

            {/* 마켓 등록율 박스 */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div 
                className="flex items-center justify-between cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMarketRegistrationModalOpen(true)}
              >
                <div className="flex items-center gap-2">
                  <span>마켓 등록율</span>
                  <span className="font-semibold text-success">94.8%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 실행 & 스캔 추이 */}
        <section className="space-y-4 w-full">
          {/* <h2 className="text-lg font-semibold text-foreground">실행 & 스캔 추이</h2> */}
          <TrendChartsSection />
        </section>

        {/* 사용자 & 커뮤니티 추이 */}
        <section className="space-y-4 w-full">
          {/* <h2 className="text-lg font-semibold text-foreground">핵심 활성도 지표</h2> */}
        <ActivityMetrics />
        </section>

        {/* 실행수 | 스캔수 | 전환율 | 신규 유입수 | 신규 게시물 | 신규채팅방 */}        
        {/* <section className="space-y-4 w-full">
          <h2 className="text-lg font-semibold text-foreground">다양한 지표</h2>
        </section> */}

        {/* 트렌드 분석 & 랭킹 */}
        <section className="space-y-4 w-full">
          <h2 className="text-lg font-semibold text-foreground">트렌드 분석 & 랭킹</h2>
          <RankingAccordions />
        </section>

        {/* 다운로드 수 모달 */}
        <MetricModal 
          open={downloadModalOpen} 
          onOpenChange={setDownloadModalOpen} 
          title="다운로드 수 현황"
        >
          <div className="space-y-6">
            {/* 다운로드 수 정보 */}
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">총 다운로드 수</span>
                  <span className="text-2xl font-bold text-primary">1,250,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">검색기간 월 다운로드</span>
                  <span className="text-xl font-semibold">32,000</span>
                </div>
              </div>
            </div>

            {/* 월별 다운로드 추이 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">월별 다운로드 추이</h3>
              <div className="h-64">
                <TrendChart 
                  data={[
                    { 
                      date: "1월", 
                      downloads: 28000, 
                      downloadsPredicted: null,
                      appStore: 12000,
                      playStore: 10000,
                      chinaStore: 6000
                    },
                    { 
                      date: "2월", 
                      downloads: 30000, 
                      downloadsPredicted: null,
                      appStore: 13000,
                      playStore: 11000,
                      chinaStore: 6000
                    },
                    { 
                      date: "3월", 
                      downloads: 29000, 
                      downloadsPredicted: null,
                      appStore: 12500,
                      playStore: 10500,
                      chinaStore: 6000
                    },
                    { 
                      date: "4월", 
                      downloads: 32000, 
                      downloadsPredicted: null,
                      appStore: 14000,
                      playStore: 12000,
                      chinaStore: 6000
                    },
                    { 
                      date: "5월", 
                      downloads: 31000, 
                      downloadsPredicted: null,
                      appStore: 13500,
                      playStore: 11500,
                      chinaStore: 6000
                    },
                    { 
                      date: "6월", 
                      downloads: 33000, 
                      downloadsPredicted: null,
                      appStore: 14500,
                      playStore: 12500,
                      chinaStore: 6000
                    },
                    { 
                      date: "7월", 
                      downloads: 32000, 
                      downloadsPredicted: null,
                      appStore: 14000,
                      playStore: 12000,
                      chinaStore: 6000
                    },
                    { 
                      date: "8월", 
                      downloads: 34000, 
                      downloadsPredicted: null,
                      appStore: 15000,
                      playStore: 13000,
                      chinaStore: 6000
                    },
                    { 
                      date: "9월", 
                      downloads: 36000, 
                      downloadsPredicted: 36000,
                      appStore: 16000,
                      playStore: 14000,
                      chinaStore: 6000,
                      appStorePredicted: 16000,
                      playStorePredicted: 14000,
                      chinaStorePredicted: 6000
                    },
                    { 
                      date: "10월", 
                      downloads: null, 
                      downloadsPredicted: 36000,
                      appStore: null,
                      playStore: null,
                      chinaStore: null,
                      appStorePredicted: 16500,
                      playStorePredicted: 14500,
                      chinaStorePredicted: 5000
                    },
                    { 
                      date: "11월", 
                      downloads: null, 
                      downloadsPredicted: 37000,
                      appStore: null,
                      playStore: null,
                      chinaStore: null,
                      appStorePredicted: 17000,
                      playStorePredicted: 15000,
                      chinaStorePredicted: 5000
                    },
                    { 
                      date: "12월", 
                      downloads: null, 
                      downloadsPredicted: 38000,
                      appStore: null,
                      playStore: null,
                      chinaStore: null,
                      appStorePredicted: 17500,
                      playStorePredicted: 15500,
                      chinaStorePredicted: 5000
                    }
                  ]}
                  lines={[
                    { dataKey: "downloads", name: "총 다운로드 수", color: "#1f2937" },
                    { dataKey: "downloadsPredicted", name: "총 다운로드 수 (예측)", color: "#1f2937", strokeDasharray: "5 5" },
                    { dataKey: "appStore", name: "App Store", color: "#007aff" },
                    { dataKey: "appStorePredicted", name: "App Store (예측)", color: "#007aff", strokeDasharray: "5 5" },
                    { dataKey: "playStore", name: "Play Store", color: "#34a853" },
                    { dataKey: "playStorePredicted", name: "Play Store (예측)", color: "#34a853", strokeDasharray: "5 5" },
                    { dataKey: "chinaStore", name: "China Store", color: "#ff6b35" },
                    { dataKey: "chinaStorePredicted", name: "China Store (예측)", color: "#ff6b35", strokeDasharray: "5 5" }
                  ]}
                  height={250}
                />
              </div>
            </div>
          </div>
        </MetricModal>

        {/* 마켓 등록 현황 모달 */}
        <MetricModal 
          open={marketRegistrationModalOpen} 
          onOpenChange={setMarketRegistrationModalOpen} 
          title="마켓 등록 현황"
        >
          <div className="space-y-6">
            {/* 등록 상태별 현황 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">등록 상태별 현황</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600">정상 37개</span>
                <span className="text-red-600">미등록 2개</span>
                <span className="text-yellow-600">심사중 0개</span>
              </div>
            </div>

            {/* 마켓 종류별 등록 현황 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">마켓 종류별 등록 현황</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-center">번호</th>
                      <th className="border border-border p-2 text-left">마켓 종류</th>
                      <th className="border border-border p-2 text-center w-20">HT</th>
                      <th className="border border-border p-2 text-center w-20">COP</th>
                      <th className="border border-border p-2 text-center w-20">Global</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "App Store", ht: "registered", cop: "registered", global: "registered" },
                      { name: "Play Store", ht: "registered", cop: "registered", global: "registered" },
                      { name: "Amazon Appstore", ht: "registered", cop: "registered", global: "unregistered" },
                      { name: "Samsung Galaxy Store", ht: "registered", cop: "registered", global: "registered" },
                      { name: "Huawei AppGallery", ht: "registered", cop: "unregistered", global: "registered" },
                      { name: "Xiaomi GetApps", ht: "registered", cop: "registered", global: "unregistered" },
                      { name: "OPPO Software Store", ht: "unregistered", cop: "registered", global: "registered" },
                      { name: "vivo App Store", ht: "registered", cop: "registered", global: "unregistered" },
                      { name: "OnePlus Store", ht: "unregistered", cop: "unregistered", global: "registered" },
                      { name: "LG SmartWorld", ht: "registered", cop: "registered", global: "registered" },
                      { name: "SKT T Store", ht: "registered", cop: "registered", global: "unregistered" },
                      { name: "KT Olleh Market", ht: "unregistered", cop: "registered", global: "registered" },
                      { name: "U+ Store", ht: "registered", cop: "unregistered", global: "unregistered" }
                    ].map((market, index) => (
                      <tr key={index}>
                        <td className="border border-border p-2 text-center">{index + 1}</td>
                        <td className="border border-border p-2 font-medium">{market.name}</td>
                        <td className="border border-border p-2 text-center">
                          <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            market.ht === "registered" 
                              ? "bg-green-100 text-green-800 border-2 border-green-300" 
                              : "bg-red-100 text-red-800 border-2 border-red-300"
                          }`}>
                            {market.ht === "registered" ? "✓" : "✗"}
                          </div>
                        </td>
                        <td className="border border-border p-2 text-center">
                          <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            market.cop === "registered" 
                              ? "bg-green-100 text-green-800 border-2 border-green-300" 
                              : "bg-red-100 text-red-800 border-2 border-red-300"
                          }`}>
                            {market.cop === "registered" ? "✓" : "✗"}
                          </div>
                        </td>
                        <td className="border border-border p-2 text-center">
                          <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            market.global === "registered" 
                              ? "bg-green-100 text-green-800 border-2 border-green-300" 
                              : "bg-red-100 text-red-800 border-2 border-red-300"
                          }`}>
                            {market.global === "registered" ? "✓" : "✗"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* 범례 */}
                <div className="flex items-center justify-center space-x-6 mt-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 border-2 border-green-300 flex items-center justify-center text-xs font-bold">✓</div>
                    <span className="text-sm text-muted-foreground">정상 등록</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-800 border-2 border-red-300 flex items-center justify-center text-xs font-bold">✗</div>
                    <span className="text-sm text-muted-foreground">미등록</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MetricModal>
      </main>
    </div>
  )
}
