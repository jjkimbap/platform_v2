'use client'

import { ConnectionStatusDashboard } from '@/components/connection-status-dashboard'

export default function ConnectionStatusPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">연결 상태 확인</h1>
      <ConnectionStatusDashboard />
    </div>
  )
}


