'use client'

import { useAgents } from '@/hooks/useAgents'
import { AgentList } from '@/components/agents/AgentList'
import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  const { agents: allAgents, isLoading } = useAgents()
  const activeAgents = allAgents.filter(agent => agent.status === 'active')
  const activeCount = activeAgents.length

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

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Live Agents</h2>
        <AgentList agents={activeAgents} isLoading={isLoading} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">RECENT ACTIVITY</h3>
          <div className="space-y-2">
            <div className="text-sm">• Agent completed task</div>
            <div className="text-sm">• Task created</div>
            <div className="text-sm">• Project updated</div>
          </div>
        </Card>

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

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">NEEDS ATTENTION (Review Queue Preview)</h3>
        <p className="text-text-secondary">[2 agents pending review] [View All →]</p>
      </Card>
    </div>
  )
}