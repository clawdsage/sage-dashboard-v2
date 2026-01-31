import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type AgentRun = Database['public']['Tables']['agent_runs']['Row']

interface AnalyticsData {
  totalRuns: number
  totalCost: number
  totalTokens: number
  avgDuration: number
  statusBreakdown: { status: string; count: number; cost: number }[]
  modelBreakdown: { model: string; count: number; cost: number }[]
  costOverTime: { date: string; cost: number }[]
  topExpensiveRuns: AgentRun[]
}

export function useAnalytics(range: 'today' | '7d' | '30d' | 'custom', startDate?: Date, endDate?: Date) {
  const getDateRange = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (range) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      case '7d':
        return { start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), end: now }
      case '30d':
        return { start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), end: now }
      case 'custom':
        return { start: startDate || today, end: endDate || now }
      default:
        return { start: today, end: now }
    }
  }

  const { start, end } = getDateRange()

  const query = useQuery({
    queryKey: ['analytics', range, start.toISOString(), end.toISOString()],
    queryFn: async () => {
      const { data: runs, error } = await supabase
        .from('agent_runs')
        .select('*')
        .gte('started_at', start.toISOString())
        .lte('started_at', end.toISOString())
        .order('started_at', { ascending: true })

      if (error) throw error

      const runsData = runs as AgentRun[]

      // Calculate aggregates
      const totalRuns = runsData.length
      const totalCost = runsData.reduce((sum, run) => sum + (run.cost || 0), 0)
      const totalTokens = runsData.reduce((sum, run) => sum + (run.tokens_total || 0), 0)
      const totalDuration = runsData.reduce((sum, run) => sum + (run.duration_ms || 0), 0)
      const avgDuration = totalRuns > 0 ? totalDuration / totalRuns : 0

      // Status breakdown
      const statusMap = new Map<string, { count: number; cost: number }>()
      runsData.forEach(run => {
        const key = run.status
        const existing = statusMap.get(key) || { count: 0, cost: 0 }
        statusMap.set(key, {
          count: existing.count + 1,
          cost: existing.cost + (run.cost || 0)
        })
      })
      const statusBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
        status,
        ...data
      }))

      // Model breakdown
      const modelMap = new Map<string, { count: number; cost: number }>()
      runsData.forEach(run => {
        const key = run.model || 'unknown'
        const existing = modelMap.get(key) || { count: 0, cost: 0 }
        modelMap.set(key, {
          count: existing.count + 1,
          cost: existing.cost + (run.cost || 0)
        })
      })
      const modelBreakdown = Array.from(modelMap.entries()).map(([model, data]) => ({
        model,
        ...data
      }))

      // Cost over time (daily)
      const costByDate = new Map<string, number>()
      runsData.forEach(run => {
        const date = new Date(run.started_at).toISOString().split('T')[0]
        costByDate.set(date, (costByDate.get(date) || 0) + (run.cost || 0))
      })
      const costOverTime = Array.from(costByDate.entries())
        .map(([date, cost]) => ({ date, cost }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Top 10 expensive runs
      const topExpensiveRuns = runsData
        .sort((a, b) => (b.cost || 0) - (a.cost || 0))
        .slice(0, 10)

      return {
        totalRuns,
        totalCost,
        totalTokens,
        avgDuration,
        statusBreakdown,
        modelBreakdown,
        costOverTime,
        topExpensiveRuns,
      } as AnalyticsData
    },
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}