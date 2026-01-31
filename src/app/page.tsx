'use client'

import Link from 'next/link'
import { useAgents } from '@/hooks/useAgents'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import { AgentList } from '@/components/agents/AgentList'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { SageStatusBar } from '@/components/dashboard/SageStatusBar'
import { Card } from '@/components/ui/Card'
import { AlertTriangle } from 'lucide-react'
import { useMemo } from 'react'

export default function DashboardPage() {
  const { agents: allAgents, isLoading } = useAgents()
  const { reviews } = useReviewQueue()
  const activeAgents = allAgents.filter(agent => agent.status === 'active')
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
    </div>
  )
}