'use client'

import { useState } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { AgentList } from '@/components/agents/AgentList'

type FilterStatus = 'all' | 'active' | 'completed' | 'failed'

export default function AgentsPage() {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

  const { agents, isLoading, error } = useAgents(
    filter === 'all' ? undefined : filter
  )

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(search.toLowerCase()) ||
    (agent.task_description && agent.task_description.toLowerCase().includes(search.toLowerCase()))
  )

  const tabs = [
    { id: 'all' as const, label: 'All', count: agents.length },
    { id: 'active' as const, label: 'Active', count: agents.filter(a => a.status === 'active').length },
    { id: 'completed' as const, label: 'Completed', count: agents.filter(a => a.status === 'completed').length },
    { id: 'failed' as const, label: 'Failed', count: agents.filter(a => a.status === 'failed').length },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Agents</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-accent-blue text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-elevated'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
        />
      </div>

      {/* Agent List */}
      <AgentList
        agents={filteredAgents}
        isLoading={isLoading}
        error={error ?? undefined}
        onRetry={() => window.location.reload()}
      />
    </div>
  )
}