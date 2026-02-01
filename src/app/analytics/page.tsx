'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/analytics/StatCard'
import { CostChart } from '@/components/analytics/CostChart'
import { ModelBreakdown } from '@/components/analytics/ModelBreakdown'
import { UsageBreakdown } from '@/components/analytics/UsageBreakdown'
import { Alerts } from '@/components/analytics/Alerts'
import { Insights } from '@/components/analytics/Insights'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Activity, DollarSign, Zap, Clock, AlertTriangle, Lightbulb } from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('7d')

  const { data, isLoading, error } = useAnalytics(timeRange)

  // Generate alerts from analytics data
  const alerts = useMemo(() => {
    if (!data) return []
    
    const alerts = []
    const now = new Date()
    
    // Check for high cost runs
    const highCostRuns = data.topExpensiveRuns.filter(run => (run.cost || 0) > 1.0)
    if (highCostRuns.length > 0) {
      alerts.push({
        id: 'high-cost-runs',
        type: 'cost' as const,
        title: 'High Cost Runs Detected',
        description: `${highCostRuns.length} runs exceeded $1.00 cost threshold`,
        severity: (highCostRuns.length > 3 ? 'high' : 'medium') as 'high' | 'medium',
        timestamp: now,
        resolved: false,
        data: {
          count: highCostRuns.length,
          maxCost: Math.max(...highCostRuns.map(r => r.cost || 0)).toFixed(4),
          totalCost: highCostRuns.reduce((sum, r) => sum + (r.cost || 0), 0).toFixed(4)
        }
      })
    }
    
    // Check for failed runs
    const failedRuns = data.statusBreakdown.find(s => s.status === 'failed')
    if (failedRuns && failedRuns.count > 0) {
      alerts.push({
        id: 'failed-runs',
        type: 'error' as const,
        title: 'Failed Runs Detected',
        description: `${failedRuns.count} run${failedRuns.count !== 1 ? 's' : ''} failed in the selected period`,
        severity: (failedRuns.count > 5 ? 'high' : 'medium') as 'high' | 'medium',
        timestamp: now,
        resolved: false,
        data: {
          count: failedRuns.count,
          cost: failedRuns.cost.toFixed(4)
        }
      })
    }
    
    // Check for cost spikes
    if (data.costOverTime.length >= 2) {
      const lastTwoDays = data.costOverTime.slice(-2)
      const [prevDay, currentDay] = lastTwoDays
      if (currentDay.cost > prevDay.cost * 2 && currentDay.cost > 0.5) {
        alerts.push({
          id: 'cost-spike',
          type: 'cost' as const,
          title: 'Cost Spike Detected',
          description: `Cost increased by ${((currentDay.cost / prevDay.cost - 1) * 100).toFixed(0)}% from previous day`,
          severity: 'high' as const,
          timestamp: now,
          resolved: false,
          data: {
            previous: `$${prevDay.cost.toFixed(4)}`,
            current: `$${currentDay.cost.toFixed(4)}`,
            increase: `${((currentDay.cost / prevDay.cost - 1) * 100).toFixed(0)}%`
          }
        })
      }
    }
    
    return alerts
  }, [data])
  
  // Generate insights from analytics data
  const insights = useMemo(() => {
    if (!data) return []
    
    const insights = []
    
    // Cost efficiency insight
    const avgCostPerRun = data.totalRuns > 0 ? data.totalCost / data.totalRuns : 0
    if (avgCostPerRun > 0.5) {
      insights.push({
        id: 'high-avg-cost',
        type: 'cost' as const,
        title: 'High Average Cost Per Run',
        description: `Average cost per run is $${avgCostPerRun.toFixed(4)}, consider optimizing expensive models`,
        impact: 'negative' as const,
        confidence: 'high' as const,
        data: {
          avgCost: avgCostPerRun.toFixed(4),
          totalRuns: data.totalRuns
        },
        recommendations: [
          'Consider using cheaper models for non-critical tasks',
          'Review top expensive runs for optimization opportunities',
          'Set cost limits for automated agents'
        ]
      })
    }
    
    // Model distribution insight
    if (data.modelBreakdown.length > 0) {
      const topModel = data.modelBreakdown[0]
      const topModelPercentage = (topModel.cost / data.totalCost) * 100
      if (topModelPercentage > 70) {
        insights.push({
          id: 'model-concentration',
          type: 'usage' as const,
          title: 'High Model Concentration',
          description: `${topModel.model} accounts for ${topModelPercentage.toFixed(0)}% of total cost`,
          impact: 'neutral' as const,
          confidence: 'high' as const,
          data: {
            model: topModel.model,
            percentage: `${topModelPercentage.toFixed(0)}%`,
            cost: `$${topModel.cost.toFixed(4)}`
          },
          recommendations: [
            'Consider diversifying model usage for better resilience',
            'Evaluate if cheaper alternatives exist for this model',
            'Monitor this model for cost optimization opportunities'
          ]
        })
      }
    }
    
    // Token efficiency insight
    const avgTokensPerRun = data.totalRuns > 0 ? data.totalTokens / data.totalRuns : 0
    const avgCostPerToken = data.totalTokens > 0 ? data.totalCost / data.totalTokens : 0
    if (avgCostPerToken > 0.00002) { // $0.00002 per token is high
      insights.push({
        id: 'token-efficiency',
        type: 'efficiency' as const,
        title: 'Token Cost Efficiency',
        description: `Average cost per token is $${avgCostPerToken.toFixed(8)}, consider optimizing token usage`,
        impact: 'negative' as const,
        confidence: 'medium' as const,
        data: {
          avgTokensPerRun: Math.round(avgTokensPerRun).toLocaleString(),
          avgCostPerToken: avgCostPerToken.toFixed(8),
          totalTokens: data.totalTokens.toLocaleString()
        },
        recommendations: [
          'Review prompts for unnecessary verbosity',
          'Consider using models with better token efficiency',
          'Implement token limits for long-running conversations'
        ]
      })
    }
    
    // Positive trend insight
    if (data.costOverTime.length >= 7) {
      const lastWeek = data.costOverTime.slice(-7)
      const firstHalf = lastWeek.slice(0, 3).reduce((sum, day) => sum + day.cost, 0)
      const secondHalf = lastWeek.slice(3).reduce((sum, day) => sum + day.cost, 0)
      if (secondHalf < firstHalf * 0.7) { // 30% reduction
        insights.push({
          id: 'cost-reduction',
          type: 'trend' as const,
          title: 'Cost Reduction Trend',
          description: 'Cost has decreased by over 30% in the last 3 days compared to previous 3 days',
          impact: 'positive' as const,
          confidence: 'medium' as const,
          data: {
            firstHalf: `$${firstHalf.toFixed(4)}`,
            secondHalf: `$${secondHalf.toFixed(4)}`,
            reduction: `${((1 - secondHalf / firstHalf) * 100).toFixed(0)}%`
          },
          recommendations: [
            'Continue current optimization strategies',
            'Document what changes led to cost reduction',
            'Consider applying similar optimizations to other areas'
          ]
        })
      }
    }
    
    return insights
  }, [data])

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <Card className="p-6">
          <p className="text-accent-red">Error loading analytics: {error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex space-x-2" role="tablist" aria-label="Time range selection">
          {(['today', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              role="tab"
              aria-selected={timeRange === range}
              aria-controls={`analytics-${range}`}
            >
              {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : '30 Days'}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-bg-tertiary rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-bg-tertiary rounded mb-2"></div>
                <div className="h-3 bg-bg-tertiary rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Runs"
              value={data.totalRuns}
              icon={Activity}
            />
            <StatCard
              title="Total Cost"
              value={`$${data.totalCost.toFixed(4)}`}
              icon={DollarSign}
            />
            <StatCard
              title="Total Tokens"
              value={data.totalTokens.toLocaleString()}
              icon={Zap}
            />
            <StatCard
              title="Avg Duration"
              value={`${(data.avgDuration / 1000).toFixed(1)}s`}
              icon={Clock}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <CostChart data={data.costOverTime} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost by Model</CardTitle>
              </CardHeader>
              <CardContent>
                <ModelBreakdown data={data.modelBreakdown} />
              </CardContent>
            </Card>
          </div>

          {/* Usage Breakdown */}
          <div className="mb-6">
            <UsageBreakdown 
              data={data.modelBreakdown.map(item => ({
                ...item,
                tokens: data.topExpensiveRuns
                  .filter(run => run.model === item.model)
                  .reduce((sum, run) => sum + (run.tokens_total || 0), 0),
                duration: data.topExpensiveRuns
                  .filter(run => run.model === item.model)
                  .reduce((sum, run) => sum + (run.duration_ms || 0), 0)
              }))}
              view="cost"
            />
          </div>

          {/* Alerts & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Alerts 
              alerts={alerts}
              isLoading={isLoading}
              onResolve={(id) => console.log('Resolve alert:', id)}
            />
            <Insights 
              insights={insights}
              isLoading={isLoading}
            />
          </div>

          {/* Top Expensive Runs */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Most Expensive Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Top 10 most expensive agent runs">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th scope="col" className="text-left py-2">Name</th>
                      <th scope="col" className="text-left py-2">Model</th>
                      <th scope="col" className="text-left py-2">Status</th>
                      <th scope="col" className="text-right py-2">Cost</th>
                      <th scope="col" className="text-right py-2">Tokens</th>
                      <th scope="col" className="text-right py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topExpensiveRuns.map((run) => (
                      <tr key={run.id} className="border-b border-border-subtle">
                        <td className="py-2">{run.name}</td>
                        <td className="py-2">{run.model || 'N/A'}</td>
                        <td className="py-2">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              run.status === 'completed' ? 'bg-accent-green/20 text-accent-green' :
                              run.status === 'failed' ? 'bg-accent-red/20 text-accent-red' :
                              'bg-accent-amber/20 text-accent-amber'
                            }`}
                            aria-label={`Status: ${run.status}`}
                          >
                            {run.status}
                          </span>
                        </td>
                        <td className="text-right py-2" aria-label={`Cost: $${(run.cost || 0).toFixed(4)}`}>
                          ${(run.cost || 0).toFixed(4)}
                        </td>
                        <td className="text-right py-2" aria-label={`Tokens: ${run.tokens_total?.toLocaleString() || 0}`}>
                          {run.tokens_total?.toLocaleString() || 0}
                        </td>
                        <td className="text-right py-2" aria-label={`Duration: ${run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)} seconds` : 'Not available'}`}>
                          {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium mb-2">No data available</h3>
          <p className="text-text-muted">
            Run some agents to see analytics here.
          </p>
        </Card>
      )}
    </div>
  )
}