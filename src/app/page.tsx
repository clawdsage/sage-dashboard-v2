'use client'

import Link from 'next/link'
import { useAgents } from '@/hooks/useAgents'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import { AgentList } from '@/components/agents/AgentList'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { Card } from '@/components/ui/Card'
import { AlertTriangle } from 'lucide-react'

export default function DashboardPage() {
  const { agents: allAgents, isLoading } = useAgents()
  const { reviews } = useReviewQueue()
  const activeAgents = allAgents.filter(agent => agent.status === 'active')
  const activeCount = activeAgents.length
  const pendingReviewCount = reviews.length

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

      {/* Needs Attention Section */}
      {pendingReviewCount > 0 && (
        <Card className="p-4 border-amber-200 bg-amber-50/50">
          <Link href="/review" className="flex items-center justify-between hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
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
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-text-secondary">runs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$4.5</div>
              <div className="text-sm text-text-secondary">cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">45k</div>
              <div className="text-sm text-text-secondary">tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2m</div>
              <div className="text-sm text-text-secondary">avg</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}