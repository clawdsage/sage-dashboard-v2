import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Insight = Database['public']['Tables']['insights']['Row']

interface InsightStats {
  total: number
  actionable: number
  byType: Record<string, number>
  byCategory: Record<string, number>
  byImpact: Record<string, number>
}

export function useInsights(options?: {
  type?: ('optimization' | 'pattern' | 'trend' | 'anomaly' | 'recommendation')[]
  category?: ('cost' | 'performance' | 'usage' | 'model' | 'efficiency')[]
  impact?: ('low' | 'medium' | 'high')[]
  actionable?: boolean
  limit?: number
  days?: number
}) {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: ['insights', options],
    queryFn: async () => {
      let query = supabase
        .from('insights')
        .select('*')
        .order('generated_at', { ascending: false })

      if (options?.type && options.type.length > 0) {
        query = query.in('type', options.type)
      }

      if (options?.category && options.category.length > 0) {
        query = query.in('category', options.category)
      }

      if (options?.impact && options.impact.length > 0) {
        query = query.in('impact', options.impact)
      }

      if (options?.actionable !== undefined) {
        query = query.eq('is_actionable', options.actionable)
      }

      if (options?.days) {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - options.days)
        query = query.gte('generated_at', cutoff.toISOString())
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Insight[]
    },
  })

  const statsQuery = useQuery({
    queryKey: ['insight-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insights')
        .select('type, category, impact, is_actionable')
        .gte('generated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      const stats: InsightStats = {
        total: data.length,
        actionable: 0,
        byType: {},
        byCategory: {},
        byImpact: {}
      }

      data.forEach(insight => {
        if (insight.is_actionable) {
          stats.actionable++
        }
        
        stats.byType[insight.type] = (stats.byType[insight.type] || 0) + 1
        stats.byCategory[insight.category] = (stats.byCategory[insight.category] || 0) + 1
        
        if (insight.impact) {
          stats.byImpact[insight.impact] = (stats.byImpact[insight.impact] || 0) + 1
        }
      })

      return stats
    },
  })

  const dismissInsight = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('insights')
        .update({ is_actionable: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] })
      queryClient.invalidateQueries({ queryKey: ['insight-stats'] })
    }
  })

  const generateInsight = useMutation({
    mutationFn: async (insight: Omit<Database['public']['Tables']['insights']['Insert'], 'id'>) => {
      const { data, error } = await supabase
        .from('insights')
        .insert(insight)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] })
      queryClient.invalidateQueries({ queryKey: ['insight-stats'] })
    }
  })

  const markAsApplied = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('insights')
        .update({ 
          is_actionable: false,
          metadata: { applied_at: new Date().toISOString() }
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] })
      queryClient.invalidateQueries({ queryKey: ['insight-stats'] })
    }
  })

  return {
    insights: query.data,
    isLoading: query.isLoading,
    error: query.error,
    stats: statsQuery.data,
    isStatsLoading: statsQuery.isLoading,
    dismissInsight,
    generateInsight,
    markAsApplied
  }
}

// Function to analyze data and generate insights
export async function analyzeForInsights(): Promise<Partial<Insight>[]> {
  const insights: Partial<Insight>[] = []
  
  // Get recent runs data
  const { data: runs, error } = await supabase
    .from('subagent_runs')
    .select('*')
    .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('started_at', { ascending: false })

  if (error || !runs || runs.length === 0) {
    return insights
  }

  // Calculate cost statistics
  const totalCost = runs.reduce((sum, run) => sum + (run.cost || 0), 0)
  const avgCost = totalCost / runs.length
  const highCostRuns = runs.filter(run => (run.cost || 0) > avgCost * 2)
  
  // Insight 1: High cost runs pattern
  if (highCostRuns.length > 0 && runs.length > 10) {
    const highCostPercentage = (highCostRuns.length / runs.length) * 100
    if (highCostPercentage > 20) {
      insights.push({
        type: 'pattern',
        title: 'High Proportion of Expensive Runs',
        description: `${highCostPercentage.toFixed(1)}% of runs in the last 7 days cost more than 2x the average.`,
        confidence: 0.8,
        impact: 'high' as const,
        category: 'cost',
        is_actionable: true,
        action_text: 'Review expensive runs',
        action_url: '/analytics'
      })
    }
  }

  // Calculate model efficiency
  const modelStats = runs.reduce((acc, run) => {
    if (!run.model) return acc
    
    const key = run.model
    if (!acc[key]) {
      acc[key] = { totalCost: 0, count: 0, avgTokens: 0 }
    }
    
    acc[key].totalCost += run.cost || 0
    acc[key].count++
    acc[key].avgTokens += (run.tokens_total || 0)
    
    return acc
  }, {} as Record<string, { totalCost: number; count: number; avgTokens: number }>)

  // Insight 2: Model efficiency comparison
  const models = Object.entries(modelStats)
    .filter(([_, stats]) => stats.count >= 3)
    .map(([model, stats]) => ({
      model,
      avgCost: stats.totalCost / stats.count,
      count: stats.count,
      costPerToken: stats.totalCost / (stats.avgTokens || 1)
    }))
    .sort((a, b) => a.costPerToken - b.costPerToken)

  if (models.length >= 2) {
    const mostEfficient = models[0]
    const leastEfficient = models[models.length - 1]
    
    if (leastEfficient.costPerToken > mostEfficient.costPerToken * 1.5) {
      insights.push({
        type: 'optimization',
        title: 'Model Efficiency Opportunity',
        description: `${mostEfficient.model} is ${((leastEfficient.costPerToken / mostEfficient.costPerToken) * 100).toFixed(0)}% more cost-efficient than ${leastEfficient.model} per token.`,
        confidence: 0.85,
        impact: 'medium' as const,
        category: 'model',
        is_actionable: true,
        action_text: 'Consider switching models',
        metadata: {
          efficient_model: mostEfficient.model,
          inefficient_model: leastEfficient.model,
          efficiency_ratio: leastEfficient.costPerToken / mostEfficient.costPerToken
        }
      })
    }
  }

  // Calculate performance trends
  const runsByDay = runs.reduce((acc, run) => {
    const date = new Date(run.started_at).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { durations: [], costs: [], count: 0 }
    }
    
    if (run.duration_ms) {
      acc[date].durations.push(run.duration_ms)
    }
    acc[date].costs.push(run.cost || 0)
    acc[date].count++
    
    return acc
  }, {} as Record<string, { durations: number[]; costs: number[]; count: number }>)

  const dates = Object.keys(runsByDay).sort()
  if (dates.length >= 3) {
    const recentAvgDuration = runsByDay[dates[dates.length - 1]].durations.reduce((a, b) => a + b, 0) / 
                             runsByDay[dates[dates.length - 1]].durations.length
    const olderAvgDuration = runsByDay[dates[0]].durations.reduce((a, b) => a + b, 0) / 
                            runsByDay[dates[0]].durations.length
    
    if (recentAvgDuration > olderAvgDuration * 1.3) {
      insights.push({
        type: 'trend',
        title: 'Performance Degradation Trend',
        description: `Average run duration has increased by ${((recentAvgDuration / olderAvgDuration - 1) * 100).toFixed(0)}% over the last week.`,
        confidence: 0.75,
        impact: 'medium' as const,
        category: 'performance',
        is_actionable: true,
        action_text: 'Investigate performance issues'
      })
    }
  }

  return insights
}

// Real-time subscription for insights
export function subscribeToInsights(callback: (insight: Insight) => void) {
  return supabase
    .channel('insights-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'insights'
      },
      (payload) => {
        callback(payload.new as Insight)
      }
    )
    .subscribe()
}