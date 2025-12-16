'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RedisStatus {
  connected: boolean
  url?: string
  error?: string
  message?: string
  timestamp?: string
}

/**
 * Redis 연결 상태를 확인하는 컴포넌트
 */
export function RedisConnectionStatus() {
  const [status, setStatus] = useState<RedisStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const checkRedisStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/redis-status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        connected: false,
        error: error instanceof Error ? error.message : String(error),
        message: 'Redis 상태 확인 실패'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkRedisStatus()
    // 30초마다 상태 확인
    const interval = setInterval(checkRedisStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusConfig = () => {
    if (loading) {
      return {
        icon: Loader2,
        text: '확인 중...',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      }
    }

    if (status?.connected) {
      return {
        icon: CheckCircle2,
        text: '연결됨',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      }
    }

    return {
      icon: XCircle,
      text: '연결 안됨',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5" />
          Redis 상태
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Redis</span>
          <Badge 
            variant={status?.connected ? 'default' : 'destructive'}
            className={cn(
              'flex items-center gap-1',
              status?.connected && 'bg-green-600',
              loading && 'bg-yellow-600'
            )}
          >
            <Icon 
              className={cn(
                'h-3 w-3',
                config.color,
                loading && 'animate-spin'
              )} 
            />
            {config.text}
          </Badge>
        </div>

        {status && (
          <>
            {status.url && (
              <div className="text-xs text-muted-foreground">
                URL: {status.url}
              </div>
            )}

            {status.error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                에러: {status.error}
              </div>
            )}

            {status.message && (
              <div className="text-xs text-muted-foreground">
                {status.message}
              </div>
            )}

            {status.timestamp && (
              <div className="text-xs text-muted-foreground">
                확인 시간: {new Date(status.timestamp).toLocaleString('ko-KR')}
              </div>
            )}
          </>
        )}

        <button
          onClick={checkRedisStatus}
          disabled={loading}
          className="text-xs text-primary hover:underline disabled:opacity-50"
        >
          {loading ? '확인 중...' : '다시 확인'}
        </button>
      </CardContent>
    </Card>
  )
}


