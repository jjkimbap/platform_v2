"use client"

import { create } from "zustand"

export interface CoreMetric {
  id: string
  title: string
  value: string
  target?: string
  predicted?: string
  achievement?: number
  change?: number
  changeLabel?: string
  team?: string
  status?: string
  icon?: React.ReactNode
  iconName?: string
  description?: string
  trendData?: Array<{ value: number }>
  trendColor?: string
  actionRequired?: string
  textData?: Array<{
    label: string
    value: string | number
    color?: string
  }>
  source?: string // 어느 섹션에서 추가되었는지
}

interface CoreMetricsStore {
  metrics: CoreMetric[]
  addMetric: (metric: CoreMetric) => void
  removeMetric: (id: string) => void
  isMetricAdded: (id: string) => boolean
  canAddMore: () => boolean
}

export const useCoreMetrics = create<CoreMetricsStore>((set, get) => ({
  metrics: [],
  
  addMetric: (metric) => {
    const state = get()
    
    if (state.isMetricAdded(metric.id)) {
      alert('이미 추가된 지표입니다.')
      return
    }
    
    set((state) => ({
      metrics: [...state.metrics, metric]
    }))
  },
  
  removeMetric: (id) => {
    set((state) => ({
      metrics: state.metrics.filter(metric => metric.id !== id)
    }))
  },
  
  isMetricAdded: (id) => {
    const state = get()
    return state.metrics.some(metric => metric.id === id)
  },
  
  canAddMore: () => {
    return true // 제한 없음
  }
}))
