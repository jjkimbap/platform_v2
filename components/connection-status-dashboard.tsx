'use client'

import { RedisConnectionStatus } from './redis-connection-status'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Redis 연결 상태를 표시하는 대시보드
 */
export function ConnectionStatusDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RedisConnectionStatus />
    </div>
  )
}

















