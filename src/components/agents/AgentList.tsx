'use client'

import { AgentRun } from '@/types'
import { AgentCard } from './AgentCard'
import { Card } from '@/components/ui/Card'

interface AgentListProps {
  agents: AgentRun[]
  isLoading?: boolean
  error?: Error
  onRetry?: () => void
}

export function AgentList({ agents, isLoading, error, onRetry }: AgentListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-bg-tertiary rounded mb-2"></div>
            <div className="h-3 bg-bg-tertiary rounded mb-4"></div>
            <div className="h-2 bg-bg-tertiary rounded"></div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-accent-red mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Failed to load agents</h3>
        <p className="text-text-secondary mb-4">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-accent-blue text-text-primary rounded-lg hover:bg-accent-blue/80 transition-colors"
          >
            Try Again
          </button>
        )}
      </Card>
    )
  }

  if (agents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-text-muted mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">No active agents</h3>
        <p className="text-text-secondary">Agents will appear here when they start running.</p>
      </Card>
    )
  }

  // Sort: active first, then by started_at desc
  const sortedAgents = [...agents].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1
    if (b.status === 'active' && a.status !== 'active') return 1
    return new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedAgents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}