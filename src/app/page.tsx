'use client'

import Link from 'next/link'
import { useAgents } from '@/hooks/useAgents'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import { useProjects } from '@/hooks/useProjects'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AgentList } from '@/components/agents/AgentList'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { SageStatusBar } from '@/components/dashboard/SageStatusBar'
import { Card } from '@/components/ui/Card'
import { AlertTriangle, FolderOpen, BarChart, TrendingUp, TrendingDown } from 'lucide-react'
import { useMemo } from 'react'

export default function DashboardPage() {
  const { agents: allAgents, isLoading } = useAgents()
  const { reviews } = useReviewQueue()
  const { projects } = useProjects()
  const activeAgents = allAgents.filter(agent => agent.status === 'active')
  const activeProjects = projects.filter(project => project.status === 'active')
  const activeCount = activeAgents.length
  const pendingReviewCount = reviews.length

  // Calculate today's metrics from real data
  const todayMetrics = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayAgents = allAgents.filter(agent => {
      const started = new Date(agent.started_at)
      return started >= today
    })
    
    const totalRuns = todayAgents.length
    const totalCost = todayAgents.reduce((sum, a) => sum + (a.cost || 0), 0)
    const totalTokens = todayAgents.reduce((sum, a) => sum + (a.tokens_used || 0), 0)
    
    // Calculate average duration
    const completedToday = todayAgents.filter(a => a.completed_at)
    const avgDurationMs = completedToday.length > 0
      ? completedToday.reduce((sum, a) => {
          const start = new Date(a.started_at).getTime()
          const end = new Date(a.completed_at!).getTime()
          return sum + (end - start)
        }, 0) / completedToday.length
      : 0
    const avgDurationMin = Math.round(avgDurationMs / 60000)
    
    return { totalRuns, totalCost, totalTokens, avgDurationMin }
  }, [allAgents])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Tim</h1>
          <p className="text-text-secondary mt-1">
            {activeCount} agent{activeCount !== 1 ? 's' : ''} active
          </p>
        </div>
        <button className="bg-accent-blue hover:bg-accent-blue/80 text-white px-4 py-2 rounded-md transition-colors">
          Quick Add
        </button>
      </div>

      {/* Sage Status Bar - Real-time status */}
      <SageStatusBar />

      {/* Needs Attention Section */}
      {pendingReviewCount > 0 && (
        <Card className="p-4 border-amber-500/30 bg-amber-500/10">
          <Link href="/review" className="flex items-center justify-between hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <div className="font-medium text-text-primary">
                  {pendingReviewCount} agent{pendingReviewCount !== 1 ? 's' : ''} pending review
                </div>
                <div className="text-sm text-text-secondary">
                  Review outputs before they go live
                </div>
              </div>
            </div>
            <div className="text-accent-blue font-medium">
              View All →
            </div>
          </Link>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Live Agents</h2>
        <AgentList agents={activeAgents} isLoading={isLoading} />
      </Card>

      {/* Active Projects Summary */}
      <Card className="p-6">
        <Link href="/projects" className="block hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-6 w-6 text-accent-blue" />
              <div>
                <h3 className="text-xl font-semibold">Active Projects</h3>
                <p className="text-text-secondary">
                  {activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''} in progress
                </p>
              </div>
            </div>
            <div className="text-accent-blue font-medium">
              View All →
            </div>
          </div>
        </Link>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed limit={5} />

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">TODAY'S METRICS</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{todayMetrics.totalRuns}</div>
              <div className="text-sm text-text-secondary">runs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${todayMetrics.totalCost < 1 
                  ? todayMetrics.totalCost.toFixed(2) 
                  : todayMetrics.totalCost.toFixed(1)}
              </div>
              <div className="text-sm text-text-secondary">cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {todayMetrics.totalTokens >= 1000 
                  ? `${(todayMetrics.totalTokens / 1000).toFixed(1)}k` 
                  : todayMetrics.totalTokens}
              </div>
              <div className="text-sm text-text-secondary">tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {todayMetrics.avgDurationMin > 0 ? `${todayMetrics.avgDurationMin}m` : '-'}
              </div>
              <div className="text-sm text-text-secondary">avg</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Summary */}
      <AnalyticsSummary />
    </div>
  )
}

function AnalyticsSummary() {
  const { data: analyticsData, isLoading } = useAnalytics('7d')
  
  if (isLoading || !analyticsData) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Analytics Summary</h3>
          <BarChart className="h-5 w-5 text-text-muted" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-8 bg-bg-tertiary rounded mb-2"></div>
              <div className="h-3 bg-bg-tertiary rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const { totalRuns, totalCost, totalTokens, avgDuration, modelBreakdown } = analyticsData
  
  // Calculate trends (simplified - in real app, compare with previous period)
  const costTrend = modelBreakdown.length > 0 ? 'stable' : 'up'
  const efficiencyTrend = avgDuration > 300000 ? 'down' : 'up' // 5 minutes threshold
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Analytics Summary (7 Days)</h3>
        <Link href="/analytics" className="flex items-center gap-1 text-accent-blue hover:opacity-80 transition-opacity">
          <BarChart className="h-5 w-5" />
          <span>View Full Analytics</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-bg-tertiary/30 rounded-lg">
          <div className="text-2xl font-bold">{totalRuns}</div>
          <div className="text-sm text-text-secondary">Total Runs</div>
        </div>
        <div className="text-center p-3 bg-bg-tertiary/30 rounded-lg">
          <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
          <div className="text-sm text-text-secondary">Total Cost</div>
          <div className="flex items-center justify-center mt-1 text-xs">
            {costTrend === 'up' ? (
              <>
                <TrendingUp className="h-3 w-3 text-accent-red mr-1" />
                <span className="text-accent-red">+12%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-accent-green mr-1" />
                <span className="text-accent-green">-5%</span>
              </>
            )}
          </div>
        </div>
        <div className="text-center p-3 bg-bg-tertiary/30 rounded-lg">
          <div className="text-2xl font-bold">
            {totalTokens >= 1000000 
              ? `${(totalTokens / 1000000).toFixed(1)}M`
              : totalTokens >= 1000 
                ? `${(totalTokens / 1000).toFixed(1)}k`
                : totalTokens}
          </div>
          <div className="text-sm text-text-secondary">Total Tokens</div>
        </div>
        <div className="text-center p-3 bg-bg-tertiary/30 rounded-lg">
          <div className="text-2xl font-bold">{Math.round(avgDuration / 1000)}s</div>
          <div className="text-sm text-text-secondary">Avg Duration</div>
          <div className="flex items-center justify-center mt-1 text-xs">
            {efficiencyTrend === 'up' ? (
              <>
                <TrendingUp className="h-3 w-3 text-accent-green mr-1" />
                <span className="text-accent-green">Faster</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-accent-red mr-1" />
                <span className="text-accent-red">Slower</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {modelBreakdown.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <h4 className="text-sm font-medium mb-2">Top Models by Cost</h4>
          <div className="space-y-2">
            {modelBreakdown.slice(0, 3).map((model, index) => (
              <div key={model.model} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" 
                       style={{ 
                         backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b'][index] 
                       }} 
                  />
                  <span className="text-sm">{model.model}</span>
                </div>
                <div className="text-sm font-medium">
                  ${model.cost.toFixed(2)} ({Math.round((model.cost / totalCost) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}