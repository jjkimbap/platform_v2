'use client'

import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WebSocketStatusIndicatorProps {
  className?: string
  showText?: boolean
}

/**
 * WebSocket 연결 상태를 표시하는 컴포넌트
 */
export function WebSocketStatusIndicator({ 
  className,
  showText = true 
}: WebSocketStatusIndicatorProps) {
  const { status, isConnected, isConnecting, reconnectAttempts } = useWebSocketContext()

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'ONLINE',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        }
      case 'connecting':
        return {
          icon: Loader2,
          text: 'CONNECTING',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        }
      case 'error':
        return {
          icon: WifiOff,
          text: 'ERROR',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        }
      default:
        return {
          icon: WifiOff,
          text: 'OFFLINE',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full',
        config.bgColor
      )}>
        <Icon 
          className={cn('w-4 h-4', config.color, {
            'animate-spin': isConnecting
          })} 
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('text-sm font-medium', config.color)}>
            {config.text}
          </span>
          {reconnectAttempts > 0 && !isConnected && (
            <span className="text-xs text-muted-foreground">
              재연결 시도: {reconnectAttempts}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

