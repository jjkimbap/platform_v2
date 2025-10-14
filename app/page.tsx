import { DashboardHeader } from "@/components/dashboard-header"
import { ActivityMetrics } from "@/components/activity-metrics"
import { TrendChartsSection } from "@/components/trend-charts-section"
import { UserGrowthCommunity } from "@/components/user-growth-community"
import { TrendingContent } from "@/components/trending-content"
import { TrendMetrics } from "@/components/trend-metrics"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6 space-y-6 lg:px-8">
        <ActivityMetrics />
        <TrendChartsSection />
        <UserGrowthCommunity />
        {/* <TrendMetrics /> */}
        <TrendingContent />
      </main>
    </div>
  )
}
