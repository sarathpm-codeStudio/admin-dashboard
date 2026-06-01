import { useMemo, useState } from 'react'
import type { TrendPeriod } from '@/features/dashboard/data/chartTrends'
import { periodSubtitles } from '@/features/dashboard/data/chartTrends'

export function useTrendPeriod<T>(dataByPeriod: Record<TrendPeriod, T[]>) {
  const [period, setPeriod] = useState<TrendPeriod>('month')

  const data = useMemo(() => dataByPeriod[period], [dataByPeriod, period])
  const subtitle = periodSubtitles[period]

  return { period, setPeriod, data, subtitle }
}
