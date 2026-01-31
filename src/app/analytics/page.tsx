'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/analytics/StatCard'
import { CostChart } from '@/components/analytics/CostChart'
import { ModelBreakdown } from '@/components/analytics/ModelBreakdown'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Activity, DollarSign, Zap, Clock } from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('7d')

  const { data, isLoading, error } = useAnalytics(timeRange)

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
        <div className="flex space-x-2">
          {(['today', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
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

          {/* Top Expensive Runs */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Most Expensive Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Model</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-right py-2">Cost</th>
                      <th className="text-right py-2">Tokens</th>
                      <th className="text-right py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topExpensiveRuns.map((run) => (
                      <tr key={run.id} className="border-b border-border-subtle">
                        <td className="py-2">{run.name}</td>
                        <td className="py-2">{run.model || 'N/A'}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            run.status === 'completed' ? 'bg-accent-green/20 text-accent-green' :
                            run.status === 'failed' ? 'bg-accent-red/20 text-accent-red' :
                            'bg-accent-amber/20 text-accent-amber'
                          }`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="text-right py-2">${(run.cost || 0).toFixed(4)}</td>
                        <td className="text-right py-2">{run.tokens_total?.toLocaleString() || 0}</td>
                        <td className="text-right py-2">
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