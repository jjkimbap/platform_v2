"use client"

import { useState } from "react"
import { MessageSquare, MessageCircle } from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { MetricModal } from "@/components/metric-modal"
import { TrendChart } from "@/components/trend-chart"

const mockCommunityData = [
  { date: "1일", type1: 45, type2: 32, type3: 28, type4: 15 },
  { date: "2일", type1: 52, type2: 38, type3: 31, type4: 18 },
  { date: "3일", type1: 48, type2: 35, type3: 29, type4: 16 },
  { date: "4일", type1: 61, type2: 42, type3: 35, type4: 22 },
  { date: "5일", type1: 58, type2: 40, type3: 33, type4: 20 },
  { date: "6일", type1: 65, type2: 45, type3: 38, type4: 24 },
  { date: "7일", type1: 72, type2: 48, type3: 41, type4: 26 },
]

const mockChatData = [
  { date: "1일", rooms: 120, messages: 1850 },
  { date: "2일", rooms: 135, messages: 2100 },
  { date: "3일", rooms: 128, messages: 1950 },
  { date: "4일", rooms: 152, messages: 2350 },
  { date: "5일", rooms: 148, messages: 2200 },
  { date: "6일", rooms: 165, messages: 2580 },
  { date: "7일", rooms: 178, messages: 2820 },
]

export function CommunityMetrics() {
  const [communityModalOpen, setCommunityModalOpen] = useState(false)
  const [chatModalOpen, setChatModalOpen] = useState(false)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">커뮤니티 & 소통 활성도</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 auto-rows-fr">
        <MetricCard
          title="커뮤니티 활성도"
          value="85.2%"
          icon={<MessageSquare className="h-5 w-5" />}
          onClick={() => setCommunityModalOpen(true)}
          target="90%"
          achievement={94.7}
        />
        <MetricCard
          title="게시물 작성률"
          value="12.8%"
          icon={<MessageCircle className="h-5 w-5" />}
          onClick={() => setChatModalOpen(true)}
          target="15%"
          achievement={85.3}
        />
      </div>

      <MetricModal open={communityModalOpen} onOpenChange={setCommunityModalOpen} title="커뮤니티 게시글 종류별 추이">
        <TrendChart
          data={mockCommunityData}
          lines={[
            { dataKey: "type1", name: "정품제품리뷰", color: "#3b82f6" },
            { dataKey: "type2", name: "정품판별팁", color: "#10b981" },
            { dataKey: "type3", name: "정품인증거래", color: "#f59e0b" },
            { dataKey: "type4", name: "정품Q&A", color: "#8b5cf6" },
          ]}
          height={350}
        />
      </MetricModal>

      <MetricModal open={chatModalOpen} onOpenChange={setChatModalOpen} title="채팅 활동 상세 추이">
        <TrendChart
          data={mockChatData}
          lines={[
            { dataKey: "rooms", name: "신규 채팅방", color: "#3b82f6" },
            { dataKey: "messages", name: "총 메시지 수", color: "#10b981" },
          ]}
          height={350}
        />
      </MetricModal>
    </section>
  )
}
